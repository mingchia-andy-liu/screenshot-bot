const puppeteer = require('puppeteer');
const format = require('date-fns/format');
const subDays = require('date-fns/subDays');
const {utcToZonedTime} = require('date-fns-tz');

const {upload} = require('./imgur');
const {fetchBox, fetchGames} = require('./nba');
const {allSettled} = require('./utils');
const reddit = require('./reddit');

const VIEWPORT = {width: 1400, height: 1080};
const VIEWPORT_SHORT = {width: 920, height: 1080};
const URL = `file://${__dirname}/ui/index.html`;

const insertEnv = (page, name, value) => {
  page.evaluateOnNewDocument(`
        Object.defineProperty(window, '${name}', {
            get() {
                return ${JSON.stringify(value)}
            }
        })
    `);
};

const extractGames = (games) => {
  return games.map((game) => {
    return Object.assign({}, game, {
      homeCity: game.home.city,
      homeName: game.home.team_code,
      homeNickname: game.home.nickname,
      visitorCity: game.visitor.city,
      visitorName: game.visitor.team_code,
      visitorNickname: game.visitor.nickname,
    });
  });
};

const getApiDate = () => {
  const est = utcToZonedTime(new Date(), 'America/New_York');
  const etHour = format(est, 'HH');
  // if ET time has not pass 6 am, don't jump ahead
  if (+etHour < 6) {
    return format(subDays(est, 1), 'yyyyMMdd');
  } else {
    return format(est, 'yyyyMMdd');
  }
};

const handler = async (req, res) => {
  // fetch all the games for date
  const todayStr = getApiDate();
  console.log('fetching...', todayStr, new Date().toISOString());
  let games = await fetchGames(todayStr);
  if (games == null || games.length === 0) {
    console.log('No games today.');
    res.sendStatus(200);
    return;
  }

  // Initialization
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  try {
    // search sub reddit's recent post-game threads
    newPosts = await reddit.getNewPGTs();
    comments = await reddit.getComments();

    games = extractGames(games);
    const promises = games.map(async (game) => {
      if (game.period_time.game_status !== '3') {
        console.log('game has not finished.');
        return;
      }

      console.log('trying to find', game.homeName, game.visitorName);
      const postGameThreads = newPosts.filter((post) => {
        const title = post.title.toLowerCase();
        return (title.includes(game.homeName.toLowerCase()) ||
              title.includes(game.homeCity.toLowerCase()) ||
              title.includes(game.homeNickname.toLowerCase())) &&
              (title.includes(game.visitorName.toLowerCase()) ||
              title.includes(game.visitorCity.toLowerCase()) ||
              title.includes(game.visitorNickname.toLowerCase()));
      });
      if (postGameThreads.length === 0) {
        console.log(`didn't find ${game.homeName}, ${game.visitorName}`);
        return;
      }

      console.log('found threads', postGameThreads.map((t) => t.id));
      const threadsWithNoComment = postGameThreads.filter((t) => {
        return comments.find(
            (comment) => comment.parent_id === `t3_${t.id}`,
        ) == null;
      });


      console.log(
          'threadsWithNoComment',
          threadsWithNoComment.map((t) => t.id),
      );
      if (threadsWithNoComment.length === 0) {
        return;
      }

      console.log('fetching game box', game.id);
      const data = await fetchBox(game.id);
      if (data == null) {
        return;
      }
      const htn = data.hls.tn;
      const vtn = data.vls.tn;

      // screenshot
      console.log('Taking a screenshot...', game.id);
      const screenshot = async (name, vn, hn) => {
        return element.screenshot({
          encoding: 'base64',
          // path: __dirname + `/images/${name}-${vn}-vs-${hn}.png`,
        });
      };
      const pageConfig = async (dark = null, short = null, viewPort = null) => {
        if (viewPort) {
          await page.setViewport(viewPort);
        }
        await page.evaluate((dark, short) => {
          const body = document.querySelector('body');
          if (dark) {
            body.classList.add('dark');
          } else {
            body.classList.remove('dark');
          }
          if (short) {
            body.classList.add('short');
          } else {
            body.classList.remove('short');
          }
        }, dark, short);
      };
      const page = await browser.newPage();
      await pageConfig(false, false, VIEWPORT);
      insertEnv(page, 'box', data);
      await page.goto(URL);
      let element = await page.$('html');
      const light = await screenshot('light', vtn, htn);

      // changing to dark mode
      await pageConfig(true);
      element = await page.$('html');
      const dark = await screenshot('dark', vtn, htn);

      // short view
      await pageConfig(false, true, VIEWPORT_SHORT);
      const lightShort = await screenshot('light-s', vtn, htn);
      await pageConfig(true, true);
      const darkShort = await screenshot('dark-s', vtn, htn);

      console.log('uploading to imgur...');
      const responses = await allSettled([
        upload(light, `${data.gdtutc} ${vtn} vs ${htn}`),
        upload(dark, `${data.gdtutc} ${vtn} vs ${htn}`),
        upload(lightShort, `${data.gdtutc} ${vtn} vs ${htn}`),
        upload(darkShort, `${data.gdtutc} ${vtn} vs ${htn}`),
      ]);
      const links = [];
      for (const response of responses) {
        if (response.status === 'fulfilled') {
          links.push(response.value.data.link);
        } else {
          links.push(undefined);
        }
      }
      console.log('posting to reddit...', links);
      for (const thread of threadsWithNoComment) {
        await reddit.postComment(thread, ...links);
      }
      console.log('finished posting to reddit...');
    });

    const responses = await allSettled(promises);
    for (const response of responses) {
      if (response.status === 'rejected') {
        console.log('rejected', response.reason);
      }
    }
    await browser.close();
    console.log('end of request');
    res.sendStatus(200);
  } catch (error) {
    console.log('Unexpected error', error);
    await browser.close();
    res.sendStatus(400);
  }
};

exports.handler = handler;

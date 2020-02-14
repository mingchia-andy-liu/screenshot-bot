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
  // Initialization
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    // headless: false,
  });

  // fetch all the games for date

  const todayStr = getApiDate();
  console.log('fetching...', todayStr, new Date().toISOString());
  let games = await fetchGames(todayStr);
  if (games == null || games.length === 0) {
    return;
  }

  // search sub reddit's recent post-game threads
  newPosts = await reddit.getNewPGTs();
  comments = await reddit.getComments();
  games = extractGames(games);
  const promises = games.map(async (game, i) => {
    console.log('trying to find', game.homeName, game.visitorName);
    const postGameThread = newPosts.find((post) => {
      const title = post.title.toLowerCase();
      return (title.includes(game.homeName.toLowerCase()) ||
            title.includes(game.homeCity.toLowerCase()) ||
            title.includes(game.homeNickname.toLowerCase())) &&
            (title.includes(game.visitorName.toLowerCase()) ||
            title.includes(game.visitorCity.toLowerCase()) ||
            title.includes(game.visitorNickname.toLowerCase()));
    },
    );
    if (postGameThread == null) {
      console.log(`didn't find ${game.homeName}, ${game.visitorName}`);
      return;
    }

    console.log('found thread', postGameThread.id);
    const hasCommented = comments.find(
        (comment) => comment.parent_id === `t3_${postGameThread.id}`,
    ) != null;

    console.log('hasCommented', hasCommented);
    if (hasCommented) {
      return;
    }
    console.log('fetching game box', game.id, 'thread', postGameThread.id);

    const data = await fetchBox(game.id);
    if (data == null) {
      return;
    }

    // screenshot
    console.log('Taking a screenshot...', game.id);
    const screenshot = async (name, vn, hn) => {
      return element.screenshot({
        encoding: 'base64',
        // path: __dirname + `/images/${name}-${vn}-vs-${hn}.png`,
      });
    };
    const pageConfig = async (dark = false, short = false, viewPort = null) => {
      if (viewPort) {
        await page.setViewport(viewPort);
      }
      if (dark || short) {
        await page.evaluate((dark, short) => {
          const body = document.querySelector('body');
          body.className = dark ? 'dark' : '';
          body.className += short ? ' short' : '';
        }, dark, short);
      }
    };
    const page = await browser.newPage();
    await pageConfig(false, false, VIEWPORT);
    insertEnv(page, 'box', data);
    await page.goto(URL);
    let element = await page.$('html');
    const light = await screenshot('light', data.vls.tn, data.hls.tn);

    // changing to dark mode
    await pageConfig(true);
    element = await page.$('html');
    const dark = await screenshot('dark', data.vls.tn, data.hls.tn);

    // short view
    await pageConfig(false, true, VIEWPORT_SHORT);
    const lightShort = await screenshot('light-s', data.vls.tn, data.hls.tn);
    await pageConfig(true, true);
    const darkShort = await screenshot('dark-s', data.vls.tn, data.hls.tn);

    console.log('uploading to imgur...');
    const responses = await allSettled([
      upload(light, `${data.gdtutc} ${data.vls.tn} vs ${data.hls.tn}`),
      upload(dark, `${data.gdtutc} ${data.vls.tn} vs ${data.hls.tn}`),
      upload(lightShort, `${data.gdtutc} ${data.vls.tn} vs ${data.hls.tn}`),
      upload(darkShort, `${data.gdtutc} ${data.vls.tn} vs ${data.hls.tn}`),
    ]);
    const links = [];
    for (const response of responses) {
      if (response.status === 'fulfilled') {
        links.push(response.value.data.link);
        console.log(response.value.data.link);
      } else {
        links.push(undefined);
      }
    }
    console.log('posting to reddit...', links);
    await reddit.postComment(
        postGameThread,
        ...links,
    );
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
};

exports.handler = handler;

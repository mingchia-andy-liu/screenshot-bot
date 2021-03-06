const Snoowrap = require('snoowrap');

const EOL = require('os').EOL;
const LINE_BREAK = `${EOL}${EOL}&nbsp;${EOL}${EOL}`;
const SUBREDDIT_NAMES = process.env.REDDIT_SUBREDDIT_NAMES;

// See https://github.com/not-an-aardvark/reddit-oauth-helper
const config = {
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
};

const r = new Snoowrap(config);

// mark down
const getText = (light, dark, lightShort, darkShort) => {
  const eols = `${EOL}${EOL}`;
  let text = `**Mobile Friendly Version (image box scores)**:${eols}`;
  text += light ? `[Full box score (light mode)](${light})${eols}` : '';
  text += dark ? `[Full box score (dark mode)](${dark})${eols}` : '';
  text += lightShort ? `[Condensed (light mode)](${lightShort})${eols}` : '';
  text += darkShort ? `[Condensed (dark mode)](${darkShort})${eols}` : '';
  text += LINE_BREAK;
  text += `---${eols}`;
  text += '^(I am a bot. Made by /u/blaze_kid)';
  return text;
};

exports.postComment = async (thread, light, dark, lightShort, darkShort) => {
  if (!light && !dark && !lightShort && !darkShort) {
    console.log('All upload failed.');
    return;
  }
  console.log('posting to', thread.id);
  await thread.reply(getText(light, dark, lightShort, darkShort));
};

exports.getNewPGTs = async () => {
  // use `+` to join  multiple subreddits, ie: nba+nbaspurs+lakers
  console.log('[getNewPGTs]', SUBREDDIT_NAMES);
  const numOfSubReddit = SUBREDDIT_NAMES.split('+').length;
  if (numOfSubReddit === 0) {
    return [];
  }

  const posts = await r.getNew(SUBREDDIT_NAMES, {
    // each sub gets 30 quota.
    limit: 30 * numOfSubReddit,
  });
  return posts.filter((post) => {
    const title = post.title.toLowerCase();
    return (
      title.includes('post') &&
      title.includes('game') &&
      title.includes('thread')
    );
  });
};

exports.getComments = async () => {
  console.log('[getComments] with userName', process.env.REDDIT_USERNAME);
  const comments = await r.getUser(process.env.REDDIT_USERNAME).getComments({
    limit: 30,
  });
  return comments;
};

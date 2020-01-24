// require('dotenv').config()
const Snoowrap = require('snoowrap');

const EOL = require('os').EOL;
const LINE_BREAK = `${EOL}${EOL}&nbsp;${EOL}${EOL}`;
const SUBREDDIT_NAME = process.env.REDDIT_SUBREDDIT_NAME;

// See https://github.com/not-an-aardvark/reddit-oauth-helper
const config = {
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
};

const r = new Snoowrap(config);

// mark down
const getText = (light, dark) => {
  let text = `**Mobile Friendly Version**:${EOL}${EOL}`;
  text += light ? `[Imgur link](${light})${EOL}${EOL}` : '';
  text += dark ? `[Dark mode](${dark})${EOL}${EOL}` : '';
  text += LINE_BREAK;
  text += `---${EOL}${EOL}`;
  text += '^(I am a bot. *Beep Boop*. Help me improve.)';
  return text;
};

const postComment = async (thread, light, dark) => {
  if (!light && !dark) {
    console.log('Both upload failed.');
    return;
  }
  console.log('posting comments', light, dark)
  await thread.reply(getText(light, dark));
};

const getNewPGTs = async () => {
  console.log('getNewPGTs');
  const posts = await r.getNew(SUBREDDIT_NAME, {
    limit: 2,
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

const getComments = async () => {
  console.log('[getComments] with userName', process.env.REDDIT_USERNAME);
  const comments = await r.getUser(process.env.REDDIT_USERNAME).getComments({
    limit: 30,
  });
  return comments;
};

module.exports = {
  getNewPGTs: getNewPGTs,
  getComments: getComments,
  postComment: postComment,
};

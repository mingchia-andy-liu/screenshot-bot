const snoowrap = require('snoowrap')
require('dotenv').config()

const EOL = require('os').EOL
const LINE_BREAK = `${EOL}${EOL}&nbsp;${EOL}${EOL}`
const SUBREDDIT_NAME = 'nba'

const config = {
    client_id: process.env.REDDIT_CLIENT_ID,
    client_secret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    user_agent: 'test-bot'
};

const r = new snoowrap(config)

// mark down
const getText = (light, dark) => {
    let text = `**Mobile Friendly Version**:${EOL}${EOL}`
    text += light ? `[Imgur link](${light})${EOL}${EOL}` : ''
    text += dark ? `[Dark mode](${dark})${EOL}${EOL}` : ''
    text += LINE_BREAK
    text += `---${EOL}${EOL}`
    text += '^(I am a bot. *Beep Boop*. Help me improve)'
    return text
}

const postComment = async (threadId, light, dark) => {
    const post = await r.getSubmission(threadId)
    console.log(post.title)
    post.reply(getText(light, dark))
}

const testPost = async(light, dark) => {
    const post = await r.getSubmission('9v6egf')
    await post.reply(getText(light, dark))
    // console.log(post.title)
}

const getTop100New = async () => {
    const posts = await r.getNew(SUBREDDIT_NAME, {
        limit: 170,
    })
    // console.log(posts.length)
    return posts.filter(post => post.title.includes('Post Game Thread'))
}

const getComments = async () => {
    const comments = await r.getUser(process.env.REDDIT_USERNAME).getComments({
        limit: 15,
    })
    return comments
}

module.exports = {
    postComment: postComment,
    getNew: getTop100New,
    getComments: getComments,
    test: testPost,
}

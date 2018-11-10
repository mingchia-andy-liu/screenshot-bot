const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const FormData = require('form-data')
require('dotenv').config()

const reddit = require('./reddit')

const VIEWPORT = {width: 1080, height: 1080}
const URL = `file://${__dirname}/index.html`

const insertEnv = (page, name, value) => {
    page.evaluateOnNewDocument(`
        Object.defineProperty(window, '${name}', {
            get() {
                return ${JSON.stringify(value)}
            }
        })
    `)
}

const upload = async (img, title) => {
    const imgur = 'https://api.imgur.com/3/image'

    const form = new FormData()
    form.append('image', img)
    form.append('album', process.env.IMGUR_ALBUM_ID)
    form.append('title', title)
    try {
        const res = await fetch(imgur, {
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID ' + process.env.IMGUR_CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.IMGUR_ACCESS_TOKEN,
            },
            body: form
        })
        const json = await res.json()
        if (!json || !json.success) throw Error()
        return json
    } catch(error) {
        return null
    }
}

const fetchGames = async (date) => {
    try {
        const res = await fetch(`https://data.nba.com/data/5s/json/cms/noseason/scoreboard/${date}/games.json`)
        const json = await res.json()
        if (json == null ||
            json.sports_content == null ||
            json.sports_content.games == null ||
            json.sports_content.games.game == null
        ) {
            throw Error()
        }
        return json.sports_content.games.game
    } catch (error) {
        console.log('error', error)
        return []
    }
}

const fetchBox = async (id) => {
    try {
        const advanced = await fetch(`https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/${id}_gamedetail.json`)
        const json = await advanced.json()
        return json.g
    } catch (error) {
        console.log('error', error)
        return null
    }
}

const extractGames = (games) => {
    return games.map(game => {
        return Object.assign({}, game, {
            homeCity: game.home.city,
            homeName: game.home.team_code,
            homeNickname: game.home.nickname,
            visitorCity: game.visitor.city,
            visitorName: game.visitor.team_code,
            visitorNickname: game.visitor.nickname,
        })
    })
}

(async () => {
    // Initialization
    const browser = await puppeteer.launch()

    // fetch all the games for date
    console.log('fetching...')
    let games = await fetchGames('20181109')
    if (games == null || games.length === 0) {
        process.exit(1)
    }

    // search reddit's recent 15 comment history and 50 new posts
    newPosts = await reddit.getNew()
    newPosts.forEach(post => console.log(post.title))
    comments = await reddit.getComments()
    games = extractGames(games)
    const promises = games.map(async (game, i) => {
        console.log('trying to find', game.homeName, game.visitorName)
        const postGameThread = newPosts.find(post =>
            (post.title.includes(game.homeName) ||
            post.title.includes(game.homeCity) ||
            post.title.includes(game.homeNickname)) &&
            (post.title.includes(game.visitorName) ||
            post.title.includes(game.visitorCity) ||
            post.title.includes(game.visitorNickname))
        )
        if (postGameThread == null) {
            return
        }

        console.log('found thread', postGameThread.id)
        const hasCommented = comments.find(comment => comment.parent_id === `t3_${postGameThread.id}`) != null

        console.log('hasCommented', hasCommented)
        if (hasCommented) {
            return
        }

        console.log('fetching game box', game.id, 'thread', postGameThread.id)
        const data = await fetchBox(game.id)
        if (data == null) {
            return
        }

        // screenshot
        console.log('screenshotting...', game.id)
        const page = await browser.newPage()
        await page.setViewport(VIEWPORT)
        insertEnv(page, 'box', data)
        await page.goto(URL)
        let element = await page.$('#content')
        const light = await element.screenshot({
            encoding: 'base64',
        })

        // changing to dark mode
        await page.evaluate(() => {
            let body = document.querySelector('body');
            body.className += 'dark'
        });
        element = await page.$('#content')
        const dark = await element.screenshot({
            encoding: 'base64',
        })

        console.log('uploading...')
        const responses = await Promise.all([
            upload(light, `${data.gdtutc} ${data.vls.tn} vs ${data.hls.tn}`),
            upload(dark, `${data.gdtutc} ${data.vls.tn} vs ${data.hls.tn}`)
        ])
        if (responses[0] && responses[1]) {
            const lightLink = responses[0].data.link
            const darkLink = responses[1].data.link
            console.log(lightLink)
            console.log(darkLink)
            console.log('posting to reddit...')
            await reddit.test(lightLink, darkLink)
            console.log('after posting to reddit...')
        }
    })
    await Promise.all(promises)
        .then(async () => await browser.close())
        .catch(async () => await browser.close())
})()

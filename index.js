const puppeteer = require('puppeteer')
const fetch = require('node-fetch')

const VIEWPORT = {width: 1440, height: 1080}
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

const fetchBox = async (id) => {
    try {
        const advanced = await fetch(`https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/${id}_gamedetail.json`)
        const json = await advanced.json()
        return json.g
    } catch (error) {
        console.log('error', error)
    }
}

(async () => {
    // Initialization
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport(VIEWPORT)

    // fetch
    const data = await fetchBox('0021800124')
    insertEnv(page, 'box', data)

    // load
    await page.goto(URL)


    const element = await page.$('#content')
    const img = await element.screenshot({
        encoding: 'base64',
    })

    await browser.close()
})()

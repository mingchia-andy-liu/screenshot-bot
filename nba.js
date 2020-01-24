const fetch = require('node-fetch')

const endpoint = (year, leagueSlug) => `https://data.nba.com/data/10s/v2015/json/mobile_teams/${leagueSlug}/${year}/scores/gamedetail`

const getLeagueYear = () => {
    const date = new Date()
    // if it's after july, it's a new season
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1
}

const getLeagueSlug = (gid) => {
    if (gid.startsWith('13')) {
        return 'sacramento'
    } else if (gid.startsWith('14')) {
        return 'orlando'
    } else if (gid.startsWith('15')) {
        return 'vegas'
    } else if (gid.startsWith('16')) {
        return 'utah'
    } else {
        return 'nba'
    }
}

exports.fetchGames = async (date) => {
  console.log('fetching games')
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

exports.fetchBox = async (id) => {
  console.log('fetching box:', id)
  try {
      const year = getLeagueYear();
      const leagueSlug = getLeagueSlug(id);
      console.log(`${endpoint(year, leagueSlug)}/${id}_gamedetail.json`)
      const advanced = await fetch(`${endpoint(year, leagueSlug)}/${id}_gamedetail.json`)
      const json = await advanced.json()
      return json.g
  } catch (error) {
      console.log('error', error)
      return null
  }
}

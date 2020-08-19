const fetch = require('node-fetch');
const getMonth = require('date-fns/getMonth');
const getYear = require('date-fns/getYear');
const addYears = require('date-fns/addYears');

const {convertDaily} = require('./convert');

const endpoint = (year, leagueSlug) => `https://data.nba.com/data/10s/v2015/json/mobile_teams/${leagueSlug}/${year}/scores/gamedetail`;

const getLeagueYear = () => {
  const date = new Date();
  // if it's after july, it's a new season
  let year;
  if (getYear(date) === 2020) {
    // 2020 season is delayed and season should finish in 2020-09
    year = getMonth(date) > 8 ? getYear(date) : getYear(addYears(date, -1));
  } else {
    // if it's after july, it's a new season
    year = getMonth(date) > 5 ? getYear(date) : getYear(addYears(date, -1));
  }
  return year;
};

const getLeagueSlug = (gid) => {
  if (gid.startsWith('13')) {
    return 'sacramento';
  } else if (gid.startsWith('14')) {
    return 'orlando';
  } else if (gid.startsWith('15')) {
    return 'vegas';
  } else if (gid.startsWith('16')) {
    return 'utah';
  } else {
    return 'nba';
  }
};

exports.fetchGames = async (date) => {
  console.log('[fetchGames]');
  try {
    const res = await fetch(`http://data.nba.net/prod/v2/${date}/scoreboard.json`);
    const json = await res.json();
    return json.games.map(convertDaily);
  } catch (error) {
    console.log('error', error);
    return [];
  }
};

exports.fetchBox = async (id) => {
  console.log('[fetchBox]', id);
  try {
    const year = getLeagueYear();
    const leagueSlug = getLeagueSlug(id);
    const url = `${endpoint(year, leagueSlug)}/${id}_gamedetail.json`;
    console.log(url);
    const advanced = await fetch(url);
    const json = await advanced.json();
    return json.g;
  } catch (error) {
    console.log('error', error);
    return null;
  }
};

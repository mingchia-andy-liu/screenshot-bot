const {getTeamBytricode} = require('./teams');
const QUARTER_NAMES = [
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'OT1',
  'OT2',
  'OT3',
  'OT4',
  'OT5',
  'OT6',
  'OT7',
  'OT8',
  'OT9',
  'OT10',
];

// this is for http://data.nba.net/prod/v2/dateStr/scoreboard.json endpoint
exports.convertDaily = (game) => {
  const {
    statusNum,
    clock,
    hTeam: h,
    vTeam: v,
    period: {current: p},
    watch: {
      broadcast: {
        broadcasters: {national, vTeam, hTeam},
      },
    },
    playoffs,
  } = game;

  const addQuarterNames = (linescores) =>
    linescores.map((ls, i) => ({
      period_name: QUARTER_NAMES[i],
      period_value: i.toString(),
      score: ls.score,
    }));

  // there is no field for game status
  // const formatGameStatus = () => {
  //   if (endTimeUTC != null) {
  //     return 'Final'
  //   } else if (isHalftime) {
  //     return 'Halftime'
  //   } else if (statusNum === 1) {
  //     return format(
  //       utcToZonedTime(startTimeUTC, getUserTimeZoneId()),
  //       'hh:mm a'
  //     )
  //   } else if (isEndOfPeriod) {
  //     if (p > 4) {
  //       const otP = p - 4
  //       return `End of ${otP} OT`
  //     }
  //     return `End of ${p} Qtr`
  //   } else {
  //     // normal period
  //     if (p > 4) {
  //       const otP = p - 4
  //       return `${otP} OT`
  //     }
  //     return `${p} Qtr`
  //   }
  // }

  const getBroadcasters = () => {
    return [
      ...national.map((c) => ({scope: 'natl', display_name: c.shortName})),
      ...vTeam.map((c) => ({scope: 'local', display_name: c.shortName})),
      ...hTeam.map((c) => ({scope: 'local', display_name: c.shortName})),
    ];
  };

  const getPlayoffs = () => {
    if (playoffs == null || playoffs.hTeam == null || playoffs.vTeam == null) {
      return undefined;
    }

    return {
      home_wins: playoffs.hTeam.seriesWin,
      visitor_wins: playoffs.vTeam.seriesWin,
    };
  };

  const home = getTeamBytricode(h.triCode);
  const visitor = getTeamBytricode(v.triCode);

  return {
    broadcasters: getBroadcasters(),
    home: {
      name: home.fullName,
      abbreviation: h.triCode,
      city: home.city,
      linescores: {period: addQuarterNames(h.linescore)},
      nickname: getTeamBytricode(h.triCode).nickname,
      score: h.score,
    },
    visitor: {
      name: visitor.fullName,
      abbreviation: v.triCode,
      city: visitor.city,
      linescores: {period: addQuarterNames(h.linescore)},
      nickname: getTeamBytricode(v.triCode).nickname,
      score: v.score,
    },
    periodTime: {
      // have not start
      // periodStatus: formatGameStatus(),
      gameClock: clock,
      gameStatus: `${statusNum}`,
      periodValue: `${p}`,
    },
    playoffs: getPlayoffs(),
    id: game.gameId,
    date: game.startDateEastern,
    time: game.startTimeEastern,
    state: '',
    arena: {
      name: game.arena.name,
      city: game.arena.city,
    },
    startTimeUtc: game.startTimeUTC,
  };
};

const teams = [
  {
    teamId: 1610612737,
    color: '#E03A3E',
    abbreviation: "ATL",
    teamName: "Atlanta Hawks",
    simpleName: "Hawks",
    city: "Atlanta"
  },
  {
    teamId: 1610612738,
    color: '#008348',
    abbreviation: "BOS",
    teamName: "Boston Celtics",
    simpleName: "Celtics",
    city: "Boston"
  },
  {
    teamId: 1610612751,
    color: '#000000',
    abbreviation: "BKN",
    teamName: "Brooklyn Nets",
    simpleName: "Nets",
    city: "Brooklyn"
  },
  {
    teamId: 1610612766,
    color: '#1D1160',
    abbreviation: "CHA",
    teamName: "Charlotte Hornets",
    simpleName: "Hornets",
    city: "Charlotte"
  },
  {
    teamId: 1610612741,
    color: '#CE1141',
    abbreviation: "CHI",
    teamName: "Chicago Bulls",
    simpleName: "Bulls",
    city: "Chicago"
  },
  {
    teamId: 1610612739,
    color: '#860038',
    abbreviation: "CLE",
    teamName: "Cleveland Cavaliers",
    simpleName: "Cavaliers",
    city: "Cleveland"
  },
  {
    teamId: 1610612742,
    color: '#007DC5',
    abbreviation: "DAL",
    teamName: "Dallas Mavericks",
    simpleName: "Mavericks",
    city: "Dallas"
  },
  {
    teamId: 1610612743,
    color: '#4FA8FF',
    abbreviation: "DEN",
    teamName: "Denver Nuggets",
    simpleName: "Nuggets",
    city: "Denver"
  },
  {
    teamId: 1610612765,
    color: '#001F70',
    abbreviation: "DET",
    teamName: "Detroit Pistons",
    simpleName: "Pistons",
    city: "Detroit"
  },
  {
    teamId: 1610612744,
    color: '#006BB6',
    abbreviation: "GSW",
    teamName: "Golden State Warriors",
    simpleName: "Warriors",
    city: "Golden State"
  },
  {
    teamId: 1610612745,
    color: '#CE1141',
    abbreviation: "HOU",
    teamName: "Houston Rockets",
    simpleName: "Rockets",
    city: "Houston"
  },
  {
    teamId: 1610612754,
    color: '#00275D',
    abbreviation: "IND",
    teamName: "Indiana Pacers",
    simpleName: "Pacers",
    city: "Indiana"
  },
  {
    teamId: 1610612746,
    color: '#ED174C',
    abbreviation: "LAC",
    teamName: "Los Angeles Clippers",
    simpleName: "Clippers",
    city: "Los Angeles"
  },
  {
    teamId: 1610612747,
    color: '#552582',
    abbreviation: "LAL",
    teamName: "Los Angeles Lakers",
    simpleName: "Lakers",
    city: "Los Angeles"
  },
  {
    teamId: 1610612763,
    color: '#23375B',
    abbreviation: "MEM",
    teamName: "Memphis Grizzlies",
    simpleName: "Grizzlies",
    city: "Memphis"
  },
  {
    teamId: 1610612748,
    color: '#98002E',
    abbreviation: "MIA",
    teamName: "Miami Heat",
    simpleName: "Heat",
    city: "Miami"
  },
  {
    teamId: 1610612749,
    color: '#00471B',
    abbreviation: "MIL",
    teamName: "Milwaukee Bucks",
    simpleName: "Bucks",
    city: "Milwaukee"
  },
  {
    teamId: 1610612750,
    color: '#005083',
    abbreviation: "MIN",
    teamName: "Minnesota Timberwolves",
    simpleName: "Timberwolves",
    city: "Minnesota"
  },
  {
    teamId: 1610612740,
    color: '#002B5C',
    abbreviation: "NOP",
    teamName: "New Orleans Pelicans",
    simpleName: "Pelicans",
    city: "New Orleans"
  },
  {
    teamId: 1610612752,
    color: '#006BB6',
    abbreviation: "NYK",
    teamName: "New York Knicks",
    simpleName: "Knicks",
    city: "New York"
  },
  {
    teamId: 1610612760,
    color: '#007DC3',
    abbreviation: "OKC",
    teamName: "Oklahoma City Thunder",
    simpleName: "Thunder",
    city: "Oklahoma City"
  },
  {
    teamId: 1610612753,
    color: '#007DC5',
    abbreviation: "ORL",
    teamName: "Orlando Magic",
    simpleName: "Magic",
    city: "Orlando"
  },
  {
    teamId: 1610612755,
    color: '#006BB6',
    abbreviation: "PHI",
    teamName: "Philadelphia 76ers",
    simpleName: "76ers",
    city: "Philadelphia"
  },
  {
    teamId: 1610612756,
    color: '#1D1160',
    abbreviation: "PHX",
    teamName: "Phoenix Suns",
    simpleName: "Suns",
    city: "Phoenix"
  },
  {
    teamId: 1610612757,
    color: '#000000',
    abbreviation: "POR",
    teamName: "Portland Trail Blazers",
    simpleName: "Trail Blazers",
    city: "Portland"
  },
  {
    teamId: 1610612758,
    color: '#724C9F',
    abbreviation: "SAC",
    teamName: "Sacramento Kings",
    simpleName: "Kings",
    city: "Sacramento"
  },
  {
    teamId: 1610612759,
    color: '#000000',
    abbreviation: "SAS",
    teamName: "San Antonio Spurs",
    simpleName: "Spurs",
    city: "San Antonio"
  },
  {
    teamId: 1610612761,
    color: '#CE1141',
    abbreviation: "TOR",
    teamName: "Toronto Raptors",
    simpleName: "Raptors",
    city: "Toronto"
  },
  {
    teamId: 1610612762,
    color: '#002B5C',
    abbreviation: "UTA",
    teamName: "Utah Jazz",
    simpleName: "Jazz",
    city: "Utah"
  },
  {
    teamId: 1610612764,
    color: '#002566',
    abbreviation: "WAS",
    teamName: "Washington Wizards",
    simpleName: "Wizards",
    city: "Washington"
  }
]

const getTeam = ({ id, abbr, name, city }) => {
  return teams.find((team) => {
    return team.teamId === id || team.abbreviation === abbr || team.teamName === name || team.city === city;
  });
}

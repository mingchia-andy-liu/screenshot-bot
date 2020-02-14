const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const decorateHeaderScore = (hs, vs) => {
  const scores$ = $$('#match p');

  scores$[0].innerHTML = `<span ${winning(vs, hs)}>${vs}</span>`;
  scores$[2].innerHTML = `<span ${winning(hs, vs)}>${hs}</span>`;
};

const decorateHeaderTeam = (selector, city, name, abbr) => {
  const name$ = $(`${selector} .name`);
  const logo$ = $(`${selector} .logo`);
  name$.textContent = `${city} ${name}`;
  logo$.setAttribute('src', `assets/logos/${abbr}.svg`);
};

const decorateSummary = (home, visitor, periodStatus) => {
  const periods = ['q1', 'q2', 'q3', 'q4', 'ot1', 'ot2', 'ot3', 'ot4', 'ot5', 'ot6', 'ot7', 'ot8', 'ot9', 'ot10'];

  const playedPeriods = periods.slice(0, periodStatus);
  const homePeriods = playedPeriods.map((key) => `<td ${winning(home[key], visitor[key])}>${home[key]}</td>`);
  const visitorPeriods = playedPeriods.map((key) => `<td ${winning(visitor[key], home[key])}>${visitor[key]}</td>`);
  const titlePeriods = playedPeriods.map((key) => `<th>${key.toUpperCase()}</th>`);

  const homeRow = `<tr><th>${home.tc}</th>${homePeriods.join('')}<td ${winning(home.s, visitor.s)}>${home.s}</td></tr>`;
  const visitorRow = `<tr><th>${visitor.tc}</th>${visitorPeriods.join('')}<td ${winning(home.s, visitor.s)}>${visitor.s}</td></tr>`;
  const titleRow = `<tr><th>Team</th>${titlePeriods.join('')}<th>Final</th></tr>`;

  const summary$ = $('#summary');
  summary$.insertAdjacentHTML('beforeend', titleRow);
  summary$.insertAdjacentHTML('beforeend', visitorRow + homeRow);
};

const decoratePlayers = (teamSelector, team) => {
  const players = team.pstsg;
  const table$ = $(teamSelector);

  const header = `
        <tr>
            <th>${team.tc}</th>
            <th>MIN</th>
            <th>PTS</th>
            <th>FGM-A</th>
            <th class="short-hide">FG%</th>
            <th class="short-hide">3PM-A</th>
            <th class="short-hide">3P%</th>
            <th>FTM-A</th>
            <th class="short-hide">FT%</th>
            <th class="short-hide">OREB</th>
            <th class="short-hide">DREB</th>
            <th>REB</th>
            <th>AST</th>
            <th>STL</th>
            <th>BLK</th>
            <th>TOV</th>
            <th>PF</th>
            <th class="short-hide">+/-</th>
        </tr>
    `;

  const playersRows = players.map((player) => {
    const assists = player.ast;
    const blocks = player.blk;
    const fieldGoalsAttempted = player.fga;
    const fieldGoalsMade = player.fgm;
    const firstName = player.fn;
    const fouls = player.pf;
    const freeThrowsAttempted = player.fta;
    const freeThrowsMade = player.ftm;
    const lastName = player.ln;
    const minutes = player.min;
    const plusMinus = player.pm;
    const points = player.pts;
    const reboundsDefensive = player.dreb;
    const reboundsOffensive = player.oreb;
    const seconds = player.sec;
    const startingPosition = player.pos;
    const steals = player.stl;
    const threePointersAttempted = player.tpa;
    const threePointersMade = player.tpm;
    const turnovers = player.tov;

    const fn = firstName.trim();
    const ln = lastName.trim();
    const name = lastName !== '' ? `${fn} ${ln}` : firstName;


    const fgp = toPercentage(+fieldGoalsMade / +fieldGoalsAttempted);
    const tpp = toPercentage(+threePointersMade / +threePointersAttempted);
    const ftp = toPercentage(+freeThrowsMade / +freeThrowsAttempted);

    if (minutes === 0 && seconds === 0) {
      return '';
    }

    const doubles = hasDoubles(player);

    return `
            <tr ${doubles}>
                <td>${name} <span>${startingPosition}</span></td>
                <td>${formatMinutes(minutes, seconds)}</td>
                <td ${winning(points, 9)}>${points}</td>
                <td
                    ${winning(fgp, 59, fieldGoalsAttempted >= 5)}
                    ${losing(fgp, 31, fieldGoalsAttempted >= 5)}
                >
                    ${fieldGoalsMade}-${fieldGoalsAttempted}
                </td>
                <td
                    class="short-hide"
                    ${winning(fgp, 59, fieldGoalsAttempted >= 5)}
                    ${losing(fgp, 31, fieldGoalsAttempted >= 5)}
                >
                    ${fgp}${fgp !== '-' ? '%' : ''}
                </td>
                <td
                    class="short-hide"
                    ${winning(tpp, 59, threePointersAttempted >= 5)}
                    ${losing(tpp, 31, threePointersAttempted >= 5)}
                >
                    ${threePointersMade}-${threePointersAttempted}
                </td>
                <td
                    class="short-hide"
                    ${winning(tpp, 59, threePointersAttempted >= 5)}
                    ${losing(tpp, 31, threePointersAttempted >= 5)}
                >
                    ${tpp}${tpp !== '-' ? '%' : ''}
                </td>
                <td
                    ${winning(ftp, 89, freeThrowsAttempted >= 5)}
                    ${losing(ftp, 61, freeThrowsAttempted >= 5)}
                >
                    ${freeThrowsMade}-${freeThrowsAttempted}
                </td>
                <td
                    class="short-hide"
                    ${winning(ftp, 89, freeThrowsAttempted >= 5)}
                    ${losing(ftp, 61, freeThrowsAttempted >= 5)}
                >
                    ${ftp}${ftp !== '-' ? '%' : ''}
                </td>
                <td class="short-hide">${reboundsOffensive}</td>
                <td class="short-hide">${reboundsDefensive}</td>
                <td ${winning(reboundsDefensive + reboundsOffensive, 9)}>${reboundsDefensive + reboundsOffensive}</td>
                <td ${winning(assists, 9)}>${assists}</td>
                <td ${winning(steals, 9)}>${steals}</td>
                <td ${winning(blocks, 9)}>${blocks}</td>
                <td ${losingWhenMore(turnovers, 4)}>${turnovers}</td>
                <td ${losingWhenMore(fouls, 4)}>${fouls}</td>
                <td  class="short-hide">${plusMinus}</td>
            </tr>
        `;
  });
  const tbody = `${header}${playersRows.join('')}`;
  table$.insertAdjacentHTML('beforeend', tbody);
};

const decorateTeamStats = (home, visitor) => {
  const ht = home.tstsg;
  const vt = visitor.tstsg;

  const homeAssists = ht.ast;
  const homeBlocks = ht.blk;
  const homeFieldGoalsAttempted = ht.fga;
  const homeFieldGoalsMade = ht.fgm;
  const homeFreeThrowsAttempted = ht.fta;
  const homeFreeThrowsMade = ht.ftm;
  const homeReboundsDefensive = ht.dreb;
  const homeReboundsOffensive = ht.oreb;
  const homeTeamRebounds = ht.tmreb;
  const homeSteals = ht.stl;
  const homeThreePointersAttempted = ht.tpa;
  const homeThreePointersMade = ht.tpm;
  const homeTurnovers = ht.tov;
  const homeFouls = ht.pf;

  const visitorAssists = vt.ast;
  const visitorBlocks = vt.blk;
  const visitorFieldGoalsAttempted = vt.fga;
  const visitorFieldGoalsMade = vt.fgm;
  const visitorFreeThrowsAttempted = vt.fta;
  const visitorFreeThrowsMade = vt.ftm;
  const visitorReboundsDefensive = vt.dreb;
  const visitorReboundsOffensive = vt.oreb;
  const visitorTeamRebounds = vt.tmreb;
  const visitorSteals = vt.stl;
  const visitorThreePointersAttempted = vt.tpa;
  const visitorThreePointersMade = vt.tpm;
  const visitorTurnovers = vt.tov;
  const visitorFouls = vt.pf;

  const hfgp = toPercentage(+homeFieldGoalsMade / +homeFieldGoalsAttempted);
  const htpp = toPercentage(+homeThreePointersMade / +homeThreePointersAttempted);
  const hftp = toPercentage(+homeFreeThrowsMade / +homeFreeThrowsAttempted);

  const vfgp = toPercentage(+visitorFieldGoalsMade / +visitorFieldGoalsAttempted);
  const vtpp = toPercentage(+visitorThreePointersMade / +visitorThreePointersAttempted);
  const vftp = toPercentage(+visitorFreeThrowsMade / +visitorFreeThrowsAttempted);

  const titleRow = `
        <tr>
            <th>Team</th>
            <th>FGM-A</th>
            <th>FG%</th>
            <th class="short-hide">3PM-A</th>
            <th class="short-hide">3P%</th>
            <th>FTM-A</th>
            <th>FT%</th>
            <th class="short-hide">TREB</th>
            <th>REB</th>
            <th>AST</th>
            <th>STL</th>
            <th>BLK</th>
            <th>TOV</th>
            <th class="short-hide">PF</th>
        </tr>
    `;

  const homeRow = `
        <tr>
            <th>${home.tc}</th>
            <td
                ${winning(hfgp, 49)}
                ${losing(hfgp, 31)}
            >
                ${homeFieldGoalsMade}-${homeFieldGoalsAttempted}
            </td>
            <td
                ${winning(hfgp, 49)}
                ${losing(hfgp, 31)}
            >
                ${hfgp}%
            </td>
            <td
                class="short-hide"
                ${winning(htpp, 49)}
                ${losing(htpp, 31)}
            >
                ${homeThreePointersMade}-${homeThreePointersAttempted}
            </td>
            <td
                class="short-hide"
                ${winning(htpp, 49)}
                ${losing(htpp, 31)}
            >
                ${htpp}%
            </td>
            <td
                ${winning(hftp, 89)}
                ${losing(hftp, 61)}
            >
                ${homeFreeThrowsMade}-${homeFreeThrowsAttempted}
            </td>
            <td
                ${winning(hftp, 89)}
                ${losing(hftp, 61)}
            >
                ${hftp}%
            </td>
            <td class="short-hide">${homeTeamRebounds}</td>
            <td>${homeReboundsDefensive + homeReboundsOffensive}</td>
            <td>${homeAssists}</td>
            <td>${homeSteals}</td>
            <td>${homeBlocks}</td>
            <td>${homeTurnovers}</td>
            <td class="short-hide">${homeFouls}</td>
        </tr>
    `;

  const visitorRow = `
        <tr>
            <th>${visitor.tc}</th>
            <td
                ${winning(vfgp, 49)}
                ${losing(vfgp, 31)}
            >
                ${visitorFieldGoalsMade}-${visitorFieldGoalsAttempted}
            </td>
            <td
                ${winning(vfgp, 49)}
                ${losing(vfgp, 31)}
            >
                ${vfgp}%
            </td>
            <td
                class="short-hide"
                ${winning(vtpp, 49)}
                ${losing(vtpp, 31)}
            >
                ${visitorThreePointersMade}-${visitorThreePointersAttempted}
            </td>
            <td
                class="short-hide"
                ${winning(vtpp, 49)}
                ${losing(vtpp, 31)}
            >
                ${vtpp}%
            </td>
            <td
                ${winning(vftp, 89)}
                ${losing(vftp, 61)}
            >
                ${visitorFreeThrowsMade}-${visitorFreeThrowsAttempted}
            </td>
            <td
                ${winning(vftp, 89)}
                ${losing(vftp, 61)}
            >
                ${vftp}%
            </td>
            <td class="short-hide">${visitorTeamRebounds}</td>
            <td>${visitorReboundsDefensive + visitorReboundsOffensive}</td>
            <td>${visitorAssists}</td>
            <td>${visitorSteals}</td>
            <td>${visitorBlocks}</td>
            <td>${visitorTurnovers}</td>
            <td class="short-hide">${visitorFouls}</td>
        </tr>
    `;

  const teamStats$ = $('#team-stats');
  teamStats$.insertAdjacentHTML('beforeend', titleRow);
  teamStats$.insertAdjacentHTML('beforeend', visitorRow + homeRow);
};

const decorateAdvanced = (home, visitor, game) => {
  const ht = home.tstsg;
  const vt = visitor.tstsg;

  const homeBiggestLead = ht.ble;
  const homeBenchPoints = ht.bpts;
  const homeFastBreakPoints = ht.fbpts;
  const homeFastBreakPointsAttempted = ht.fbptsa;
  const homeFastBreakPointsMade = ht.fbptsm;
  const homePointsInPaint = ht.pip;
  const homePointsInPaintAttempted = ht.pipa;
  const homePointsInPaintMade = ht.pipm;
  const homePointsOffTurnovers = ht.potov;
  const homeSecondChancePoints = ht.scp;

  const visitorBiggestLead = vt.ble;
  const visitorBenchPoints = vt.bpts;
  const visitorFastBreakPoints = vt.fbpts;
  const visitorFastBreakPointsAttempted = vt.fbptsa;
  const visitorFastBreakPointsMade = vt.fbptsm;
  const visitorPointsInPaint = vt.pip;
  const visitorPointsInPaintAttempted = vt.pipa;
  const visitorPointsInPaintMade = vt.pipm;
  const visitorPointsOffTurnovers = vt.potov;
  const visitorSecondChancePoints = vt.scp;


  const titleRow = `
        <tr>
            <th>Team</th>
            <th>Biggest Lead</th>
            <th>Bench Pts</th>
            <th>2nd Chance Pts</th>
            <th>Fast Break Pts (M-A)</th>
            <th>Pts In Paint (M-A)</th>
            <th>Pts Off Turnovers</th>
        </tr>
    `;

  const homeRow = `
        <tr>
            <th>${home.tc}</th>
            <td>${homeBiggestLead}</td>
            <td>${homeBenchPoints}</td>
            <td>${homeSecondChancePoints}</td>
            <td>${homeFastBreakPoints} (${homeFastBreakPointsMade}-${homeFastBreakPointsAttempted})</td>
            <td>${homePointsInPaint} (${homePointsInPaintMade}-${homePointsInPaintAttempted})</td>
            <td>${homePointsOffTurnovers}</td>
        </tr>
    `;

  const visitorRow = `
        <tr>
            <th>${visitor.tc}</th>
            <td>${visitorBiggestLead}</td>
            <td>${visitorBenchPoints}</td>
            <td>${visitorSecondChancePoints}</td>
            <td>${visitorFastBreakPoints} (${visitorFastBreakPointsMade}-${visitorFastBreakPointsAttempted})</td>
            <td>${visitorPointsInPaint} (${visitorPointsInPaintMade}-${visitorPointsInPaintAttempted})</td>
            <td>${visitorPointsOffTurnovers}</td>
        </tr>
    `;


  const advanced = $('#advanced-stats');
  advanced.insertAdjacentHTML('beforeend', titleRow);
  advanced.insertAdjacentHTML('beforeend', visitorRow + homeRow);

  $('#advanced-extra-stats').insertAdjacentHTML('beforeend', `
        <tr>
            <th>Lead Changes</th>
            <th>Times Tied</th>
        </tr>
        <tr>
            <td>${game.lc}</td>
            <td>${game.tt}</td>
        </tr>
    `);
};

const format = () => {
  // get box scores
  const box = window.box;
  if (box == null) {
    return;
  }

  // get all the variables
  const home = box.hls;
  const visitor = box.vls;
  const period = box.p;

  // insert header
  decorateHeaderTeam('#header-home', home.tc, home.tn, home.ta);
  decorateHeaderTeam('#header-visitor', visitor.tc, visitor.tn, visitor.ta);
  decorateHeaderScore(home.s, visitor.s);

  // decorate summary
  decorateSummary(home, visitor, period);

  // decorate player stats
  decoratePlayers('#home-players-stats', home);
  decoratePlayers('#visitor-players-stats', visitor);

  // decorate team stats
  decorateTeamStats(home, visitor);
  decorateAdvanced(home, visitor, box.gsts);
};

format();

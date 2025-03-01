export interface NBATeam {
  code: string;
  name: string;
  logo: string;
}

export const nbaTeams: NBATeam[] = [
  {
    "code": "ATL",
    "name": "Atlanta Hawks",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/atl.png"
  },
  {
    "code": "BOS",
    "name": "Boston Celtics",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/bos.png"
  },
  {
    "code": "BKN",
    "name": "Brooklyn Nets",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png"
  },
  {
    "code": "CHA",
    "name": "Charlotte Hornets",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/cha.png"
  },
  {
    "code": "CHI",
    "name": "Chicago Bulls",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/chi.png"
  },
  {
    "code": "CLE",
    "name": "Cleveland Cavaliers",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/cle.png"
  },
  {
    "code": "DAL",
    "name": "Dallas Mavericks",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/dal.png"
  },
  {
    "code": "DEN",
    "name": "Denver Nuggets",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/den.png"
  },
  {
    "code": "DET",
    "name": "Detroit Pistons",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/det.png"
  },
  {
    "code": "GSW",
    "name": "Golden State Warriors",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/gs.png"
  },
  {
    "code": "HOU",
    "name": "Houston Rockets",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/hou.png"
  },
  {
    "code": "IND",
    "name": "Indiana Pacers",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/ind.png"
  },
  {
    "code": "LAC",
    "name": "LA Clippers",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/lac.png"
  },
  {
    "code": "LAL",
    "name": "Los Angeles Lakers",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/lal.png"
  },
  {
    "code": "MEM",
    "name": "Memphis Grizzlies",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/mem.png"
  },
  {
    "code": "MIA",
    "name": "Miami Heat",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/mia.png"
  },
  {
    "code": "MIL",
    "name": "Milwaukee Bucks",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/mil.png"
  },
  {
    "code": "MIN",
    "name": "Minnesota Timberwolves",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/min.png"
  },
  {
    "code": "NOP",
    "name": "New Orleans Pelicans",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/no.png"
  },
  {
    "code": "NYK",
    "name": "New York Knicks",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/ny.png"
  },
  {
    "code": "OKC",
    "name": "Oklahoma City Thunder",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/okc.png"
  },
  {
    "code": "ORL",
    "name": "Orlando Magic",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/orl.png"
  },
  {
    "code": "PHI",
    "name": "Philadelphia 76ers",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/phi.png"
  },
  {
    "code": "PHX",
    "name": "Phoenix Suns",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/phx.png"
  },
  {
    "code": "POR",
    "name": "Portland Trail Blazers",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/por.png"
  },
  {
    "code": "SAC",
    "name": "Sacramento Kings",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/sac.png"
  },
  {
    "code": "SAS",
    "name": "San Antonio Spurs",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/sa.png"
  },
  {
    "code": "TOR",
    "name": "Toronto Raptors",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/tor.png"
  },
  {
    "code": "UTA",
    "name": "Utah Jazz",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/utah.png"
  },
  {
    "code": "WAS",
    "name": "Washington Wizards",
    "logo": "https://a.espncdn.com/i/teamlogos/nba/500/was.png"
  }
];

// Map of team codes to ESPN API team codes
export const espnTeamCodes: Record<string, string> = {
  "ATL": "atl",
  "BOS": "bos",
  "BKN": "bkn",
  "CHA": "cha",
  "CHI": "chi",
  "CLE": "cle",
  "DAL": "dal",
  "DEN": "den",
  "DET": "det",
  "GSW": "gs",
  "HOU": "hou",
  "IND": "ind",
  "LAC": "lac",
  "LAL": "lal",
  "MEM": "mem",
  "MIA": "mia",
  "MIL": "mil",
  "MIN": "min",
  "NOP": "no",
  "NYK": "ny",
  "OKC": "okc",
  "ORL": "orl",
  "PHI": "phi",
  "PHX": "phx",
  "POR": "por",
  "SAC": "sac",
  "SAS": "sa",
  "TOR": "tor",
  "UTA": "uta",
  "WAS": "was"
};

// Get current NBA season year
export const getCurrentNBASeason = (): number => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // If we're in or after August, use the next year as the season
  // (NBA season typically starts in October and ends in June)
  if (currentMonth >= 7) { // August or later
    return currentYear + 1;
  } else {
    return currentYear;
  }
};

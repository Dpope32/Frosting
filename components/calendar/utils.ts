import { Task } from '@/types/task';

export const isNBATask = (task: Task): boolean => {
  return task.category === 'nba';
}

export const formatNBATitle = (title: string): string => {
  if (!isNBATask) return title;
  const replacements: Record<string, string> = {
    'Oklahoma City Thunder': 'Thunder',
    'Los Angeles Lakers': 'Lakers',
    'Los Angeles Clippers': 'Clippers',
    'Golden State Warriors': 'Warriors',
    'Phoenix Suns': 'Suns',
    'Sacramento Kings': 'Kings',
    'Portland Trail Blazers': 'Blazers',
    'Denver Nuggets': 'Nuggets',
    'Minnesota Timberwolves': 'Timberwolves',
    'Utah Jazz': 'Jazz',
    'San Antonio Spurs': 'Spurs',
    'Houston Rockets': 'Rockets',
    'Dallas Mavericks': 'Mavericks',
    'Memphis Grizzlies': 'Grizzlies',
    'New Orleans Pelicans': 'Pelicans',
    'Miami Heat': 'Heat',
    'Orlando Magic': 'Magic',
    'Atlanta Hawks': 'Hawks',
    'Washington Wizards': 'Wizards',
    'Charlotte Hornets': 'Hornets',
    'Detroit Pistons': 'Pistons',
    'Indiana Pacers': 'Pacers',
    'Cleveland Cavaliers': 'Cavaliers',
    'Chicago Bulls': 'Bulls',
    'Milwaukee Bucks': 'Bucks',
    'Toronto Raptors': 'Raptors',
    'Boston Celtics': 'Celtics',
    'New York Knicks': 'Knicks',
    'Philadelphia 76ers': '76ers',
    'Brooklyn Nets': 'Nets'
  };
  
  let formattedTitle = title;
  Object.entries(replacements).forEach(([fullName, shortName]) => {
    formattedTitle = formattedTitle.replace(fullName, shortName);
  });
  
  return formattedTitle;
};
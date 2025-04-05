// utils/stringUtils.ts

/**
 * Formats an NBA game title string to show only team names.
 * e.g., "Oklahoma City Thunder @ Phoenix Suns" becomes "Thunder @ Suns"
 * e.g., "Los Angeles Lakers vs Denver Nuggets" becomes "Lakers vs Nuggets"
 * If the title doesn't match the expected format, it returns the original title.
 * @param title The original game title string.
 * @returns The formatted title or the original title.
 */
export const formatNbaGameTitle = (title: string): string => {
  const separator = title.includes(' @ ') ? ' @ ' : title.includes(' vs ') ? ' vs ' : null;

  if (!separator) {
    return title; // Not a recognized NBA game format
  }

  const parts = title.split(separator);
  if (parts.length !== 2) {
    return title; // Unexpected format
  }

  const formatTeamName = (teamString: string): string => {
    const words = teamString.trim().split(' ');
    return words[words.length - 1]; // Return the last word (team name)
  };

  const team1 = formatTeamName(parts[0]);
  const team2 = formatTeamName(parts[1]);

  return `${team1}${separator}${team2}`;
};

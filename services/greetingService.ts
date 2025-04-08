// Helper function for the time-based part (keeps original logic)
const getTimeBasedGreeting = (hour: number): string => {
  switch (Math.floor(hour / 2)) {
    case 0: return "Hello";
    case 1: return 'Still up are we';
    case 2: return 'Early bird';
    case 3: return 'Rise and shine';
    case 4: return 'Morning';
    case 5: return 'Gm';
    case 6: return 'Lunch time';
    case 7: return 'Good afternoon';
    case 8: return 'Whats good';
    case 9: return 'Good evening';
    case 10: return 'Gn';
    case 11:
    default: return 'Goodnight';
  }
};

// Helper to get day of the year (1-366)
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const getGreeting = (username: string) => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfYear = getDayOfYear(now); // Get the current day of the year

  const timeBasedGreeting = getTimeBasedGreeting(hour);

  // Define the "changeup" greetings for specific days
  const changeupGreetings = [
    `${username}. ${username}, ${username}!`,
    `${username} returns!`,
    `Look who it is! ${username}!`
  ];

  // Define the "regular" personalized greetings (excluding the changeups)
  // Added the base time greeting here too for more variety on regular days
  const regularPersonalizedGreetings = [
    `${timeBasedGreeting}, ${username}`,
    `Welcome back, ${username}`,
    `Hey ${username}, ${timeBasedGreeting.toLowerCase()}`,
    `What's up, ${username}?`,
    `${timeBasedGreeting}! Ready for action, ${username}?`,
    `Greetings, ${username}`,
    timeBasedGreeting // Include the base time greeting itself
  ];

  let finalGreeting: string;

  // Check if it's a "changeup" day (e.g., every 3rd day)
  if (dayOfYear % 3 === 0) {
    // Select a random greeting from the changeup list
    const randomIndex = Math.floor(Math.random() * changeupGreetings.length);
    finalGreeting = changeupGreetings[randomIndex];
    // Ensure punctuation if needed for changeup greetings
    if (!/[.,!?]$/.test(finalGreeting)) {
        finalGreeting += '!';
    }
  } else {
    // Select a random greeting from the regular list
    const randomIndex = Math.floor(Math.random() * regularPersonalizedGreetings.length);
    let selectedGreeting = regularPersonalizedGreetings[randomIndex];

    // --- Post-processing for regular greetings (similar logic as before) ---
    // Ensure username is appended if it's just the time-based greeting
    if (selectedGreeting === timeBasedGreeting) {
        selectedGreeting = `${timeBasedGreeting}, ${username}`;
    }
    // Basic check to avoid double username in simple cases
    else if (!selectedGreeting.includes(username)) {
        selectedGreeting = `${selectedGreeting}, ${username}`;
    }

    // Handle cases like "Gm" or "Gn" needing punctuation before username
    if (selectedGreeting.startsWith('Gm,') || selectedGreeting.startsWith('Gn,')) {
        selectedGreeting = selectedGreeting.replace(',', '!');
    }
    // Add punctuation if the time-based part doesn't end with it and username was added
    else if (selectedGreeting.startsWith(timeBasedGreeting) && !/[.,!?]$/.test(timeBasedGreeting)) {
         // Find the position right after the timeBasedGreeting part
         const insertPos = timeBasedGreeting.length;
         // Check if the next char isn't already punctuation before adding a comma
         if (selectedGreeting.length > insertPos && !/[.,!?]/.test(selectedGreeting[insertPos])) {
            selectedGreeting = selectedGreeting.slice(0, insertPos) + ',' + selectedGreeting.slice(insertPos);
         }
    }
    // Ensure the final regular greeting ends with some punctuation if username is present
    else if (selectedGreeting.includes(username) && !/[.,!?]$/.test(selectedGreeting)) {
        selectedGreeting += '.';
    }
    // --- End Post-processing ---

    finalGreeting = selectedGreeting;
  }

  return finalGreeting;
}

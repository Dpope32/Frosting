import { getUSHolidays } from './holidayService';

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

const getRandomEmoji = (): string => {
  const emojis = ['👋', '✨', '🌟', '🎉', '💫', '🌈', '⭐', '🔥', '💪', '🚀'];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

export const getGreeting = (username: string, temp?: number) => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfYear = getDayOfYear(now);
  const dayOfWeek = now.toLocaleDateString(undefined, { weekday: 'long' });
  const timeBasedGreeting = getTimeBasedGreeting(hour);

  // --- Holiday Greeting Logic ---
  const year = now.getFullYear();
  const todayISO = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const holidays = getUSHolidays(year);
  const todayHoliday = holidays.find(h => h.date === todayISO);

  if (todayHoliday) {
    // Map of holiday name to possible greetings
    const holidayGreetingMap: Record<string, string[]> = {
      "New Year's Day": [
        "Happy New Year!",
        "Wishing you a fantastic New Year!",
        "Cheers to a new beginning!",
        "Welcome to the new year, let's make it great!"
      ],
      "Martin Luther King Jr. Day": [
        "Honoring Dr. King today.",
        "Happy Martin Luther King Jr. Day!",
        "Remembering the dream."
      ],
      "Presidents' Day": [
        "Happy Presidents' Day!",
        "Celebrating our leaders today."
      ],
      "Washington's Birthday": [
        "Happy Washington's Birthday!",
        "Remembering George Washington today."
      ],
      "Good Friday": [
        "Reflecting on Good Friday.",
        "Wishing you a peaceful Good Friday."
      ],
      "Easter Sunday": [
        "Happy Easter!",
        "Hope you have a wonderful Easter!",
        "Wishing you a joyful Easter Sunday."
      ],
      "Memorial Day": [
        "Honoring our heroes this Memorial Day.",
        "Happy Memorial Day!",
        "Remembering those who served."
      ],
      "Juneteenth": [
        "Happy Juneteenth!",
        "Celebrating freedom today."
      ],
      "Independence Day": [
        "Happy 4th of July!",
        "Happy Independence Day!",
        "Enjoy the fireworks!"
      ],
      "Labor Day": [
        "Happy Labor Day!",
        "Enjoy your well-deserved break!"
      ],
      "Columbus Day": [
        "Happy Columbus Day!",
        "Exploring new horizons today."
      ],
      "Indigenous Peoples' Day": [
        "Honoring Indigenous Peoples today.",
        "Happy Indigenous Peoples' Day!"
      ],
      "Veterans Day": [
        "Thank you, veterans!",
        "Honoring all who served.",
        "Happy Veterans Day!"
      ],
      "Thanksgiving Day": [
        "Happy Thanksgiving!",
        "Hope you have a wonderful Thanksgiving!",
        "Grateful for you this Thanksgiving."
      ],
      "Christmas Day": [
        "Merry Christmas!",
        "Wishing you a joyful Christmas!",
        "Hope your Christmas is merry and bright!"
      ],
      "Valentine's Day": [
        "Happy Valentine's Day!",
        "Sending love your way!",
        "Hope your day is filled with love."
      ],
      "St. Patrick's Day": [
        "Happy St. Patrick's Day!",
        "Wishing you the luck of the Irish!",
        "Don't forget to wear green!"
      ],
      "Halloween": [
        "Happy Halloween!",
        "Spooky greetings!",
        "Hope you have a frightfully fun Halloween!"
      ]
    };

    // Fallback for custom holidays or missing ones
    const holidayGreetings = holidayGreetingMap[todayHoliday.title] || [
      `Happy ${todayHoliday.title}!`
    ];
    // Add some variety by including username or time-based
    const possibleHolidayGreetings = [
      ...holidayGreetings,
      `${holidayGreetings[0]} ${username}!`,
      `${holidayGreetings[0]} ${timeBasedGreeting}, ${username}!`
    ];
    const randomIndex = Math.floor(Math.random() * possibleHolidayGreetings.length);
    return possibleHolidayGreetings[randomIndex];
  }

  // --- Temperature-based Greetings (12 new, only if temp is provided) ---
  const tempGreetings = temp !== undefined && temp !== null ? [
    temp >= 95 ? `It's a scorcher at ${temp}°F, ${username}!` : null,
    temp >= 85 && temp < 95 ? `Stay cool, it's ${temp}°F today, ${username}!` : null,
    temp >= 75 && temp < 85 ? `Perfect weather at ${temp}°F, ${username}!` : null,
    temp >= 65 && temp < 75 ? `Mild and comfy: ${temp}°F, ${username}.` : null,
    temp >= 55 && temp < 65 ? `A crisp ${temp}°F out there, ${username}.` : null,
    temp >= 45 && temp < 55 ? `Sweater weather: ${temp}°F, ${username}!` : null,
    temp >= 35 && temp < 45 ? `Chilly ${temp}°F today, ${username}.` : null,
    temp >= 25 && temp < 35 ? `Bundle up, it's ${temp}°F, ${username}!` : null,
    temp < 25 ? `Brrr! Only ${temp}°F, ${username}!` : null,
    temp >= 100 ? `Heatwave alert: ${temp}°F, ${username}!` : null,
    temp <= 10 ? `Arctic vibes: ${temp}°F, ${username}!` : null,
    temp >= 60 && temp < 70 ? `Nice and pleasant: ${temp}°F, ${username}.` : null,
  ].filter(Boolean) as string[] : [];

  // --- Changeup Greetings (expanded and more varied) ---
  const changeupGreetings = [
    ...tempGreetings,
    `${username}. ${username}, ${username}`,
    `${username} returns!`,
    `Look who it is! ${username}!`,
    `Guess who's back? It's ${username}!`,
    `The legend, ${username}, has arrived.`,
    `All hail ${username}!`,
    `Welcome to the matrix, ${username}.`,
    `Ready to conquer ${dayOfWeek}?`,
    `It's a beautiful ${dayOfWeek}, ${username}!`,
    `Alert: ${username} detected.`,
    `The one and only ${username}!`,
    `You again, ${username}?`,
    `Mission start: ${username} online.`,
    `Status: ${username} is present.`,
    `Welcome, agent ${username}.`,
    `Rise and grind, ${username}!`,
    `Let's get after it, ${username}!`,
    `Another day, another adventure, ${username}.`,
    `The universe welcomes you, ${username}.`,
    `Hey superstar, ${username}!`,
    `Time to shine, ${username}!`,
    `Did someone say ${username}?`,
    `Welcome back, time traveler ${username}.`,
    `You made it, ${username}!`,
    `Good vibes only, ${username}!`,
    `Ready for greatness, ${username}?`,
    `Let's make today awesome, ${username}!`,
    `Who let the ${username} out?`,
    `You're back!`,
    `Hey ${username}, ready to conquer ${dayOfWeek}?`,
    `Let's make today awesome, ${username}!`,
    `Who let the ${username} out?`,
    `You're back! ${username} is here!`,
    `Hey ${username}, ready to conquer ${dayOfWeek}?`,
    'Well, well, well..',
    'About time you check your fav app!',
    'OH ${username}!',
  ];

  // --- Regular Personalized Greetings (expanded) ---
  const regularPersonalizedGreetings = [
    `${timeBasedGreeting}, ${username}`,
    `Welcome back, ${username}`,
    `Hey ${username}, ${timeBasedGreeting.toLowerCase()}`,
    `What's up, ${username}?`,
    `${timeBasedGreeting}! Ready for action, ${username}?`,
    `Greetings, ${username}`,
    timeBasedGreeting, // Include the base time greeting itself
    `Hope you're having a great ${dayOfWeek}`,
    `How's your ${dayOfWeek} going, ${username}?`,
    `Let's make the most of this ${dayOfWeek}`,
    `Sending positive vibes, ${username}`,
    `You got this, ${username}!`,
    `Keep crushing it, ${username}!`,
    `Stay awesome, ${username}!`,
    `Let's do this, ${username}!`,
    `Onward and upward, ${username}!`,
    `The day is yours, ${username}!`,
    `Seize the day, ${username}!`,
    `Hope ur day is as awesome as you are, ${username} :)`
  ];

  const edgyGreetingsThatShouldBeUsedRarely = [
    'IF YOU DONT START CHECKING OFF YOUR TODO LIST, I WILL BE VERY DISAPPOINTED IN YOU',
    'I think you are doing great, ${username}',
    'CHECK THE WEATHER BY CLICKING THE TEMP',
    'CHECK YOUR WIFI BY CLICKING THE WIFI',
    'CHECK YOUR STOCKS BY CLICKING THE MONEY',
    'CHECK THE DAILY QUOTE BY CLICKING THE QUOTE',
    'DISABLE ANY BUTTON BELOW THIS IN THE SETTINGS'
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
  } else if (dayOfYear % 5 === 0) {
    // Select a random greeting from the edgy list
    const randomIndex = Math.floor(Math.random() * edgyGreetingsThatShouldBeUsedRarely.length);
    finalGreeting = edgyGreetingsThatShouldBeUsedRarely[randomIndex];
    // Check if its a curveball day, if so, add a random emoji to the greeting
    if (dayOfYear % 5 === 0) {
      finalGreeting += ' ' + getRandomEmoji();
    }
    // Random check to remind user to text a friend or family member and check in on them
    if (Math.random() < 0.1) {
      finalGreeting += ' Text a friend or family member and check in on them today!';
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

  // Ensure greeting fits UI constraints (max 48 chars)
  const MAX_GREETING_LENGTH = 48;
  if (finalGreeting.length > MAX_GREETING_LENGTH) {
    return finalGreeting.slice(0, MAX_GREETING_LENGTH - 1) + "…";
  }
  return finalGreeting;
}

export const getGreeting = () => {
  const hour = new Date().getHours()
  switch (Math.floor(hour / 2)) {
    case 0:
      return "Hello"
    case 1:
      return 'Still up are we'
    case 2:
      return 'Early bird'
    case 3:
      return 'Rise and shine'
    case 4:
      return 'Morning'
    case 5:
      return 'Gm'
    case 6:
      return 'Lunch time'
    case 7:
      return 'Good afternoon'
    case 8:
      return 'Whats good'
    case 9:
      return 'Good evening'
    case 10:
      return 'Gn'
    default:
      return 'Goodnight'
  }
}

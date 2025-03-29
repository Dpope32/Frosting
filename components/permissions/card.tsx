

type IconName = "people" | "calendar" | "images" | "notifications";

export interface Card {
    id: number;
    title: string;
    description: string;
    gradientColors: readonly [string, string];
    titleColor: string;
    icon: IconName;
    iconColor: string;
    isDark?: boolean;
  }

 export const cards: Card[] = [
      {
        id: 1,
        title: "Contacts",
        description: "This allows you to import existing contacts.",
        gradientColors: ["#411465", "#2a0d42"] as const,
        titleColor: "#C080FF",
        icon: "people",
        iconColor: "#C080FF"
      },
      {
        id: 2,
        title: "Calendar",
        description: "This helps you manage events and appointments.",
        gradientColors: ["#064e42", "#043530"] as const,
        titleColor: "#4ADECD",
        icon: "calendar",
        iconColor: "#4ADECD"
      },
      {
        id: 3,
        title: "Photo Library",
        description: "This allows you to select a profile picture.",
        gradientColors: ["#6e2b11", "#4a1d0b"] as const,
        titleColor: "#FF9D5C",
        icon: "images",
        iconColor: "#FF9D5C"
      },
      {
        id: 4,
        title: "Notifications",
        description: "This reminds you of upcoming events, birthdays, and tasks.",
        gradientColors: ["#0e2e85", "#0a1f5a"] as const,
        titleColor: "#6495ED",
        icon: "notifications",
        iconColor: "#6495ED"
      }
    ];

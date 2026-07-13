const WELCOME_KEY = "smc_welcome_seen";
const TOUR_KEY = "smc_tour_done";

function userKey(base: string, userId: string) {
  return `${base}_${userId}`;
}

export function hasSeenWelcome(userId: string): boolean {
  return localStorage.getItem(userKey(WELCOME_KEY, userId)) === "1";
}

export function markWelcomeSeen(userId: string): void {
  localStorage.setItem(userKey(WELCOME_KEY, userId), "1");
}

export function hasCompletedTour(userId: string): boolean {
  return localStorage.getItem(userKey(TOUR_KEY, userId)) === "1";
}

export function markTourCompleted(userId: string): void {
  localStorage.setItem(userKey(TOUR_KEY, userId), "1");
}

export function shouldShowWelcome(userId: string): boolean {
  return !hasSeenWelcome(userId);
}

export type TourStep = {
  id: string;
  target: string;
  title: string;
  description: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard",
    target: '[data-tour="nav-dashboard"]',
    title: "Dashboard",
    description: "Yahan se apne accounts, scheduled posts, aur activity ka quick overview milta hai.",
  },
  {
    id: "compose",
    target: '[data-tour="nav-compose"]',
    title: "Compose",
    description: "Ek jagah se likho, live preview dekho, aur LinkedIn / Reddit par publish ya schedule karo.",
  },
  {
    id: "calendar",
    target: '[data-tour="nav-calendar"]',
    title: "Calendar",
    description: "Scheduled posts calendar view mein — drag-free planning ke liye perfect.",
  },
  {
    id: "accounts",
    target: '[data-tour="nav-accounts"]',
    title: "Accounts",
    description: "Social accounts connect karo. Pehle LinkedIn, phir Reddit ya doosre platforms.",
  },
  {
    id: "settings",
    target: '[data-tour="nav-settings"]',
    title: "Settings & Plans",
    description: "Profile, billing plans, aur AI keys yahan manage karo.",
  },
];

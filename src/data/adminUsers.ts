export type AdminUserRole =
  | "Super Administrator"
  | "Administrator"
  | "Content Manager"
  | "Marketing Manager"
  | "Analyst";

export const USER_ROLES: AdminUserRole[] = [
  "Super Administrator",
  "Administrator",
  "Content Manager",
  "Marketing Manager",
  "Analyst",
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: "Active" | "Invited";
  twoFA: boolean;
  lastActive: string;
  logins: number;
  actions: number;
  week: number[]; // actions per day, Mon → Sun
  hue: "slate" | "amber" | "sky" | "emerald" | "violet";
};

export const USERS_SEED: AdminUser[] = [
  {
    id: "u1",
    name: "Wuese Philip",
    email: "pwuese.p@gmail.com",
    role: "Super Administrator",
    status: "Active",
    twoFA: true,
    lastActive: "Online now",
    logins: 148,
    actions: 312,
    week: [9, 14, 11, 17, 12, 3, 6],
    hue: "slate",
  },
  {
    id: "u2",
    name: "Jonas Weber",
    email: "jonas@alexrivera.dev",
    role: "Administrator",
    status: "Active",
    twoFA: true,
    lastActive: "1h ago",
    logins: 86,
    actions: 154,
    week: [6, 9, 4, 12, 8, 2, 5],
    hue: "amber",
  },
  {
    id: "u3",
    name: "Priya Natarajan",
    email: "priya@alexrivera.dev",
    role: "Content Manager",
    status: "Active",
    twoFA: false,
    lastActive: "3d ago",
    logins: 52,
    actions: 88,
    week: [3, 5, 7, 2, 9, 0, 1],
    hue: "sky",
  },
  {
    id: "u4",
    name: "Sofia Marchetti",
    email: "sofia@alexrivera.dev",
    role: "Analyst",
    status: "Invited",
    twoFA: false,
    lastActive: "Invitation pending",
    logins: 0,
    actions: 0,
    week: [0, 0, 0, 0, 0, 0, 0],
    hue: "violet",
  },
];

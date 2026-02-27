// ─── Shared enums ─────────────────────────────────────────────────────────────

export type LeagueFormat = "points" | "strokes" | "best_x";
export type LeagueStatus = "active" | "archived";
export type ParticipantFormat = "individual" | "team";
export type SeasonStatus = "draft" | "published" | "archived";
export type LeaderboardUnit = "points" | "strokes";
export type PaymentMode = "free" | "paid";
export type EventType = "course_play" | "hit_it" | "closest_to_pin";

// ─── Event settings ───────────────────────────────────────────────────────────

export interface CoursePlaySettings {
  courseId?: string;
  course?: string;
  holes?: "front9" | "back9" | 18;
  tee?: string;
  putting?: "none" | "auto" | "manual";
  scoring?: "stroke" | "stableford";
  mulligans?: number;
  handicap?: boolean;
  leaderboardMode?: "gross" | "net";
  maxScorePerHole?: number;
}

export interface HitItSettings {
  attempts?: number;
  scoring?: "longest" | "zones";
  targetDistance?: number;
}

export interface ClosestToPinSettings {
  distance?: number;
  attempts?: number;
  tieBreak?: "earliest" | "best_second";
}

export type EventSettings = CoursePlaySettings | HitItSettings | ClosestToPinSettings;

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  mode: PaymentMode;
  price?: number;
  taxEnabled?: boolean;
  taxRate?: number;
  signupStart?: string; // local datetime string (no timezone)
  signupEnd?: string;   // local datetime string (no timezone)
}

// ─── Core entities ────────────────────────────────────────────────────────────

/** One-to-many with Season */
export interface League {
  id: string;
  name: string;
  format: LeagueFormat;
  participantFormat?: ParticipantFormat;
  status: LeagueStatus;
  coverImage?: string; // data URL
  logoImage?: string;  // data URL
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
}

/** Belongs to League; one-to-many with LeagueEvent */
export interface Season {
  id: string;
  leagueId: string;
  name: string;
  description?: string;
  participantLimit?: number;
  leaderboardUnit: LeaderboardUnit;
  status: SeasonStatus;
  payment: Payment;
  leagueLink?: string;  // generated on publish
  coverImage?: string;  // data URL
  bannerImage?: string; // data URL
  createdAt: string;    // ISO
  updatedAt: string;    // ISO
}

/** Belongs to Season */
export interface LeagueEvent {
  id: string;
  seasonId: string;
  name: string;
  type: EventType;
  sponsorName?: string;
  sponsorLogo?: string; // data URL
  startAt?: string;     // local datetime string (no timezone), e.g. "2024-03-15T14:30"
  endAt?: string;       // local datetime string (no timezone)
  settings: EventSettings;
}

// ─── Flat DB stored in localStorage ──────────────────────────────────────────

export interface DB {
  leagues: League[];
  seasons: Season[];
  events: LeagueEvent[];
}

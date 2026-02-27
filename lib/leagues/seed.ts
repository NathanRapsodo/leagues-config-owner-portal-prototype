import { DB } from "./types";

const STORAGE_KEY = "leagues_admin_v4";

// ─── Fixed IDs (used in generateStaticParams for static export) ───────────────

export const SEED_LEAGUE_IDS = [
  "00000001-0000-0000-0000-000000000001",
  "00000002-0000-0000-0000-000000000002",
  "00000003-0000-0000-0000-000000000003",
];

/** Maps leagueId → seasonIds for all seed seasons */
export const SEED_SEASON_IDS: Record<string, string[]> = {
  "00000001-0000-0000-0000-000000000001": [
    "10000001-0000-0000-0000-000000000001",
    "10000002-0000-0000-0000-000000000002",
  ],
  "00000002-0000-0000-0000-000000000002": [
    "10000003-0000-0000-0000-000000000003",
  ],
  "00000003-0000-0000-0000-000000000003": [
    "10000004-0000-0000-0000-000000000004",
  ],
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_DATA: DB = {
  leagues: [
    {
      id: "00000001-0000-0000-0000-000000000001",
      name: "City Links Golf League",
      format: "strokes",
      participantFormat: "individual",
      status: "active",
      coverImage: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=400&fit=crop&auto=format&q=80",
      logoImage: "https://images.unsplash.com/photo-1552423314-cf29ab68ad73?w=200&h=200&fit=crop&auto=format&q=80",
      createdAt: "2025-01-10T09:00:00.000Z",
      updatedAt: "2026-02-01T10:00:00.000Z",
    },
    {
      id: "00000002-0000-0000-0000-000000000002",
      name: "Weekend Warriors",
      format: "points",
      participantFormat: "individual",
      status: "active",
      coverImage: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=400&fit=crop&auto=format&q=80",
      logoImage: "https://images.unsplash.com/photo-1560438718-eb61ede255eb?w=200&h=200&fit=crop&auto=format&q=80",
      createdAt: "2025-09-01T09:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    },
    {
      id: "00000003-0000-0000-0000-000000000003",
      name: "Club Championship 2024",
      format: "best_x",
      participantFormat: "individual",
      status: "archived",
      coverImage: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&h=400&fit=crop&auto=format&q=80",
      logoImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop&auto=format&q=80",
      createdAt: "2024-01-01T09:00:00.000Z",
      updatedAt: "2024-12-31T10:00:00.000Z",
    },
  ],
  seasons: [
    // City Links — Spring 2025 (completed: all events in the past)
    {
      id: "10000001-0000-0000-0000-000000000001",
      leagueId: "00000001-0000-0000-0000-000000000001",
      name: "Spring 2025",
      leaderboardUnit: "points",
      status: "published",
      payment: { mode: "paid", price: 50 },
      leagueLink: "https://leagues.example.com/join/10000001-0000-0000-0000-000000000001",
      description: "Our opening season of the year featuring 4 competitive stroke play rounds.",
      participantLimit: 40,
      coverImage: "https://images.unsplash.com/photo-1490509353573-2ee6b88bca93?w=1200&h=400&fit=crop&auto=format&q=80",
      bannerImage: "https://images.unsplash.com/photo-1490509353573-2ee6b88bca93?w=1200&h=300&fit=crop&crop=bottom&auto=format&q=80",
      createdAt: "2025-01-10T09:00:00.000Z",
      updatedAt: "2025-01-15T10:00:00.000Z",
    },
    // City Links — Summer 2026 (live: events span the current date Feb 27 2026)
    {
      id: "10000002-0000-0000-0000-000000000002",
      leagueId: "00000001-0000-0000-0000-000000000001",
      name: "Summer 2026",
      leaderboardUnit: "points",
      status: "published",
      payment: { mode: "paid", price: 75, taxEnabled: true, taxRate: 10 },
      leagueLink: "https://leagues.example.com/join/10000002-0000-0000-0000-000000000002",
      description: "Summer championship with handicap scoring across all rounds.",
      participantLimit: 60,
      coverImage: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=400&fit=crop&crop=bottom&auto=format&q=80",
      bannerImage: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=300&fit=crop&crop=center&auto=format&q=80",
      createdAt: "2025-11-01T09:00:00.000Z",
      updatedAt: "2026-01-20T10:00:00.000Z",
    },
    // Weekend Warriors — 2026 Spring Series (upcoming: events start Apr 2026)
    {
      id: "10000003-0000-0000-0000-000000000003",
      leagueId: "00000002-0000-0000-0000-000000000002",
      name: "2026 Spring Series",
      leaderboardUnit: "points",
      status: "published",
      payment: { mode: "free" },
      leagueLink: "https://leagues.example.com/join/10000003-0000-0000-0000-000000000003",
      description: "Weekend warrior stableford series — open to all handicap levels.",
      coverImage: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=400&fit=crop&crop=bottom&auto=format&q=80",
      bannerImage: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=300&fit=crop&crop=center&auto=format&q=80",
      createdAt: "2026-01-15T09:00:00.000Z",
      updatedAt: "2026-02-01T10:00:00.000Z",
    },
    // Club Championship — 2024 (archived)
    {
      id: "10000004-0000-0000-0000-000000000004",
      leagueId: "00000003-0000-0000-0000-000000000003",
      name: "2024 Annual Championship",
      leaderboardUnit: "points",
      status: "archived",
      payment: { mode: "paid", price: 120 },
      description: "Annual club championship with match play format.",
      coverImage: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&h=400&fit=crop&crop=top&auto=format&q=80",
      createdAt: "2024-01-01T09:00:00.000Z",
      updatedAt: "2024-12-15T10:00:00.000Z",
    },
  ],
  events: [
    // Spring 2025 events — all completed (Jan–Apr 2025)
    {
      id: "20000001-0000-0000-0000-000000000001",
      seasonId: "10000001-0000-0000-0000-000000000001",
      name: "Round 1 — Meadowbrook",
      type: "course_play",
      startAt: "2025-02-01T08:00:00.000Z",
      endAt: "2025-02-01T18:00:00.000Z",
      settings: { holes: 18, scoring: "stroke" },
    },
    {
      id: "20000002-0000-0000-0000-000000000002",
      seasonId: "10000001-0000-0000-0000-000000000001",
      name: "Round 2 — Pineview Links",
      type: "course_play",
      startAt: "2025-03-01T08:00:00.000Z",
      endAt: "2025-03-01T18:00:00.000Z",
      settings: { holes: 18, scoring: "stroke" },
    },
    {
      id: "20000003-0000-0000-0000-000000000003",
      seasonId: "10000001-0000-0000-0000-000000000001",
      name: "Closest to Pin Challenge",
      type: "closest_to_pin",
      startAt: "2025-03-15T09:00:00.000Z",
      endAt: "2025-03-15T17:00:00.000Z",
      settings: { distance: 150, attempts: 3 },
    },
    {
      id: "20000004-0000-0000-0000-000000000004",
      seasonId: "10000001-0000-0000-0000-000000000001",
      name: "Grand Finale",
      type: "course_play",
      startAt: "2025-04-12T08:00:00.000Z",
      endAt: "2025-04-12T18:00:00.000Z",
      settings: { holes: 18, scoring: "stroke" },
    },
    // Summer 2026 events — live (Feb 1 – Apr 30 2026, spans Feb 27 2026)
    {
      id: "20000005-0000-0000-0000-000000000005",
      seasonId: "10000002-0000-0000-0000-000000000002",
      name: "Opening Round — Lakeside",
      type: "course_play",
      startAt: "2026-02-01T08:00:00.000Z",
      endAt: "2026-02-28T18:00:00.000Z",
      settings: { holes: 18, scoring: "stroke", handicap: true },
    },
    {
      id: "20000006-0000-0000-0000-000000000006",
      seasonId: "10000002-0000-0000-0000-000000000002",
      name: "Longest Drive Challenge",
      type: "hit_it",
      startAt: "2026-03-15T09:00:00.000Z",
      endAt: "2026-03-15T17:00:00.000Z",
      settings: { attempts: 3, scoring: "longest" },
      sponsorName: "BigDrive Co.",
    },
    {
      id: "20000007-0000-0000-0000-000000000007",
      seasonId: "10000002-0000-0000-0000-000000000002",
      name: "Summer Grand Final",
      type: "course_play",
      startAt: "2026-04-18T08:00:00.000Z",
      endAt: "2026-04-18T18:00:00.000Z",
      settings: { holes: 18, scoring: "stroke", handicap: true },
    },
    // 2026 Spring Series events — upcoming (Apr–Jun 2026)
    {
      id: "20000008-0000-0000-0000-000000000008",
      seasonId: "10000003-0000-0000-0000-000000000003",
      name: "Stableford Round 1",
      type: "course_play",
      startAt: "2026-04-05T08:00:00.000Z",
      endAt: "2026-04-05T18:00:00.000Z",
      settings: { holes: 18, scoring: "stableford" },
    },
    {
      id: "20000009-0000-0000-0000-000000000009",
      seasonId: "10000003-0000-0000-0000-000000000003",
      name: "Stableford Round 2",
      type: "course_play",
      startAt: "2026-05-10T08:00:00.000Z",
      endAt: "2026-05-10T18:00:00.000Z",
      settings: { holes: 18, scoring: "stableford" },
    },
    {
      id: "20000010-0000-0000-0000-000000000010",
      seasonId: "10000003-0000-0000-0000-000000000003",
      name: "Series Final",
      type: "course_play",
      startAt: "2026-06-07T08:00:00.000Z",
      endAt: "2026-06-07T18:00:00.000Z",
      settings: { holes: 18, scoring: "stableford" },
    },
    // 2024 Championship events (season is archived)
    {
      id: "20000011-0000-0000-0000-000000000011",
      seasonId: "10000004-0000-0000-0000-000000000004",
      name: "Quarter Finals",
      type: "course_play",
      startAt: "2024-09-07T08:00:00.000Z",
      endAt: "2024-09-07T18:00:00.000Z",
      settings: { holes: 18 },
    },
    {
      id: "20000012-0000-0000-0000-000000000012",
      seasonId: "10000004-0000-0000-0000-000000000004",
      name: "Semi Finals",
      type: "course_play",
      startAt: "2024-10-05T08:00:00.000Z",
      endAt: "2024-10-05T18:00:00.000Z",
      settings: { holes: 18 },
    },
    {
      id: "20000013-0000-0000-0000-000000000013",
      seasonId: "10000004-0000-0000-0000-000000000004",
      name: "Grand Final",
      type: "course_play",
      startAt: "2024-11-02T08:00:00.000Z",
      endAt: "2024-11-02T18:00:00.000Z",
      settings: { holes: 18 },
    },
  ],
};

// ─── Seed initialiser ─────────────────────────────────────────────────────────

/** Writes seed data to localStorage only if the key doesn't already exist. */
export function seedIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
}

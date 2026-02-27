import { DB, League, Season, LeagueEvent } from "./types";
import { seedIfEmpty } from "./seed";

const STORAGE_KEY = "leagues_admin_v2";

// ─── DB load / save ───────────────────────────────────────────────────────────

function loadDB(): DB {
  if (typeof window === "undefined") return { leagues: [], seasons: [], events: [] };
  seedIfEmpty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { leagues: [], seasons: [], events: [] };
    return JSON.parse(raw) as DB;
  } catch {
    return { leagues: [], seasons: [], events: [] };
  }
}

function saveDB(db: DB): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── League ops ───────────────────────────────────────────────────────────────

export function listLeagues(): League[] {
  return loadDB().leagues.slice().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getLeague(id: string): League | undefined {
  return loadDB().leagues.find((l) => l.id === id);
}

export function upsertLeague(league: League): void {
  const db = loadDB();
  const updated = { ...league, updatedAt: new Date().toISOString() };
  const idx = db.leagues.findIndex((l) => l.id === league.id);
  if (idx >= 0) db.leagues[idx] = updated;
  else db.leagues.push(updated);
  saveDB(db);
}

export function archiveLeague(id: string): void {
  const league = getLeague(id);
  if (!league) return;
  upsertLeague({ ...league, status: "archived" });
}

export function unarchiveLeague(id: string): void {
  const league = getLeague(id);
  if (!league) return;
  upsertLeague({ ...league, status: "active" });
}

export function deleteLeague(id: string): void {
  const db = loadDB();
  const seasonIds = db.seasons.filter((s) => s.leagueId === id).map((s) => s.id);
  db.events = db.events.filter((e) => !seasonIds.includes(e.seasonId));
  db.seasons = db.seasons.filter((s) => s.leagueId !== id);
  db.leagues = db.leagues.filter((l) => l.id !== id);
  saveDB(db);
}

export function duplicateLeague(id: string): League | undefined {
  const original = getLeague(id);
  if (!original) return undefined;
  const copy: League = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upsertLeague(copy);
  return copy;
}

// ─── Season ops ───────────────────────────────────────────────────────────────

export function listSeasons(leagueId: string): Season[] {
  return loadDB()
    .seasons.filter((s) => s.leagueId === leagueId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSeason(seasonId: string): Season | undefined {
  return loadDB().seasons.find((s) => s.id === seasonId);
}

export function upsertSeason(season: Season): void {
  const db = loadDB();
  const updated = { ...season, updatedAt: new Date().toISOString() };
  const idx = db.seasons.findIndex((s) => s.id === season.id);
  if (idx >= 0) db.seasons[idx] = updated;
  else db.seasons.push(updated);
  saveDB(db);
}

export function archiveSeason(id: string): void {
  const season = getSeason(id);
  if (!season) return;
  upsertSeason({ ...season, status: "archived" });
}

export function duplicateSeason(seasonId: string): Season | undefined {
  const original = getSeason(seasonId);
  if (!original) return undefined;
  const newId = crypto.randomUUID();
  const copy: Season = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    status: "draft",
    leagueLink: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upsertSeason(copy);
  // duplicate events
  listEvents(seasonId).forEach((ev) => {
    upsertEvent({ ...ev, id: crypto.randomUUID(), seasonId: newId });
  });
  return copy;
}

// ─── Event ops ────────────────────────────────────────────────────────────────

export function listEvents(seasonId: string): LeagueEvent[] {
  return loadDB().events.filter((e) => e.seasonId === seasonId);
}

export function upsertEvent(event: LeagueEvent): void {
  const db = loadDB();
  const idx = db.events.findIndex((e) => e.id === event.id);
  if (idx >= 0) db.events[idx] = event;
  else db.events.push(event);
  saveDB(db);
}

export function deleteEvent(eventId: string): void {
  const db = loadDB();
  db.events = db.events.filter((e) => e.id !== eventId);
  saveDB(db);
}

export function reorderEvents(seasonId: string, orderedIds: string[]): void {
  const db = loadDB();
  const eventsForSeason = orderedIds
    .map((id) => db.events.find((e) => e.id === id && e.seasonId === seasonId))
    .filter(Boolean) as LeagueEvent[];
  const otherEvents = db.events.filter((e) => e.seasonId !== seasonId);
  db.events = [...otherEvents, ...eventsForSeason];
  saveDB(db);
}

// ─── Bulk delete (used when removing a season) ────────────────────────────────

export function deleteSeasonWithEvents(seasonId: string): void {
  const db = loadDB();
  db.seasons = db.seasons.filter((s) => s.id !== seasonId);
  db.events = db.events.filter((e) => e.seasonId !== seasonId);
  saveDB(db);
}

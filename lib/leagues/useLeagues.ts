"use client";

import { useState, useEffect, useCallback } from "react";
import { League, Season, LeagueEvent } from "./types";
import {
  listLeagues,
  getLeague,
  upsertLeague,
  archiveLeague,
  unarchiveLeague,
  deleteLeague,
  duplicateLeague,
  listSeasons,
  getSeason,
  upsertSeason,
  archiveSeason,
  duplicateSeason,
  listEvents,
  upsertEvent,
  deleteEvent,
  deleteSeasonWithEvents,
} from "./repo";

// ─── Simple pub-sub so all hooks re-render when any mutation fires ─────────────

const _subs = new Set<() => void>();

export function _notify(): void {
  _subs.forEach((fn) => fn());
}

function _subscribe(fn: () => void): () => void {
  _subs.add(fn);
  return () => _subs.delete(fn);
}

// ─── Season stats enrichment ──────────────────────────────────────────────────

export interface SeasonWithStats extends Season {
  eventCount: number;
  dateRange?: string;
  displayStatus: string;
}

export function computeDisplayStatus(s: Season, events: LeagueEvent[]): string {
  if (s.status === "archived") return "archived";
  if (s.status === "draft") return "draft";
  const datedEvents = events.filter((e) => e.startAt && e.endAt);
  if (datedEvents.length === 0) return "published";
  const now = Date.now();
  const minStart = Math.min(...datedEvents.map((e) => new Date(e.startAt!).getTime()));
  const maxEnd = Math.max(...datedEvents.map((e) => new Date(e.endAt!).getTime()));
  if (now < minStart) return "upcoming";
  if (now > maxEnd) return "completed";
  return "live";
}

function enrichSeason(s: Season): SeasonWithStats {
  const events = listEvents(s.id);
  const starts = events.filter((e) => e.startAt).map((e) => new Date(e.startAt!).getTime());
  const ends = events.filter((e) => e.endAt).map((e) => new Date(e.endAt!).getTime());
  let dateRange: string | undefined;
  if (starts.length && ends.length) {
    const fmt = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    dateRange = `${fmt(Math.min(...starts))} – ${fmt(Math.max(...ends))}`;
  }
  return { ...s, eventCount: events.length, dateRange, displayStatus: computeDisplayStatus(s, events) };
}

// ─── League stats enrichment ─────────────────────────────────────────────────

export interface LeagueWithStats extends League {
  seasonCount: number;
  publishedSeasonCount: number;
}

function enrichLeague(l: League): LeagueWithStats {
  const seasons = listSeasons(l.id);
  return {
    ...l,
    seasonCount: seasons.length,
    publishedSeasonCount: seasons.filter((s) => s.status === "published").length,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLeagues() {
  const [leagues, setLeagues] = useState<LeagueWithStats[]>([]);

  const refresh = useCallback(() => setLeagues(listLeagues().map(enrichLeague)), []);

  useEffect(() => {
    refresh();
    return _subscribe(refresh);
  }, [refresh]);

  return {
    leagues,
    save(l: League) { upsertLeague(l); _notify(); },
    archive(id: string) { archiveLeague(id); _notify(); },
    unarchive(id: string) { unarchiveLeague(id); _notify(); },
    remove(id: string) { deleteLeague(id); _notify(); },
    duplicate(id: string) { const c = duplicateLeague(id); _notify(); return c; },
  };
}

export function useLeague(leagueId: string) {
  const [league, setLeague] = useState<League | undefined>(undefined);

  const refresh = useCallback(() => setLeague(getLeague(leagueId)), [leagueId]);

  useEffect(() => {
    refresh();
    return _subscribe(refresh);
  }, [refresh]);

  return {
    league,
    save(l: League) { upsertLeague(l); _notify(); },
    archive() { archiveLeague(leagueId); _notify(); },
    unarchive() { unarchiveLeague(leagueId); _notify(); },
    remove() { deleteLeague(leagueId); _notify(); },
    duplicate() { const c = duplicateLeague(leagueId); _notify(); return c; },
  };
}

export function useSeasons(leagueId: string) {
  const [seasons, setSeasons] = useState<SeasonWithStats[]>([]);

  const refresh = useCallback(
    () => setSeasons(listSeasons(leagueId).map(enrichSeason)),
    [leagueId]
  );

  useEffect(() => {
    refresh();
    return _subscribe(refresh);
  }, [refresh]);

  return {
    seasons,
    archive(id: string) { archiveSeason(id); _notify(); },
    remove(id: string) { deleteSeasonWithEvents(id); _notify(); },
    duplicate(id: string) { const c = duplicateSeason(id); _notify(); return c; },
  };
}

export function useSeason(seasonId: string) {
  const [season, setSeason] = useState<Season | undefined>(undefined);

  const refresh = useCallback(() => setSeason(getSeason(seasonId)), [seasonId]);

  useEffect(() => {
    refresh();
    return _subscribe(refresh);
  }, [refresh]);

  return {
    season,
    save(s: Season) { upsertSeason(s); _notify(); },
    archive() { archiveSeason(seasonId); _notify(); },
    remove() { deleteSeasonWithEvents(seasonId); _notify(); },
    duplicate() { const c = duplicateSeason(seasonId); _notify(); return c; },
  };
}

export function useEvents(seasonId: string) {
  const [events, setEvents] = useState<LeagueEvent[]>([]);

  const refresh = useCallback(() => setEvents(listEvents(seasonId)), [seasonId]);

  useEffect(() => {
    refresh();
    return _subscribe(refresh);
  }, [refresh]);

  return {
    events,
    save(ev: LeagueEvent) { upsertEvent(ev); _notify(); },
    remove(id: string) { deleteEvent(id); _notify(); },
  };
}

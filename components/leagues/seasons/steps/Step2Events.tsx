"use client";

import { useState } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Upload, X,
  Flag, Crosshair, Zap, Calendar, ChevronDown as ChevronDownIcon,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  LeagueEvent, EventType,
  CoursePlaySettings, HitItSettings, ClosestToPinSettings,
} from "@/lib/leagues/types";
import {
  MOCK_COURSES, HoleSelection, getHolesLabel,
} from "@/lib/leagues/courseData";
import { EventSettingsPanel } from "@/components/leagues/wizard/EventSettingsPanel";

interface Props {
  seasonId: string;
  events: LeagueEvent[];
  onChange: (events: LeagueEvent[]) => void;
  errors: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  course_play: "Course Play",
  hit_it: "Hit It",
  closest_to_pin: "Closest to Pin",
};

// Store datetime-local values as-is (no UTC conversion) to fix the 8-hour offset bug.
// new Date("2024-03-15T14:30") parses as local time consistently in modern browsers.
function toDatetimeLocal(val?: string): string {
  if (!val) return "";
  return val.slice(0, 16);
}

function fromDatetimeLocal(val: string): string {
  return val; // store raw local datetime string — no UTC conversion
}

function formatDateRange(startAt?: string, endAt?: string): string {
  if (!startAt && !endAt) return "No dates set";
  const fmt = (v: string) =>
    new Date(v).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (startAt && endAt) return `${fmt(startAt)} – ${fmt(endAt)}`;
  if (startAt) return `From ${fmt(startAt)}`;
  return `Until ${fmt(endAt!)}`;
}

function defaultSettings(type: EventType) {
  if (type === "course_play") return { holes: 18 as const, scoring: "stroke" as const };
  if (type === "hit_it") return { attempts: 5, scoring: "longest" as const };
  return { attempts: 3, tieBreak: "earliest" as const };
}

function newEvent(type: EventType, seasonId: string): LeagueEvent {
  return {
    id: crypto.randomUUID(),
    seasonId,
    name: "",
    type,
    settings: defaultSettings(type),
  };
}

// ─── Live date error computation ──────────────────────────────────────────────

/**
 * Merges wizard-passed errors with live-computed date errors.
 * Live errors (end <= start, overlap) are always recomputed so users get
 * immediate feedback as they type, without having to click Next first.
 */
function buildDisplayErrors(
  wizardErrors: Record<string, string>,
  events: LeagueEvent[]
): Record<string, string> {
  const display: Record<string, string> = {};

  // Carry over wizard errors, but skip overlap errors (always recomputed live)
  // and skip end-date errors if an end date is now set (live check takes over)
  Object.entries(wizardErrors).forEach(([key, val]) => {
    const endMatch = key.match(/^event_(.+)_end$/);
    const overlapMatch = key.match(/^event_(.+)_overlap$/);

    if (overlapMatch) {
      // Never carry forward — overlap is always live-computed below
    } else if (endMatch) {
      const ev = events.find((e) => e.id === endMatch[1]);
      if (ev && !ev.endAt) {
        // End date still missing: keep the "required" wizard error
        display[key] = val;
      }
      // If endAt is now set, live check below will determine the error state
    } else {
      display[key] = val;
    }
  });

  // Live end > start validation
  events.forEach((ev) => {
    if (ev.startAt && ev.endAt) {
      if (new Date(ev.endAt) <= new Date(ev.startAt)) {
        display[`event_${ev.id}_end`] = "End must be after start.";
      }
    }
  });

  // Live overlap check (only for events with a valid date range)
  const validDated = events.filter(
    (e) => e.startAt && e.endAt && new Date(e.endAt) > new Date(e.startAt)
  );
  for (let i = 0; i < validDated.length; i++) {
    for (let j = i + 1; j < validDated.length; j++) {
      const a = validDated[i];
      const b = validDated[j];
      if (
        new Date(a.startAt!).getTime() < new Date(b.endAt!).getTime() &&
        new Date(b.startAt!).getTime() < new Date(a.endAt!).getTime()
      ) {
        display[`event_${a.id}_overlap`] = `Overlaps with "${b.name || "another event"}".`;
      }
    }
  }

  return display;
}

// ─── Collapsed settings summary ───────────────────────────────────────────────

function SettingsSummary({ event }: { event: LeagueEvent }) {
  if (event.type === "course_play") {
    const s = event.settings as CoursePlaySettings;
    const course = MOCK_COURSES.find((c) => c.id === s.courseId);
    if (!course) {
      return <span className="text-xs text-muted-foreground/70">No course selected</span>;
    }
    const tee = course.tees.find((t) => t.id === s.tee);
    const holesLabel = s.holes ? getHolesLabel(s.holes as HoleSelection) : "18 Holes";
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
        <span className="truncate max-w-[10rem]">{course.name}</span>
        <span>·</span>
        <span className="shrink-0">{holesLabel}</span>
        {tee && (
          <>
            <span>·</span>
            <span
              className="inline-block h-2 w-2 rounded-full border border-white/30 shrink-0"
              style={{ backgroundColor: tee.colorHex }}
            />
            <span className="shrink-0">{tee.label}</span>
          </>
        )}
      </span>
    );
  }

  if (event.type === "hit_it") {
    const s = event.settings as HitItSettings;
    const parts: string[] = [];
    if (s.attempts) parts.push(`${s.attempts} attempts`);
    if (s.scoring === "longest") parts.push("Longest wins");
    else if (s.scoring === "zones") parts.push("Zone points");
    if (s.targetDistance) parts.push(`${s.targetDistance} yds target`);
    if (parts.length === 0) return null;
    return (
      <span className="text-xs text-muted-foreground/70">{parts.join(" · ")}</span>
    );
  }

  if (event.type === "closest_to_pin") {
    const s = event.settings as ClosestToPinSettings;
    const parts: string[] = [];
    if (s.distance) parts.push(`${s.distance} yds`);
    if (s.attempts) parts.push(`${s.attempts} attempts`);
    if (parts.length === 0) return null;
    return (
      <span className="text-xs text-muted-foreground/70">{parts.join(" · ")}</span>
    );
  }

  return null;
}

// ─── Event type options for Add Event dialog ──────────────────────────────────

const EVENT_TYPE_OPTIONS: {
  type: EventType;
  label: string;
  description: string;
  Icon: React.ElementType;
  colorClass: string;
}[] = [
  {
    type: "course_play",
    label: "Course Play",
    Icon: Flag,
    colorClass: "bg-emerald-50 text-emerald-700",
    description:
      "Play a full round on a simulator course. Players track strokes per hole with configurable tees, scoring modes, putting options, and handicap support.",
  },
  {
    type: "hit_it",
    label: "Hit It",
    Icon: Zap,
    colorClass: "bg-orange-50 text-orange-700",
    description:
      "Players drive from the tee box competing for the longest shot. Configure the number of attempts and choose between longest distance or zone-based point scoring.",
  },
  {
    type: "closest_to_pin",
    label: "Closest to Pin",
    Icon: Crosshair,
    colorClass: "bg-blue-50 text-blue-700",
    description:
      "An approach shot challenge where players compete to land closest to the pin. Set the pin distance and configure tie-breaking rules when shots are equal.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Step2Events({ seasonId, events, onChange, errors }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(events[0]?.id ?? null);
  const [expandedSection, setExpandedSection] = useState<
    Record<string, "settings" | "sponsor" | null>
  >({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Merge wizard errors with live-computed date errors
  const displayErrors = buildDisplayErrors(errors, events);

  const toggleSection = (id: string, section: "settings" | "sponsor") => {
    setExpandedSection((prev) => ({
      ...prev,
      [id]: prev[id] === section ? null : section,
    }));
  };

  const addEvent = (type: EventType) => {
    const ev = newEvent(type, seasonId);
    setExpandedId(ev.id);
    onChange([...events, ev]);
    setAddDialogOpen(false);
  };

  const removeEvent = (id: string) => {
    onChange(events.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const patchEvent = (id: string, patch: Partial<LeagueEvent>) => {
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...events];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    onChange(copy);
  };

  const moveDown = (idx: number) => {
    if (idx === events.length - 1) return;
    const copy = [...events];
    [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
    onChange(copy);
  };

  const handleSponsorLogo = (id: string, file: File | null) => {
    if (!file) {
      patchEvent(id, { sponsorLogo: undefined });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patchEvent(id, { sponsorLogo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const autoFillSequential = () => {
    if (events.length === 0) return;
    let cursor = events[0].startAt
      ? new Date(events[0].startAt)
      : new Date(Date.now() + 86400000);

    const pad = (n: number) => String(n).padStart(2, "0");
    const fmtLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const updated = events.map((ev) => {
      const start = new Date(cursor);
      const end = new Date(start.getTime() + 7 * 86400000);
      cursor = new Date(end.getTime() + 60000);
      return { ...ev, startAt: fmtLocal(start), endAt: fmtLocal(end) };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Events</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add at least one event. Set dates and configure settings for each.
          </p>
        </div>
        {events.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={autoFillSequential}>
            <Calendar className="h-4 w-4 mr-1.5" /> Auto-fill Dates
          </Button>
        )}
      </div>

      {displayErrors.events && (
        <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">
          {displayErrors.events}
        </p>
      )}

      {/* Event cards */}
      <div className="space-y-3">
        {events.map((event, idx) => {
          const isExpanded = expandedId === event.id;
          const evNameError = displayErrors[`event_${event.id}_name`];
          const startErr = displayErrors[`event_${event.id}_start`];
          const endErr = displayErrors[`event_${event.id}_end`];
          const overlapErr = displayErrors[`event_${event.id}_overlap`];
          const activeSect = expandedSection[event.id] ?? null;

          return (
            <Card key={event.id} className={isExpanded ? "border-primary/50 shadow-sm" : ""}>
              {/* ── Header (always visible) ── */}
              <CardHeader
                className="p-4 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveUp(idx); }}
                      disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveDown(idx); }}
                      disabled={idx === events.length - 1}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {event.name || (
                        <span className="text-muted-foreground italic">Unnamed event</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {EVENT_TYPE_LABELS[event.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateRange(event.startAt, event.endAt)}
                      </span>
                    </div>
                    {/* Date/overlap errors visible in collapsed view */}
                    {!isExpanded && (startErr || endErr || overlapErr) && (
                      <p className="text-xs text-destructive mt-1">
                        {overlapErr ?? startErr ?? endErr}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeEvent(event.id); }}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              {/* ── Expanded body ── */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 space-y-4">
                  <Separator />

                  {/* Event name */}
                  <div className="space-y-2">
                    <Label>
                      Event Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Opening Round"
                      value={event.name}
                      onChange={(e) => patchEvent(event.id, { name: e.target.value })}
                      className={evNameError ? "border-destructive" : ""}
                    />
                    {evNameError && (
                      <p className="text-xs text-destructive">{evNameError}</p>
                    )}
                  </div>

                  {/* Inline dates */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Event Dates
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Start</span>
                        <Input
                          type="datetime-local"
                          value={toDatetimeLocal(event.startAt)}
                          onChange={(e) =>
                            patchEvent(event.id, { startAt: fromDatetimeLocal(e.target.value) })
                          }
                          className={startErr ? "border-destructive" : ""}
                        />
                        {startErr && <p className="text-xs text-destructive">{startErr}</p>}
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">End</span>
                        <Input
                          type="datetime-local"
                          value={toDatetimeLocal(event.endAt)}
                          onChange={(e) =>
                            patchEvent(event.id, { endAt: fromDatetimeLocal(e.target.value) })
                          }
                          className={endErr ? "border-destructive" : ""}
                        />
                        {endErr && <p className="text-xs text-destructive">{endErr}</p>}
                      </div>
                    </div>
                    {overlapErr && (
                      <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">
                        {overlapErr}
                      </p>
                    )}
                  </div>

                  {/* Collapsible: Event-specific settings */}
                  <div className="rounded-lg border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection(event.id, "settings")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex flex-col items-start gap-0.5">
                        <span className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                          {EVENT_TYPE_LABELS[event.type]} Settings
                        </span>
                        {activeSect !== "settings" && (
                          <span className="ml-6">
                            <SettingsSummary event={event} />
                          </span>
                        )}
                      </span>
                      <ChevronDownIcon
                        className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                          activeSect === "settings" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeSect === "settings" && (
                      <div className="px-4 pb-4 pt-2 border-t">
                        <EventSettingsPanel
                          event={event}
                          onChange={(patch) => patchEvent(event.id, patch)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Collapsible: Sponsor */}
                  <div className="rounded-lg border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection(event.id, "sponsor")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        Sponsor
                        {activeSect !== "sponsor" && event.sponsorName ? (
                          <span className="text-xs text-muted-foreground font-normal">
                            {event.sponsorName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 font-normal">
                            optional
                          </span>
                        )}
                      </span>
                      <ChevronDownIcon
                        className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                          activeSect === "sponsor" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeSect === "sponsor" && (
                      <div className="px-4 pb-4 pt-2 border-t">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                          <div className="space-y-2">
                            <Label>Sponsor Name</Label>
                            <Input
                              placeholder="Sponsor name"
                              value={event.sponsorName ?? ""}
                              onChange={(e) =>
                                patchEvent(event.id, { sponsorName: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Sponsor Logo</Label>
                            {event.sponsorLogo ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={event.sponsorLogo}
                                  alt="Sponsor"
                                  className="h-10 w-auto rounded border object-contain"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => patchEvent(event.id, { sponsorLogo: undefined })}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-sm text-muted-foreground hover:bg-muted/50">
                                <Upload className="h-4 w-4" /> Upload logo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) =>
                                    handleSponsorLogo(event.id, e.target.files?.[0] ?? null)
                                  }
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Event button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setAddDialogOpen(true)}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Event
      </Button>

      {/* Add Event dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Choose Event Type</DialogTitle>
            <DialogDescription>
              Select the type of competitive event to add to this season.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 mt-2">
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => addEvent(opt.type)}
                className="flex items-start gap-4 rounded-xl border-2 border-muted p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${opt.colorClass}`}
                >
                  <opt.Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

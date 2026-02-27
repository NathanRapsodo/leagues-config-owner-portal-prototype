"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronRight, MapPin, Search } from "lucide-react";
import {
  LeagueEvent,
  CoursePlaySettings,
  HitItSettings,
  ClosestToPinSettings,
} from "@/lib/leagues/types";
import {
  MOCK_COURSES,
  MockTee,
  HoleSelection,
  getHolesLabel,
  getTeeYards,
  getScorecardPar,
  getScorecardYds,
  getScorecardStartHole,
} from "@/lib/leagues/courseData";

// ─── Holes options ─────────────────────────────────────────────────────────────

const HOLE_OPTIONS: { value: HoleSelection; label: string }[] = [
  { value: "front9", label: "Front 9" },
  { value: "back9",  label: "Back 9"  },
  { value: 18,       label: "18 Holes" },
];

// ─── Course Play panel ────────────────────────────────────────────────────────

function CoursePlayPanel({
  s,
  patchSettings,
}: {
  s: CoursePlaySettings;
  patchSettings: (p: Partial<CoursePlaySettings>) => void;
}) {
  const [search, setSearch] = useState("");
  const [showScorecard, setShowScorecard] = useState(false);

  const selectedCourse = MOCK_COURSES.find((c) => c.id === s.courseId);
  const selectedTee = selectedCourse?.tees.find((t) => t.id === s.tee);
  const holes: HoleSelection = s.holes ?? 18;

  const holeCount = holes === 18 ? 18 : 9;
  const startHole = getScorecardStartHole(holes);

  const filtered = search.trim()
    ? MOCK_COURSES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_COURSES;

  const parTotal = (tee: MockTee) =>
    getScorecardPar(tee, holes).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      {/* ── Course picker ── */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Course</Label>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-0.5">
          {filtered.map((course) => {
            const defaultTee = course.tees[0];
            const isSelected = s.courseId === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() =>
                  patchSettings({ courseId: course.id, course: course.name, tee: undefined })
                }
                className={`relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-muted-foreground/30 shadow-sm"
                }`}
              >
                {/* Gradient header — mimics in-game course card */}
                <div
                  className={`h-20 bg-gradient-to-br ${course.gradient} flex flex-col items-center justify-center`}
                >
                  <span className="text-white text-2xl font-bold leading-none">
                    {defaultTee.par18.reduce((a, b) => a + b, 0)}
                  </span>
                  <span className="text-white/75 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                    Par
                  </span>
                </div>

                <div className="bg-card p-2 border-t">
                  <p className="font-semibold text-xs leading-tight truncate">{course.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{course.location}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {defaultTee.yards18.toLocaleString()} yds (18)
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-3 py-6 text-center text-xs text-muted-foreground">
              No courses match &quot;{search}&quot;
            </p>
          )}
        </div>
      </div>

      {/* ── Course-specific controls ── */}
      {selectedCourse && (
        <>
          <Separator />

          {/* Holes toggle — Front 9 / Back 9 / 18 Holes */}
          <div className="space-y-2">
            <Label>Holes</Label>
            <div className="flex gap-2">
              {HOLE_OPTIONS.map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => patchSettings({ holes: value })}
                  className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${
                    holes === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-muted hover:border-muted-foreground/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tee selector */}
          <div className="space-y-2">
            <Label>Select Tee</Label>
            <div className="space-y-2">
              {selectedCourse.tees.map((tee) => {
                const yards = getTeeYards(tee, holes);
                return (
                  <button
                    key={tee.id}
                    type="button"
                    onClick={() => patchSettings({ tee: tee.id })}
                    className={`w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors ${
                      s.tee === tee.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-white shadow-sm shrink-0"
                      style={{ backgroundColor: tee.colorHex }}
                    />
                    <span className="font-medium text-sm flex-1">{tee.label}</span>
                    <span className="text-xs text-muted-foreground">Par {parTotal(tee)}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {yards.toLocaleString()} yds
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {tee.rating}/{tee.slope}
                    </span>
                    {s.tee === tee.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scorecard (collapsible) */}
          {selectedTee && (
            <div>
              <button
                type="button"
                onClick={() => setShowScorecard((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${showScorecard ? "rotate-90" : ""}`}
                />
                View {getHolesLabel(holes).toLowerCase()} scorecard
              </button>

              {showScorecard && (
                <div className="mt-2 overflow-x-auto rounded-lg border text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/60 border-b">
                        <th className="px-3 py-2 text-left font-medium">Hole</th>
                        {Array.from({ length: holeCount }, (_, i) => (
                          <th key={i} className="px-2 py-2 text-center font-medium min-w-[2rem]">
                            {startHole + i}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-center font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-3 py-2 font-medium text-muted-foreground">Par</td>
                        {getScorecardPar(selectedTee, holes).map((p, i) => (
                          <td key={i} className="px-2 py-2 text-center">{p}</td>
                        ))}
                        <td className="px-3 py-2 text-center font-semibold">{parTotal(selectedTee)}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium text-muted-foreground">Yds</td>
                        {getScorecardYds(selectedTee, holes).map((y, i) => (
                          <td key={i} className="px-2 py-2 text-center text-muted-foreground">{y}</td>
                        ))}
                        <td className="px-3 py-2 text-center font-semibold">
                          {getTeeYards(selectedTee, holes).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Game settings ── */}
      <Separator />
      <div>
        <p className="text-sm font-semibold mb-3">Game Settings</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Scoring Mode</Label>
            <Select
              value={s.scoring ?? ""}
              onValueChange={(v) => patchSettings({ scoring: v as CoursePlaySettings["scoring"] })}
            >
              <SelectTrigger><SelectValue placeholder="Select scoring" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stroke">Stroke Play</SelectItem>
                <SelectItem value="stableford">Stableford</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Putting</Label>
            <Select
              value={s.putting ?? ""}
              onValueChange={(v) => patchSettings({ putting: v as CoursePlaySettings["putting"] })}
            >
              <SelectTrigger><SelectValue placeholder="Select putting" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="auto">Auto-Putt</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mulligans per round</Label>
            <Input
              type="number"
              min={0}
              max={10}
              placeholder="0 (none)"
              value={s.mulligans ?? ""}
              onChange={(e) =>
                patchSettings({ mulligans: e.target.value ? parseInt(e.target.value) : undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Max score / hole</Label>
            <Input
              type="number"
              min={1}
              placeholder="No limit"
              value={s.maxScorePerHole ?? ""}
              onChange={(e) =>
                patchSettings({ maxScorePerHole: e.target.value ? parseInt(e.target.value) : undefined })
              }
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Apply Handicap</p>
              <p className="text-xs text-muted-foreground">
                Adjust scores based on each player&apos;s handicap index.
              </p>
            </div>
            <Switch
              checked={s.handicap ?? false}
              onCheckedChange={(v) => patchSettings({ handicap: v })}
            />
          </div>

          {s.handicap && (
            <div className="space-y-2">
              <Label>Leaderboard Mode</Label>
              <div className="flex gap-2">
                {(["gross", "net"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => patchSettings({ leaderboardMode: mode })}
                    className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium capitalize transition-colors ${
                      s.leaderboardMode === mode
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted hover:border-muted-foreground/40"
                    }`}
                  >
                    {mode} Score
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  event: LeagueEvent;
  onChange: (patch: Partial<LeagueEvent>) => void;
}

export function EventSettingsPanel({ event, onChange }: Props) {
  const patchSettings = (
    patch: Partial<CoursePlaySettings | HitItSettings | ClosestToPinSettings>
  ) => {
    onChange({ settings: { ...event.settings, ...patch } });
  };

  if (event.type === "course_play") {
    return (
      <CoursePlayPanel
        s={event.settings as CoursePlaySettings}
        patchSettings={patchSettings as (p: Partial<CoursePlaySettings>) => void}
      />
    );
  }

  if (event.type === "hit_it") {
    const s = event.settings as HitItSettings;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label>Attempts per player</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 5"
            value={s.attempts ?? ""}
            onChange={(e) =>
              patchSettings({ attempts: e.target.value ? parseInt(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Scoring</Label>
          <Select
            value={s.scoring ?? ""}
            onValueChange={(v) => patchSettings({ scoring: v as HitItSettings["scoring"] })}
          >
            <SelectTrigger><SelectValue placeholder="Select scoring" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="longest">Longest shot wins</SelectItem>
              <SelectItem value="zones">Zone-based points</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target distance (yards)</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 250"
            value={s.targetDistance ?? ""}
            onChange={(e) =>
              patchSettings({ targetDistance: e.target.value ? parseInt(e.target.value) : undefined })
            }
          />
        </div>
      </div>
    );
  }

  if (event.type === "closest_to_pin") {
    const s = event.settings as ClosestToPinSettings;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label>Pin distance (yards)</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 150"
            value={s.distance ?? ""}
            onChange={(e) =>
              patchSettings({ distance: e.target.value ? parseInt(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Attempts per player</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 3"
            value={s.attempts ?? ""}
            onChange={(e) =>
              patchSettings({ attempts: e.target.value ? parseInt(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tie Break</Label>
          <Select
            value={s.tieBreak ?? ""}
            onValueChange={(v) =>
              patchSettings({ tieBreak: v as ClosestToPinSettings["tieBreak"] })
            }
          >
            <SelectTrigger><SelectValue placeholder="Select tie break" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="earliest">Earliest shot wins</SelectItem>
              <SelectItem value="best_second">Best second attempt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return null;
}

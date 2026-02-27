"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Rocket, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { WizardStepper } from "@/components/leagues/wizard/WizardStepper";
import { Step1Basics } from "./steps/Step1Basics";
import { Step2Events } from "./steps/Step2Events";
import { Step4Payment as StepPayment } from "./steps/Step4Payment";
import { StepMedia } from "./steps/StepMedia";
import { Step5Review as StepReview } from "./steps/Step5Review";
import { Season, LeagueEvent } from "@/lib/leagues/types";
import {
  upsertSeason,
  upsertEvent,
  deleteEvent,
  getLeague,
  getSeason,
  listEvents,
} from "@/lib/leagues/repo";
import { _notify } from "@/lib/leagues/useLeagues";
import { useToast } from "@/hooks/use-toast";

// ─── Steps: Basics → Events (with dates) → Payment → Media → Review ──────────

const STEPS = [
  { label: "Basics" },
  { label: "Events" },
  { label: "Payment" },
  { label: "Media" },
  { label: "Review" },
];

interface Props {
  leagueId: string;
}

function newDraftSeason(leagueId: string): Season {
  return {
    id: crypto.randomUUID(),
    leagueId,
    name: "",
    leaderboardUnit: "points",
    status: "draft",
    payment: { mode: "free" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(
  step: number,
  season: Partial<Season>,
  events: LeagueEvent[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (!season.name?.trim()) errors.name = "Season name is required.";
  }

  if (step === 1) {
    if (events.length === 0) errors.events = "Add at least one event.";
    events.forEach((ev) => {
      if (!ev.name?.trim()) errors[`event_${ev.id}_name`] = "Event name is required.";
      if (!ev.startAt) errors[`event_${ev.id}_start`] = "Start date required.";
      if (!ev.endAt) errors[`event_${ev.id}_end`] = "End date required.";
      if (ev.startAt && ev.endAt && new Date(ev.endAt) <= new Date(ev.startAt)) {
        errors[`event_${ev.id}_end`] = "End must be after start.";
      }
    });
    // Overlap check
    const dated = events.filter((e) => e.startAt && e.endAt);
    for (let i = 0; i < dated.length; i++) {
      for (let j = i + 1; j < dated.length; j++) {
        const a = dated[i];
        const b = dated[j];
        if (
          new Date(a.startAt!).getTime() < new Date(b.endAt!).getTime() &&
          new Date(b.startAt!).getTime() < new Date(a.endAt!).getTime()
        ) {
          errors[`event_${a.id}_overlap`] = `Overlaps with "${b.name || "another event"}".`;
        }
      }
    }
  }

  // Steps 2 (Payment) and 3 (Media) have no blocking validation requirements
  return errors;
}

function getPublishErrors(
  season: Partial<Season>,
  events: LeagueEvent[],
  leagueStatus?: string
): string[] {
  const errs: string[] = [];
  if (leagueStatus && leagueStatus !== "active") {
    errs.push("The league is archived. Reactivate it before publishing seasons.");
  }
  if (!season.name?.trim()) errs.push("Season name is required.");
  if (events.length === 0) errs.push("At least one event is required.");
  events.forEach((ev, idx) => {
    if (!ev.name?.trim()) errs.push(`Event ${idx + 1} must have a name.`);
    if (!ev.startAt || !ev.endAt)
      errs.push(`Event "${ev.name || idx + 1}" needs start and end dates.`);
    if (ev.startAt && ev.endAt && new Date(ev.endAt) <= new Date(ev.startAt))
      errs.push(`Event "${ev.name || idx + 1}": end must be after start.`);
  });
  const dated = events.filter((e) => e.startAt && e.endAt);
  for (let i = 0; i < dated.length; i++) {
    for (let j = i + 1; j < dated.length; j++) {
      const a = dated[i];
      const b = dated[j];
      if (
        new Date(a.startAt!).getTime() < new Date(b.endAt!).getTime() &&
        new Date(b.startAt!).getTime() < new Date(a.endAt!).getTime()
      ) {
        errs.push(`Events "${a.name}" and "${b.name}" have overlapping dates.`);
      }
    }
  }
  return errs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateSeasonWizard({ leagueId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeSeasonId = searchParams.get("resume") ?? undefined;
  const { toast } = useToast();

  const league = getLeague(leagueId);
  const leagueName = league?.name ?? "League";
  const leagueStatus = league?.status;

  const [season, setSeason] = useState<Season>(() => {
    if (resumeSeasonId) {
      const existing = getSeason(resumeSeasonId);
      if (existing) return existing;
    }
    return newDraftSeason(leagueId);
  });

  const [events, setEvents] = useState<LeagueEvent[]>(() => {
    if (resumeSeasonId) return listEvents(resumeSeasonId);
    return [];
  });

  const persistedEventIds = useRef<Set<string>>(
    new Set(resumeSeasonId ? listEvents(resumeSeasonId).map((e) => e.id) : [])
  );
  const removedEventIds = useRef<string[]>([]);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedOnce, setSavedOnce] = useState(!!resumeSeasonId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Persist ───────────────────────────────────────────────────────────────
  const persist = useCallback(
    (s: Season, evs: LeagueEvent[]) => {
      upsertSeason(s);
      evs.forEach(upsertEvent);
      removedEventIds.current.forEach(deleteEvent);
      removedEventIds.current = [];
      persistedEventIds.current = new Set(evs.map((e) => e.id));
      _notify();
    },
    []
  );

  const debouncedSave = useCallback(
    (s: Season, evs: LeagueEvent[]) => {
      if (!savedOnce) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(s, evs), 700);
    },
    [savedOnce, persist]
  );

  // ── Patch helpers ─────────────────────────────────────────────────────────
  const patchSeason = useCallback(
    (patch: Partial<Season>) => {
      setSeason((prev) => {
        const next = { ...prev, ...patch };
        debouncedSave(next, events);
        return next;
      });
    },
    [debouncedSave, events]
  );

  const updateEvents = useCallback(
    (next: LeagueEvent[]) => {
      const nextIds = new Set(next.map((e) => e.id));
      persistedEventIds.current.forEach((id) => {
        if (!nextIds.has(id)) removedEventIds.current.push(id);
      });
      setEvents(next);
      debouncedSave(season, next);
    },
    [debouncedSave, season]
  );

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    const stepErrors = validateStep(step, season, events);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});

    if (!savedOnce) {
      persist(season, events);
      setSavedOnce(true);
    } else {
      persist(season, events);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    if (savedOnce) persist(season, events);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handlePublish = () => {
    const publishErrors = getPublishErrors(season, events, leagueStatus);
    if (publishErrors.length > 0) {
      toast({
        title: "Cannot publish",
        description: publishErrors[0],
        variant: "destructive",
      });
      return;
    }
    const published: Season = {
      ...season,
      status: "published",
      leagueLink: `https://demo.offscript.local/join/${season.id}`,
      updatedAt: new Date().toISOString(),
    };
    setSeason(published);
    persist(published, events);
    toast({
      title: "Season published!",
      description: "Players can now join via the league link.",
    });
    router.push(`/leagues/${leagueId}/seasons/${season.id}`);
  };

  const publishErrors = getPublishErrors(season, events, leagueStatus);
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Leagues", href: "/leagues" },
          { label: leagueName, href: `/leagues/${leagueId}` },
          { label: resumeSeasonId ? "Edit Season" : "New Season" },
        ]}
      />

      {/* Stepper */}
      <div className="bg-white rounded-lg border p-6">
        <WizardStepper steps={STEPS} currentStep={step} />
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <Step1Basics data={season} onChange={patchSeason} errors={errors} />
          )}
          {step === 1 && (
            <Step2Events
              seasonId={season.id}
              events={events}
              onChange={updateEvents}
              errors={errors}
            />
          )}
          {step === 2 && (
            <StepPayment data={season} onChange={patchSeason} errors={errors} />
          )}
          {step === 3 && (
            <StepMedia data={season} onChange={patchSeason} errors={errors} />
          )}
          {step === 4 && (
            <StepReview
              season={season}
              events={events}
              validationErrors={publishErrors}
              leagueName={leagueName}
            />
          )}
        </CardContent>
      </Card>

      {/* Save indicator */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Save className="h-3 w-3" />
        {savedOnce ? "Draft saved" : "Will save on Next"}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground text-xs px-2">
            <Link href={`/leagues/${leagueId}`}>
              <ChevronLeft className="h-3 w-3" /> Back to League
            </Link>
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={goBack} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {isLastStep ? (
            <Button
              onClick={handlePublish}
              disabled={publishErrors.length > 0}
              className="gap-2"
            >
              <Rocket className="h-4 w-4" /> Publish Season
            </Button>
          ) : (
            <Button onClick={goNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

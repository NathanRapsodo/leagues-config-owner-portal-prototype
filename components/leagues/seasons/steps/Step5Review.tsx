"use client";

import {
  CheckCircle2, AlertCircle, Calendar, Users, CreditCard, Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Season, LeagueEvent } from "@/lib/leagues/types";

interface Props {
  season: Partial<Season>;
  events: LeagueEvent[];
  validationErrors: string[];
  leagueName?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  course_play: "Course Play",
  hit_it: "Hit It",
  closest_to_pin: "Closest to Pin",
};

function formatDate(val?: string) {
  if (!val) return "—";
  // Handles both "2024-03-15T14:30" (local) and full ISO strings
  const d = new Date(val);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function Step5Review({ season, events, validationErrors, leagueName }: Props) {
  const isValid = validationErrors.length === 0;
  const hasMedia = !!(season.coverImage || season.bannerImage);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & Publish</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your season configuration before publishing.
        </p>
      </div>

      {/* Validation status */}
      {isValid ? (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">
            All checks passed. Ready to publish.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">Fix these before publishing:</p>
          </div>
          <ul className="ml-7 text-sm text-destructive space-y-1 list-disc">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Season Basics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" /> Season Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {leagueName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">League</span>
              <span className="font-medium">{leagueName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Season</span>
            <span className="font-medium">{season.name || "—"}</span>
          </div>
          {season.description && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Description</span>
              <span className="font-medium text-right">{season.description}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant Limit</span>
            <span className="font-medium">{season.participantLimit ?? "Unlimited"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Leaderboard</span>
            <span className="font-medium capitalize">{season.leaderboardUnit ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events added.</p>
          ) : (
            events.map((ev, idx) => (
              <div key={ev.id}>
                {idx > 0 && <Separator className="my-3" />}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ev.name || "Unnamed"}</span>
                    <Badge variant="secondary" className="text-xs">
                      {EVENT_TYPE_LABELS[ev.type]}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Start</span>
                    <span>{formatDate(ev.startAt)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">End</span>
                    <span>{formatDate(ev.endAt)}</span>
                  </div>
                  {ev.sponsorName && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sponsor</span>
                      <span>{ev.sponsorName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <Badge variant={season.payment?.mode === "free" ? "success" : "info"}>
              {season.payment?.mode === "free" ? "Free" : "Paid"}
            </Badge>
          </div>
          {season.payment?.mode === "paid" && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  ${season.payment?.price?.toFixed(2) ?? "0.00"}
                </span>
              </div>
              {season.payment?.taxEnabled && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Rate</span>
                  <span className="font-medium">{season.payment?.taxRate ?? 0}%</span>
                </div>
              )}
              {season.payment?.signupStart && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signup Opens</span>
                  <span className="font-medium">{formatDate(season.payment.signupStart)}</span>
                </div>
              )}
              {season.payment?.signupEnd && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signup Closes</span>
                  <span className="font-medium">{formatDate(season.payment.signupEnd)}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Season Media
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {hasMedia ? (
            <div className="flex items-center gap-4">
              {season.coverImage && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cover</p>
                  <img
                    src={season.coverImage}
                    alt="Cover"
                    className="h-16 w-28 rounded-md border object-cover"
                  />
                </div>
              )}
              {season.bannerImage && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Thumbnail</p>
                  <img
                    src={season.bannerImage}
                    alt="Thumbnail"
                    className="h-16 w-16 rounded-md border object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">No media uploaded (optional).</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

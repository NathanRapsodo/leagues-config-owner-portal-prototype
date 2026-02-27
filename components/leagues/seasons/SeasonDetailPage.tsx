"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy, Archive, Edit, Check, Users, Calendar,
  CreditCard, Link as LinkIcon, FileEdit, AlertTriangle, Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useSeason, useEvents, useLeague, computeDisplayStatus } from "@/lib/leagues/useLeagues";
import { duplicateSeason } from "@/lib/leagues/repo";
import { _notify } from "@/lib/leagues/useLeagues";
import { useToast } from "@/hooks/use-toast";

interface Props {
  leagueId: string;
  seasonId: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  course_play: "Course Play",
  hit_it: "Hit It",
  closest_to_pin: "Closest to Pin",
};

const DISPLAY_STATUS_VARIANT: Record<string, "success" | "info" | "secondary" | "upcoming"> = {
  published: "success",
  draft: "info",
  archived: "secondary",
  upcoming: "upcoming",
  live: "success",
  completed: "secondary",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-2">
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

export function SeasonDetailPage({ leagueId, seasonId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { league } = useLeague(leagueId);
  const { season, archive, remove } = useSeason(seasonId);
  const { events } = useEvents(seasonId);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!season) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <Calendar className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h2 className="text-xl font-semibold">Season not found</h2>
          <p className="text-muted-foreground text-sm mt-1">
            This season may have been archived or the URL is incorrect.
          </p>
        </div>
        <Button onClick={() => router.push(`/leagues/${leagueId}`)}>
          Back to League
        </Button>
      </div>
    );
  }

  const handleArchive = () => {
    archive();
    toast({ title: "Season archived." });
  };

  const handleDuplicate = () => {
    const copy = duplicateSeason(seasonId);
    _notify();
    if (copy) {
      toast({ title: "Season duplicated.", description: `"${copy.name}" created as draft.` });
      router.push(`/leagues/${leagueId}/seasons/${copy.id}`);
    }
  };

  const handleCreateDraft = () => {
    const copy = duplicateSeason(seasonId);
    _notify();
    if (copy) {
      toast({ title: "Draft copy created." });
      router.push(`/leagues/${leagueId}/seasons/${copy.id}`);
    }
  };

  const handleDelete = () => {
    remove();
    setDeleteConfirm(false);
    toast({ title: "Season deleted." });
    router.push(`/leagues/${leagueId}`);
  };

  const displayStatus = computeDisplayStatus(season, events);
  const statusVariant = DISPLAY_STATUS_VARIANT[displayStatus] ?? "secondary";
  const statusLabel = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Leagues", href: "/leagues" },
          { label: league?.name ?? "League", href: `/leagues/${leagueId}` },
          { label: season.name },
        ]}
      />

      {/* Archived league warning */}
      {season.status === "published" && league?.status === "archived" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            The parent league is archived. This season&apos;s join link is currently inactive —
            players cannot register until the league is reactivated.
          </p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{season.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {league && (
              <Link
                href={`/leagues/${leagueId}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {league.name}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {season.status === "draft" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/leagues/${leagueId}/seasons/new?resume=${seasonId}`}>
                <Edit className="h-4 w-4 mr-2" /> Edit Season
              </Link>
            </Button>
          )}
          {season.status === "published" && (
            <Button variant="outline" size="sm" onClick={handleCreateDraft}>
              <FileEdit className="h-4 w-4 mr-2" /> Create Draft Copy
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" /> Duplicate
          </Button>
          {season.status !== "archived" && (
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" /> Archive
            </Button>
          )}
          {season.status === "archived" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="text-destructive hover:text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">League</p>
            <Link href={`/leagues/${leagueId}`} className="font-medium hover:underline">
              {league?.name ?? "—"}
            </Link>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Leaderboard</p>
            <p className="font-medium capitalize">{season.leaderboardUnit}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Participant Limit</p>
            <p className="font-medium">{season.participantLimit ?? "Unlimited"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Payment</p>
            <Badge variant={season.payment.mode === "free" ? "success" : "info"}>
              {season.payment.mode === "free"
                ? "Free"
                : `Paid · $${season.payment.price ?? 0}`}
            </Badge>
          </div>
          {season.description && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-muted-foreground text-xs mb-0.5">Description</p>
              <p className="text-muted-foreground">{season.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Players / League Link ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" /> Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* League link */}
          <div>
            <p className="text-muted-foreground text-xs mb-1.5">Player Join Link</p>
            {season.leagueLink ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <code className="text-xs font-mono flex-1 truncate">{season.leagueLink}</code>
                <CopyButton text={season.leagueLink} />
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic">
                Publish this season to generate a join link.
              </p>
            )}
          </div>

          <Separator />

          {/* Participants placeholder */}
          <div>
            <p className="text-muted-foreground text-xs mb-3">Participants</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-xs">
                      No participants yet. Share the join link to get started.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Events ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" /> Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events configured for this season.</p>
          ) : (
            events.map((ev, idx) => (
              <div key={ev.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{ev.name}</span>
                    <Badge variant="secondary" className="text-xs">{EVENT_TYPE_LABELS[ev.type]}</Badge>
                    {ev.sponsorName && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        Sponsored by {ev.sponsorName}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-8">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Start</p>
                      <p className="text-sm">{formatDate(ev.startAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">End</p>
                      <p className="text-sm">{formatDate(ev.endAt)}</p>
                    </div>
                  </div>
                  {/* Settings summary */}
                  <p className="pl-8 text-xs text-muted-foreground">
                    {Object.entries(ev.settings)
                      .filter(([, v]) => v !== undefined && v !== "")
                      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Payment detail (paid only) ───────────────────────────────────── */}
      {season.payment.mode === "paid" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Entry Fee</p>
              <p className="font-medium">${season.payment.price?.toFixed(2) ?? "0.00"}</p>
            </div>
            {season.payment.taxEnabled && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Tax Rate</p>
                <p className="font-medium">{season.payment.taxRate ?? 0}%</p>
              </div>
            )}
            {season.payment.signupStart && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Signup Opens</p>
                <p className="font-medium">{formatDate(season.payment.signupStart)}</p>
              </div>
            )}
            {season.payment.signupEnd && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Signup Closes</p>
                <p className="font-medium">{formatDate(season.payment.signupEnd)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete season?</DialogTitle>
            <DialogDescription>
              <strong>&quot;{season.name}&quot;</strong> and all its events will be permanently
              deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

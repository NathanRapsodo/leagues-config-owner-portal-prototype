"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy, Copy, Archive, ArchiveRestore, Edit, Plus, Calendar, ImageIcon,
  ChevronRight, AlertTriangle, Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useLeague, useSeasons } from "@/lib/leagues/useLeagues";
import { useToast } from "@/hooks/use-toast";

interface Props {
  leagueId: string;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const SEASON_STATUS_VARIANT: Record<string, "success" | "info" | "secondary" | "upcoming"> = {
  published: "success",
  draft: "info",
  archived: "secondary",
  upcoming: "upcoming",
  live: "success",
  completed: "secondary",
};

export function LeagueDetailPage({ leagueId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { league, archive, unarchive, remove, duplicate } = useLeague(leagueId);
  const { seasons, archive: archiveSeason, remove: removeSeason, duplicate: duplicateSeason } = useSeasons(leagueId);

  const [confirmAction, setConfirmAction] = useState<"archive" | "unarchive" | null>(null);
  const [deleteLeagueConfirm, setDeleteLeagueConfirm] = useState(false);
  const [deleteSeasonTarget, setDeleteSeasonTarget] = useState<{ id: string; name: string } | null>(null);

  if (!league) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <Trophy className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h2 className="text-xl font-semibold">League not found</h2>
          <p className="text-muted-foreground text-sm mt-1">
            This league may have been deleted or the URL is incorrect.
          </p>
        </div>
        <Button onClick={() => router.push("/leagues")}>Back to Leagues</Button>
      </div>
    );
  }

  const SEASON_DISPLAY_ORDER: Record<string, number> = { live: 0, upcoming: 1, draft: 2, published: 3, completed: 4, archived: 5 };

  const hasPublishedSeasons = seasons.some((s) => s.status === "published");
  const sortedSeasons = [...seasons].sort((a, b) =>
    (SEASON_DISPLAY_ORDER[a.displayStatus] ?? 9) - (SEASON_DISPLAY_ORDER[b.displayStatus] ?? 9)
  );

  const handleConfirm = () => {
    if (confirmAction === "archive") {
      archive();
      toast({ title: "League archived." });
    } else if (confirmAction === "unarchive") {
      unarchive();
      toast({ title: "League reactivated." });
    }
    setConfirmAction(null);
  };

  const handleDuplicate = () => {
    const copy = duplicate();
    if (copy) {
      toast({ title: "League duplicated.", description: `"${copy.name}" created.` });
      router.push("/leagues");
    }
  };

  const handleDuplicateSeason = (id: string, name: string) => {
    const copy = duplicateSeason(id);
    if (copy) {
      toast({ title: "Season duplicated.", description: `"${name} (Copy)" created as draft.` });
    }
  };

  const handleArchiveSeason = (id: string) => {
    archiveSeason(id);
    toast({ title: "Season archived." });
  };

  const handleDeleteSeason = () => {
    if (!deleteSeasonTarget) return;
    removeSeason(deleteSeasonTarget.id);
    setDeleteSeasonTarget(null);
    toast({ title: "Season deleted." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Leagues", href: "/leagues" }, { label: league.name }]} />

      {/* Archived league warning */}
      {league.status === "archived" && hasPublishedSeasons && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This league is archived. Published seasons within it are no longer accessible to players.
            Reactivate the league to restore player access.
          </p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {league.logoImage ? (
            <img
              src={league.logoImage}
              alt="League logo"
              className="h-14 w-14 rounded-lg border object-cover shrink-0"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{league.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={league.status === "active" ? "success" : "secondary"}>
                {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground capitalize">
                {league.format.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/leagues/${leagueId}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" /> Duplicate
          </Button>
          {league.status === "archived" ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setConfirmAction("unarchive")}>
                <ArchiveRestore className="h-4 w-4 mr-2" /> Unarchive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteLeagueConfirm(true)}
                className="text-destructive hover:text-destructive border-destructive/30"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("archive")}>
              <Archive className="h-4 w-4 mr-2" /> Archive
            </Button>
          )}
        </div>
      </div>

      {/* Cover image */}
      {league.coverImage && (
        <div className="rounded-lg border overflow-hidden">
          <img src={league.coverImage} alt="Cover" className="w-full h-40 object-cover" />
        </div>
      )}

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Format</p>
            <p className="font-medium capitalize">{league.format.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Seasons</p>
            <p className="font-medium">{seasons.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Created</p>
            <p className="font-medium">{formatDate(league.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Updated</p>
            <p className="font-medium">{formatDate(league.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Seasons ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Seasons
            </CardTitle>
            {league.status === "archived" ? (
              <Button size="sm" disabled title="Reactivate the league to create seasons">
                <Plus className="h-4 w-4 mr-1.5" /> Create Season
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/leagues/${leagueId}/seasons/new`}>
                  <Plus className="h-4 w-4 mr-1.5" /> Create Season
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {seasons.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
              <Calendar className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium">No seasons yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Seasons hold events, scoring rules, and player links. Create your first one.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Season</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Events</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Dates</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Payment</th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedSeasons.map((season) => (
                    <tr
                      key={season.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/leagues/${leagueId}/seasons/${season.id}`)}
                    >
                      <td className="px-6 py-4 font-medium">{season.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant={SEASON_STATUS_VARIANT[season.displayStatus] ?? "secondary"}>
                          {season.displayStatus.charAt(0).toUpperCase() + season.displayStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{season.eventCount}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {season.dateRange ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground capitalize">
                        {season.payment.mode}
                        {season.payment.mode === "paid" && season.payment.price
                          ? ` · $${season.payment.price}`
                          : ""}
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="View season">
                            <Link href={`/leagues/${leagueId}/seasons/${season.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Duplicate season"
                            onClick={() => handleDuplicateSeason(season.id, season.name)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {season.status !== "archived" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Archive season"
                              onClick={() => handleArchiveSeason(season.id)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          {season.status === "archived" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete season"
                              onClick={() => setDeleteSeasonTarget({ id: season.id, name: season.name })}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Branding ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" /> Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Cover Image</p>
              {league.coverImage ? (
                <img src={league.coverImage} alt="Cover" className="h-20 w-40 rounded-lg border object-cover" />
              ) : (
                <div className="h-20 w-40 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  No cover image
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Logo</p>
              {league.logoImage ? (
                <img src={league.logoImage} alt="Logo" className="h-20 w-20 rounded-lg border object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  No logo
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season delete confirmation dialog */}
      <Dialog open={!!deleteSeasonTarget} onOpenChange={(open) => { if (!open) setDeleteSeasonTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete season?</DialogTitle>
            <DialogDescription>
              <strong>&quot;{deleteSeasonTarget?.name}&quot;</strong> and all its events will be
              permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteSeasonTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSeason}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete league confirmation dialog */}
      <Dialog open={deleteLeagueConfirm} onOpenChange={(open) => { if (!open) setDeleteLeagueConfirm(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete league?</DialogTitle>
            <DialogDescription>
              <strong>&quot;{league.name}&quot;</strong> and all its seasons and events will be
              permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteLeagueConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                remove();
                setDeleteLeagueConfirm(false);
                toast({ title: "League deleted." });
                router.push("/leagues");
              }}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive / Unarchive confirmation dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "archive" ? "Archive league?" : "Reactivate league?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "archive"
                ? `"${league.name}" will be archived. Published seasons will become inaccessible to players until the league is reactivated.`
                : `"${league.name}" will be set back to active. Published seasons will become accessible to players again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button variant={confirmAction === "archive" ? "destructive" : "default"} onClick={handleConfirm}>
              {confirmAction === "archive" ? "Archive" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Plus, Trophy, Eye, Copy, Archive, ArchiveRestore, Inbox, Users, Users2,
  Trash2, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useLeagues } from "@/lib/leagues/useLeagues";

function statusVariant(status: "active" | "archived"): "success" | "secondary" {
  return status === "active" ? "success" : "secondary";
}

function formatLabel(format: string): string {
  if (format === "best_x") return "Best X";
  return format.charAt(0).toUpperCase() + format.slice(1);
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const GRADIENTS = [
  "from-blue-800 to-blue-600",
  "from-emerald-700 to-emerald-500",
  "from-purple-800 to-purple-600",
  "from-orange-700 to-orange-500",
  "from-rose-700 to-rose-500",
  "from-teal-700 to-teal-500",
];

function pickGradient(id: string): string {
  const idx = id.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

export function LeaguesListPage() {
  const router = useRouter();
  const { leagues, archive, unarchive, remove, duplicate } = useLeagues();

  const [showArchived, setShowArchived] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    name: string;
    action: "archive" | "unarchive";
  } | null>(null);

  const LEAGUE_STATUS_ORDER: Record<string, number> = { active: 0, archived: 1 };

  const archivedCount = leagues.filter((l) => l.status === "archived").length;
  const displayed = (showArchived ? leagues : leagues.filter((l) => l.status !== "archived"))
    .slice()
    .sort((a, b) => {
      const diff = (LEAGUE_STATUS_ORDER[a.status] ?? 9) - (LEAGUE_STATUS_ORDER[b.status] ?? 9);
      if (diff !== 0) return diff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleDuplicate = (id: string) => {
    duplicate(id);
    // stays on list — hook re-renders automatically
  };

  const handleConfirm = () => {
    if (!confirmTarget) return;
    if (confirmTarget.action === "archive") {
      archive(confirmTarget.id);
    } else {
      unarchive(confirmTarget.id);
    }
    setConfirmTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leagues</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your range leagues and seasons.
          </p>
        </div>
        <Button asChild>
          <Link href="/leagues/new">
            <Plus className="h-4 w-4 mr-2" />
            Create League
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {leagues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No leagues yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Create your first league to get started.
              </p>
            </div>
            <Button asChild>
              <Link href="/leagues/new">
                <Plus className="h-4 w-4 mr-2" />
                Create League
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Count + archived toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {displayed.length} league{displayed.length !== 1 ? "s" : ""}
              {!showArchived && archivedCount > 0 && (
                <span className="ml-1 text-muted-foreground/60">
                  ({archivedCount} archived hidden)
                </span>
              )}
            </p>
            {archivedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground"
                onClick={() => setShowArchived((v) => !v)}
              >
                <EyeOff className="h-3 w-3" />
                {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((league) => (
              <Card
                key={league.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => router.push(`/leagues/${league.id}`)}
              >
                {/* Cover image / gradient header */}
                <div className={`relative h-28 bg-gradient-to-br ${pickGradient(league.id)} ${league.status === "archived" ? "opacity-60" : ""}`}>
                  {league.coverImage && (
                    <img
                      src={league.coverImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Status badge — top right */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={statusVariant(league.status)} className="text-xs shadow-sm">
                      {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Logo — overlaps bottom edge */}
                  <div className="absolute -bottom-5 left-4">
                    {league.logoImage ? (
                      <img
                        src={league.logoImage}
                        alt=""
                        className="h-10 w-10 rounded-lg border-2 border-white object-cover shadow-sm bg-white"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-white shadow-sm">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="pt-7 pb-4 px-4">
                  <div className={league.status === "archived" ? "opacity-60" : ""}>
                    {/* Name + badges */}
                    <div>
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {league.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {formatLabel(league.format)}
                        </Badge>
                        {league.participantFormat && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {league.participantFormat === "team" ? (
                              <><Users2 className="h-2.5 w-2.5" /> Teams</>
                            ) : (
                              <><Users className="h-2.5 w-2.5" /> Individual</>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{league.seasonCount} season{league.seasonCount !== 1 ? "s" : ""}</span>
                      {league.publishedSeasonCount > 0 && (
                        <span className="text-green-700 font-medium">
                          {league.publishedSeasonCount} published
                        </span>
                      )}
                      <span className="ml-auto">{relativeDate(league.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Action strip — always full opacity even when league is archived */}
                  <div
                    className="mt-3 flex items-center gap-1 pt-3 border-t"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
                      <Link href={`/leagues/${league.id}`}>
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => handleDuplicate(league.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Duplicate
                    </Button>

                    {league.status !== "archived" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive ml-auto"
                        onClick={() => setConfirmTarget({ id: league.id, name: league.name, action: "archive" })}
                      >
                        <Archive className="h-3 w-3 mr-1" /> Archive
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-muted-foreground ml-auto"
                          onClick={() => setConfirmTarget({ id: league.id, name: league.name, action: "unarchive" })}
                        >
                          <ArchiveRestore className="h-3 w-3 mr-1" /> Unarchive
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget({ id: league.id, name: league.name })}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Archive / Unarchive confirmation dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.action === "archive" ? "Archive league?" : "Reactivate league?"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.action === "archive"
                ? `"${confirmTarget?.name}" will be archived. Published seasons will become inaccessible to players.`
                : `"${confirmTarget?.name}" will be set back to active. Players can access its published seasons again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmTarget?.action === "archive" ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {confirmTarget?.action === "archive" ? "Archive" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete league?</DialogTitle>
            <DialogDescription>
              <strong>&quot;{deleteTarget?.name}&quot;</strong> and all its seasons and events will
              be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
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

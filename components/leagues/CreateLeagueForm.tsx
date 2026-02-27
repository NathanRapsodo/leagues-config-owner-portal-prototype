"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, X, Users, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { upsertLeague, getLeague } from "@/lib/leagues/repo";
import { _notify } from "@/lib/leagues/useLeagues";
import { League, LeagueFormat, ParticipantFormat } from "@/lib/leagues/types";

const FORMAT_OPTIONS: { value: LeagueFormat; label: string; description: string }[] = [
  { value: "points", label: "Points", description: "Players earn points based on performance." },
  { value: "strokes", label: "Strokes", description: "Traditional stroke-play scoring." },
  { value: "best_x", label: "Best X", description: "Count only the best X scores per player." },
];

const PARTICIPATION_OPTIONS: {
  value: ParticipantFormat;
  label: string;
  description: string;
  Icon: React.ElementType;
}[] = [
  {
    value: "individual",
    label: "Individual",
    description: "Players compete on their own merits. Rankings are per player.",
    Icon: Users,
  },
  {
    value: "team",
    label: "Team",
    description: "Players are grouped into teams. Rankings are aggregated per team.",
    Icon: Users2,
  },
];

interface Props {
  /** When provided, the form operates in edit mode for the given league. */
  leagueId?: string;
}

export function CreateLeagueForm({ leagueId }: Props) {
  const router = useRouter();
  const editLeague = leagueId ? getLeague(leagueId) : undefined;

  const [name, setName] = useState(editLeague?.name ?? "");
  const [format, setFormat] = useState<LeagueFormat | "">(editLeague?.format ?? "");
  const [participantFormat, setParticipantFormat] = useState<ParticipantFormat | "">(
    editLeague?.participantFormat ?? ""
  );
  const [coverImage, setCoverImage] = useState<string | undefined>(editLeague?.coverImage);
  const [logoImage, setLogoImage] = useState<string | undefined>(editLeague?.logoImage);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleImage = (field: "cover" | "logo", file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (field === "cover") setCoverImage(url);
      else setLogoImage(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "League name is required.";
    if (!format) errs.format = "Please select a scoring format.";
    if (!participantFormat) errs.participantFormat = "Please select a participation type.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const league: League = {
      id: editLeague?.id ?? crypto.randomUUID(),
      name: name.trim(),
      format: format as LeagueFormat,
      participantFormat: participantFormat as ParticipantFormat,
      status: editLeague?.status ?? "active",
      coverImage,
      logoImage,
      createdAt: editLeague?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertLeague(league);
    _notify();
    router.push(`/leagues/${league.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {editLeague ? (
        <Breadcrumb
          items={[
            { label: "Leagues", href: "/leagues" },
            { label: editLeague.name, href: `/leagues/${editLeague.id}` },
            { label: "Edit" },
          ]}
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/leagues")}
          className="-ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Leagues
        </Button>
      )}

      <div>
        <h2 className="text-2xl font-bold">{editLeague ? "Edit League" : "New League"}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {editLeague
            ? "Update league settings and branding."
            : "Create a league and then add seasons to it."}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="league-name">
              League Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="league-name"
              placeholder="e.g. Tuesday Night Shootout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Scoring Format */}
          <div className="space-y-2">
            <Label>
              Scoring Format <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={`relative flex flex-col gap-1 rounded-lg border-2 p-4 text-left transition-colors ${
                    format === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/40"
                  }`}
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                  {format === opt.value && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
            {errors.format && <p className="text-xs text-destructive">{errors.format}</p>}
          </div>

          {/* Participation Type */}
          <div className="space-y-2">
            <Label>
              Participation <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PARTICIPATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setParticipantFormat(opt.value)}
                  className={`relative flex flex-col gap-2 rounded-lg border-2 p-4 text-left transition-colors ${
                    participantFormat === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/40"
                  }`}
                >
                  <opt.Icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                  {participantFormat === opt.value && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
            {errors.participantFormat && (
              <p className="text-xs text-destructive">{errors.participantFormat}</p>
            )}
          </div>

          {/* Branding (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cover image */}
            <div className="space-y-2">
              <Label>
                Cover Image{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              {coverImage ? (
                <div className="relative inline-block w-full">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="h-24 w-full rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setCoverImage(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImage("cover", e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>
                Logo{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              {logoImage ? (
                <div className="relative inline-block">
                  <img
                    src={logoImage}
                    alt="Logo"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setLogoImage(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImage("logo", e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {editLeague && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/leagues/${editLeague.id}`)}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} size="lg">
          {editLeague ? "Save Changes" : "Create League"}
        </Button>
      </div>
    </form>
  );
}

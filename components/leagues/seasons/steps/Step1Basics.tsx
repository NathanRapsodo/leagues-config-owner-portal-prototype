"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Season } from "@/lib/leagues/types";

interface Props {
  data: Partial<Season>;
  onChange: (patch: Partial<Season>) => void;
  errors: Record<string, string>;
}

export function Step1Basics({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Season Basics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Name this season and set its participation rules.
        </p>
      </div>

      {/* Season name */}
      <div className="space-y-2">
        <Label htmlFor="season-name">
          Season Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="season-name"
          placeholder="e.g. Spring 2025"
          value={data.name ?? ""}
          onChange={(e) => onChange({ name: e.target.value })}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="season-desc">Description</Label>
        <Textarea
          id="season-desc"
          placeholder="Brief description of this season..."
          value={data.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Participant limit */}
      <div className="space-y-2">
        <Label htmlFor="participant-limit">Participant Limit</Label>
        <Input
          id="participant-limit"
          type="number"
          min={1}
          placeholder="Leave blank for unlimited"
          value={data.participantLimit ?? ""}
          onChange={(e) =>
            onChange({ participantLimit: e.target.value ? parseInt(e.target.value) : undefined })
          }
        />
      </div>

      {/* Leaderboard unit */}
      <div className="space-y-2">
        <Label>Leaderboard Unit</Label>
        <Select
          value={data.leaderboardUnit ?? "points"}
          onValueChange={(v) => onChange({ leaderboardUnit: v as Season["leaderboardUnit"] })}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points">Points</SelectItem>
            <SelectItem value="strokes">Strokes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

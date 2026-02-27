"use client";

import { Upload, X, Image as ImageIcon, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Season } from "@/lib/leagues/types";

interface Props {
  data: Partial<Season>;
  onChange: (patch: Partial<Season>) => void;
  errors: Record<string, string>;
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export function StepMedia({ data, onChange }: Props) {
  const handleFile = async (
    field: "coverImage" | "bannerImage",
    file: File | null
  ) => {
    if (!file) return;
    const url = await readFile(file);
    onChange({ [field]: url });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Season Media</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload visuals that players see when browsing or joining this season. Both are optional.
        </p>
      </div>

      {/* Cover image — wide banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          <Label>Season Cover</Label>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Wide banner displayed at the top of the season page and in season listings.
          Recommended: 1200 × 400 px.
        </p>

        {data.coverImage ? (
          <div className="relative rounded-xl overflow-hidden border">
            <img
              src={data.coverImage}
              alt="Season cover"
              className="w-full h-40 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => onChange({ coverImage: undefined })}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <div className="absolute bottom-2 left-3 text-white text-xs font-medium bg-black/40 rounded px-2 py-0.5">
              Cover image
            </div>
          </div>
        ) : (
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Upload cover image</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG or WEBP</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile("coverImage", e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      {/* Banner / logo image */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <Label>Season Logo / Thumbnail</Label>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Square image used as the season thumbnail in app cards and share previews.
          Recommended: 600 × 600 px.
        </p>

        {data.bannerImage ? (
          <div className="relative inline-block">
            <img
              src={data.bannerImage}
              alt="Season thumbnail"
              className="h-32 w-32 rounded-xl border object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onChange({ bannerImage: undefined })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground text-center px-2">Thumbnail</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile("bannerImage", e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-muted/50 border px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Tips for great visuals</p>
        <ul className="space-y-1 list-disc ml-4">
          <li>Use high-contrast images that look good at small sizes.</li>
          <li>Avoid text-heavy images — the season name overlays the cover automatically.</li>
          <li>JPG and WEBP give the best file sizes for photographs.</li>
        </ul>
      </div>
    </div>
  );
}

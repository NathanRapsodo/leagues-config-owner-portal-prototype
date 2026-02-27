// ─── Shared mock course data ──────────────────────────────────────────────────
// Used by EventSettingsPanel (course picker) and Step2Events (settings summary)

export interface MockTee {
  id: string;
  label: string;
  colorHex: string;
  yards9: number;   // front 9 total
  yards18: number;  // full 18 total
  rating: number;
  slope: number;
  par9: number[];   // par per hole, holes 1-9
  yds9: number[];   // yardage per hole, holes 1-9
  par18: number[];  // par per hole, holes 1-18
  yds18: number[];  // yardage per hole, holes 1-18
}

export interface MockCourse {
  id: string;
  name: string;
  location: string;
  gradient: string;
  tees: MockTee[];
}

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "pebble-beach",
    name: "Pebble Beach Golf Links",
    location: "Pebble Beach, CA",
    gradient: "from-blue-800 to-blue-600",
    tees: [
      {
        id: "black", label: "Black", colorHex: "#111827",
        yards9: 3421, yards18: 6828, rating: 74.7, slope: 145,
        par9:  [4,5,4,4,3,5,3,4,4], yds9:  [381,502,388,331,187,516,107,418,591],
        par18: [4,5,4,4,3,5,3,4,4,4,4,3,4,5,4,4,3,5],
        yds18: [381,502,388,331,187,516,107,418,591,455,384,202,392,565,397,402,178,543],
      },
      {
        id: "blue", label: "Blue", colorHex: "#1e40af",
        yards9: 3180, yards18: 6390, rating: 71.9, slope: 138,
        par9:  [4,5,4,4,3,5,3,4,4], yds9:  [356,479,362,308,163,488,103,394,527],
        par18: [4,5,4,4,3,5,3,4,4,4,4,3,4,5,4,4,3,5],
        yds18: [356,479,362,308,163,488,103,394,527,428,358,188,365,540,369,374,160,518],
      },
      {
        id: "white", label: "White", colorHex: "#9ca3af",
        yards9: 2940, yards18: 5920, rating: 69.5, slope: 128,
        par9:  [4,5,4,4,3,5,3,4,4], yds9:  [330,445,335,285,145,455,92,368,485],
        par18: [4,5,4,4,3,5,3,4,4,4,4,3,4,5,4,4,3,5],
        yds18: [330,445,335,285,145,455,92,368,485,396,328,170,337,503,340,345,142,479],
      },
      {
        id: "red", label: "Red", colorHex: "#dc2626",
        yards9: 2580, yards18: 5200, rating: 65.8, slope: 117,
        par9:  [4,5,4,4,3,5,3,4,4], yds9:  [295,398,300,253,126,407,80,325,396],
        par18: [4,5,4,4,3,5,3,4,4,4,4,3,4,5,4,4,3,5],
        yds18: [295,398,300,253,126,407,80,325,396,351,292,148,300,450,302,305,119,426],
      },
    ],
  },
  {
    id: "st-andrews",
    name: "St Andrews Old Course",
    location: "St Andrews, Scotland",
    gradient: "from-emerald-700 to-emerald-500",
    tees: [
      {
        id: "black", label: "Championship", colorHex: "#111827",
        yards9: 3652, yards18: 7305, rating: 73.1, slope: 132,
        par9:  [4,4,4,4,5,4,4,4,4], yds9:  [376,453,371,463,568,416,372,318,315],
        par18: [4,4,4,4,5,4,4,4,4,4,3,4,4,5,4,4,4,4],
        yds18: [376,453,371,463,568,416,372,318,315,380,174,316,425,567,413,423,495,360],
      },
      {
        id: "blue", label: "Blue", colorHex: "#1e40af",
        yards9: 3450, yards18: 6900, rating: 71.2, slope: 126,
        par9:  [4,4,4,4,5,4,4,4,4], yds9:  [352,425,347,438,540,390,348,300,310],
        par18: [4,4,4,4,5,4,4,4,4,4,3,4,4,5,4,4,4,4],
        yds18: [352,425,347,438,540,390,348,300,310,355,163,296,398,540,385,398,469,346],
      },
      {
        id: "white", label: "White", colorHex: "#9ca3af",
        yards9: 3200, yards18: 6408, rating: 68.9, slope: 119,
        par9:  [4,4,4,4,5,4,4,4,4], yds9:  [324,392,319,403,498,360,320,276,308],
        par18: [4,4,4,4,5,4,4,4,4,4,3,4,4,5,4,4,4,4],
        yds18: [324,392,319,403,498,360,320,276,308,328,149,273,367,498,355,368,432,338],
      },
    ],
  },
  {
    id: "augusta",
    name: "Augusta National",
    location: "Augusta, GA",
    gradient: "from-teal-700 to-green-500",
    tees: [
      {
        id: "black", label: "Masters", colorHex: "#111827",
        yards9: 3739, yards18: 7475, rating: 76.2, slope: 148,
        par9:  [4,5,4,4,4,3,4,5,4], yds9:  [445,575,350,325,455,180,450,570,389],
        par18: [4,5,4,4,4,3,4,5,4,4,4,3,5,4,5,3,4,4],
        yds18: [445,575,350,325,455,180,450,570,389,495,505,155,510,440,530,170,440,461],
      },
      {
        id: "white", label: "Member", colorHex: "#9ca3af",
        yards9: 3180, yards18: 6365, rating: 71.5, slope: 131,
        par9:  [4,5,4,4,4,3,4,5,4], yds9:  [375,495,295,275,385,155,380,490,330],
        par18: [4,5,4,4,4,3,4,5,4,4,4,3,5,4,5,3,4,4],
        yds18: [375,495,295,275,385,155,380,490,330,420,430,135,430,375,450,145,375,390],
      },
    ],
  },
  {
    id: "torrey-pines",
    name: "Torrey Pines South",
    location: "La Jolla, CA",
    gradient: "from-slate-700 to-slate-500",
    tees: [
      {
        id: "black", label: "Tournament", colorHex: "#111827",
        yards9: 3853, yards18: 7698, rating: 75.6, slope: 144,
        par9:  [4,4,3,4,4,5,4,3,5], yds9:  [452,389,175,490,453,521,448,172,753],
        par18: [4,4,3,4,4,5,4,3,5,4,3,5,5,4,4,3,5,4],
        yds18: [452,389,175,490,453,521,448,172,753,320,220,501,558,421,476,205,624,320],
      },
      {
        id: "blue", label: "Blue", colorHex: "#1e40af",
        yards9: 3540, yards18: 7072, rating: 72.8, slope: 138,
        par9:  [4,4,3,4,4,5,4,3,5], yds9:  [417,360,157,454,418,492,413,150,679],
        par18: [4,4,3,4,4,5,4,3,5,4,3,5,5,4,4,3,5,4],
        yds18: [417,360,157,454,418,492,413,150,679,296,196,468,525,387,438,174,582,296],
      },
      {
        id: "white", label: "White", colorHex: "#9ca3af",
        yards9: 3215, yards18: 6432, rating: 70.1, slope: 128,
        par9:  [4,4,3,4,4,5,4,3,5], yds9:  [378,325,138,411,380,447,376,132,628],
        par18: [4,4,3,4,4,5,4,3,5,4,3,5,5,4,4,3,5,4],
        yds18: [378,325,138,411,380,447,376,132,628,267,172,426,479,352,399,152,529,266],
      },
      {
        id: "red", label: "Red", colorHex: "#dc2626",
        yards9: 2831, yards18: 5658, rating: 67.3, slope: 118,
        par9:  [4,4,3,4,4,5,4,3,5], yds9:  [332,286,115,363,335,396,332,110,562],
        par18: [4,4,3,4,4,5,4,3,5,4,3,5,5,4,4,3,5,4],
        yds18: [332,286,115,363,335,396,332,110,562,236,148,379,426,312,355,130,471,261],
      },
    ],
  },
  {
    id: "bethpage-black",
    name: "Bethpage Black",
    location: "Farmingdale, NY",
    gradient: "from-neutral-800 to-neutral-600",
    tees: [
      {
        id: "black", label: "Black", colorHex: "#111827",
        yards9: 3680, yards18: 7459, rating: 76.6, slope: 155,
        par9:  [4,4,3,5,4,4,3,5,4], yds9:  [430,389,210,517,478,409,207,519,521],
        par18: [4,4,3,5,4,4,3,5,4,4,4,3,4,4,3,4,5,4],
        yds18: [430,389,210,517,478,409,207,519,521,492,435,202,415,418,161,478,565,413],
      },
      {
        id: "blue", label: "Blue", colorHex: "#1e40af",
        yards9: 3420, yards18: 6936, rating: 73.6, slope: 148,
        par9:  [4,4,3,5,4,4,3,5,4], yds9:  [398,360,185,485,443,380,178,485,496],
        par18: [4,4,3,5,4,4,3,5,4,4,4,3,4,4,3,4,5,4],
        yds18: [398,360,185,485,443,380,178,485,496,458,403,174,385,388,140,443,528,384],
      },
    ],
  },
];

/** Helpers */

export type HoleSelection = "front9" | "back9" | 18;

export function getHolesLabel(holes: HoleSelection): string {
  if (holes === "front9") return "Front 9";
  if (holes === "back9") return "Back 9";
  return "18 Holes";
}

/** Yardage for a tee given the hole selection */
export function getTeeYards(tee: MockTee, holes: HoleSelection): number {
  if (holes === "front9") return tee.yards9;
  if (holes === "back9") return tee.yards18 - tee.yards9;
  return tee.yards18;
}

/** Scorecard par array for given hole selection */
export function getScorecardPar(tee: MockTee, holes: HoleSelection): number[] {
  if (holes === "front9") return tee.par18.slice(0, 9);
  if (holes === "back9") return tee.par18.slice(9, 18);
  return tee.par18;
}

/** Scorecard yardage array for given hole selection */
export function getScorecardYds(tee: MockTee, holes: HoleSelection): number[] {
  if (holes === "front9") return tee.yds18.slice(0, 9);
  if (holes === "back9") return tee.yds18.slice(9, 18);
  return tee.yds18;
}

/** Starting hole number for the scorecard */
export function getScorecardStartHole(holes: HoleSelection): number {
  return holes === "back9" ? 10 : 1;
}

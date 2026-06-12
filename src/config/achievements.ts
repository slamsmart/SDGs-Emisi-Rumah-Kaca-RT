export type AchievementDefinition = {
  code: string;
  title: string;
  description: string;
  kind: "reports" | "points" | "streak";
  threshold: number;
};

export const achievementDefinitions: AchievementDefinition[] = [
  {
    code: "AKSI_PERTAMA",
    title: "Aksi Pertama",
    description: "Mengirim laporan transport pertama.",
    kind: "reports",
    threshold: 1,
  },
  {
    code: "HEMAT_5KG",
    title: "Hemat 5 Kg CO2e",
    description: "Menghindari emisi kumulatif minimal 5 Kg CO2e.",
    kind: "points",
    threshold: 500,
  },
  {
    code: "STREAK_7",
    title: "Konsisten 7 Hari",
    description: "Melapor selama 7 hari berbeda.",
    kind: "streak",
    threshold: 7,
  },
];

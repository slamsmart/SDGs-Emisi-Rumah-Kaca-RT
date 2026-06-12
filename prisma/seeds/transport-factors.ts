import type { FactorUnit } from "@prisma/client";

export const transportFactorSeeds: Array<{
  modeCode: string;
  unit: FactorUnit;
  kgCo2ePerKm: number;
  sourceNote: string;
}> = [
  {
    modeCode: "WALK",
    unit: "PASSENGER_KM",
    kgCo2ePerKm: 0,
    sourceNote: "MVP baseline reference",
  },
  {
    modeCode: "BICYCLE",
    unit: "PASSENGER_KM",
    kgCo2ePerKm: 0,
    sourceNote: "MVP baseline reference",
  },
  {
    modeCode: "BUS",
    unit: "PASSENGER_KM",
    kgCo2ePerKm: 0.08,
    sourceNote: "MVP baseline reference",
  },
  {
    modeCode: "ANGKOT",
    unit: "PASSENGER_KM",
    kgCo2ePerKm: 0.11,
    sourceNote: "MVP baseline reference",
  },
  {
    modeCode: "MOTORCYCLE",
    unit: "VEHICLE_KM",
    kgCo2ePerKm: 0.103,
    sourceNote: "MVP baseline reference",
  },
  {
    modeCode: "CAR",
    unit: "VEHICLE_KM",
    kgCo2ePerKm: 0.192,
    sourceNote: "MVP baseline reference",
  },
];

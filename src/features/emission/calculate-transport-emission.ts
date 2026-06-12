import type { FactorUnit } from "@prisma/client";

export type EmissionFactorInput = {
  unit: FactorUnit;
  kgCo2ePerKm: number;
  defaultOccupancy?: number | null;
};

export type TransportEmissionInput = {
  distanceKm: number;
  trips: number;
  isRoundTrip: boolean;
  occupancy?: number | null;
  actualFactor: EmissionFactorInput;
  baselineFactor: EmissionFactorInput;
};

function compute(
  factor: EmissionFactorInput,
  effectiveDistanceKm: number,
  occupancy?: number | null,
) {
  if (factor.unit === "PASSENGER_KM") {
    return effectiveDistanceKm * factor.kgCo2ePerKm;
  }

  const effectiveOccupancy = occupancy ?? factor.defaultOccupancy ?? 1;
  return effectiveDistanceKm * factor.kgCo2ePerKm / Math.max(1, effectiveOccupancy);
}

export function calculateTransportEmission(input: TransportEmissionInput) {
  const tripMultiplier = input.isRoundTrip ? 2 : 1;
  const effectiveDistanceKm = input.distanceKm * input.trips * tripMultiplier;
  const actualEmissionKg = compute(input.actualFactor, effectiveDistanceKm, input.occupancy);
  const baselineEmissionKg = compute(input.baselineFactor, effectiveDistanceKm, input.occupancy);
  const avoidedEmissionKg = Math.max(0, baselineEmissionKg - actualEmissionKg);

  return {
    effectiveDistanceKm,
    actualEmissionKg,
    baselineEmissionKg,
    avoidedEmissionKg,
  };
}

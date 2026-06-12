import { describe, expect, it } from "vitest";

import { calculateTransportEmission } from "@/features/emission/calculate-transport-emission";

describe("calculateTransportEmission", () => {
  it("menghasilkan emisi nol untuk jalan kaki", () => {
    const result = calculateTransportEmission({
      distanceKm: 2,
      trips: 1,
      isRoundTrip: true,
      actualFactor: { unit: "PASSENGER_KM", kgCo2ePerKm: 0 },
      baselineFactor: { unit: "VEHICLE_KM", kgCo2ePerKm: 0.103, defaultOccupancy: 1.5 },
    });

    expect(result.actualEmissionKg).toBe(0);
    expect(result.avoidedEmissionKg).toBeGreaterThan(0);
  });

  it("mengunci avoidedEmissionKg ke nol bila baseline tidak lebih buruk", () => {
    const result = calculateTransportEmission({
      distanceKm: 5,
      trips: 1,
      isRoundTrip: false,
      actualFactor: { unit: "VEHICLE_KM", kgCo2ePerKm: 0.192, defaultOccupancy: 1 },
      baselineFactor: { unit: "PASSENGER_KM", kgCo2ePerKm: 0.08 },
    });

    expect(result.actualEmissionKg).toBeGreaterThan(result.baselineEmissionKg);
    expect(result.avoidedEmissionKg).toBe(0);
  });
});

import { SouthAfricanProvince } from '../types';
import { SA_PROVINCES_GEO, calculateHaversineDistanceKm } from './geolocation';

export type RouteTier = 'local' | 'regional' | 'national' | 'outlying';

export interface DeliveryEstimate {
  originProvince: SouthAfricanProvince | string;
  destinationProvince: SouthAfricanProvince | string;
  estimatedCostZAR: number;
  deliveryDays: string;
  distanceKm: number;
  routeTier: RouteTier;
  isLocalPickupAvailable: boolean;
  courierService: string;
  summaryText: string;
  breakdownNotice: string;
}

/**
 * Estimates automotive part shipping costs and transit times between South African provinces.
 *
 * Uses centroid coordinates of origin and destination provinces, straight-line distance,
 * route corridor classifications (intra-provincial, regional short-haul, national mainline,
 * and outlying remote), and optional category bulk multipliers (e.g. heavy engines/gearboxes).
 *
 * @param originProvince The seller/scrap yard province location
 * @param destinationProvince The buyer's delivery destination province
 * @param baseItemDeliveryCost The listing's default delivery quote (defaults to R250)
 * @param category Optional auto part category for volumetric/weight adjustments
 */
export function estimateDeliveryCost(
  originProvince: SouthAfricanProvince | string,
  destinationProvince: SouthAfricanProvince | string,
  baseItemDeliveryCost: number = 250,
  category?: string
): DeliveryEstimate {
  const normOrigin = (originProvince || 'Gauteng') as SouthAfricanProvince;
  const normDest = (destinationProvince || 'Gauteng') as SouthAfricanProvince;

  const originGeo = SA_PROVINCES_GEO[normOrigin];
  const destGeo = SA_PROVINCES_GEO[normDest];

  // Category weight / bulk factor
  let categoryMultiplier = 1.0;
  let categoryNote = 'Standard automotive parcel';

  if (category) {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('engine') || lowerCat.includes('gearbox') || lowerCat.includes('axle') || lowerCat.includes('hydraulic')) {
      categoryMultiplier = 1.45; // Heavy powertrain / crated freight
      categoryNote = 'Heavy freight / pallet handling (engines & gearboxes)';
    } else if (lowerCat.includes('body') || lowerCat.includes('bumper') || lowerCat.includes('windscreen') || lowerCat.includes('tires')) {
      categoryMultiplier = 1.2; // Bulky panel / volumetric freight
      categoryNote = 'Bulky volumetric panel parcel';
    } else if (lowerCat.includes('electrical') || lowerCat.includes('ecu') || lowerCat.includes('light') || lowerCat.includes('mirror')) {
      categoryMultiplier = 0.9; // Lightweight parcel / express satchel
      categoryNote = 'Lightweight express satchel / box';
    }
  }

  // 1. Same Province (Local Intra-Provincial)
  if (normOrigin === normDest) {
    const rawCost = Math.max(120, Math.round(baseItemDeliveryCost * 0.7 * categoryMultiplier));
    const roundedCost = Math.round(rawCost / 5) * 5;

    return {
      originProvince: normOrigin,
      destinationProvince: normDest,
      estimatedCostZAR: roundedCost,
      deliveryDays: '1 - 2 Business Days',
      distanceKm: 45, // Average metro transit
      routeTier: 'local',
      isLocalPickupAvailable: true,
      courierService: 'Local Intra-Provincial Express',
      summaryText: `Local delivery within ${normDest} ~R${roundedCost} (1-2 days). Counter collection also available.`,
      breakdownNotice: `Same-province dispatch from ${normOrigin}. Immediate counter collection or 24-48h door courier (${categoryNote}).`
    };
  }

  // 2. Cross-Province Delivery (Calculate distance between centroid hubs)
  let distanceKm = 600;
  if (originGeo && destGeo) {
    distanceKm = calculateHaversineDistanceKm(
      originGeo.centroid.lat,
      originGeo.centroid.lng,
      destGeo.centroid.lat,
      destGeo.centroid.lng
    );
  }

  // Distance Tiers
  if (distanceKm < 450) {
    // Regional Short-Haul (e.g., GP to NW, MP, or FS)
    const rawCost = Math.max(160, Math.round(baseItemDeliveryCost * 1.05 * categoryMultiplier));
    const roundedCost = Math.round(rawCost / 5) * 5;

    return {
      originProvince: normOrigin,
      destinationProvince: normDest,
      estimatedCostZAR: roundedCost,
      deliveryDays: '2 - 3 Business Days',
      distanceKm,
      routeTier: 'regional',
      isLocalPickupAvailable: false,
      courierService: 'Regional Road Freight',
      summaryText: `Regional freight to ${normDest} (~${distanceKm} km) est. R${roundedCost}.`,
      breakdownNotice: `Short-haul regional transport between ${normOrigin} and ${normDest} (~${distanceKm} km). Tracked parcel road courier (${categoryNote}).`
    };
  } else if (distanceKm < 1000) {
    // Inter-Provincial Mainline Corridor (e.g., GP to KZN, FS to WC, EC to GP)
    const rawCost = Math.max(220, Math.round(baseItemDeliveryCost * 1.35 * categoryMultiplier));
    const roundedCost = Math.round(rawCost / 5) * 5;

    return {
      originProvince: normOrigin,
      destinationProvince: normDest,
      estimatedCostZAR: roundedCost,
      deliveryDays: '2 - 4 Business Days',
      distanceKm,
      routeTier: 'national',
      isLocalPickupAvailable: false,
      courierService: 'Inter-Provincial Mainline Freight',
      summaryText: `National mainline delivery to ${normDest} (~${distanceKm} km) est. R${roundedCost}.`,
      breakdownNotice: `Mainline transport corridor from ${normOrigin} to ${normDest} (~${distanceKm} km). Fully insured automotive road freight (${categoryNote}).`
    };
  } else {
    // Long-Haul Cross-Country / Outlying (e.g., Western Cape to Limpopo / Mpumalanga ~1,400 km, or Northern Cape)
    const rawCost = Math.max(290, Math.round(baseItemDeliveryCost * 1.65 * categoryMultiplier));
    const roundedCost = Math.round(rawCost / 5) * 5;

    return {
      originProvince: normOrigin,
      destinationProvince: normDest,
      estimatedCostZAR: roundedCost,
      deliveryDays: '3 - 5 Business Days',
      distanceKm,
      routeTier: 'outlying',
      isLocalPickupAvailable: false,
      courierService: 'Cross-Country Long-Haul Freight',
      summaryText: `Long-distance nationwide courier to ${normDest} (~${distanceKm} km) est. R${roundedCost}.`,
      breakdownNotice: `Cross-country transit from ${normOrigin} to ${normDest} (~${distanceKm} km). Waybill-tracked nationwide automotive freight (${categoryNote}).`
    };
  }
}

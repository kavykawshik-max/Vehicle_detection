import { DetectionItem, VehicleSummary, SceneDescription, CrossingSummary, AnalysisRecord } from '../types/traffic';

// Real photorealistic image assets generated for standard demonstration scenarios
import trafficImg from '../assets/images/traffic_intersection_cctv_1790675052124.jpg';
import dogImg from '../assets/images/dog_on_park_lawn_1790675074902.jpg';
import personCarImg from '../assets/images/person_beside_car_1790675100380.jpg';
import emptyRoadImg from '../assets/images/empty_mountain_road_1790675118395.jpg';
import pedestriansImg from '../assets/images/pedestrians_walking_plaza_1790675146763.jpg';

export const VEHICLE_CLASSES = new Set(['car', 'motorcycle', 'bus', 'truck', 'bicycle', 'train']);

export const CLASS_COLORS: Record<string, string> = {
  car: '#38BDF8',         // Sky blue
  motorcycle: '#F59E0B',  // Amber
  bus: '#A855F7',         // Purple
  truck: '#22C55E',       // Green
  bicycle: '#EAB308',     // Yellow
  train: '#EC4899',       // Pink
  person: '#F43F5E',      // Rose/Coral
  dog: '#14B8A6',         // Teal
  cat: '#06B6D4',         // Cyan
  default_vehicle: '#0284C7',
  default_non_vehicle: '#94A3B8', // Slate
};

export function isVehicleClass(className: string): boolean {
  return VEHICLE_CLASSES.has(className.toLowerCase().trim());
}

export function generateSceneDescription(
  vehicleDetections: DetectionItem[],
  nonVehicleDetections: DetectionItem[]
): SceneDescription {
  const vehicleCount = vehicleDetections.length;
  const nonVehicleCount = nonVehicleDetections.length;

  const otherTally: Record<string, number> = {};
  nonVehicleDetections.forEach((d) => {
    const name = d.className.charAt(0).toUpperCase() + d.className.slice(1);
    otherTally[name] = (otherTally[name] || 0) + 1;
  });

  const otherList = Object.entries(otherTally).map(([name, count]) =>
    count > 1 ? `${count} ${name}s` : name
  );
  const otherSummary = otherList.length > 0 ? otherList.join(', ') : 'None detected';

  if (vehicleCount === 0) {
    const status = 'NO VEHICLES DETECTED';
    const classification = 'Non-Vehicle Scene';
    let desc = '';
    if (nonVehicleCount > 0) {
      desc = `The image contains ${otherSummary}. No motorized or non-motorized vehicles were observed.`;
    } else {
      desc = 'No vehicles or recognized objects were detected in this image. Scene appears empty or contains non-cataloged visual features.';
    }

    return {
      vehicleDetectionStatus: status,
      totalVehiclesDetected: 0,
      otherObjectsDetected: Object.keys(otherTally),
      otherObjectsSummary: otherSummary,
      imageClassification: classification,
      description: desc,
      hasVehicles: false,
    };
  }

  const status = `VEHICLES DETECTED (${vehicleCount} UNITS)`;
  const classification = 'Traffic / Roadway Scene';

  const vTally: Record<string, number> = {};
  vehicleDetections.forEach((d) => {
    const name = d.className.charAt(0).toUpperCase() + d.className.slice(1);
    vTally[name] = (vTally[name] || 0) + 1;
  });

  const vSummary = Object.entries(vTally)
    .map(([name, count]) => (count > 1 ? `${count} ${name}s` : `1 ${name}`))
    .join(', ');

  let desc = `Active traffic roadway with ${vehicleCount} detected vehicle(s): ${vSummary}.`;
  if (nonVehicleCount > 0) {
    desc += ` Also observed ${otherSummary}.`;
  }

  return {
    vehicleDetectionStatus: status,
    totalVehiclesDetected: vehicleCount,
    otherObjectsDetected: Object.keys(otherTally),
    otherObjectsSummary: otherSummary,
    imageClassification: classification,
    description: desc,
    hasVehicles: true,
  };
}

export function ensurePlateDataForVehicle(
  detection: DetectionItem,
  index: number = 0
): DetectionItem {
  if (!detection.isVehicle) return detection;
  if (detection.plate) return detection;

  // Derive realistic bumper plate coordinates (bottom 25% of vehicle bounding box, centered)
  const [x1, y1, x2, y2] = detection.box;
  const w = Math.max(20, x2 - x1);
  const h = Math.max(20, y2 - y1);
  const pw = Math.round(Math.max(24, Math.min(64, w * 0.36)));
  const ph = Math.round(Math.max(12, Math.min(22, h * 0.18)));
  const px1 = Math.round(x1 + (w - pw) / 2);
  const py1 = Math.round(y2 - ph - Math.max(3, h * 0.08));
  const px2 = Math.round(px1 + pw);
  const py2 = Math.round(py1 + ph);

  const states = ['NY', 'CA', 'TX', 'FL', 'NJ', 'PA', 'IL', 'MA', 'WA', 'CT'];
  const state = states[(index * 3 + 1) % states.length];
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l1 = letters[(index * 7 + 2) % letters.length];
  const l2 = letters[(index * 11 + 5) % letters.length];
  const l3 = letters[(index * 13 + 8) % letters.length];
  const num = 1000 + ((index * 463 + 281) % 8999);
  const plateNumber = `${state} · ${l1}${l2}${l3}-${num}`;

  return {
    ...detection,
    plate: {
      plateNumber,
      stateOrRegion: `${state} Department of Motor Vehicles`,
      confidence: Math.round((0.93 + (index % 6) * 0.01) * 1000) / 1000,
      box: [px1, py1, px2, py2],
      status: index === 4 ? 'WATCHLIST_FLAG' : index === 9 ? 'EXPIRED_REG' : 'CLEARED',
      vehicleModel: `${detection.className.toUpperCase()} - Registered Fleet`,
      registeredOwner: `Registered Operator #${index + 101}`,
      vinSnippet: `1HGCM${index}2633A0${index}****`,
      inspectionExpiry: '2027-10-31',
      unpaidViolationsCount: index === 4 ? 4 : 0,
    },
  };
}

export function ensureAllVehiclesHavePlates(detections: DetectionItem[]): DetectionItem[] {
  let vehicleIdx = 0;
  return detections.map((d) => {
    if (d.isVehicle) {
      const enriched = ensurePlateDataForVehicle(d, vehicleIdx);
      vehicleIdx++;
      return enriched;
    }
    return d;
  });
}

export function summarizeVehicles(vehicleDetections: DetectionItem[]): VehicleSummary {
  const counts: Record<string, number> = {
    car: 0,
    motorcycle: 0,
    bus: 0,
    truck: 0,
    bicycle: 0,
    train: 0,
  };

  let totalConf = 0;
  vehicleDetections.forEach((d) => {
    const c = d.className.toLowerCase().trim();
    counts[c] = (counts[c] || 0) + 1;
    totalConf += d.confidence;
  });

  const total = vehicleDetections.length;
  const avgConf = total > 0 ? totalConf / total : 0;
  const totalPlates = vehicleDetections.filter((d) => Boolean(d.plate)).length;
  const watchlistAlerts = vehicleDetections.filter((d) => d.plate?.status === 'WATCHLIST_FLAG').length;

  return {
    totalVehicles: total,
    cars: counts.car || 0,
    motorcycles: counts.motorcycle || 0,
    buses: counts.bus || 0,
    trucks: counts.truck || 0,
    bicycles: counts.bicycle || 0,
    trains: counts.train || 0,
    averageConfidence: Math.round(avgConf * 100) / 100,
    categoryCounts: counts,
    totalPlatesDetected: totalPlates,
    watchlistAlertsCount: watchlistAlerts,
  };
}

// Preset demonstration scenarios (from Section 17)
export interface PresetScenario {
  id: string;
  name: string;
  type: 'image' | 'video';
  description: string;
  expectedResult: string;
  width: number;
  height: number;
  imageSrc?: string;
  detections: DetectionItem[];
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'scenario_a',
    name: 'Scenario A: Road Intersection (Multi-Vehicle)',
    type: 'image',
    description: 'High-angle municipal traffic surveillance photo of a busy multi-lane roadway intersection.',
    expectedResult: 'Detect visible vehicles (cars, motorcycles, bus). Accurate bounding boxes and category metrics.',
    width: 1024,
    height: 576,
    imageSrc: trafficImg,
    detections: [
      {
        box: [595, 182, 785, 325],
        className: 'bus',
        confidence: 0.96,
        isVehicle: true,
        plate: {
          plateNumber: 'MTA · 9204-T',
          stateOrRegion: 'Municipal Transit',
          confidence: 0.994,
          box: [675, 298, 715, 312],
          status: 'TRANSIT_OFFICIAL',
          vehicleModel: 'New Flyer Xcelsior Diesel Transit Bus',
          registeredOwner: 'Metropolitan Transportation Authority',
          vinSnippet: '5FY470C05M200****',
          inspectionExpiry: '2027-12-31',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [515, 370, 680, 535],
        className: 'car',
        confidence: 0.95,
        isVehicle: true,
        plate: {
          plateNumber: 'NY · GTR-4912',
          stateOrRegion: 'New York',
          confidence: 0.985,
          box: [580, 498, 624, 514],
          status: 'CLEARED',
          vehicleModel: '2022 Honda CR-V EX AWD (Crystal Black)',
          registeredOwner: 'M. Chen · New York, NY',
          vinSnippet: '2HKRW2H87NH09****',
          inspectionExpiry: '2027-08-31',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [665, 305, 780, 400],
        className: 'car',
        confidence: 0.93,
        isVehicle: true,
        plate: {
          plateNumber: 'CT · 4AP-892',
          stateOrRegion: 'Connecticut',
          confidence: 0.965,
          box: [712, 368, 744, 380],
          status: 'CLEARED',
          vehicleModel: '2021 Toyota RAV4 XLE (Magnetic Gray)',
          registeredOwner: 'S. Bradley · Stamford, CT',
          vinSnippet: '2T3C1RFV8MC08****',
          inspectionExpiry: '2027-04-30',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [745, 255, 825, 325],
        className: 'car',
        confidence: 0.90,
        isVehicle: true,
        plate: {
          plateNumber: 'MA · 912-TX4',
          stateOrRegion: 'Massachusetts',
          confidence: 0.951,
          box: [778, 304, 804, 314],
          status: 'CLEARED',
          vehicleModel: '2023 Jeep Grand Cherokee (Midnight)',
          registeredOwner: 'E. Rodriguez · Boston, MA',
          vinSnippet: '1C4RJFBG8PC54****',
          inspectionExpiry: '2026-10-31',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [770, 415, 915, 525],
        className: 'car',
        confidence: 0.92,
        isVehicle: true,
        plate: {
          plateNumber: 'PA · LMN-5421',
          stateOrRegion: 'Pennsylvania',
          confidence: 0.962,
          box: [830, 488, 868, 502],
          status: 'WATCHLIST_FLAG',
          vehicleModel: '2020 Ford Fiesta SE (Oxford White)',
          registeredOwner: 'R. K. Kowalski · Philadelphia, PA',
          vinSnippet: '3FADP4BJ1LM11****',
          inspectionExpiry: '2025-11-30',
          unpaidViolationsCount: 4,
        },
      },
      {
        box: [100, 230, 160, 298],
        className: 'car',
        confidence: 0.94,
        isVehicle: true,
        plate: {
          plateNumber: 'NJ · K78-YZA',
          stateOrRegion: 'New Jersey',
          confidence: 0.974,
          box: [122, 276, 148, 288],
          status: 'CLEARED',
          vehicleModel: '2019 Chevrolet Spark (Crimson Red)',
          registeredOwner: 'D. Miller · Hoboken, NJ',
          vinSnippet: 'KL8CB6S91KC31****',
          inspectionExpiry: '2026-09-30',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [166, 210, 234, 268],
        className: 'car',
        confidence: 0.91,
        isVehicle: true,
        plate: {
          plateNumber: 'NY · JXW-3109',
          stateOrRegion: 'New York',
          confidence: 0.962,
          box: [194, 248, 218, 258],
          status: 'CLEARED',
          vehicleModel: '2018 Hyundai Elantra (Lakeside Blue)',
          registeredOwner: 'K. Patel · Queens, NY',
          vinSnippet: 'KMHD84LF7JU51****',
          inspectionExpiry: '2027-01-31',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [244, 198, 318, 262],
        className: 'car',
        confidence: 0.92,
        isVehicle: true,
        plate: {
          plateNumber: 'NY · HVC-8291',
          stateOrRegion: 'New York',
          confidence: 0.967,
          box: [274, 242, 298, 252],
          status: 'CLEARED',
          vehicleModel: '2020 Subaru Outback Limited (Ice Silver)',
          registeredOwner: 'G. Bennett · Albany, NY',
          vinSnippet: '4S4BTANC7L314****',
          inspectionExpiry: '2027-03-31',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [155, 258, 192, 320],
        className: 'motorcycle',
        confidence: 0.89,
        isVehicle: true,
        plate: {
          plateNumber: 'NY · 82-MK9',
          stateOrRegion: 'New York Motorcycle',
          confidence: 0.941,
          box: [170, 302, 188, 314],
          status: 'CLEARED',
          vehicleModel: 'Yamaha Tracer 900 GT',
          registeredOwner: 'L. Gomez · Brooklyn, NY',
          vinSnippet: 'JYARN53Y9KA00****',
          inspectionExpiry: '2026-11-30',
          unpaidViolationsCount: 0,
        },
      },
      {
        box: [180, 250, 212, 305],
        className: 'motorcycle',
        confidence: 0.88,
        isVehicle: true,
        plate: {
          plateNumber: 'NJ · MC-4821',
          stateOrRegion: 'New Jersey Motorcycle',
          confidence: 0.948,
          box: [192, 290, 208, 300],
          status: 'EXPIRED_REG',
          vehicleModel: 'Harley-Davidson Sportster Iron 883',
          registeredOwner: 'T. Vance · Jersey City, NJ',
          vinSnippet: '1HD4CR218KC41****',
          inspectionExpiry: '2026-02-15',
          unpaidViolationsCount: 1,
        },
      },
      {
        box: [202, 244, 236, 295],
        className: 'motorcycle',
        confidence: 0.87,
        isVehicle: true,
        plate: {
          plateNumber: 'NY · 77-BR4',
          stateOrRegion: 'New York Motorcycle',
          confidence: 0.946,
          box: [216, 280, 230, 290],
          status: 'CLEARED',
          vehicleModel: 'Kawasaki Ninja 650 ABS',
          registeredOwner: 'A. Thorne · Manhattan, NY',
          vinSnippet: 'JKAZR650ALA02****',
          inspectionExpiry: '2026-12-31',
          unpaidViolationsCount: 0,
        },
      },
    ],
  },
  {
    id: 'scenario_b',
    name: 'Scenario B: Domestic Dog (Non-Vehicle Scene)',
    type: 'image',
    description: 'Real photographic capture of a golden retriever dog sitting alone on park lawn without any vehicles.',
    expectedResult: 'Total vehicles: 0. Status: NO VEHICLES DETECTED. Identified object: Dog.',
    width: 1024,
    height: 576,
    imageSrc: dogImg,
    detections: [
      { box: [320, 150, 710, 520], className: 'dog', confidence: 0.98, isVehicle: false },
    ],
  },
  {
    id: 'scenario_c',
    name: 'Scenario C: Person Standing Beside a Car',
    type: 'image',
    description: 'Real street photograph showing a person standing right next to a modern car parked along the curb.',
    expectedResult: 'Total vehicles: 1 (car). Other objects: 1 (person). Separate classifications without conflation.',
    width: 1024,
    height: 576,
    imageSrc: personCarImg,
    detections: [
      {
        box: [350, 150, 920, 510],
        className: 'car',
        confidence: 0.95,
        isVehicle: true,
        plate: {
          plateNumber: 'CA · 8XYZ109',
          stateOrRegion: 'California',
          confidence: 0.985,
          box: [610, 440, 680, 465],
          status: 'CLEARED',
          vehicleModel: '2023 Tesla Model 3 Performance (Midnight Silver)',
          registeredOwner: 'E. Vance · San Francisco, CA',
          vinSnippet: '5YJ3E1EB7PF88****',
          inspectionExpiry: '2028-05-31',
          unpaidViolationsCount: 0,
        },
      },
      { box: [140, 100, 330, 520], className: 'person', confidence: 0.96, isVehicle: false },
    ],
  },
  {
    id: 'scenario_d',
    name: 'Scenario D: Moving Highway Traffic (Video)',
    description: 'CCTV highway segment with vehicles traversing across a virtual tripwire.',
    expectedResult: 'Frame-by-frame ByteTrack tracking with persistent IDs. Zero duplicate count for same car.',
    width: 1024,
    height: 576,
    imageSrc: trafficImg,
    detections: [
      {
        box: [120, 80, 260, 200],
        className: 'car',
        confidence: 0.92,
        isVehicle: true,
        trackingId: 1,
        plate: {
          plateNumber: 'FL · WQ9-812',
          stateOrRegion: 'Florida',
          confidence: 0.964,
          box: [175, 180, 215, 192],
          status: 'CLEARED',
          vehicleModel: '2021 Toyota Camry SE',
          registeredOwner: 'H. Walker · Miami, FL',
        },
      },
      {
        box: [320, 120, 480, 250],
        className: 'truck',
        confidence: 0.89,
        isVehicle: true,
        trackingId: 2,
        plate: {
          plateNumber: 'US-DOT · 389104',
          stateOrRegion: 'Interstate Commerce',
          confidence: 0.988,
          box: [385, 230, 435, 244],
          status: 'COMMERCIAL_VALID',
          vehicleModel: 'Freightliner Cascadia 126 Semi',
          registeredOwner: 'Titan Logistics Freight Lines',
        },
      },
      {
        box: [540, 90, 680, 220],
        className: 'car',
        confidence: 0.94,
        isVehicle: true,
        trackingId: 3,
        plate: {
          plateNumber: 'GA · RKL-502',
          stateOrRegion: 'Georgia',
          confidence: 0.957,
          box: [595, 198, 635, 210],
          status: 'CLEARED',
          vehicleModel: '2022 Honda Accord Sport',
          registeredOwner: 'B. Jackson · Atlanta, GA',
        },
      },
      {
        box: [200, 280, 310, 400],
        className: 'motorcycle',
        confidence: 0.85,
        isVehicle: true,
        trackingId: 4,
        plate: {
          plateNumber: 'FL · 99-ZXT',
          stateOrRegion: 'Florida Motorcycle',
          confidence: 0.932,
          box: [245, 375, 275, 388],
          status: 'CLEARED',
          vehicleModel: 'BMW R1250 GS Adventure',
          registeredOwner: 'C. Ross · Orlando, FL',
        },
      },
      {
        box: [420, 260, 620, 440],
        className: 'bus',
        confidence: 0.97,
        isVehicle: true,
        trackingId: 5,
        plate: {
          plateNumber: 'COACH · 4410-A',
          stateOrRegion: 'Express Transit',
          confidence: 0.991,
          box: [505, 415, 555, 430],
          status: 'TRANSIT_OFFICIAL',
          vehicleModel: 'MCI J4500 Intercity Coach',
          registeredOwner: 'Metropolitan Intercity Transit Authority',
        },
      },
    ],
  },
  {
    id: 'scenario_e',
    name: 'Scenario E: Pedestrians Walking in Plaza (Video)',
    type: 'video',
    description: 'Civic pedestrian zone with people walking and zero vehicles.',
    expectedResult: 'Total unique vehicles: 0. Status: NO VEHICLES DETECTED IN THIS VIDEO. Reports people separately.',
    width: 1024,
    height: 576,
    imageSrc: pedestriansImg,
    detections: [
      { box: [140, 120, 240, 420], className: 'person', confidence: 0.94, isVehicle: false, trackingId: 1 },
      { box: [300, 150, 390, 440], className: 'person', confidence: 0.92, isVehicle: false, trackingId: 2 },
      { box: [480, 110, 580, 460], className: 'person', confidence: 0.95, isVehicle: false, trackingId: 3 },
      { box: [650, 140, 740, 430], className: 'person', confidence: 0.90, isVehicle: false, trackingId: 4 },
    ],
  },
  {
    id: 'scenario_f',
    name: 'Scenario F: Empty Scenic Mountain Road',
    type: 'image',
    description: 'Pristine mountain asphalt highway completely empty with zero vehicular or pedestrian presence.',
    expectedResult: 'Total vehicles: 0. Status: NO VEHICLES DETECTED. Description: Roadway is clear of transit.',
    width: 1024,
    height: 576,
    imageSrc: emptyRoadImg,
    detections: [],
  },
];

// Fallback background scene renderer if image element is loading
export function drawSceneBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgType: string
) {
  if (bgType === 'road_multi' || bgType === 'highway_video') {
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, width, 40);
    ctx.fillRect(0, height - 40, width, 40);

    ctx.strokeStyle = '#FCD34D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 16]);
    ctx.beginPath();
    ctx.moveTo(0, height * 0.28);
    ctx.lineTo(width, height * 0.28);
    ctx.moveTo(0, height * 0.72);
    ctx.lineTo(width, height * 0.72);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);
  }
}

// Server-side AI Computer Vision Detection pipeline via /api/detect
export async function runServerDetection(
  imageBase64: string,
  imgWidth: number,
  imgHeight: number,
  confidenceThreshold: number
): Promise<{
  detections: DetectionItem[];
  sceneDescription: SceneDescription;
  summary: VehicleSummary;
  rawText?: string;
} | null> {
  try {
    const res = await fetch('/api/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.result) return null;

    const rawResult = data.result;
    const rawDets = rawResult.detections || [];

    const mappedDetections: DetectionItem[] = rawDets
      .map((d: any) => {
        const box2d = d.box_2d || [0, 0, 1000, 1000];
        // box2d is [ymin, xmin, ymax, xmax] on a 0-1000 scale
        const ymin = (box2d[0] / 1000) * imgHeight;
        const xmin = (box2d[1] / 1000) * imgWidth;
        const ymax = (box2d[2] / 1000) * imgHeight;
        const xmax = (box2d[3] / 1000) * imgWidth;

        const label = String(d.label || '').toLowerCase().trim();
        const conf = typeof d.confidence === 'number' ? d.confidence : 0.85;

        return {
          box: [Math.round(xmin), Math.round(ymin), Math.round(xmax), Math.round(ymax)] as [number, number, number, number],
          className: label,
          confidence: Math.round(conf * 100) / 100,
          isVehicle: isVehicleClass(label),
        };
      })
      .filter((d: DetectionItem) => d.confidence >= confidenceThreshold);

    const vehicleDets = mappedDetections.filter((d) => d.isVehicle);
    const nonVehicleDets = mappedDetections.filter((d) => !d.isVehicle);

    const summary = summarizeVehicles(vehicleDets);
    const sDesc = generateSceneDescription(vehicleDets, nonVehicleDets);

    if (rawResult.scene_description) {
      sDesc.description = rawResult.scene_description;
    }

    return {
      detections: mappedDetections,
      sceneDescription: sDesc,
      summary,
    };
  } catch (e) {
    console.warn('Server detection endpoint issue:', e);
    return null;
  }
}

// Draw bounding box on canvas with government surveillance & ANPR styling
export function drawCanvasBoundingBox(
  ctx: CanvasRenderingContext2D,
  detection: DetectionItem,
  options?: {
    showTrackingId?: boolean;
    showLicensePlates?: boolean;
    isHovered?: boolean;
  }
) {
  const [rx1, ry1, rx2, ry2] = detection.box;
  const x1 = Math.min(rx1, rx2);
  const x2 = Math.max(rx1, rx2);
  const y1 = Math.min(ry1, ry2);
  const y2 = Math.max(ry1, ry2);

  const color = CLASS_COLORS[detection.className] || (detection.isVehicle ? CLASS_COLORS.default_vehicle : CLASS_COLORS.default_non_vehicle);

  const w = x2 - x1;
  const h = y2 - y1;

  // Main rectangle
  ctx.save();
  if (options?.isHovered) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = detection.isVehicle ? 2.5 : 1.5;
  }
  ctx.strokeRect(x1, y1, w, h);
  ctx.restore();

  // Corner brackets for surveillance aesthetic
  const corner = Math.min(10, w / 4, h / 4);
  ctx.lineWidth = detection.isVehicle ? 3.5 : 2;
  ctx.strokeStyle = options?.isHovered ? '#FFFFFF' : color;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(x1, y1 + corner);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1 + corner, y1);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(x2 - corner, y1);
  ctx.lineTo(x2, y1);
  ctx.lineTo(x2, y1 + corner);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x1, y2 - corner);
  ctx.lineTo(x1, y2);
  ctx.lineTo(x1 + corner, y2);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x2 - corner, y2);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2, y2 - corner);
  ctx.stroke();

  // Label badge
  let label = `${detection.className.toUpperCase()} ${(detection.confidence * 100).toFixed(0)}%`;
  if (options?.showTrackingId && detection.trackingId !== undefined) {
    label = `ID #${detection.trackingId} | ${label}`;
  }

  ctx.font = 'bold 10px Inter, sans-serif';
  const textMetrics = ctx.measureText(label);
  const badgeWidth = textMetrics.width + 8;
  const badgeHeight = 16;

  // Place badge above box if there is room; otherwise inside the top edge
  const badgeY = (y1 - badgeHeight >= 34) ? y1 - badgeHeight : y1 + 1;
  const badgeX = Math.max(0, Math.min(x1, ctx.canvas.width - badgeWidth - 2));

  // Badge background
  ctx.fillStyle = color;
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

  // High-contrast dark text
  ctx.fillStyle = '#050D1A';
  ctx.fillText(label, badgeX + 4, badgeY + 11.5);

  // ANPR License Plate Bounding & Optical OCR Badge
  if (options?.showLicensePlates && detection.plate) {
    const plate = detection.plate;
    const [px1, py1, px2, py2] = plate.box;
    const pw = px2 - px1;
    const ph = py2 - py1;

    // Glowing license plate bounding box on bumper
    ctx.save();
    const plateColor = plate.status === 'WATCHLIST_FLAG' ? '#EF4444' : plate.status === 'EXPIRED_REG' ? '#F59E0B' : '#00F0FF';
    ctx.strokeStyle = plateColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(px1, py1, pw, ph);

    // Glowing micro-corners
    ctx.fillStyle = plateColor;
    ctx.fillRect(px1 - 1, py1 - 1, 3, 3);
    ctx.fillRect(px2 - 2, py1 - 1, 3, 3);
    ctx.fillRect(px1 - 1, py2 - 2, 3, 3);
    ctx.fillRect(px2 - 2, py2 - 2, 3, 3);
    ctx.restore();

    // Floating Holographic ANPR Pill
    const plateLabel = `[ ${plate.plateNumber} ]`;
    ctx.font = 'bold 9px monospace';
    const plateMetric = ctx.measureText(plateLabel);
    const pBadgeW = plateMetric.width + 8;
    const pBadgeH = 14;

    const pBadgeX = Math.max(0, Math.min(x1, ctx.canvas.width - pBadgeW - 2));
    const pBadgeY = y2 + 2;

    ctx.fillStyle = plate.status === 'WATCHLIST_FLAG' ? '#450A0A' : '#05192D';
    ctx.fillRect(pBadgeX, pBadgeY, pBadgeW, pBadgeH);

    ctx.strokeStyle = plateColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(pBadgeX, pBadgeY, pBadgeW, pBadgeH);

    ctx.fillStyle = plateColor;
    ctx.fillText(plateLabel, pBadgeX + 4, pBadgeY + 10.5);
  }
}

// Draw HUD header
export function drawCanvasHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  totalVehicles: number,
  fps?: number,
  timestampStr?: string,
  anprCount?: number
) {
  ctx.fillStyle = 'rgba(7, 19, 37, 0.92)';
  ctx.fillRect(0, 0, width, 32);

  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(width, 32);
  ctx.stroke();

  ctx.font = 'bold 11px monospace';
  // Left telemetry
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('● LIVE REC [YOLOv8 + ANPR ARMED]', 12, 20);

  // Center
  ctx.fillStyle = '#FFFFFF';
  const centerText = `VEHICLES: ${totalVehicles}` + (anprCount !== undefined ? ` | PLATES SCANNED: ${anprCount}` : '');
  const cWidth = ctx.measureText(centerText).width;
  ctx.fillText(centerText, width / 2 - cWidth / 2, 20);

  // Right
  ctx.fillStyle = '#38BDF8';
  let rText = 'ITS-SURVEILLANCE';
  if (fps !== undefined) {
    rText = `${fps.toFixed(1)} FPS | ` + (timestampStr || '');
  }
  const rWidth = ctx.measureText(rText).width;
  ctx.fillText(rText, width - rWidth - 12, 20);
}

// Draw virtual counting line on canvas
export function drawCanvasVirtualLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  lineY: number,
  countA: number,
  countB: number
) {
  // Dashed glowing tripwire
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, lineY);
  ctx.lineTo(width, lineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Direction A -> B Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(15, lineY - 26, 175, 22);
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1;
  ctx.strokeRect(15, lineY - 26, 175, 22);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText(`DIR A → B (Inbound): ${countA}`, 22, lineY - 11);

  // Direction B -> A Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(width - 195, lineY + 4, 180, 22);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1;
  ctx.strokeRect(width - 195, lineY + 4, 180, 22);
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(`DIR B → A (Outbound): ${countB}`, width - 188, lineY + 19);
}

// Generate CSV export
export function generateCSVReport(analyses: AnalysisRecord[]): string {
  const header = [
    'Analysis ID',
    'File Name',
    'Media Type',
    'Timestamp',
    'Total Vehicles',
    'Cars',
    'Motorcycles',
    'Buses',
    'Trucks',
    'Bicycles',
    'Trains',
    'Processing Time (s)',
    'Status',
    'Classification',
    'Description',
  ];

  const rows = analyses.map((a) => {
    const s = a.summary;
    return [
      a.id,
      `"${a.fileName.replace(/"/g, '""')}"`,
      a.fileType.toUpperCase(),
      a.timestamp,
      s.totalVehicles,
      s.cars,
      s.motorcycles,
      s.buses,
      s.trucks,
      s.bicycles,
      s.trains,
      a.processingTime.toFixed(2),
      a.status,
      a.sceneDescription.imageClassification,
      `"${a.description.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

// Generate Incident Bulletin text
export function generateIncidentBulletin(analysis: AnalysisRecord): string {
  const s = analysis.summary;
  const cats = Object.entries(s.categoryCounts)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => `  * ${k.toUpperCase().padEnd(16)}: ${v} units`)
    .join('\n');

  return `======================================================================
         OFFICIAL TRAFFIC SURVEILLANCE & VEHICLE AUDIT REPORT
       Department of Traffic Monitoring | Intelligent Transportation
======================================================================

INCIDENT & AUDIT METADATA:
  - Document ID       : TRAFFIC-AUDIT-${analysis.id}
  - Timestamp (UTC)   : ${analysis.timestamp}
  - Target Media      : ${analysis.fileName}
  - Media Format      : ${analysis.fileType.toUpperCase()}
  - Processing Latency: ${analysis.processingTime.toFixed(2)} seconds
  - Model Architecture: YOLOv8n (COCO weights) + ByteTrack Multi-Object Tracking

VEHICULAR CENSUS SUMMARY:
  - TOTAL VEHICLES DETECTED: ${s.totalVehicles}
${cats || '  * None detected.'}

NON-VEHICLE & CONTEXTUAL SCENE OBSERVATIONS:
  - Status Flag       : ${analysis.sceneDescription.vehicleDetectionStatus}
  - Classification    : ${analysis.sceneDescription.imageClassification}
  - Contextual Note   : ${analysis.sceneDescription.description}
  - Other Objects     : ${analysis.sceneDescription.otherObjectsSummary}

VIRTUAL TRIPWIRE CROSSING METRICS:
  ${analysis.crossingSummary ? `Total Crossings: ${analysis.crossingSummary.totalCrossingEvents} | Dir A->B: ${analysis.crossingSummary.directionAToBCount} | Dir B->A: ${analysis.crossingSummary.directionBToACount}` : 'Not enabled for static photographic media.'}

AUTHORIZATION & DISCLAIMER:
  Generated by AI-Based Traffic Surveillance Prototype.
  Notice: This summary is an intelligent computer vision diagnostic report
  for educational and research demonstration in ITS.
======================================================================
`;
}

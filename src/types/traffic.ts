export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LicensePlateData {
  plateNumber: string;
  stateOrRegion: string;
  confidence: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  status: 'CLEARED' | 'WATCHLIST_FLAG' | 'EXPIRED_REG' | 'COMMERCIAL_VALID' | 'TRANSIT_OFFICIAL';
  vehicleModel?: string;
  registeredOwner?: string;
  color?: string;
  vinSnippet?: string;
  inspectionExpiry?: string;
  unpaidViolationsCount?: number;
}

export interface DetectionItem {
  id?: number | string;
  box: [number, number, number, number]; // [x1, y1, x2, y2] in pixels
  className: string;
  confidence: number;
  isVehicle: boolean;
  trackingId?: number;
  plate?: LicensePlateData;
}

export interface VehicleSummary {
  totalVehicles: number;
  cars: number;
  motorcycles: number;
  buses: number;
  trucks: number;
  bicycles: number;
  trains: number;
  averageConfidence: number;
  categoryCounts: Record<string, number>;
  totalPlatesDetected?: number;
  watchlistAlertsCount?: number;
}

export interface SceneDescription {
  vehicleDetectionStatus: string;
  totalVehiclesDetected: number;
  otherObjectsDetected: string[];
  otherObjectsSummary: string;
  imageClassification: string;
  description: string;
  hasVehicles: boolean;
  anprSummary?: string;
}

export interface CrossingEvent {
  trackId: number;
  className: string;
  direction: 'A_to_B' | 'B_to_A';
  frame: number;
  timestampSec: number;
  plateNumber?: string;
}

export interface CrossingSummary {
  virtualLineEnabled: boolean;
  lineYRatio: number;
  totalCrossingEvents: number;
  directionAToBCount: number;
  directionBToACount: number;
  directionALabel: string;
  directionBLabel: string;
  eventsLog: CrossingEvent[];
}

export interface CameraFeed {
  id: string;
  code: string;
  name: string;
  roadType: 'Arterial' | 'Interstate' | 'Pedestrian Zone' | 'Commercial Corridor' | 'Highway Pass';
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  location: string;
  coordinates: [number, number]; // [lat, lng]
  currentVPH: number;
  levelOfService: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  imageSrc: string;
  scenarioId: string;
  activeVehicles: number;
  sensorResolution: string;
  fps: number;
  anprEnabled?: boolean;
}

export interface AnalysisRecord {
  id: number;
  fileName: string;
  fileType: 'image' | 'video';
  timestamp: string;
  totalVehicleCount: number;
  processingTime: number;
  status: string;
  description: string;
  summary: VehicleSummary;
  sceneDescription: SceneDescription;
  sampleDetections: DetectionItem[];
  annotatedDataUrl?: string;
  crossingSummary?: CrossingSummary;
  videoDuration?: number;
  framesProcessed?: number;
  processingFps?: number;
  cameraId?: string;
  locationName?: string;
  gpsCoords?: string;
  evidenceHash?: string;
  levelOfService?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  flowRateVPH?: number;
  operatorId?: string;
  detectedPlates?: LicensePlateData[];
}

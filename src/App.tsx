import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { OperationsCenterView } from './components/OperationsCenterView';
import { ImageDetectionView } from './components/ImageDetectionView';
import { VideoAnalysisView } from './components/VideoAnalysisView';
import { CameraMapView } from './components/CameraMapView';
import { TrafficStatisticsView } from './components/TrafficStatisticsView';
import { ModelTrainingStudio } from './components/ModelTrainingStudio';
import { AnalysisHistoryView } from './components/AnalysisHistoryView';
import { AboutView } from './components/AboutView';
import { AnalysisRecord } from './types/traffic';
import { PRESET_SCENARIOS, summarizeVehicles, generateSceneDescription } from './utils/cvEngine';

const STORAGE_KEY = 'dot_its_traffic_audit_archive_v2';

// Seed initial realistic government surveillance records
function getInitialAnalyses(): AnalysisRecord[] {
  const scA = PRESET_SCENARIOS[0]; // Broadway intersection
  const scB = PRESET_SCENARIOS[1]; // Dog non-vehicle
  const scC = PRESET_SCENARIOS[2]; // Curbside driver
  const scD = PRESET_SCENARIOS[3]; // Interstate highway

  const vA = scA.detections.filter((d) => d.isVehicle);
  const nvA = scA.detections.filter((d) => !d.isVehicle);
  const sumA = summarizeVehicles(vA);
  const descA = generateSceneDescription(vA, nvA);

  const vB = scB.detections.filter((d) => d.isVehicle);
  const nvB = scB.detections.filter((d) => !d.isVehicle);
  const sumB = summarizeVehicles(vB);
  const descB = generateSceneDescription(vB, nvB);

  const vC = scC.detections.filter((d) => d.isVehicle);
  const nvC = scC.detections.filter((d) => !d.isVehicle);
  const sumC = summarizeVehicles(vC);
  const descC = generateSceneDescription(vC, nvC);

  const vD = scD.detections.filter((d) => d.isVehicle);
  const nvD = scD.detections.filter((d) => !d.isVehicle);
  const sumD = summarizeVehicles(vD);
  const descD = generateSceneDescription(vD, nvD);

  return [
    {
      id: 2026101,
      fileName: 'cctv_broadway_arterial_junction_01.jpg',
      fileType: 'image',
      timestamp: '2026-09-29 08:30:15',
      totalVehicleCount: sumA.totalVehicles,
      processingTime: 0.38,
      status: 'VERIFIED',
      description: descA.description,
      summary: sumA,
      sceneDescription: descA,
      sampleDetections: scA.detections,
      cameraId: 'CCTV-NY-101',
      locationName: 'Broadway & 42nd St Arterial Junction',
      gpsCoords: '40.7558° N, 73.9864° W',
      evidenceHash: '4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      levelOfService: 'C',
      flowRateVPH: 1480,
    },
    {
      id: 2026102,
      fileName: 'cctv_central_park_lawn_perimeter.jpg',
      fileType: 'image',
      timestamp: '2026-09-29 08:45:22',
      totalVehicleCount: sumB.totalVehicles,
      processingTime: 0.29,
      status: 'VERIFIED',
      description: descB.description,
      summary: sumB,
      sceneDescription: descB,
      sampleDetections: scB.detections,
      cameraId: 'CCTV-PRK-004',
      locationName: 'Central Green Lawn Ecological Perimeter',
      gpsCoords: '40.7829° N, 73.9654° W',
      evidenceHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      levelOfService: 'A',
      flowRateVPH: 0,
    },
    {
      id: 2026103,
      fileName: 'cctv_broad_street_curbside_zone.jpg',
      fileType: 'image',
      timestamp: '2026-09-29 09:12:04',
      totalVehicleCount: sumC.totalVehicles,
      processingTime: 0.31,
      status: 'VERIFIED',
      description: descC.description,
      summary: sumC,
      sceneDescription: descC,
      sampleDetections: scC.detections,
      cameraId: 'CCTV-CRB-019',
      locationName: 'Broad Street Curbside Transit Zone',
      gpsCoords: '40.7061° N, 74.0113° W',
      evidenceHash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
      levelOfService: 'B',
      flowRateVPH: 420,
    },
    {
      id: 2026104,
      fileName: 'cctv_i95_expressway_corridor.mp4',
      fileType: 'video',
      timestamp: '2026-09-29 09:30:00',
      totalVehicleCount: sumD.totalVehicles,
      processingTime: 3.85,
      status: 'VERIFIED',
      description: descD.description,
      summary: sumD,
      sceneDescription: descD,
      sampleDetections: scD.detections,
      cameraId: 'CCTV-I95-044',
      locationName: 'Interstate 95 Corridor Milepost 44.2',
      gpsCoords: '40.8122° N, 73.9298° W',
      evidenceHash: '7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a',
      levelOfService: 'D',
      flowRateVPH: 2150,
      crossingSummary: {
        virtualLineEnabled: true,
        lineYRatio: 0.52,
        totalCrossingEvents: 5,
        directionAToBCount: 3,
        directionBToACount: 2,
        directionALabel: 'Direction A → B (Southbound)',
        directionBLabel: 'Direction B → A (Northbound)',
        eventsLog: [],
      },
    },
  ];
}

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCameraScenarioId, setSelectedCameraScenarioId] = useState<string>('scenario_a');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  // Persistent storage in localStorage
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved DOT analyses:', e);
    }
    return getInitialAnalyses();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    } catch (e) {
      console.warn('Failed to save DOT analyses to storage:', e);
    }
  }, [analyses]);

  const handleSaveAnalysis = (record: AnalysisRecord) => {
    setAnalyses((prev) => [record, ...prev.filter((a) => a.id !== record.id)]);
  };

  const handleDeleteRecord = (id: number) => {
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectCameraFromGrid = (scenarioId: string) => {
    setSelectedCameraScenarioId(scenarioId);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#040A14] text-slate-100 flex flex-col font-sans selection:bg-blue-700 selection:text-white fixed inset-0">
      {/* Official Government Header */}
      <Header onNewAnalysis={() => setCurrentTab('image')} />

      {/* Main App Layout: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          analysisCount={analyses.length}
        />

        <main className="flex-1 h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#050D1A]">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <OperationsCenterView
                analyses={analyses}
                onNavigate={setCurrentTab}
                onSelectCameraForAnalysis={handleSelectCameraFromGrid}
              />
            )}

            {currentTab === 'image' && (
              <ImageDetectionView
                onSaveAnalysis={handleSaveAnalysis}
                initialScenarioId={selectedCameraScenarioId}
              />
            )}

            {currentTab === 'video' && (
              <VideoAnalysisView
                onSaveAnalysis={handleSaveAnalysis}
                initialScenarioId={selectedCameraScenarioId === 'scenario_e' ? 'scenario_e' : 'scenario_d'}
              />
            )}

            {currentTab === 'training' && (
              <ModelTrainingStudio />
            )}

            {currentTab === 'map' && (
              <CameraMapView
                onNavigate={setCurrentTab}
                onSelectCamera={handleSelectCameraFromGrid}
              />
            )}

            {currentTab === 'stats' && <TrafficStatisticsView analyses={analyses} />}

            {currentTab === 'history' && (
              <AnalysisHistoryView
                analyses={analyses}
                onDeleteRecord={handleDeleteRecord}
                selectedRecordId={selectedRecordId}
              />
            )}

            {currentTab === 'about' && <AboutView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

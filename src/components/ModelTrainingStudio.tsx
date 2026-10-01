import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  TrendingUp,
  BarChart3,
  Shield,
  Layers,
  Activity,
  Terminal,
  Save,
  Download,
  Check,
} from 'lucide-react';
import { CLASS_COLORS } from '../utils/cvEngine';

interface TrainingStudioProps {
  onDeployModelWeights?: (weightsInfo: {
    epochs: number;
    mAP50: number;
    confidenceThreshold: number;
    iouThreshold: number;
  }) => void;
}

export const ModelTrainingStudio: React.FC<TrainingStudioProps> = ({ onDeployModelWeights }) => {
  const [activeTab, setActiveTab] = useState<'training' | 'metrics' | 'calibration' | 'weights'>('training');

  // Hyperparameters
  const [baseModel, setBaseModel] = useState<'yolov8n' | 'yolov8s'>('yolov8n');
  const [epochs, setEpochs] = useState<number>(50);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [optimizer, setOptimizer] = useState<'AdamW' | 'SGD'>('AdamW');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.35);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(100);
  const [currentEpoch, setCurrentEpoch] = useState<number>(50);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([
    '[INIT] Loaded pre-trained weights: yolov8n-coco.pt (3.2M params)',
    '[CONFIG] Optimizer: AdamW, lr0: 0.001, batch: 16, imgsz: 640',
    '[EPOCH 10/50] box_loss: 1.12 | cls_loss: 1.34 | mAP50: 0.724 | precision: 0.781',
    '[EPOCH 25/50] box_loss: 0.64 | cls_loss: 0.58 | mAP50: 0.886 | precision: 0.892',
    '[EPOCH 40/50] box_loss: 0.38 | cls_loss: 0.28 | mAP50: 0.932 | precision: 0.935',
    '[EPOCH 50/50] box_loss: 0.26 | cls_loss: 0.18 | mAP50: 0.948 | precision: 0.952',
    '[COMPLETE] Model weights optimized. Verification: 15/15 tests passing.',
  ]);

  const [deployed, setDeployed] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Simulated loss curve data
  const [lossHistory, setLossHistory] = useState<{ epoch: number; loss: number; map: number }[]>([
    { epoch: 1, loss: 2.85, map: 0.35 },
    { epoch: 5, loss: 2.10, map: 0.52 },
    { epoch: 10, loss: 1.62, map: 0.68 },
    { epoch: 15, loss: 1.25, map: 0.79 },
    { epoch: 20, loss: 0.98, map: 0.85 },
    { epoch: 25, loss: 0.76, map: 0.89 },
    { epoch: 30, loss: 0.59, map: 0.91 },
    { epoch: 35, loss: 0.46, map: 0.93 },
    { epoch: 40, loss: 0.36, map: 0.94 },
    { epoch: 45, loss: 0.29, map: 0.945 },
    { epoch: 50, loss: 0.24, map: 0.948 },
  ]);

  const startTrainingRun = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setCurrentEpoch(0);
    setDeployed(false);
    setTrainingLogs([
      `[INIT] Commencing retraining run on ${baseModel.toUpperCase()} backbone...`,
      `[SETUP] Dataset: Municipal Arterial Census & COCO Traffic Subset (12,400 annotated frames)`,
      `[HYPERPARAMS] Epochs: ${epochs}, Batch: ${batchSize}, LR: ${learningRate}, Optimizer: ${optimizer}`,
    ]);

    const newHistory: { epoch: number; loss: number; map: number }[] = [];
    const stepInterval = 250; // ms per update
    let epochCounter = 0;

    const interval = setInterval(() => {
      epochCounter += Math.max(1, Math.floor(epochs / 20));
      if (epochCounter >= epochs) {
        epochCounter = epochs;
        clearInterval(interval);
        setIsTraining(false);
        setTrainingProgress(100);
        setCurrentEpoch(epochs);
        setTrainingLogs((prev) => [
          ...prev,
          `[EPOCH ${epochs}/${epochs}] Training completed successfully!`,
          `[VAL] Validation mAP@0.5: 0.954 | Precision: 0.958 | Recall: 0.931`,
          `[STATUS] Ready for deployment to active surveillance feeds.`,
        ]);
      } else {
        const progress = Math.round((epochCounter / epochs) * 100);
        const simLoss = Math.max(0.18, Number((3.0 * Math.exp(-0.06 * epochCounter) + 0.18).toFixed(3)));
        const simMap = Math.min(0.954, Number((0.35 + 0.60 * (1 - Math.exp(-0.08 * epochCounter))).toFixed(3)));
        const simPrec = Math.min(0.958, Number((0.40 + 0.55 * (1 - Math.exp(-0.08 * epochCounter))).toFixed(3)));

        setTrainingProgress(progress);
        setCurrentEpoch(epochCounter);
        newHistory.push({ epoch: epochCounter, loss: simLoss, map: simMap });
        setLossHistory([...newHistory]);

        setTrainingLogs((prev) => [
          ...prev,
          `[EPOCH ${epochCounter}/${epochs}] box_loss: ${(simLoss * 0.5).toFixed(3)} | cls_loss: ${(simLoss * 0.4).toFixed(3)} | mAP50: ${simMap.toFixed(3)} | prec: ${simPrec.toFixed(3)}`,
        ]);
      }
    }, stepInterval);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [trainingLogs]);

  const handleDeploy = () => {
    setDeployed(true);
    if (onDeployModelWeights) {
      onDeployModelWeights({
        epochs: currentEpoch,
        mAP50: 0.948,
        confidenceThreshold,
        iouThreshold,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Department Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#163359]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-widest">
              AI MODEL TRAINING & NEURAL WEIGHTS CALIBRATION
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-0.5 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>YOLOv8 Machine Learning Training & Optimization Studio</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            <span>Transfer Learning on Municipal Traffic Datasets</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>mAP@50 Optimization</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Hyperparameter Tuning</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#07172E] border border-[#1A3F70] rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('training')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${
              activeTab === 'training' ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Training Loop
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${
              activeTab === 'metrics' ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Confusion & mAP
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-colors ${
              activeTab === 'calibration' ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hyperparameters
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>MODEL ACCURACY (mAP@50)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">94.8%</div>
          <div className="text-[11px] text-slate-400 font-sans mt-0.5">COCO Traffic Benchmark</div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>PRECISION / RECALL</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">95.2% / 92.4%</div>
          <div className="text-[11px] text-sky-300 font-sans mt-0.5">Balanced F1-Score: 0.938</div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>INFERENCE THROUGHPUT</span>
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">31.4 FPS</div>
          <div className="text-[11px] text-slate-400 font-sans mt-0.5">CPU Latency: ~32ms</div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>DEPLOYMENT STATUS</span>
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ACTIVE LIVE</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-sans mt-0.5">Weights Synchronized</div>
        </div>
      </div>

      {/* Tab 1: Training Loop Execution */}
      {activeTab === 'training' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-4">
            <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#143157]">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Training Hyperparameters</span>
              </h3>

              <div className="space-y-1.5">
                <span className="text-slate-400">Backbone Architecture:</span>
                <select
                  value={baseModel}
                  onChange={(e) => setBaseModel(e.target.value as any)}
                  disabled={isTraining}
                  className="w-full bg-[#050E1C] border border-[#143157] rounded px-3 py-1.5 text-white focus:outline-none"
                >
                  <option value="yolov8n">YOLOv8 Nano (3.2M params - Ultra Fast)</option>
                  <option value="yolov8s">YOLOv8 Small (11.2M params - High Accuracy)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Epochs:</span>
                  <span className="text-sky-300 font-bold">{epochs}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  disabled={isTraining}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400">Batch Size:</span>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  disabled={isTraining}
                  className="w-full bg-[#050E1C] border border-[#143157] rounded px-3 py-1.5 text-white focus:outline-none"
                >
                  <option value={8}>8 Samples / Batch</option>
                  <option value={16}>16 Samples / Batch (Recommended)</option>
                  <option value={32}>32 Samples / Batch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400">Optimizer:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOptimizer('AdamW')}
                    disabled={isTraining}
                    className={`py-1.5 rounded font-bold uppercase ${
                      optimizer === 'AdamW'
                        ? 'bg-blue-700 text-white'
                        : 'bg-[#050E1C] text-slate-400 border border-[#143157]'
                    }`}
                  >
                    AdamW
                  </button>
                  <button
                    onClick={() => setOptimizer('SGD')}
                    disabled={isTraining}
                    className={`py-1.5 rounded font-bold uppercase ${
                      optimizer === 'SGD'
                        ? 'bg-blue-700 text-white'
                        : 'bg-[#050E1C] text-slate-400 border border-[#143157]'
                    }`}
                  >
                    SGD (Momentum)
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={startTrainingRun}
                  disabled={isTraining}
                  className="w-full py-2.5 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-blue-500 shadow-md"
                >
                  {isTraining ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Training in Progress ({trainingProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Initiate Neural Training Run</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Training Visualization & Real-time Logs (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Real-time Loss Curve Plot */}
            <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[#143157] text-xs">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Loss Convergence & mAP@50 Curve</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  EPOCH {currentEpoch} / {epochs} ({trainingProgress}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded bg-[#050E1C] overflow-hidden border border-[#143157]">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>

              {/* SVG Curve Graph */}
              <div className="relative h-44 w-full bg-[#050E1C] rounded border border-[#143157] p-2 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 150">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#163761" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#163761" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#163761" strokeDasharray="3 3" />

                  {/* Loss Line (Red/Orange) */}
                  <path
                    d={`M 10 ${140 - (2.85 / 3.0) * 120} Q 150 110, 300 130 T 490 135`}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                  />

                  {/* mAP Line (Green) */}
                  <path
                    d={`M 10 110 Q 150 40, 300 25 T 490 20`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                  />
                </svg>

                {/* Legend */}
                <div className="absolute top-2 right-3 flex items-center gap-4 text-[10px] bg-black/70 px-2 py-1 rounded border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-rose-500"></span>
                    <span className="text-slate-300">Total Loss</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-emerald-400"></span>
                    <span className="text-emerald-300 font-bold">mAP@50</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Terminal Output Console */}
            <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-2 font-mono">
              <div className="flex items-center justify-between pb-1 border-b border-[#143157] text-xs">
                <span className="text-slate-300 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>PyTorch / Ultralytics Training Output Stream</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">DEVICE: CPU (AVX2)</span>
              </div>

              <div
                ref={logContainerRef}
                className="h-44 bg-[#030811] rounded p-3 text-[11px] text-slate-300 space-y-1 overflow-y-auto border border-[#112745]"
              >
                {trainingLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('[COMPLETE]')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('[EPOCH')
                        ? 'text-sky-300'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>

              {/* Deploy weights button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Model Status:{' '}
                  <strong className={deployed ? 'text-emerald-400' : 'text-amber-400'}>
                    {deployed ? 'Active in Operations Center' : 'New Weights Ready'}
                  </strong>
                </span>

                <button
                  onClick={handleDeploy}
                  disabled={deployed}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    deployed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {deployed ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{deployed ? 'Weights Active' : 'Deploy Weights to System'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Confusion Matrix & Detailed mAP Breakdown */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Table */}
            <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#143157]">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>COCO Normalized Confusion Matrix</span>
              </h3>
              <p className="text-slate-400 font-sans text-xs">
                Evaluated on 3,500 validation frames. Rows denote true class; columns denote model prediction.
              </p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] border-b border-[#143157]">
                      <th className="py-2 text-left">True \ Pred</th>
                      <th className="py-2">Car</th>
                      <th className="py-2">Bus</th>
                      <th className="py-2">Motorcycle</th>
                      <th className="py-2">Truck</th>
                      <th className="py-2">Non-Vehicle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102B4E]">
                    <tr>
                      <td className="py-2 text-left font-bold text-slate-300">Car</td>
                      <td className="py-2 bg-emerald-950/80 text-emerald-300 font-bold">0.96</td>
                      <td className="py-2 text-slate-500">0.01</td>
                      <td className="py-2 text-slate-500">0.01</td>
                      <td className="py-2 text-slate-500">0.01</td>
                      <td className="py-2 text-slate-500">0.01</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-left font-bold text-slate-300">Bus</td>
                      <td className="py-2 text-slate-500">0.01</td>
                      <td className="py-2 bg-emerald-950/80 text-emerald-300 font-bold">0.97</td>
                      <td className="py-2 text-slate-500">0.00</td>
                      <td className="py-2 text-slate-500">0.02</td>
                      <td className="py-2 text-slate-500">0.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-left font-bold text-slate-300">Motorcycle</td>
                      <td className="py-2 text-slate-500">0.02</td>
                      <td className="py-2 text-slate-500">0.00</td>
                      <td className="py-2 bg-emerald-950/80 text-emerald-300 font-bold">0.93</td>
                      <td className="py-2 text-slate-500">0.00</td>
                      <td className="py-2 text-slate-500">0.05</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-left font-bold text-slate-300">Truck</td>
                      <td className="py-2 text-slate-500">0.03</td>
                      <td className="py-2 text-slate-500">0.02</td>
                      <td className="py-2 text-slate-500">0.00</td>
                      <td className="py-2 bg-emerald-950/80 text-emerald-300 font-bold">0.94</td>
                      <td className="py-2 text-slate-500">0.01</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-left font-bold text-slate-300">Non-Vehicle</td>
                      <td className="py-2 text-slate-500">0.01</td>
                      <td className="py-2 text-slate-500">0.00</td>
                      <td className="py-2 text-slate-500">0.01</td>
                      <td className="py-2 text-slate-500">0.00</td>
                      <td className="py-2 bg-emerald-950/80 text-emerald-300 font-bold">0.98</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Per-Class Accuracy Metrics */}
            <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#143157]">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Class-Specific mAP@50 Breakdown</span>
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Car', mAP: 96.4, color: '#38BDF8' },
                  { name: 'Bus', mAP: 97.1, color: '#A855F7' },
                  { name: 'Motorcycle', mAP: 92.8, color: '#F59E0B' },
                  { name: 'Truck', mAP: 94.5, color: '#22C55E' },
                  { name: 'Bicycle', mAP: 89.2, color: '#EAB308' },
                  { name: 'Pedestrian / Non-Vehicle', mAP: 98.2, color: '#10B981' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-300 capitalize">{item.name}</span>
                      <span className="text-white font-bold">{item.mAP}%</span>
                    </div>
                    <div className="w-full h-2 rounded bg-[#050E1C] overflow-hidden border border-[#143157]">
                      <div
                        className="h-full rounded"
                        style={{ width: `${item.mAP}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Calibration & NMS Tuning */}
      {activeTab === 'calibration' && (
        <div className="p-5 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-4 font-mono text-xs max-w-2xl mx-auto">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#143157]">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Detection Confidence & Non-Maximum Suppression (NMS)</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Confidence Threshold:</span>
                <span className="text-sky-300 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 font-sans">
                Controls the minimum confidence score required before a bounding box is emitted. Higher values eliminate false positives; lower values capture distant small vehicles.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#143157]">
              <div className="flex justify-between">
                <span className="text-slate-300">IoU Overlap Suppression Threshold (NMS):</span>
                <span className="text-sky-300 font-bold">{(iouThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 font-sans">
                Suppresses duplicate overlapping bounding boxes for the same vehicle based on Intersection-over-Union.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={handleDeploy}
                className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-blue-500 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Apply Hyperparameters to Live System</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

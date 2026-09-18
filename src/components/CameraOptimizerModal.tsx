import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RotateCw, 
  Sparkles, 
  Check, 
  X, 
  Sliders, 
  RefreshCw, 
  Zap, 
  Upload, 
  AlertCircle,
  Eye,
  Maximize2,
  Gauge,
  Tag,
  SunMedium,
  CheckCircle2,
  SwitchCamera
} from 'lucide-react';
import { 
  optimizeImage, 
  captureVideoFrame, 
  AIPartAnalysis, 
  OptimizedImageResult, 
  formatBytes, 
  AspectRatioOption, 
  QualityPreset 
} from '../utils/imageOptimizer';

interface CameraOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (optimizedDataUrl: string, aiDetails?: Partial<AIPartAnalysis>) => void;
  onApplyAndAutoCategorize?: (optimizedDataUrl: string, aiDetails?: Partial<AIPartAnalysis>) => void;
  currentDraftTitle?: string;
  initialImage?: string;
}

export const CameraOptimizerModal: React.FC<CameraOptimizerModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onApplyAndAutoCategorize,
  currentDraftTitle = '',
  initialImage
}) => {
  // Mode: 'camera' | 'workbench'
  const [mode, setMode] = useState<'camera' | 'workbench'>('camera');
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shutterEffect, setShutterEffect] = useState(false);

  // Workbench state
  const [rawCapturedImage, setRawCapturedImage] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIPartAnalysis | null>(null);
  const [aiSource, setAiSource] = useState<string>('');
  
  // Tuning state
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('auto');
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('balanced');
  const [rotation, setRotation] = useState<number>(0);
  const [autoEnhance, setAutoEnhance] = useState<boolean>(true);
  const [viewTab, setViewTab] = useState<'optimized' | 'original' | 'split'>('optimized');
  
  // Optimized result state
  const [optimizedResult, setOptimizedResult] = useState<OptimizedImageResult | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setIsTorchOn(false);
    setHasTorchSupport(false);
  }, []);

  // Start camera stream
  const startCameraStream = useCallback(async (facing: 'environment' | 'user') => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or device.');
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }

      // Check for torch/flashlight capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
        if (capabilities && 'torch' in capabilities) {
          setHasTorchSupport(true);
        }
      }
    } catch (err: any) {
      console.warn('Camera initiation issue:', err);
      let msg = 'Unable to access camera. Please grant camera permission in your browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setCameraError(msg);
    }
  }, [stopCameraStream]);

  // Lifecycle for modal opening/closing
  useEffect(() => {
    if (isOpen) {
      if (initialImage) {
        // If an initial image is provided, start directly in workbench
        setRawCapturedImage(initialImage);
        setMode('workbench');
        triggerAIAnalysis(initialImage);
      } else {
        setMode('camera');
        startCameraStream(cameraFacing);
      }
    } else {
      stopCameraStream();
      setRawCapturedImage(null);
      setAiAnalysis(null);
      setOptimizedResult(null);
      setCountdown(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, initialImage]);

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const newStatus = !isTorchOn;
        await (track.applyConstraints as any)({
          advanced: [{ torch: newStatus }]
        });
        setIsTorchOn(newStatus);
      } catch (err) {
        console.warn('Could not toggle torch:', err);
      }
    }
  };

  // Flip Camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCameraStream(nextFacing);
  };

  // Capture Photo
  const takeSnapshot = () => {
    if (!videoRef.current || !isCameraReady) return;

    // Trigger visual shutter flash
    setShutterEffect(true);
    setTimeout(() => setShutterEffect(false), 200);

    const capturedDataUrl = captureVideoFrame(videoRef.current);
    stopCameraStream();
    setRawCapturedImage(capturedDataUrl);
    setMode('workbench');
    triggerAIAnalysis(capturedDataUrl);
  };

  // Trigger snapshot with optional 3s timer
  const handleSnapClick = (withDelay: boolean = false) => {
    if (withDelay) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            takeSnapshot();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  // Handle manual file selection fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      stopCameraStream();
      setRawCapturedImage(dataUrl);
      setMode('workbench');
      triggerAIAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Server-side AI Analysis & Auto-Crop Detection
  const triggerAIAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/ai/optimize-part-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          partHint: currentDraftTitle
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.analysis) {
          setAiAnalysis(json.analysis);
          setAiSource(json.source || 'gemini-3.8-flash');
          if (json.analysis.recommendedAspectRatio) {
            setAspectRatio('auto');
          }
        }
      }
    } catch (err) {
      console.warn('AI analysis call failed, using heuristic crop:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Re-run crop and compression whenever tuning options change
  const applyCurrentOptimizations = useCallback(async () => {
    if (!rawCapturedImage) return;

    setIsProcessingCrop(true);
    try {
      const cropTarget = aspectRatio === 'original' ? undefined : (aiAnalysis?.cropBox || {
        ymin: 100,
        xmin: 100,
        ymax: 900,
        xmax: 900
      });

      const result = await optimizeImage(rawCapturedImage, {
        cropBox: aspectRatio === 'original' ? undefined : cropTarget,
        aspectRatio,
        qualityPreset,
        rotation,
        brightness: autoEnhance ? 1.05 : 1.0,
        contrast: autoEnhance ? 1.10 : 1.0
      });

      setOptimizedResult(result);
    } catch (err) {
      console.error('Failed to run optimization canvas:', err);
    } finally {
      setIsProcessingCrop(false);
    }
  }, [rawCapturedImage, aiAnalysis, aspectRatio, qualityPreset, rotation, autoEnhance]);

  useEffect(() => {
    if (rawCapturedImage && mode === 'workbench') {
      applyCurrentOptimizations();
    }
  }, [rawCapturedImage, mode, applyCurrentOptimizations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="camera-optimizer-modal" 
        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md">
              <Camera className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">AI Part Camera & Optimizer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Capture auto parts, auto-crop cluttered backgrounds & compress for instant mobile loading
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'workbench' && (
              <button
                type="button"
                onClick={() => {
                  setMode('camera');
                  setRawCapturedImage(null);
                  setAiAnalysis(null);
                  startCameraStream(cameraFacing);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {mode === 'camera' ? (
            /* CAMERA VIEWFINDER VIEW */
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-full max-w-2xl aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Shutter Visual Flash */}
                {shutterEffect && (
                  <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
                )}

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <div className="text-7xl font-extrabold text-amber-400 animate-ping">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Camera HUD Reticle & Guidelines */}
                {isCameraReady && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    {/* Top HUD Badges */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/60 text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE 1080p
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-black/60 text-[11px] font-medium text-slate-300 border border-slate-700/60 backdrop-blur-xs">
                        Auto-Framing Active
                      </span>
                    </div>

                    {/* Framing Boundary Box (Auto-part Target) */}
                    <div className="relative flex-1 m-4 border-2 border-dashed border-amber-400/60 rounded-2xl flex items-center justify-center">
                      {/* Corner Brackets */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-amber-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-amber-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-amber-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-amber-400 rounded-br-lg" />

                      {/* Center Crosshair */}
                      <div className="w-8 h-8 flex items-center justify-center opacity-40">
                        <div className="w-full h-0.5 bg-amber-400" />
                        <div className="h-full w-0.5 bg-amber-400 absolute" />
                      </div>

                      <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 text-[11px] font-medium text-amber-300 border border-amber-500/30">
                        Align car or truck part inside reticle
                      </div>
                    </div>

                    {/* Bottom HUD info */}
                    <div className="flex items-center justify-center">
                      <span className="text-[11px] text-slate-400 bg-black/60 px-3 py-1 rounded-full">
                        AI will automatically detect edges & crop workshop clutter
                      </span>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {!isCameraReady && !cameraError && (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <p className="text-sm text-slate-300 font-medium">Connecting to camera sensor...</p>
                    <p className="text-xs text-slate-500">Please grant camera permissions when prompted</p>
                  </div>
                )}

                {/* Camera Permission / Error Fallback */}
                {cameraError && (
                  <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                    <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                    <p className="text-xs text-slate-300">{cameraError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => startCameraStream(cameraFacing)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File Instead
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="w-full max-w-2xl mt-4 flex items-center justify-between px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
                {/* Torch / Flashlight Toggle */}
                <div className="flex items-center gap-2">
                  {hasTorchSupport && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isTorchOn 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                    >
                      <Zap className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Flip Camera (Front / Rear)"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Shutter Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!isCameraReady}
                    onClick={() => handleSnapClick(false)}
                    className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
                    title="Capture Photo"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-slate-950 group-hover:scale-90 transition-transform" />
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!isCameraReady || countdown !== null}
                    onClick={() => handleSnapClick(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                    title="3-Second Timer Shutter"
                  >
                    <span>3s Timer</span>
                  </button>
                </div>

                {/* File Upload Alternative */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Select existing photo from device"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* WORKBENCH & OPTIMIZATION VIEW */
            <div className="space-y-4">
              {/* AI Analysis Status Banner */}
              {isAnalyzingAI ? (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-800 to-amber-950/40 border border-amber-500/30 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-amber-300 block">
                      Gemini 3.8 Flash Vision Scanning...
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Detecting automotive component, framing tight crop boundaries, and generating tags.
                    </span>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-white">{aiAnalysis.partName}</span>
                        <span className="px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          {aiAnalysis.category}
                        </span>
                        {aiAnalysis.confidence && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {Math.round(aiAnalysis.confidence * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {aiAnalysis.qualityAssessment}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Source: {aiSource}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Compression & Network Speed Metrics Card */}
              {optimizedResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      Original Photo
                    </span>
                    <span className="text-sm font-bold text-slate-300 font-mono">
                      {formatBytes(optimizedResult.originalSizeBytes)}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                    <span className="text-[10px] text-emerald-400 block uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      Optimized Size
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-emerald-300 font-mono">
                        {formatBytes(optimizedResult.optimizedSizeBytes)}
                      </span>
                      <span className="text-[11px] font-extrabold text-emerald-400">
                        (-{optimizedResult.reductionPercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      Output Format
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-mono uppercase">
                      {optimizedResult.format} ({optimizedResult.width}x{optimizedResult.height})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      SA 4G Load Time
                    </span>
                    <span className="text-sm font-bold text-sky-400 font-mono">
                      {optimizedResult.estimatedLoadTimes.sa4g}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Photo Preview & View Switcher */}
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[340px]">
                {/* View Tabs */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewTab('optimized')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      viewTab === 'optimized'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Optimized
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('original')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      viewTab === 'original'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Uncropped
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('split')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      viewTab === 'split'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>

                {/* Processing Overlay */}
                {isProcessingCrop && (
                  <div className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                    <span className="text-xs text-amber-300 font-bold">Rendering crop & WebP encoding...</span>
                  </div>
                )}

                {/* Image Views */}
                {viewTab === 'optimized' && optimizedResult && (
                  <div className="w-full flex items-center justify-center p-4">
                    <img
                      src={optimizedResult.dataUrl}
                      alt="AI Optimized Auto Part"
                      className="max-h-[320px] max-w-full rounded-xl object-contain shadow-md border border-slate-800"
                    />
                  </div>
                )}

                {viewTab === 'original' && rawCapturedImage && (
                  <div className="w-full flex items-center justify-center p-4">
                    <img
                      src={rawCapturedImage}
                      alt="Raw Captured Auto Part"
                      className="max-h-[320px] max-w-full rounded-xl object-contain opacity-90"
                    />
                  </div>
                )}

                {viewTab === 'split' && rawCapturedImage && optimizedResult && (
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-400 mb-1.5">Original Raw Photo</span>
                      <img
                        src={rawCapturedImage}
                        alt="Original"
                        className="max-h-[220px] w-full object-contain rounded-lg border border-slate-800"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-emerald-400 mb-1.5">AI Cropped & WebP Compressed</span>
                      <img
                        src={optimizedResult.dataUrl}
                        alt="Optimized"
                        className="max-h-[220px] w-full object-contain rounded-lg border border-emerald-500/40 shadow-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tuning & Adjustment Controls Toolbar */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {/* Aspect Ratio Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Aspect Ratio:
                    </span>
                    <div className="flex items-center gap-1">
                      {(['auto', '4:3', '1:1', '16:9', 'original'] as AspectRatioOption[]).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setAspectRatio(opt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            aspectRatio === opt
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          {opt === 'auto' ? 'AI Focus' : opt === 'original' ? 'Full' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Presets */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Compression:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQualityPreset('fast')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          qualityPreset === 'fast'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="Smallest file size (~70KB), fastest load on 3G"
                      >
                        Fast (3G)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQualityPreset('balanced')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          qualityPreset === 'balanced'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="Recommended balance of crisp detail and light payload (~130KB)"
                      >
                        Balanced
                      </button>
                      <button
                        type="button"
                        onClick={() => setQualityPreset('high')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          qualityPreset === 'high'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="Highest resolution (~240KB)"
                      >
                        HD Detail
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Quick Action Enhancements */}
                <div className="flex items-center justify-between border-t border-slate-700/60 pt-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAutoEnhance(!autoEnhance)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                        autoEnhance
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <SunMedium className="w-3 h-3" />
                      <span>Workshop Contrast Boost</span>
                    </button>
                  </div>

                  {aiAnalysis?.tags && aiAnalysis.tags.length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      {aiAnalysis.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800 whitespace-nowrap">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {mode === 'workbench' && optimizedResult ? (
              <span>
                Ready to save: <strong className="text-white">{formatBytes(optimizedResult.optimizedSizeBytes)}</strong> ({optimizedResult.width}×{optimizedResult.height})
              </span>
            ) : (
              <span>Tip: Place the automotive component in good light for best AI edge detection</span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            {mode === 'workbench' && (
              <>
                <button
                  type="button"
                  disabled={!optimizedResult || isProcessingCrop}
                  onClick={() => {
                    if (!optimizedResult) return;
                    onApply(optimizedResult.dataUrl, aiAnalysis || undefined);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apply Photo</span>
                </button>

                {onApplyAndAutoCategorize && (
                  <button
                    type="button"
                    disabled={!optimizedResult || isProcessingCrop}
                    onClick={() => {
                      if (!optimizedResult) return;
                      onApplyAndAutoCategorize(optimizedResult.dataUrl, aiAnalysis || undefined);
                      onClose();
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    title="Apply photo and instantly run Smart Auto-Categorization"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply & Auto-Categorize</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

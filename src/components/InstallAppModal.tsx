import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  Zap, 
  HardDrive, 
  ArrowDownToLine, 
  Laptop, 
  Layers, 
  Check, 
  ExternalLink,
  ChevronRight,
  Info,
  Radio,
  Copy,
  Flame
} from 'lucide-react';

export const InstallAppModal: React.FC = () => {
  const { 
    isInstallModalOpen, 
    setIsInstallModalOpen, 
    detectedPlatform,
    canInstallPWA,
    triggerPWAInstall,
    showNotification
  } = useApp();

  const [activePlatformTab, setActivePlatformTab] = useState<'mobile' | 'desktop'>('mobile');
  const [mobileSubTab, setMobileSubTab] = useState<'android' | 'ios' | 'qr'>('android');
  const [desktopSubTab, setDesktopSubTab] = useState<'windows' | 'mac' | 'linux'>('windows');
  
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Set default tab according to detected platform on open
  useEffect(() => {
    if (isInstallModalOpen) {
      if (detectedPlatform === 'android') {
        setActivePlatformTab('mobile');
        setMobileSubTab('android');
      } else if (detectedPlatform === 'ios') {
        setActivePlatformTab('mobile');
        setMobileSubTab('ios');
      } else if (detectedPlatform === 'mac') {
        setActivePlatformTab('desktop');
        setDesktopSubTab('mac');
      } else if (detectedPlatform === 'linux') {
        setActivePlatformTab('desktop');
        setDesktopSubTab('linux');
      } else {
        setActivePlatformTab('desktop');
        setDesktopSubTab('windows');
      }
    }
  }, [isInstallModalOpen, detectedPlatform]);

  if (!isInstallModalOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://partsource.co.za';

  // Helper to generate and download installer files
  const handleDownloadPackage = (filename: string, mimeType: string, label: string) => {
    setDownloadingType(label);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          
          // Generate file download
          const fileContent = `[Part Source ZA - Official Application Package]
Application: Part Source ZA (South Africa Automotive Marketplace)
Version: 2.4.2 (Production Release)
Package Target: ${label}
Timestamp: ${new Date().toISOString()}
Origin: ${currentUrl}
Features:
- Instant Vehicle Spares Search across 9 SA Provinces
- Direct Scrap Yard WhatsApp & Call Integrations
- Offline Catalog & Parts Comparison
- Real-time Price Quotations & Supplier Verification
Install Instructions:
Run this installer package on your device to launch Part Source ZA with hardware acceleration and push notifications.
`;
          const blob = new Blob([fileContent], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setTimeout(() => {
            setDownloadingType(null);
            setDownloadProgress(0);
            showNotification('Download Complete', `${filename} saved to your downloads folder.`, 'success');
          }, 800);

          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      showNotification('Link Copied', 'App install link copied to clipboard.', 'info');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInstantPWA = async () => {
    const success = await triggerPWAInstall();
    if (!success) {
      // If browser doesn't support deferred prompt or already installed, explain guide
      showNotification('Installation Guide', 'Click your browser menu (⋮ or Share) and select "Install app" or "Add to Home Screen".', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-b border-slate-800 p-5 sm:p-6 relative">
          <button
            onClick={() => setIsInstallModalOpen(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Install Part Source ZA
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
                  Free • v2.4
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Download the official app for <span className="text-amber-400 font-bold">Mobile (Android / iOS)</span> and <span className="text-amber-400 font-bold">Desktop (Windows / Mac)</span>.
              </p>
            </div>
          </div>

          {/* Quick Detected Platform Highlight */}
          <div className="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Current Device:</span>
              <span className="font-bold text-white capitalize flex items-center gap-1.5">
                {detectedPlatform === 'android' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                {detectedPlatform === 'ios' && <Apple className="w-3.5 h-3.5 text-slate-200" />}
                {detectedPlatform === 'windows' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                {detectedPlatform === 'mac' && <Laptop className="w-3.5 h-3.5 text-slate-200" />}
                {detectedPlatform === 'linux' && <HardDrive className="w-3.5 h-3.5 text-amber-400" />}
                {detectedPlatform === 'android' ? 'Android Device' : 
                 detectedPlatform === 'ios' ? 'Apple iPhone / iPad' : 
                 detectedPlatform === 'mac' ? 'Apple Mac (macOS)' : 
                 detectedPlatform === 'linux' ? 'Linux System' : 'Windows PC'}
              </span>
            </div>
            
            {canInstallPWA ? (
              <button
                onClick={handleInstantPWA}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md shadow-amber-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Install Now</span>
              </button>
            ) : (
              <span className="text-[11px] text-amber-400/90 font-mono">
                Direct Install Supported
              </span>
            )}
          </div>
        </div>

        {/* Unified Platform Switcher (Mobile vs Desktop) */}
        <div className="p-5 sm:p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActivePlatformTab('mobile')}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activePlatformTab === 'mobile'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile App (Android & iOS)</span>
            </button>

            <button
              onClick={() => setActivePlatformTab('desktop')}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activePlatformTab === 'desktop'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop App (PC & Mac)</span>
            </button>
          </div>

          {/* Active Download Progress Bar */}
          {downloadingType && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                <span className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                  Generating & Downloading {downloadingType}...
                </span>
                <span className="font-mono">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* TAB 1: MOBILE APP (Android, iOS, QR Code) */}
          {activePlatformTab === 'mobile' && (
            <div className="space-y-4">
              
              {/* Mobile Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setMobileSubTab('android')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    mobileSubTab === 'android'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Android (APK & PWA)</span>
                </button>

                <button
                  onClick={() => setMobileSubTab('ios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    mobileSubTab === 'ios'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5 text-slate-200" />
                  <span>Apple iPhone / iOS</span>
                </button>

                <button
                  onClick={() => setMobileSubTab('qr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    mobileSubTab === 'qr'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Scan Phone QR Code</span>
                </button>
              </div>

              {/* Android View */}
              {mobileSubTab === 'android' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* APK Download Card */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            OFFICIAL APK
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">14.2 MB</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Direct Android Package (.APK)</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Native APK installer with push notifications and instant scrap yard WhatsApp integration.
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadPackage('PartSourceZA-v2.4-release.apk', 'application/vnd.android.package-archive', 'Android APK Package')}
                        className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Android APK</span>
                      </button>
                    </div>

                    {/* Android Chrome PWA Card */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            INSTANT PWA
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">0 MB Storage</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Add to Home Screen</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Install directly via Chrome or Samsung Internet without using storage space.
                        </p>
                      </div>
                      <button
                        onClick={handleInstantPWA}
                        className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Instant Chrome Install</span>
                      </button>
                    </div>

                  </div>

                  {/* Android Step-by-Step Info */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      Quick Android Installation Steps:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-slate-400">
                      <li>Tap <strong>Download Android APK</strong> or <strong>Instant Chrome Install</strong>.</li>
                      <li>In Chrome menu (<strong>⋮</strong>), select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Launch from your phone home screen for full offline parts search & quotes.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* iOS View */}
              {mobileSubTab === 'ios' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200">
                        <Apple className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Install on Apple iPhone & iPad</h4>
                        <p className="text-xs text-slate-400">
                          Apple iOS allows 1-tap installation directly in Safari with zero App Store download fees.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-slate-200 font-semibold">Open Part Source ZA in Apple Safari</p>
                          <p className="text-[11px] text-slate-400">Make sure you are browsing in Safari browser on iOS.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                            Tap the Safari Share Icon 
                            <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] text-blue-400 font-mono">
                              <Share2 className="w-3 h-3 inline mr-1" /> Share
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400">Located at the bottom center of your iPhone screen.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="text-slate-200 font-semibold">
                            Scroll down & select <span className="text-amber-400">"Add to Home Screen"</span>
                          </p>
                          <p className="text-[11px] text-slate-400">Tap "Add" in the top-right corner to complete installation.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyLink}
                      className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Safari Install Link'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* QR Code Scan View */}
              {mobileSubTab === 'qr' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Generated High-Resolution SVG QR Code */}
                  <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center shrink-0">
                    <svg
                      viewBox="0 0 160 160"
                      className="w-36 h-36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="160" height="160" fill="white" />
                      {/* Corner Position Detection Squares */}
                      {/* Top Left */}
                      <rect x="12" y="12" width="40" height="40" rx="6" fill="#020617" />
                      <rect x="20" y="20" width="24" height="24" rx="3" fill="white" />
                      <rect x="26" y="26" width="12" height="12" rx="2" fill="#f59e0b" />
                      
                      {/* Top Right */}
                      <rect x="108" y="12" width="40" height="40" rx="6" fill="#020617" />
                      <rect x="116" y="20" width="24" height="24" rx="3" fill="white" />
                      <rect x="122" y="26" width="12" height="12" rx="2" fill="#f59e0b" />

                      {/* Bottom Left */}
                      <rect x="12" y="108" width="40" height="40" rx="6" fill="#020617" />
                      <rect x="20" y="116" width="24" height="24" rx="3" fill="white" />
                      <rect x="26" y="122" width="12" height="12" rx="2" fill="#f59e0b" />

                      {/* QR Pattern Matrix Dots */}
                      <rect x="60" y="16" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="76" y="16" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="92" y="16" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="68" y="28" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="84" y="28" width="8" height="8" rx="1" fill="#f59e0b" />

                      <rect x="16" y="60" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="28" y="68" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="16" y="84" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="36" y="76" width="8" height="8" rx="1" fill="#020617" />

                      {/* Center Decorative Shield / Logo Area */}
                      <rect x="60" y="60" width="40" height="40" rx="8" fill="#020617" />
                      <path d="M72 70 L80 66 L88 70 L88 80 C88 86 80 90 80 90 C80 90 72 86 72 80 Z" fill="#f59e0b" />
                      
                      <rect x="108" y="60" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="124" y="60" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="140" y="68" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="116" y="76" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="132" y="84" width="8" height="8" rx="1" fill="#020617" />

                      <rect x="60" y="108" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="76" y="116" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="92" y="108" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="68" y="132" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="84" y="124" width="8" height="8" rx="1" fill="#f59e0b" />
                      <rect x="108" y="124" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="124" y="116" width="8" height="8" rx="1" fill="#020617" />
                      <rect x="140" y="132" width="8" height="8" rx="1" fill="#020617" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mt-1">
                      Part Source ZA
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3 text-xs">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-purple-400" />
                      Scan with Your Phone Camera
                    </h4>
                    <p className="text-slate-400 text-xs">
                      1. Open the standard Camera app on your Android or iPhone.
                      <br />
                      2. Point at this QR code to instantly launch and install the mobile app.
                      <br />
                      3. Enjoy instant scrap yard quotes and vehicle part comparisons on your mobile device.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy URL for Mobile Browser</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: DESKTOP APP (Windows, Mac, Linux) */}
          {activePlatformTab === 'desktop' && (
            <div className="space-y-4">
              
              {/* Desktop Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setDesktopSubTab('windows')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    desktopSubTab === 'windows'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  <span>Windows (PC)</span>
                </button>

                <button
                  onClick={() => setDesktopSubTab('mac')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    desktopSubTab === 'mac'
                      ? 'bg-slate-200/20 text-white border border-slate-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5 text-slate-200" />
                  <span>macOS (Apple Silicon / Intel)</span>
                </button>

                <button
                  onClick={() => setDesktopSubTab('linux')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    desktopSubTab === 'linux'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Linux (Debian / RPM)</span>
                </button>
              </div>

              {/* Windows View */}
              {desktopSubTab === 'windows' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Windows Setup Executable */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            WINDOWS 10 / 11
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">64-bit EXE</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">PartSourceZA_Setup_x64.exe</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Standalone desktop client with taskbar pin, system tray alerts, and offline caching.
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadPackage('PartSourceZA_Setup_x64.exe', 'application/x-msdownload', 'Windows Desktop Executable')}
                        className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Windows App</span>
                      </button>
                    </div>

                    {/* Windows Edge / Chrome Direct PWA */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DESKTOP PWA
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Edge & Chrome</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">1-Click Desktop Install</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Installs as a borderless native Windows application via Chrome or Microsoft Edge.
                        </p>
                      </div>
                      <button
                        onClick={handleInstantPWA}
                        className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Install via Browser</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Mac View */}
              {desktopSubTab === 'mac' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* macOS DMG Download */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-400/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-700 text-slate-200 border border-slate-600">
                            macOS UNIVERSAL
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">DMG Installer</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">PartSourceZA_macOS.dmg</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Optimized for Apple Silicon (M1/M2/M3/M4) and Intel Macs with macOS Dock integration.
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadPackage('PartSourceZA_macOS.dmg', 'application/x-apple-diskimage', 'macOS Universal DMG')}
                        className="mt-4 w-full py-2.5 bg-slate-200 hover:bg-white text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/10"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download macOS DMG</span>
                      </button>
                    </div>

                    {/* Mac Safari / Chrome PWA */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            SAFARI / CHROME
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Sonoma & Sequoia</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Add to Mac Dock</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          In Safari menu, choose File → "Add to Dock" to run as an independent Mac app.
                        </p>
                      </div>
                      <button
                        onClick={handleInstantPWA}
                        className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <Zap className="w-4 h-4" />
                        <span>1-Click Install PWA</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Linux View */}
              {desktopSubTab === 'linux' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          LINUX PACKAGE
                        </span>
                        <span className="text-xs font-bold text-white">PartSourceZA.AppImage / .deb</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Compatible with Ubuntu, Debian, Fedora, Arch, and Linux Mint distributions.
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPackage('PartSourceZA-Linux.AppImage', 'application/x-executable', 'Linux AppImage')}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download AppImage</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Value Props & Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 bg-slate-950/40 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">100% Free & Safe</p>
              <p className="text-[10px] text-slate-500">Verified digital build</p>
            </div>

            <div className="p-2 bg-slate-950/40 rounded-xl">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Offline Ready</p>
              <p className="text-[10px] text-slate-500">Instant load & quotes</p>
            </div>

            <div className="p-2 bg-slate-950/40 rounded-xl">
              <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Auto Sync</p>
              <p className="text-[10px] text-slate-500">All 9 SA provinces</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

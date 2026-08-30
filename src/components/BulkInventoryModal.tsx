import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Layers, 
  Check, 
  Search, 
  Filter, 
  FileText, 
  HelpCircle, 
  Trash2, 
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Info,
  Edit3,
  Sliders,
  DollarSign,
  Tag,
  Package
} from 'lucide-react';
import { 
  CANONICAL_COLUMNS, 
  ParsedRowResult, 
  parseSpreadsheetFile, 
  autoMapHeaders, 
  validateAndNormalizeRows, 
  downloadTemplate, 
  exportSellerInventory,
  CATEGORY_DEFAULT_IMAGES
} from '../utils/bulkCsvExcelHelper';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { Listing } from '../types';

export const BulkInventoryModal: React.FC = () => {
  const { 
    isBulkUploadModalOpen, 
    setIsBulkUploadModalOpen, 
    currentSeller, 
    listings, 
    bulkAddOrUpdateListings,
    setIsSubscriptionModalOpen,
    showNotification
  } = useApp();

  // Active top-level mode
  const [activeMode, setActiveMode] = useState<'import' | 'templates' | 'export' | 'batch_adjust'>('import');

  // Step state for Import flow: 1: upload -> 2: map -> 3: preview & validate -> 4: processing -> 5: completed
  const [importStep, setImportStep] = useState<'upload' | 'map' | 'preview' | 'processing' | 'done'>('upload');

  // File parsing states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import Strategy & Row Selection
  const [importStrategy, setImportStrategy] = useState<'upsert' | 'append' | 'skip_existing'>('upsert');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [previewSearch, setPreviewSearch] = useState('');
  const [excludedRowIndices, setExcludedRowIndices] = useState<Set<number>>(new Set());

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);

  // Batch adjustment states
  const [adjustCategory, setAdjustCategory] = useState<string>('all');
  const [adjustType, setAdjustType] = useState<'markup_pct' | 'discount_pct' | 'set_warranty' | 'set_delivery'>('markup_pct');
  const [adjustValue, setAdjustValue] = useState<number>(10);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Current Seller Listings and Plan Quota
  const sellerListings = listings.filter(l => l.sellerId === currentSeller.id);
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentSeller.subscriptionTier) || SUBSCRIPTION_PLANS[0];
  const remainingQuota = Math.max(0, currentPlan.listingLimit - sellerListings.length);
  const currentUsagePercent = Math.min(100, Math.round((sellerListings.length / currentPlan.listingLimit) * 100));

  if (!isBulkUploadModalOpen) return null;

  // Handle file drop / selection
  const handleFile = async (file: File) => {
    setParseError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setParseError('Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    try {
      setUploadedFile(file);
      const parsed = await parseSpreadsheetFile(file);
      setRawHeaders(parsed.headers);
      setRawRows(parsed.rawRows);
      
      // Auto map columns
      const autoMap = autoMapHeaders(parsed.headers);
      setColumnMap(autoMap);
      
      setImportStep('map');
      showNotification('File Loaded', `Read ${parsed.rawRows.length} rows and ${parsed.headers.length} columns from ${file.name}.`, 'info');
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParseError(err.message || 'Failed to read spreadsheet. Please verify file format.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Normalized Parsed Rows
  const parsedRows: ParsedRowResult[] = useMemo(() => {
    if (!rawRows.length) return [];
    return validateAndNormalizeRows(rawRows, columnMap, currentSeller, listings);
  }, [rawRows, columnMap, currentSeller, listings]);

  // Statistics
  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const warningCount = parsedRows.filter(r => r.status === 'warning').length;
  const errorCount = parsedRows.filter(r => r.status === 'error').length;
  const duplicateSkuCount = parsedRows.filter(r => r.isDuplicateSkuInCatalog).length;

  // Filtered rows for grid
  const displayedRows = parsedRows.filter((row, idx) => {
    if (previewFilter === 'valid' && row.status !== 'valid') return false;
    if (previewFilter === 'warning' && row.status !== 'warning') return false;
    if (previewFilter === 'error' && row.status !== 'error') return false;

    if (previewSearch.trim()) {
      const q = previewSearch.toLowerCase();
      const matchTitle = row.normalized.title.toLowerCase().includes(q);
      const matchSku = row.normalized.partNumber.toLowerCase().includes(q);
      const matchMake = row.normalized.make.toLowerCase().includes(q);
      const matchModel = row.normalized.model.toLowerCase().includes(q);
      if (!matchTitle && !matchSku && !matchMake && !matchModel) return false;
    }
    return true;
  });

  const activeImportableRows = parsedRows.filter((_, idx) => !excludedRowIndices.has(idx) && parsedRows[idx].status !== 'error');

  // Will this import exceed plan limit?
  const estimatedNewListingsCount = importStrategy === 'upsert'
    ? activeImportableRows.filter(r => !r.isDuplicateSkuInCatalog).length
    : importStrategy === 'skip_existing'
    ? activeImportableRows.filter(r => !r.isDuplicateSkuInCatalog).length
    : activeImportableRows.length;

  const willExceedQuota = (sellerListings.length + estimatedNewListingsCount) > currentPlan.listingLimit;

  // Execute Bulk Upload
  const handleExecuteImport = async () => {
    if (activeImportableRows.length === 0) {
      showNotification('No Valid Rows', 'There are no valid rows selected for import.', 'warning');
      return;
    }

    setIsProcessing(true);
    setImportStep('processing');
    setProgressPercent(10);

    const itemsToProcess = activeImportableRows.map(r => r.normalized);

    // Simulate smooth progress bar while executing
    const timer = setInterval(() => {
      setProgressPercent(prev => Math.min(prev + 18, 90));
    }, 150);

    try {
      const result = await bulkAddOrUpdateListings(itemsToProcess, importStrategy);
      clearInterval(timer);
      setProgressPercent(100);
      setImportResult(result);
      setIsProcessing(false);
      setImportStep('done');

      showNotification(
        'Inventory Import Complete', 
        `Processed ${itemsToProcess.length} parts: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`, 
        'success'
      );
    } catch (err: any) {
      clearInterval(timer);
      setIsProcessing(false);
      showNotification('Import Failed', err.message || 'An error occurred while saving listings.', 'warning');
      setImportStep('preview');
    }
  };

  const resetImportFlow = () => {
    setUploadedFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setColumnMap({});
    setParseError(null);
    setExcludedRowIndices(new Set());
    setImportStep('upload');
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Batch adjustment execute
  const handleBatchAdjustment = async () => {
    setIsAdjusting(true);
    let targetListings = sellerListings;
    if (adjustCategory !== 'all') {
      targetListings = targetListings.filter(l => l.category === adjustCategory);
    }

    if (targetListings.length === 0) {
      showNotification('No Listings Found', 'No listings matched the selected category filter.', 'warning');
      setIsAdjusting(false);
      return;
    }

    const modifiedItems = targetListings.map(item => {
      const copy = { ...item };
      if (adjustType === 'markup_pct') {
        const factor = 1 + (adjustValue / 100);
        copy.priceZAR = Math.round(copy.priceZAR * factor);
      } else if (adjustType === 'discount_pct') {
        const factor = 1 - (adjustValue / 100);
        copy.priceZAR = Math.max(50, Math.round(copy.priceZAR * factor));
      } else if (adjustType === 'set_warranty') {
        copy.warrantyMonths = adjustValue;
      } else if (adjustType === 'set_delivery') {
        copy.deliveryCostZAR = adjustValue;
        copy.isNationwideDelivery = true;
      }
      return copy;
    });

    const res = await bulkAddOrUpdateListings(modifiedItems, 'upsert');
    setIsAdjusting(false);
    showNotification(
      'Batch Adjustment Applied',
      `Updated ${res.updated} listings across your ${currentSeller.businessName} catalog.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Bulk CSV & Excel Inventory Manager
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {currentSeller.subscriptionTier} Supplier
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bulk upload, sync catalog pricing, or export scrap inventory for <span className="text-slate-200 font-semibold">{currentSeller.businessName}</span>
              </p>
            </div>
          </div>

          {/* Plan Capacity Pill & Close Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Inventory Capacity:</span>
                <span className="font-mono font-bold text-amber-400">
                  {sellerListings.length} / {currentPlan.listingLimit}
                </span>
                <span className="text-[10px] text-slate-500">({remainingQuota} left)</span>
              </div>
              <div className="w-32 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${currentUsagePercent > 90 ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${currentUsagePercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsBulkUploadModalOpen(false)}
              className="h-9 w-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveMode('import')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all border-t-2 border-x border-b-0 ${
              activeMode === 'import'
                ? 'bg-slate-900 text-amber-400 border-amber-500 border-x-slate-800 shadow-lg'
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Upload Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveMode('templates')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all border-t-2 border-x border-b-0 ${
              activeMode === 'templates'
                ? 'bg-slate-900 text-amber-400 border-amber-500 border-x-slate-800 shadow-lg'
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download CSV / Excel Templates</span>
          </button>

          <button
            onClick={() => setActiveMode('export')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all border-t-2 border-x border-b-0 ${
              activeMode === 'export'
                ? 'bg-slate-900 text-amber-400 border-amber-500 border-x-slate-800 shadow-lg'
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Catalog ({sellerListings.length})</span>
          </button>

          <button
            onClick={() => setActiveMode('batch_adjust')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all border-t-2 border-x border-b-0 ${
              activeMode === 'batch_adjust'
                ? 'bg-slate-900 text-amber-400 border-amber-500 border-x-slate-800 shadow-lg'
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Bulk Price & Warranty Sync</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* MODE 1: SPREADSHEET IMPORT */}
          {activeMode === 'import' && (
            <div>
              {/* Step 1: File Drop & Upload */}
              {importStep === 'upload' && (
                <div className="space-y-6">
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                      isDragging 
                        ? 'border-amber-500 bg-amber-500/10 scale-[1.01]' 
                        : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/50 hover:bg-slate-900/60'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      className="hidden" 
                    />
                    <div className="h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/5">
                      <UploadCloud className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      Drag & Drop Your Spares Spreadsheet File
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Supports <span className="text-amber-400 font-mono font-semibold">.XLSX</span>, <span className="text-amber-400 font-mono font-semibold">.XLS</span> (Microsoft Excel), and <span className="text-amber-400 font-mono font-semibold">.CSV</span> files up to 20MB.
                    </p>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-transform transform active:scale-95 shadow-lg shadow-amber-500/20">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Browse Files on Device</span>
                    </div>
                  </div>

                  {parseError && (
                    <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  {/* Quick Format Guidelines */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Key Required Fields</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Include at least <strong className="text-slate-200">Part Title</strong>, <strong className="text-slate-200">Part Number / SKU</strong>, <strong className="text-slate-200">Make</strong>, <strong className="text-slate-200">Model</strong>, and <strong className="text-slate-200">Price (ZAR)</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Smart Auto-Mapping</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Our intelligent parser recognizes synonyms (e.g. <em>sku</em>, <em>item_code</em>, <em>brand</em>, <em>cost</em>, <em>qty</em>) automatically.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Upsert Intelligence</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Re-uploading with existing Part Numbers will update stock & prices in-place without creating duplicates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">Need a sample structure to start with?</span>
                    <button
                      type="button"
                      onClick={() => setActiveMode('templates')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Starter Excel / CSV Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Column Mapping */}
              {importStep === 'map' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Review Column Mapping</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {uploadedFile?.name} ({rawRows.length} rows)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Match your spreadsheet columns with Part Source ZA database fields.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setColumnMap(autoMapHeaders(rawHeaders))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Auto-Detect Again</span>
                    </button>
                  </div>

                  {/* Mapping Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {CANONICAL_COLUMNS.map(col => {
                      const currentMapped = columnMap[col.key] || '';
                      const isMapped = !!currentMapped;

                      return (
                        <div 
                          key={col.key} 
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isMapped 
                              ? 'bg-slate-950/80 border-slate-800' 
                              : col.required 
                              ? 'bg-red-950/20 border-red-500/40' 
                              : 'bg-slate-950/40 border-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{col.label}</span>
                              {col.required && (
                                <span className="text-[10px] text-red-400 font-bold">*Required</span>
                              )}
                            </label>
                            {isMapped ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Mapped
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Unmapped (Optional)</span>
                            )}
                          </div>
                          
                          <select
                            value={currentMapped}
                            onChange={(e) => setColumnMap(prev => ({ ...prev, [col.key]: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="">-- Do Not Map / Use Default --</option>
                            {rawHeaders.map(h => (
                              <option key={h} value={h}>
                                Column: {h}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
                            <span className="truncate max-w-[200px]">{col.description}</span>
                            <span className="font-mono text-slate-400">e.g. {col.example}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 2 Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={resetImportFlow}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Choose Different File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportStep('preview')}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <span>Proceed to Validation & Preview ({rawRows.length} rows)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Interactive Data Preview Grid & Conflict Handling */}
              {importStep === 'preview' && (
                <div className="space-y-5">
                  {/* Status Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div 
                      onClick={() => setPreviewFilter('all')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        previewFilter === 'all' ? 'bg-slate-800 border-amber-500/80 ring-1 ring-amber-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Parsed</span>
                      <span className="text-xl font-bold font-mono text-white">{parsedRows.length}</span>
                    </div>

                    <div 
                      onClick={() => setPreviewFilter('valid')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        previewFilter === 'valid' ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready / Valid
                      </span>
                      <span className="text-xl font-bold font-mono text-emerald-400">{validCount}</span>
                    </div>

                    <div 
                      onClick={() => setPreviewFilter('warning')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        previewFilter === 'warning' ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-amber-400 block flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Warnings (Auto-Fixed)
                      </span>
                      <span className="text-xl font-bold font-mono text-amber-400">{warningCount}</span>
                    </div>

                    <div 
                      onClick={() => setPreviewFilter('error')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        previewFilter === 'error' ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-red-400 block flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Blocking Errors
                      </span>
                      <span className="text-xl font-bold font-mono text-red-400">{errorCount}</span>
                    </div>
                  </div>

                  {/* Strategy Selector & Search */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Import Strategy:</span>
                      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setImportStrategy('upsert')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            importStrategy === 'upsert' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Updates matching SKUs and inserts new parts"
                        >
                          Upsert (Update + Add)
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportStrategy('append')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            importStrategy === 'append' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Always creates new listings"
                        >
                          Add All as New
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportStrategy('skip_existing')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            importStrategy === 'skip_existing' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Only inserts parts with new unique SKUs"
                        >
                          Skip Existing SKUs
                        </button>
                      </div>
                    </div>

                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search in parsed rows..."
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Quota warning banner if exceeding subscription plan */}
                  {willExceedQuota && (
                    <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-amber-300">
                            Upload Exceeds {currentPlan.name} Limit
                          </h5>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            You currently have {sellerListings.length} listings. Importing {estimatedNewListingsCount} new parts will exceed your {currentPlan.listingLimit} limit. Upgrade your subscription to allow up to 500 listings.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap shadow-lg shadow-amber-500/20"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  )}

                  {/* Interactive Table Preview */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-300">
                          Showing {displayedRows.length} of {parsedRows.length} Rows
                        </span>
                        {duplicateSkuCount > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {duplicateSkuCount} Existing SKUs Detected in Catalog
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeImportableRows.length} selected for upload
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">Row</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Part Title</th>
                            <th className="py-2.5 px-3">Part Number / SKU</th>
                            <th className="py-2.5 px-3">Make / Model</th>
                            <th className="py-2.5 px-3">Years</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Price (ZAR)</th>
                            <th className="py-2.5 px-3">Stock</th>
                            <th className="py-2.5 px-3">Notes & Diagnostics</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {displayedRows.map((row) => {
                            const isExcluded = excludedRowIndices.has(row.rowNumber - 1);
                            return (
                              <tr 
                                key={row.rowNumber}
                                className={`hover:bg-slate-900/80 transition-colors ${
                                  isExcluded ? 'opacity-40 line-through bg-slate-950' : row.status === 'error' ? 'bg-red-950/10' : ''
                                }`}
                              >
                                <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                                  #{row.rowNumber}
                                </td>
                                
                                <td className="py-2.5 px-3">
                                  {row.status === 'valid' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3 h-3" /> Valid
                                    </span>
                                  ) : row.status === 'warning' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      <AlertTriangle className="w-3 h-3" /> Auto-Fixed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                      <AlertCircle className="w-3 h-3" /> Error
                                    </span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate">
                                  {row.normalized.title}
                                </td>

                                <td className="py-2.5 px-3 font-mono text-amber-300">
                                  <div className="flex items-center gap-1">
                                    <span>{row.normalized.partNumber}</span>
                                    {row.isDuplicateSkuInCatalog && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">
                                        Update
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-slate-300">
                                  {row.normalized.make} {row.normalized.model}
                                </td>

                                <td className="py-2.5 px-3 font-mono text-slate-400">
                                  {row.normalized.yearStart}-{row.normalized.yearEnd}
                                </td>

                                <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                  {row.normalized.category}
                                </td>

                                <td className="py-2.5 px-3 font-bold text-emerald-400 font-sans">
                                  R{row.normalized.priceZAR.toLocaleString()}
                                </td>

                                <td className="py-2.5 px-3 text-slate-300">
                                  {row.normalized.stockCount}
                                </td>

                                <td className="py-2.5 px-3 text-[10px] text-slate-400 max-w-[220px]">
                                  {row.messages.length > 0 ? (
                                    <span className={row.status === 'error' ? 'text-red-400 font-semibold' : 'text-amber-400/90'}>
                                      {row.messages.join(' • ')}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">All rules verified</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Step 3 Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setImportStep('map')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Column Mapping</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={resetImportFlow}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel Upload
                      </button>

                      <button
                        type="button"
                        onClick={handleExecuteImport}
                        disabled={activeImportableRows.length === 0}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirm & Bulk Upload ({activeImportableRows.length} Parts)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Live Processing Progress */}
              {importStep === 'processing' && (
                <div className="py-16 text-center space-y-6">
                  <div className="h-16 w-16 rounded-3xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mx-auto animate-bounce shadow-xl">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Syncing Inventory with Cloud Database...
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Writing listings to Firestore, assigning high-res category imagery, and building search indices.
                    </p>
                  </div>
                  <div className="max-w-md mx-auto bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Completion Summary */}
              {importStep === 'done' && importResult && (
                <div className="py-8 text-center space-y-6 max-w-lg mx-auto">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">
                      Bulk Inventory Successfully Uploaded!
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your spares catalog for <strong className="text-slate-200">{currentSeller.businessName}</strong> is immediately live and searchable across South Africa.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">New Added</span>
                      <span className="text-2xl font-black text-emerald-400 block font-mono">{importResult.added}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Updated</span>
                      <span className="text-2xl font-black text-blue-400 block font-mono">{importResult.updated}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Skipped</span>
                      <span className="text-2xl font-black text-slate-400 block font-mono">{importResult.skipped}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetImportFlow}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    >
                      Upload Another File
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBulkUploadModalOpen(false)}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
                    >
                      View in My Spares Inventory
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: DOWNLOAD TEMPLATES */}
          {activeMode === 'templates' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                      <span>Official Part Source ZA Inventory Templates</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Download pre-formatted templates with sample South African vehicle parts (Hilux, Polo, Ranger, Isuzu, BMW) and validation notes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        downloadTemplate('xlsx');
                        showNotification('Template Downloaded', 'PartSource_ZA_Inventory_Template.xlsx generated.', 'success');
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        downloadTemplate('csv');
                        showNotification('Template Downloaded', 'PartSource_ZA_Inventory_Template.csv generated.', 'success');
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download CSV (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* Column Specification Table */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Spreadsheet Column Specification
                </h4>
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Column Header</th>
                        <th className="py-2.5 px-4">Requirement</th>
                        <th className="py-2.5 px-4">Accepted Values / Format</th>
                        <th className="py-2.5 px-4">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {CANONICAL_COLUMNS.map(col => (
                        <tr key={col.key} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-4 font-mono font-semibold text-amber-300">
                            {col.label}
                          </td>
                          <td className="py-2.5 px-4">
                            {col.required ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Optional</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                            {col.description}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-300">
                            {col.example}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: EXPORT CATALOG */}
          {activeMode === 'export' && (
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                  <Download className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-white">
                    Export {currentSeller.businessName} Inventory
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Download a full backup of your current {sellerListings.length} active parts with buyer inquiry metrics, SKU references, and prices.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      exportSellerInventory(sellerListings, currentSeller.businessName, 'xlsx');
                      showNotification('Catalog Exported', `Exported ${sellerListings.length} parts to Excel (.xlsx).`, 'success');
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export to Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      exportSellerInventory(sellerListings, currentSeller.businessName, 'csv');
                      showNotification('Catalog Exported', `Exported ${sellerListings.length} parts to CSV (.csv).`, 'success');
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-black rounded-xl text-xs flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export to CSV (.csv)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: BULK ADJUSTMENT TOOL */}
          {activeMode === 'batch_adjust' && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-400" />
                    <span>Bulk Price & Guarantee Synchronizer</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Apply percentage markups, discounts, or uniform warranties across your inventory in one click.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Target Inventory Category
                    </label>
                    <select
                      value={adjustCategory}
                      onChange={(e) => setAdjustCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="all">Entire Spares Catalog ({sellerListings.length} parts)</option>
                      {Array.from(new Set(sellerListings.map(l => l.category))).map(cat => (
                        <option key={cat} value={cat}>
                          {cat} ({sellerListings.filter(l => l.category === cat).length} parts)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Adjustment Type
                      </label>
                      <select
                        value={adjustType}
                        onChange={(e) => setAdjustType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-400 font-bold"
                      >
                        <option value="markup_pct">Price Increase (+ %)</option>
                        <option value="discount_pct">Promotional Discount (- %)</option>
                        <option value="set_warranty">Set Guarantee Period (Months)</option>
                        <option value="set_delivery">Set Standard Courier Cost (ZAR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        {adjustType.includes('pct') ? 'Percentage (%)' : adjustType === 'set_warranty' ? 'Months' : 'Rands (ZAR)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={adjustValue}
                        onChange={(e) => setAdjustValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={handleBatchAdjustment}
                    disabled={isAdjusting || sellerListings.length === 0}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    {isAdjusting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[3]" />
                    )}
                    <span>Apply Batch Update</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

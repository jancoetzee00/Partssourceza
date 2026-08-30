import * as XLSX from 'xlsx';
import { 
  Listing, 
  SellerAccount, 
  PartCategory, 
  PartCondition, 
  VehicleType, 
  SouthAfricanProvince 
} from '../types';

export interface ColumnMappingDefinition {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
  description: string;
  example: string;
}

export const CANONICAL_COLUMNS: ColumnMappingDefinition[] = [
  { 
    key: 'title', 
    label: 'Part Title / Component Name', 
    required: true, 
    aliases: ['title', 'part_title', 'part name', 'name', 'item', 'description_short', 'part_description', 'component'],
    description: 'Full descriptive title of the spare part',
    example: 'Toyota Hilux 2.8 GD-6 Denso Common Rail Diesel Injector Set'
  },
  { 
    key: 'partNumber', 
    label: 'Part Number / SKU', 
    required: true, 
    aliases: ['part number', 'partnumber', 'part_number', 'sku', 'code', 'part_no', 'partno', 'item_code', 'stock_code', 'reference'],
    description: 'Unique internal or manufacturer SKU',
    example: 'TOY-INJ-23670-0E020'
  },
  { 
    key: 'oemNumber', 
    label: 'OEM Reference Number', 
    required: false, 
    aliases: ['oem', 'oem number', 'oem_number', 'oem_no', 'original_code', 'oem_sku'],
    description: 'Original equipment manufacturer part number',
    example: '23670-0E020'
  },
  { 
    key: 'make', 
    label: 'Vehicle Make / Brand', 
    required: true, 
    aliases: ['make', 'brand', 'vehicle_make', 'car_make', 'manufacturer', 'auto_make'],
    description: 'Vehicle brand (Toyota, VW, Ford, BMW, Isuzu, etc.)',
    example: 'Toyota'
  },
  { 
    key: 'model', 
    label: 'Vehicle Model / Series', 
    required: true, 
    aliases: ['model', 'series', 'vehicle_model', 'car_model', 'model_name'],
    description: 'Vehicle model (Hilux, Polo, Ranger, 3 Series, etc.)',
    example: 'Hilux GD-6'
  },
  { 
    key: 'yearStart', 
    label: 'Year From (Start Year)', 
    required: false, 
    aliases: ['year start', 'year_start', 'from_year', 'year_from', 'start_year', 'year', 'years', 'model_year'],
    description: 'First compatible production year',
    example: '2016'
  },
  { 
    key: 'yearEnd', 
    label: 'Year To (End Year)', 
    required: false, 
    aliases: ['year end', 'year_end', 'to_year', 'year_to', 'end_year'],
    description: 'Latest compatible production year',
    example: '2024'
  },
  { 
    key: 'priceZAR', 
    label: 'Price in ZAR (Rands)', 
    required: true, 
    aliases: ['price', 'price_zar', 'price zar', 'cost', 'amount', 'selling_price', 'unit_price', 'price (zar)', 'price_rands', 'rand'],
    description: 'Selling price in South African Rands (ZAR)',
    example: '4250'
  },
  { 
    key: 'category', 
    label: 'Category', 
    required: false, 
    aliases: ['category', 'part_category', 'type', 'section', 'group', 'component_type'],
    description: 'Engine, Gearbox, Brakes, Suspension, Body, Electrical, etc.',
    example: 'Turbochargers & Fuel'
  },
  { 
    key: 'condition', 
    label: 'Part Condition', 
    required: false, 
    aliases: ['condition', 'state', 'grade', 'quality', 'item_condition'],
    description: 'Used Original (Clean), Reconditioned / Tested, Brand New OEM, Scrap Stripping',
    example: 'Reconditioned / Tested'
  },
  { 
    key: 'vehicleType', 
    label: 'Vehicle Type', 
    required: false, 
    aliases: ['vehicle type', 'vehicle_type', 'body_type', 'vehicle_class'],
    description: 'car, bakkie, truck, suv, commercial',
    example: 'bakkie'
  },
  { 
    key: 'warrantyMonths', 
    label: 'Warranty (Months)', 
    required: false, 
    aliases: ['warranty', 'warranty_months', 'guarantee', 'warranty (months)', 'guarantee_months', 'warranty_period'],
    description: 'Warranty period in months (e.g. 1, 3, 6, 12)',
    example: '6'
  },
  { 
    key: 'stockCount', 
    label: 'Stock Quantity', 
    required: false, 
    aliases: ['stock', 'stock_count', 'qty', 'quantity', 'count', 'units_available', 'inventory'],
    description: 'Number of units available in yard/shop',
    example: '4'
  },
  { 
    key: 'engineSpec', 
    label: 'Engine Spec / Displacement', 
    required: false, 
    aliases: ['engine', 'engine_spec', 'displacement', 'motor', 'engine_code'],
    description: 'e.g. 2.8 GD-6 Turbo Diesel / 1.4 TSI / 3.2 TDCi',
    example: '2.8 GD-6 1GD-FTV'
  },
  { 
    key: 'locationCity', 
    label: 'Location City', 
    required: false, 
    aliases: ['city', 'location_city', 'town', 'branch_city'],
    description: 'e.g. Johannesburg, Pretoria, Cape Town, Durban',
    example: 'Johannesburg'
  },
  { 
    key: 'locationProvince', 
    label: 'Location Province', 
    required: false, 
    aliases: ['province', 'location_province', 'region', 'state'],
    description: 'Gauteng, Western Cape, KwaZulu-Natal, etc.',
    example: 'Gauteng'
  },
  { 
    key: 'isNationwideDelivery', 
    label: 'Nationwide Delivery Available', 
    required: false, 
    aliases: ['delivery', 'nationwide_delivery', 'courier', 'shipping', 'ships_nationwide', 'is_nationwide'],
    description: 'YES / NO (Courier Guy / RAM available)',
    example: 'YES'
  },
  { 
    key: 'deliveryCostZAR', 
    label: 'Delivery Cost (ZAR)', 
    required: false, 
    aliases: ['delivery_cost', 'shipping_cost', 'courier_fee', 'delivery_fee', 'freight'],
    description: 'Courier fee in Rands (0 for free / buyer pays)',
    example: '180'
  },
  { 
    key: 'deliveryDaysEstimate', 
    label: 'Delivery Time Estimate', 
    required: false, 
    aliases: ['delivery_time', 'delivery_days', 'lead_time', 'shipping_time'],
    description: 'e.g. 1-2 business days (Door-to-door)',
    example: '1-2 business days'
  },
  { 
    key: 'description', 
    label: 'Detailed Description / Notes', 
    required: false, 
    aliases: ['description', 'notes', 'details', 'full_description', 'comments', 'specification'],
    description: 'Component condition, testing notes, fitment guide',
    example: 'Original Denso units tested on Bosch EPS test bench. Balanced and calibrated. Includes test report and copper washers.'
  },
  { 
    key: 'images', 
    label: 'Image URL(s)', 
    required: false, 
    aliases: ['image', 'images', 'image_url', 'image_urls', 'photo', 'photos', 'picture', 'pic'],
    description: 'Direct image link (separated by comma if multiple)',
    example: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800'
  }
];

// Fallback high-quality automotive component images by category
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'Engine & Mechanical': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  'Gearbox & Drivetrain': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
  'Brakes & Hubs': 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80',
  'Suspension & Steering': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
  'Body Panels & Bumpers': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80',
  'Auto Electrical & ECUs': 'https://images.unsplash.com/photo-1558441719-813c9e377668?w=800&auto=format&fit=crop&q=80',
  'Cooling & Radiators': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  'Lighting & Mirrors': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
  'Turbochargers & Fuel': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
  'Truck Heavy Duty Axles': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
  'Tires & Wheels': 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
  'Hydraulic Systems': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
};

export const SAMPLE_TEMPLATE_ROWS = [
  {
    'Part Title': 'Toyota Hilux 2.8 GD-6 Denso Common Rail Diesel Injector Set',
    'Part Number': 'TOY-INJ-23670-0E020',
    'OEM Reference': '23670-0E020',
    'Make': 'Toyota',
    'Model': 'Hilux GD-6',
    'Year Start': 2016,
    'Year End': 2024,
    'Price (ZAR)': 4250,
    'Category': 'Turbochargers & Fuel',
    'Condition': 'Reconditioned / Tested',
    'Vehicle Type': 'bakkie',
    'Warranty (Months)': 6,
    'Stock Quantity': 4,
    'Engine Spec': '2.8 GD-6 1GD-FTV Diesel',
    'Location City': 'Johannesburg',
    'Location Province': 'Gauteng',
    'Nationwide Delivery': 'YES',
    'Delivery Cost (ZAR)': 180,
    'Delivery Time': '1-2 business days',
    'Description': 'Fully tested on Bosch EPS bench. Balanced, calibrated with new copper washers. 6 months replacement warranty.',
    'Image URL': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800'
  },
  {
    'Part Title': 'Volkswagen Polo 6R / 6C 1.2 TSI Manual 5-Speed Gearbox',
    'Part Number': 'VW-GBX-02T-POLO',
    'OEM Reference': '02T300049R',
    'Make': 'Volkswagen',
    'Model': 'Polo 6R / 6C',
    'Year Start': 2011,
    'Year End': 2017,
    'Price (ZAR)': 8900,
    'Category': 'Gearbox & Drivetrain',
    'Condition': 'Used Original (Clean)',
    'Vehicle Type': 'car',
    'Warranty (Months)': 3,
    'Stock Quantity': 2,
    'Engine Spec': '1.2 TSI CJZA / CBZB',
    'Location City': 'Pretoria',
    'Location Province': 'Gauteng',
    'Nationwide Delivery': 'YES',
    'Delivery Cost (ZAR)': 350,
    'Delivery Time': '2-3 business days (Crated)',
    'Description': 'Clean low-mileage gearbox stripped from runner. Smooth synchros, fresh seals, drained clean oil.',
    'Image URL': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
  },
  {
    'Part Title': 'Ford Ranger T6 3.2 TDCi Complete Front Disc Brake Caliper & Hub Kit',
    'Part Number': 'FRD-BRK-RNG32-KIT',
    'OEM Reference': 'AB31-2B120-AA',
    'Make': 'Ford',
    'Model': 'Ranger T6 / Wildtrak',
    'Year Start': 2012,
    'Year End': 2022,
    'Price (ZAR)': 3200,
    'Category': 'Brakes & Hubs',
    'Condition': 'Reconditioned / Tested',
    'Vehicle Type': 'bakkie',
    'Warranty (Months)': 6,
    'Stock Quantity': 5,
    'Engine Spec': '3.2 TDCi Duratorq',
    'Location City': 'Cape Town',
    'Location Province': 'Western Cape',
    'Nationwide Delivery': 'YES',
    'Delivery Cost (ZAR)': 220,
    'Delivery Time': '2 business days',
    'Description': 'Dual piston calipers with ceramic seals and brand new heavy duty vented slotted rotors.',
    'Image URL': 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800'
  },
  {
    'Part Title': 'Isuzu D-Max / KB250 D-Teq Complete Cylinder Head Assembly',
    'Part Number': 'ISU-CYL-4JK1-TC',
    'OEM Reference': '8-98018-454-0',
    'Make': 'Isuzu',
    'Model': 'D-Max / KB250',
    'Year Start': 2013,
    'Year End': 2021,
    'Price (ZAR)': 11500,
    'Category': 'Engine & Mechanical',
    'Condition': 'Brand New OEM',
    'Vehicle Type': 'bakkie',
    'Warranty (Months)': 12,
    'Stock Quantity': 3,
    'Engine Spec': '2.5 D-Teq 4JK1-TC',
    'Location City': 'Durban',
    'Location Province': 'KwaZulu-Natal',
    'Nationwide Delivery': 'YES',
    'Delivery Cost (ZAR)': 280,
    'Delivery Time': '1-3 business days',
    'Description': 'Brand new loaded cylinder head complete with valves, camshafts, and lifters. Pressure tested.',
    'Image URL': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800'
  },
  {
    'Part Title': 'BMW 3 Series F30 LCI Xenon / LED Adaptive Headlight (Right Side)',
    'Part Number': 'BMW-HDL-F30-RH',
    'OEM Reference': '63117419630',
    'Make': 'BMW',
    'Model': '3 Series F30 / F31',
    'Year Start': 2015,
    'Year End': 2019,
    'Price (ZAR)': 7800,
    'Category': 'Lighting & Mirrors',
    'Condition': 'Used Original (Clean)',
    'Vehicle Type': 'car',
    'Warranty (Months)': 3,
    'Stock Quantity': 1,
    'Engine Spec': '320i / 320d / 330i',
    'Location City': 'Johannesburg',
    'Location Province': 'Gauteng',
    'Nationwide Delivery': 'YES',
    'Delivery Cost (ZAR)': 150,
    'Delivery Time': '1-2 business days',
    'Description': 'All tabs intact, no cracks, crystal clear lens. Complete with control ballast modules.',
    'Image URL': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800'
  },
  {
    'Part Title': 'Mercedes-Benz Actros MP4 Commercial Truck Heavy Duty Air Brake Valve',
    'Part Number': 'MB-TRK-ACT-BRK01',
    'OEM Reference': 'A0004319413',
    'Make': 'Mercedes-Benz',
    'Model': 'Actros MP4 / Arocs',
    'Year Start': 2014,
    'Year End': 2024,
    'Price (ZAR)': 14500,
    'Category': 'Truck Heavy Duty Axles',
    'Condition': 'Brand New OEM',
    'Vehicle Type': 'truck',
    'Warranty (Months)': 12,
    'Stock Quantity': 2,
    'Engine Spec': 'OM471 Heavy Duty Diesel',
    'Location City': 'Johannesburg',
    'Location Province': 'Gauteng',
    'Nationwide Delivery': 'YES',
    'Delivery Cost (ZAR)': 350,
    'Delivery Time': '1-2 business days',
    'Description': 'Knorr-Bremse genuine pneumatic brake module for long-haul fleet and tippers. ISO 9001 certified.',
    'Image URL': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800'
  }
];

export interface ParsedRowResult {
  rowNumber: number;
  raw: Record<string, any>;
  normalized: Omit<Listing, 'id' | 'dateAdded' | 'views' | 'inquiriesCount'>;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
  isDuplicateSkuInCatalog?: boolean;
  existingListingId?: string;
}

/**
 * Downloads a pre-formatted auto parts inventory template as CSV or XLSX
 */
export const downloadTemplate = (format: 'csv' | 'xlsx' = 'xlsx') => {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
  
  // Set column widths for clean readability in Excel
  ws['!cols'] = [
    { wch: 45 }, // Part Title
    { wch: 22 }, // Part Number
    { wch: 18 }, // OEM Reference
    { wch: 15 }, // Make
    { wch: 20 }, // Model
    { wch: 12 }, // Year Start
    { wch: 12 }, // Year End
    { wch: 14 }, // Price (ZAR)
    { wch: 24 }, // Category
    { wch: 24 }, // Condition
    { wch: 14 }, // Vehicle Type
    { wch: 16 }, // Warranty
    { wch: 14 }, // Stock Qty
    { wch: 25 }, // Engine Spec
    { wch: 16 }, // City
    { wch: 18 }, // Province
    { wch: 18 }, // Delivery
    { wch: 18 }, // Delivery Cost
    { wch: 20 }, // Delivery Time
    { wch: 50 }, // Description
    { wch: 45 }  // Image URL
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Part_Source_Inventory_Template');

  // Also add an instructions sheet in Excel format
  if (format === 'xlsx') {
    const instructionsData = [
      { 'Field': 'Part Title (Required)', 'Notes': 'E.g. Toyota Hilux 2.8 GD-6 Injector. Be specific for buyer search visibility.' },
      { 'Field': 'Part Number / SKU (Required)', 'Notes': 'Your internal inventory SKU or scrapyard bin tag code.' },
      { 'Field': 'OEM Reference', 'Notes': 'Original factory stamp code if visible.' },
      { 'Field': 'Make & Model (Required)', 'Notes': 'E.g. Toyota, Hilux or VW, Golf 7 GTI.' },
      { 'Field': 'Year Start / End', 'Notes': '4-digit automotive years (e.g. 2015 to 2023).' },
      { 'Field': 'Price (ZAR) (Required)', 'Notes': 'Numbers only without currency symbols. E.g. 4500.' },
      { 'Field': 'Category', 'Notes': 'Engine, Gearbox, Brakes, Suspension, Body Panels, Auto Electrical, Cooling, Lighting, Turbochargers, Truck Axles, etc.' },
      { 'Field': 'Condition', 'Notes': 'Used Original (Clean), Reconditioned / Tested, Brand New OEM, Brand New Aftermarket, Scrap Stripping (Used)' },
      { 'Field': 'Vehicle Type', 'Notes': 'car, bakkie, truck, suv, commercial' },
      { 'Field': 'Warranty (Months)', 'Notes': 'E.g. 1, 3, 6, 12 months.' },
      { 'Field': 'Location City & Province', 'Notes': 'Defaults to your registered seller location if left empty.' },
      { 'Field': 'Nationwide Delivery', 'Notes': 'YES or NO.' },
      { 'Field': 'Image URL', 'Notes': 'Web link to photo. If left blank, a professional high-res category image is automatically assigned.' }
    ];
    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 30 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Guide_&_Instructions');
  }

  const filename = `PartSource_ZA_Inventory_Template.${format === 'csv' ? 'csv' : 'xlsx'}`;
  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
};

/**
 * Exports current seller listings into an Excel or CSV file
 */
export const exportSellerInventory = (
  listings: Listing[], 
  sellerName: string, 
  format: 'csv' | 'xlsx' = 'xlsx'
) => {
  const exportRows = listings.map(item => ({
    'Listing ID': item.id,
    'Part Title': item.title,
    'Part Number / SKU': item.partNumber,
    'OEM Reference': item.oemNumber || '',
    'Vehicle Make': item.make,
    'Vehicle Model': item.model,
    'Year Start': item.yearStart,
    'Year End': item.yearEnd,
    'Engine Spec': item.engineSpec || '',
    'Vehicle Type': item.vehicleType,
    'Category': item.category,
    'Condition': item.condition,
    'Price (ZAR)': item.priceZAR,
    'Original Price (ZAR)': item.originalPriceZAR || '',
    'Warranty (Months)': item.warrantyMonths,
    'Stock Count': item.stockCount,
    'City': item.locationCity,
    'Province': item.locationProvince,
    'Nationwide Delivery': item.isNationwideDelivery ? 'YES' : 'NO',
    'Delivery Cost (ZAR)': item.deliveryCostZAR,
    'Delivery Estimate': item.deliveryDaysEstimate,
    'Views': item.views,
    'Buyer Inquiries': item.inquiriesCount,
    'Featured Status': item.isFeatured ? 'YES' : 'NO',
    'Date Added': item.dateAdded,
    'Image URL': item.images[0] || '',
    'Description': item.description
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'My_Spares_Catalog');

  const cleanSellerSlug = sellerName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Inventory_${cleanSellerSlug}_${dateStr}.${format === 'csv' ? 'csv' : 'xlsx'}`;

  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
};

/**
 * Parses uploaded File (CSV, XLSX, XLS) into header names and raw row objects
 */
export const parseSpreadsheetFile = async (file: File): Promise<{
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  rawRows: Record<string, any>[];
}> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  
  if (!workbook.SheetNames.length) {
    throw new Error('The uploaded workbook contains no worksheets.');
  }

  const selectedSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[selectedSheet];
  
  // Convert worksheet to JSON array of objects (raw strings/numbers)
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '',
    raw: false 
  });

  if (!rawRows.length) {
    throw new Error('The selected spreadsheet sheet is empty.');
  }

  // Extract all distinct headers from the first few rows
  const headerSet = new Set<string>();
  rawRows.slice(0, 10).forEach(row => {
    Object.keys(row).forEach(key => headerSet.add(key.trim()));
  });

  return {
    sheetNames: workbook.SheetNames,
    selectedSheet,
    headers: Array.from(headerSet),
    rawRows
  };
};

/**
 * Computes best automated matching canonical column keys
 */
export const autoMapHeaders = (uploadedHeaders: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};

  CANONICAL_COLUMNS.forEach(colDef => {
    // 1. Direct match on key or label
    let found = uploadedHeaders.find(h => 
      h.toLowerCase().trim() === colDef.key.toLowerCase() ||
      h.toLowerCase().trim() === colDef.label.toLowerCase()
    );

    // 2. Match on aliases
    if (!found) {
      found = uploadedHeaders.find(h => {
        const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        return colDef.aliases.some(alias => {
          const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanHeader === cleanAlias || cleanHeader.includes(cleanAlias);
        });
      });
    }

    if (found) {
      mapping[colDef.key] = found;
    }
  });

  return mapping;
};

/**
 * Normalizes fuzzy categories
 */
const normalizeCategory = (val: string): PartCategory => {
  if (!val) return 'Engine & Mechanical';
  const clean = val.toLowerCase();
  if (clean.includes('gear') || clean.includes('trans') || clean.includes('clutch') || clean.includes('diff')) return 'Gearbox & Drivetrain';
  if (clean.includes('brake') || clean.includes('hub') || clean.includes('rotor') || clean.includes('caliper') || clean.includes('pad')) return 'Brakes & Hubs';
  if (clean.includes('susp') || clean.includes('steer') || clean.includes('rack') || clean.includes('shock') || clean.includes('spring')) return 'Suspension & Steering';
  if (clean.includes('body') || clean.includes('bump') || clean.includes('fender') || clean.includes('door') || clean.includes('bonnet') || clean.includes('hood') || clean.includes('grille')) return 'Body Panels & Bumpers';
  if (clean.includes('elec') || clean.includes('ecu') || clean.includes('sensor') || clean.includes('alt') || clean.includes('start') || clean.includes('fuse')) return 'Auto Electrical & ECUs';
  if (clean.includes('cool') || clean.includes('radi') || clean.includes('water') || clean.includes('fan') || clean.includes('thermo') || clean.includes('intercooler')) return 'Cooling & Radiators';
  if (clean.includes('light') || clean.includes('lamp') || clean.includes('headlight') || clean.includes('taillight') || clean.includes('mirror')) return 'Lighting & Mirrors';
  if (clean.includes('turb') || clean.includes('fuel') || clean.includes('inj') || clean.includes('pump') || clean.includes('diesel')) return 'Turbochargers & Fuel';
  if (clean.includes('truck') || clean.includes('axle') || clean.includes('heavy') || clean.includes('commercial')) return 'Truck Heavy Duty Axles';
  if (clean.includes('tire') || clean.includes('tyre') || clean.includes('wheel') || clean.includes('rim')) return 'Tires & Wheels';
  if (clean.includes('hydr') || clean.includes('tipper') || clean.includes('cylinder') || clean.includes('crane')) return 'Hydraulic Systems';
  return 'Engine & Mechanical';
};

/**
 * Normalizes fuzzy condition
 */
const normalizeCondition = (val: string): PartCondition => {
  if (!val) return 'Used Original (Clean)';
  const clean = val.toLowerCase();
  if (clean.includes('oem') && (clean.includes('new') || clean.includes('brand'))) return 'Brand New OEM';
  if (clean.includes('aftermarket') || (clean.includes('new') && clean.includes('rep'))) return 'Brand New Aftermarket';
  if (clean.includes('recon') || clean.includes('test') || clean.includes('refurb') || clean.includes('rebuilt')) return 'Reconditioned / Tested';
  if (clean.includes('scrap') || clean.includes('strip') || clean.includes('yard')) return 'Scrap Stripping (Used)';
  if (clean.includes('used') || clean.includes('clean') || clean.includes('second')) return 'Used Original (Clean)';
  return 'Used Original (Clean)';
};

/**
 * Normalizes fuzzy province
 */
const normalizeProvince = (val: string, fallback: SouthAfricanProvince): SouthAfricanProvince => {
  if (!val) return fallback;
  const clean = val.toLowerCase();
  if (clean.includes('gauteng') || clean.includes('jhb') || clean.includes('joburg') || clean.includes('pta') || clean.includes('pretoria')) return 'Gauteng';
  if (clean.includes('western') || clean.includes('cape town') || clean.includes('cpt')) return 'Western Cape';
  if (clean.includes('kwazulu') || clean.includes('kzn') || clean.includes('durban') || clean.includes('natal')) return 'KwaZulu-Natal';
  if (clean.includes('eastern') || clean.includes('gqeberha') || clean.includes('pe') || clean.includes('port elizabeth')) return 'Eastern Cape';
  if (clean.includes('free state') || clean.includes('bloem')) return 'Free State';
  if (clean.includes('limpopo') || clean.includes('polokwane')) return 'Limpopo';
  if (clean.includes('mpumalanga') || clean.includes('nelspruit') || clean.includes('mbombela')) return 'Mpumalanga';
  if (clean.includes('north west') || clean.includes('rustenburg')) return 'North West';
  if (clean.includes('northern cape') || clean.includes('kimberley')) return 'Northern Cape';
  return fallback;
};

/**
 * Normalizes vehicle type
 */
const normalizeVehicleType = (val: string): VehicleType => {
  if (!val) return 'car';
  const clean = val.toLowerCase();
  if (clean.includes('bakkie') || clean.includes('pickup') || clean.includes('ute')) return 'bakkie';
  if (clean.includes('truck') || clean.includes('heavy') || clean.includes('lorry') || clean.includes('actros') || clean.includes('hino')) return 'truck';
  if (clean.includes('suv') || clean.includes('crossover') || clean.includes('4x4')) return 'suv';
  if (clean.includes('comm') || clean.includes('van') || clean.includes('bus') || clean.includes('quantum') || clean.includes('taxi')) return 'commercial';
  return 'car';
};

/**
 * Validates, cleans, and transforms raw spreadsheet rows into standard Part Source Listing objects
 */
export const validateAndNormalizeRows = (
  rawRows: Record<string, any>[],
  columnMap: Record<string, string>,
  currentSeller: SellerAccount,
  existingListings: Listing[]
): ParsedRowResult[] => {
  const currentYear = new Date().getFullYear();

  return rawRows.map((row, index) => {
    const rowNumber = index + 1;
    const messages: string[] = [];
    let hasError = false;
    let hasWarning = false;

    // Helper to get raw value from mapped header
    const getVal = (canonicalKey: string): string => {
      const mappedHeader = columnMap[canonicalKey];
      if (!mappedHeader || row[mappedHeader] === undefined) return '';
      return String(row[mappedHeader]).trim();
    };

    // 1. Validate Title
    const rawTitle = getVal('title');
    let title = rawTitle;
    if (!title) {
      // Attempt auto-construction if make + model exist
      const m = getVal('make');
      const mod = getVal('model');
      const cat = getVal('category');
      if (m && mod) {
        title = `${m} ${mod} ${cat || 'Auto Spare Part'}`;
        messages.push('Title was missing; auto-constructed from Make & Model.');
        hasWarning = true;
      } else {
        messages.push('Missing required Part Title.');
        hasError = true;
        title = 'Untitled Auto Part';
      }
    }

    // 2. Validate Part Number / SKU
    let partNumber = getVal('partNumber');
    if (!partNumber) {
      partNumber = `SKU-${Date.now().toString().slice(-4)}-${index + 100}`;
      messages.push('Missing SKU; auto-generated temporary inventory part number.');
      hasWarning = true;
    } else {
      // Clean SKU string
      partNumber = partNumber.replace(/\s+/g, '-').toUpperCase();
    }

    // Check if duplicate SKU already exists in this seller's catalog
    const existingListing = existingListings.find(
      l => l.sellerId === currentSeller.id && l.partNumber.toLowerCase() === partNumber.toLowerCase()
    );
    const isDuplicateSkuInCatalog = !!existingListing;

    // 3. Make & Model
    let make = getVal('make');
    let model = getVal('model');
    if (!make) {
      messages.push('Missing vehicle Make (e.g. Toyota, VW).');
      hasError = true;
      make = 'Universal / Multi-Fit';
    }
    if (!model) {
      messages.push('Missing vehicle Model.');
      hasError = true;
      model = 'Universal';
    }

    // 4. Price validation
    const rawPrice = getVal('priceZAR');
    let priceZAR = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(priceZAR) || priceZAR <= 0) {
      messages.push(`Invalid price "${rawPrice || 'blank'}". Price in ZAR must be greater than R0.`);
      hasError = true;
      priceZAR = 0;
    }

    // 5. Year validation
    let yearStart = parseInt(getVal('yearStart'), 10);
    let yearEnd = parseInt(getVal('yearEnd'), 10);

    if (isNaN(yearStart) || yearStart < 1970 || yearStart > currentYear + 2) {
      yearStart = 2015;
      messages.push('Start year was empty or invalid (set default to 2015).');
      hasWarning = true;
    }
    if (isNaN(yearEnd) || yearEnd < yearStart || yearEnd > currentYear + 2) {
      yearEnd = Math.max(yearStart, currentYear);
    }

    // 6. Category & Condition
    const category = normalizeCategory(getVal('category'));
    const condition = normalizeCondition(getVal('condition'));
    const vehicleType = normalizeVehicleType(getVal('vehicleType'));

    // 7. Warranty & Stock
    let warrantyMonths = parseInt(getVal('warrantyMonths'), 10);
    if (isNaN(warrantyMonths) || warrantyMonths < 0) {
      warrantyMonths = 3; // Standard 3-month guarantee default
    }

    let stockCount = parseInt(getVal('stockCount'), 10);
    if (isNaN(stockCount) || stockCount < 1) {
      stockCount = 1;
    }

    // 8. Location Defaults
    const locationCity = getVal('locationCity') || currentSeller.city || 'Johannesburg';
    const locationProvince = normalizeProvince(getVal('locationProvince'), currentSeller.province || 'Gauteng');

    // 9. Delivery & Shipping
    const rawDelivery = getVal('isNationwideDelivery').toLowerCase();
    const isNationwideDelivery = rawDelivery.includes('yes') || rawDelivery.includes('true') || rawDelivery === '1' || rawDelivery === 'y';
    let deliveryCostZAR = parseFloat(getVal('deliveryCostZAR').replace(/[^0-9.]/g, ''));
    if (isNaN(deliveryCostZAR)) deliveryCostZAR = isNationwideDelivery ? 180 : 0;
    const deliveryDaysEstimate = getVal('deliveryDaysEstimate') || (isNationwideDelivery ? '1-3 business days' : 'Collection Only');

    // 10. Images
    const rawImage = getVal('images');
    let images: string[] = [];
    if (rawImage && (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('data:'))) {
      images = rawImage.split(',').map(s => s.trim()).filter(s => s.length > 5);
    }
    if (!images.length) {
      images = [CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES['Engine & Mechanical']];
      messages.push('No photo link provided; applied categorized high-resolution automotive image.');
      hasWarning = true;
    }

    // 11. Description
    const rawDesc = getVal('description');
    const description = rawDesc || `High-quality ${condition.toLowerCase()} ${title} for ${make} ${model} (${yearStart}-${yearEnd}). Inspected and certified by ${currentSeller.businessName}. Immediate dispatch available nationwide.`;

    const normalized: Omit<Listing, 'id' | 'dateAdded' | 'views' | 'inquiriesCount'> = {
      title,
      partNumber,
      oemNumber: getVal('oemNumber') || undefined,
      make,
      model,
      yearStart,
      yearEnd,
      engineSpec: getVal('engineSpec') || undefined,
      vehicleType,
      category,
      condition,
      priceZAR,
      originalPriceZAR: priceZAR > 0 ? Math.round(priceZAR * 1.15) : undefined,
      warrantyMonths,
      stockCount,
      locationCity,
      locationProvince,
      images,
      description,
      sellerId: currentSeller.id,
      sellerName: currentSeller.businessName,
      sellerPhone: currentSeller.phone,
      sellerWhatsApp: currentSeller.whatsapp,
      sellerEmail: currentSeller.email,
      sellerRating: currentSeller.rating,
      sellerVerified: currentSeller.verified,
      isFeatured: false,
      isNationwideDelivery,
      deliveryDaysEstimate,
      deliveryCostZAR
    };

    const status: 'valid' | 'warning' | 'error' = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

    return {
      rowNumber,
      raw: row,
      normalized,
      status,
      messages,
      isDuplicateSkuInCatalog,
      existingListingId: existingListing?.id
    };
  });
};

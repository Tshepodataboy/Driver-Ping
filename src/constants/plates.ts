import { Vehicle } from '../types/index.js';
import { SA_PROVINCES } from './provinces.js';

export interface NumberPlateOption {
  plateDisplay: string;         // e.g. "CF 10 VD GP"
  rawRegistration: string;      // e.g. "CF 10 VD"
  provinceCode: string;         // e.g. "GP"
  provinceName: string;         // e.g. "Gauteng"
  vehicleName?: string;         // e.g. "Volkswagen Golf TSI"
  categoryTag?: string;         // e.g. "Registered Vehicle" or "Official Sample"
}

/**
 * Standard South African number plates representing all 9 provinces,
 * verified demo vehicles, and official registrations.
 */
export const OFFICIAL_NUMBER_PLATES: NumberPlateOption[] = [
  // Gauteng (GP)
  {
    plateDisplay: 'CF 10 VD GP',
    rawRegistration: 'CF 10 VD',
    provinceCode: 'GP',
    provinceName: 'Gauteng',
    vehicleName: 'Gauteng Provincial Sample',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'CK 45 DF GP',
    rawRegistration: 'CK 45 DF',
    provinceCode: 'GP',
    provinceName: 'Gauteng',
    vehicleName: 'Alex Morgan · Verified Owner',
    categoryTag: 'Registered Vehicle',
  },
  {
    plateDisplay: 'BB 12 CD GP',
    rawRegistration: 'BB 12 CD',
    provinceCode: 'GP',
    provinceName: 'Gauteng',
    vehicleName: 'Johannesburg Metro',
    categoryTag: 'Gauteng Series',
  },
  {
    plateDisplay: 'DZ 44 KL GP',
    rawRegistration: 'DZ 44 KL',
    provinceCode: 'GP',
    provinceName: 'Gauteng',
    vehicleName: 'Pretoria / Tshwane Fleet',
    categoryTag: 'Gauteng Series',
  },
  {
    plateDisplay: 'GP 99 ZZ GP',
    rawRegistration: 'GP 99 ZZ',
    provinceCode: 'GP',
    provinceName: 'Gauteng',
    vehicleName: 'Centurion Commercial',
    categoryTag: 'Gauteng Series',
  },

  // Western Cape (WC)
  {
    plateDisplay: 'CA 812-482 WC',
    rawRegistration: '812-482',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    vehicleName: 'Volkswagen Golf TSI · Deep Blue',
    categoryTag: 'Registered Vehicle',
  },
  {
    plateDisplay: 'CA 234-890 WC',
    rawRegistration: '234-890',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    vehicleName: 'Cape Town Metro · Private Driver',
    categoryTag: 'Registered Vehicle',
  },
  {
    plateDisplay: 'CA 232-577 WC',
    rawRegistration: '232-577',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    vehicleName: 'Cape Town Metro',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'CAA 102-304 WC',
    rawRegistration: '102-304',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    vehicleName: 'Atlantic Seaboard / Helderberg',
    categoryTag: 'Western Cape Series',
  },
  {
    plateDisplay: 'CA 456-789 WC',
    rawRegistration: '456-789',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    vehicleName: 'Stellenbosch Winelands',
    categoryTag: 'Western Cape Series',
  },

  // KwaZulu-Natal (ZN)
  {
    plateDisplay: 'ND 913-317 ZN',
    rawRegistration: '913-317',
    provinceCode: 'ZN',
    provinceName: 'KwaZulu-Natal',
    vehicleName: 'Nissan Leaf Electric · Pearl White',
    categoryTag: 'Registered Vehicle',
  },
  {
    plateDisplay: 'NUR 18083',
    rawRegistration: '18083',
    provinceCode: 'ZN',
    provinceName: 'KwaZulu-Natal',
    vehicleName: 'Umhlanga / Durban North',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'NP 88201',
    rawRegistration: '88201',
    provinceCode: 'ZN',
    provinceName: 'KwaZulu-Natal',
    vehicleName: 'Pietermaritzburg Capital',
    categoryTag: 'KZN Series',
  },

  // Free State (FS)
  {
    plateDisplay: 'CAM 69 FS',
    rawRegistration: 'CAM 69',
    provinceCode: 'FS',
    provinceName: 'Free State',
    vehicleName: 'Bloemfontein Central',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'FS 123 FS',
    rawRegistration: 'FS 123',
    provinceCode: 'FS',
    provinceName: 'Free State',
    vehicleName: 'Welkom / Goldfields',
    categoryTag: 'Free State Series',
  },

  // North West (NW)
  {
    plateDisplay: 'KTZ 747 NW',
    rawRegistration: 'KTZ 747',
    provinceCode: 'NW',
    provinceName: 'North West',
    vehicleName: 'Rustenburg Platinum Belt',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'NW 892 NW',
    rawRegistration: 'NW 892',
    provinceCode: 'NW',
    provinceName: 'North West',
    vehicleName: 'Potchefstroom Academic',
    categoryTag: 'North West Series',
  },

  // Northern Cape (NC)
  {
    plateDisplay: 'BKK 973 NC',
    rawRegistration: 'BKK 973',
    provinceCode: 'NC',
    provinceName: 'Northern Cape',
    vehicleName: 'Kimberley Diamond City',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'NC 331 NC',
    rawRegistration: 'NC 331',
    provinceCode: 'NC',
    provinceName: 'Northern Cape',
    vehicleName: 'Upington Orange River',
    categoryTag: 'Northern Cape Series',
  },

  // Limpopo (L / LP)
  {
    plateDisplay: 'BKS 214 L',
    rawRegistration: 'BKS 214',
    provinceCode: 'LP',
    provinceName: 'Limpopo',
    vehicleName: 'Polokwane Capital',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'LMP 402 L',
    rawRegistration: 'LMP 402',
    provinceCode: 'LP',
    provinceName: 'Limpopo',
    vehicleName: 'Tzaneen Valley',
    categoryTag: 'Limpopo Series',
  },

  // Eastern Cape (EC)
  {
    plateDisplay: 'CBB 574 EC',
    rawRegistration: 'CBB 574',
    provinceCode: 'EC',
    provinceName: 'Eastern Cape',
    vehicleName: 'Gqeberha / Port Elizabeth',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'EC 777 EC',
    rawRegistration: 'EC 777',
    provinceCode: 'EC',
    provinceName: 'Eastern Cape',
    vehicleName: 'East London Buffalo City',
    categoryTag: 'Eastern Cape Series',
  },

  // Mpumalanga (MP)
  {
    plateDisplay: 'RGZ 191 MP',
    rawRegistration: 'RGZ 191',
    provinceCode: 'MP',
    provinceName: 'Mpumalanga',
    vehicleName: 'Mbombela / Nelspruit',
    categoryTag: 'Standard Tag',
  },
  {
    plateDisplay: 'DKH 512 MP',
    rawRegistration: 'DKH 512',
    provinceCode: 'MP',
    provinceName: 'Mpumalanga',
    vehicleName: 'Highveld Witbank',
    categoryTag: 'Mpumalanga Series',
  },
];

/**
 * Combines built-in plates with any vehicles registered in the application.
 */
export function getAllNumberPlates(extraVehicles: Vehicle[] = []): NumberPlateOption[] {
  const result: NumberPlateOption[] = [];
  const seenPlates = new Set<string>();

  // Add extra app vehicles first (if any)
  for (const veh of extraVehicles) {
    const display = veh.plateDisplay || veh.plateNormalized;
    if (!display) continue;
    const cleanNorm = display.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!seenPlates.has(cleanNorm)) {
      seenPlates.add(cleanNorm);

      // Detect province code
      let provCode = 'GP';
      let provName = 'Gauteng';
      for (const prov of SA_PROVINCES) {
        if (display.toUpperCase().endsWith(prov.code) || display.toUpperCase().startsWith(prov.code)) {
          provCode = prov.code;
          provName = prov.name;
          break;
        }
      }

      // Extract raw reg
      let rawReg = display;
      if (rawReg.toUpperCase().endsWith(` ${provCode}`)) {
        rawReg = rawReg.slice(0, -(provCode.length + 1)).trim();
      }

      result.push({
        plateDisplay: display,
        rawRegistration: rawReg,
        provinceCode: provCode,
        provinceName: provName,
        vehicleName: `${veh.make || ''} ${veh.model || ''}${veh.color ? ` · ${veh.color}` : ''}`.trim() || 'My Registered Vehicle',
        categoryTag: 'Your Vehicle',
      });
    }
  }

  // Add official number plates
  for (const plate of OFFICIAL_NUMBER_PLATES) {
    const cleanNorm = plate.plateDisplay.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!seenPlates.has(cleanNorm)) {
      seenPlates.add(cleanNorm);
      result.push(plate);
    }
  }

  return result;
}

/**
 * Filters number plates based on user input.
 * - When query is empty: returns all plates, with preferred province plates prioritized.
 * - When query has text: filters according to typed characters against plate, raw reg, province, or vehicle.
 */
export function filterNumberPlates(
  plates: NumberPlateOption[],
  query: string,
  preferredProvinceCode?: string
): NumberPlateOption[] {
  const trimmed = query.trim();

  if (!trimmed) {
    if (!preferredProvinceCode) {
      return plates;
    }
    const prefNorm = preferredProvinceCode.toUpperCase();
    return [...plates].sort((a, b) => {
      const aMatch = a.provinceCode.toUpperCase() === prefNorm;
      const bMatch = b.provinceCode.toUpperCase() === prefNorm;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  const cleanQuery = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '');

  return plates.filter((plate) => {
    const cleanDisplay = plate.plateDisplay.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanRaw = plate.rawRegistration.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const provCode = plate.provinceCode.toUpperCase();
    const provName = plate.provinceName.toUpperCase();
    const vehicleName = (plate.vehicleName || '').toUpperCase();

    return (
      cleanDisplay.includes(cleanQuery) ||
      cleanRaw.includes(cleanQuery) ||
      provCode.includes(cleanQuery) ||
      provName.includes(trimmed.toUpperCase()) ||
      vehicleName.includes(trimmed.toUpperCase())
    );
  });
}

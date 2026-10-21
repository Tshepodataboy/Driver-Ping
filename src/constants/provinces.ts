export interface SAProvince {
  code: string;
  name: string;
  fullName: string;
  plateExample: string;
  capital: string;
  cities: string[];
  searchTerms: string[];
}

// Ordered exactly as requested:
// Western Cape WC, KwaZulu-Natal ZN, North West NW, Free State FS, Northern Cape NC,
// Gauteng GP, Limpopo L, Eastern Cape EC and Mpumalanga MP
export const SA_PROVINCES: SAProvince[] = [
  {
    code: 'WC',
    name: 'Western Cape',
    fullName: 'Western Cape (WC)',
    plateExample: 'CA 232-577',
    capital: 'Cape Town',
    cities: ['Cape Town', 'Stellenbosch', 'George', 'Paarl', 'Hermanus', 'Mossel Bay', 'Worcester'],
    searchTerms: ['western cape', 'western', 'cape', 'wc'],
  },
  {
    code: 'ZN',
    name: 'KwaZulu-Natal',
    fullName: 'KwaZulu-Natal (ZN)',
    plateExample: 'NUR 18083',
    capital: 'Pietermaritzburg',
    cities: ['Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay', 'Umhlanga', 'Pinetown', 'Ballito'],
    searchTerms: ['kwazulu-natal', 'kwazulu natal', 'kwazulu', 'natal', 'kzn', 'zn'],
  },
  {
    code: 'NW',
    name: 'North West',
    fullName: 'North West (NW)',
    plateExample: 'KTZ 747 NW',
    capital: 'Mahikeng',
    cities: ['Rustenburg', 'Potchefstroom', 'Klerksdorp', 'Mahikeng', 'Brits', 'Orkney'],
    searchTerms: ['north west', 'north-west', 'northwest', 'north', 'west', 'nw'],
  },
  {
    code: 'FS',
    name: 'Free State',
    fullName: 'Free State (FS)',
    plateExample: 'CAM 69 FS',
    capital: 'Bloemfontein',
    cities: ['Bloemfontein', 'Welkom', 'Sasolburg', 'Bethlehem', 'Kroonstad', 'Parys'],
    searchTerms: ['free state', 'free-state', 'freestate', 'free', 'state', 'fs'],
  },
  {
    code: 'NC',
    name: 'Northern Cape',
    fullName: 'Northern Cape (NC)',
    plateExample: 'BKK 973 NC',
    capital: 'Kimberley',
    cities: ['Kimberley', 'Upington', 'Springbok', 'Kuruman', 'De Aar', 'Colesberg'],
    searchTerms: ['northern cape', 'northern', 'cape', 'nc'],
  },
  {
    code: 'GP',
    name: 'Gauteng',
    fullName: 'Gauteng (GP)',
    plateExample: 'CF 10 VD GP',
    capital: 'Johannesburg',
    cities: ['Johannesburg', 'Pretoria', 'Soweto', 'Centurion', 'Sandton', 'Midrand', 'Randburg', 'Benoni', 'Roodepoort'],
    searchTerms: ['gauteng', 'gp', 'gauteng province'],
  },
  {
    code: 'L',
    name: 'Limpopo',
    fullName: 'Limpopo (L)',
    plateExample: 'BKS 214 L',
    capital: 'Polokwane',
    cities: ['Polokwane', 'Tzaneen', 'Mokopane', 'Thohoyandou', 'Bela-Bela', 'Phalaborwa', 'Lephalale'],
    searchTerms: ['limpopo', 'limpopo province', 'l', 'lp'],
  },
  {
    code: 'EC',
    name: 'Eastern Cape',
    fullName: 'Eastern Cape (EC)',
    plateExample: 'CBB 574 EC',
    capital: 'Bhisho',
    cities: ['Gqeberha', 'Port Elizabeth', 'East London', 'Mthatha', 'Makhanda', 'Grahamstown', 'Kariega', 'Uitenhage'],
    searchTerms: ['eastern cape', 'eastern', 'cape', 'ec'],
  },
  {
    code: 'MP',
    name: 'Mpumalanga',
    fullName: 'Mpumalanga (MP)',
    plateExample: 'RGZ 191 MP',
    capital: 'Mbombela',
    cities: ['Mbombela', 'Nelspruit', 'Witbank', 'Emalahleni', 'Middelburg', 'Secunda', 'White River'],
    searchTerms: ['mpumalanga', 'mpumalanga province', 'mp'],
  },
];

/**
 * Searches provinces strictly by province name and province code (not cities).
 */
export function searchProvinces(query: string): SAProvince[] {
  const rawClean = query.trim().toLowerCase();
  if (!rawClean) return [];

  const alphaNumClean = rawClean.replace(/[^a-z0-9]/g, '');

  return SA_PROVINCES.filter((prov) => {
    // 1. Province code exact or prefix match (e.g. "GP", "WC", "ZN", "FS", "NW", "NC", "EC", "MP", "L", "LP")
    const codeLower = prov.code.toLowerCase();
    if (codeLower === rawClean || codeLower === alphaNumClean) return true;

    // Special official aliases for province codes
    if (prov.code === 'ZN' && (rawClean === 'kzn' || alphaNumClean === 'kzn')) return true;
    if (prov.code === 'L' && (rawClean === 'lp' || alphaNumClean === 'lp')) return true;

    // 2. Province full name includes search query (e.g. "gauteng", "western cape", "limpopo", "natal")
    const nameLower = prov.name.toLowerCase();
    if (nameLower.includes(rawClean)) return true;

    // Normalized comparison ignoring spaces and hyphens (e.g. "westerncape" -> "western cape", "kwazulunatal" -> "kwazulu-natal")
    const nameAlphaNum = nameLower.replace(/[^a-z0-9]/g, '');
    if (nameAlphaNum.includes(alphaNumClean)) return true;

    // 3. Search terms (only province name variations, never cities)
    return prov.searchTerms.some((term) => {
      const termLower = term.toLowerCase();
      return termLower.includes(rawClean) || termLower.replace(/[^a-z0-9]/g, '').includes(alphaNumClean);
    });
  });
}

export const PROVINCES = SA_PROVINCES;

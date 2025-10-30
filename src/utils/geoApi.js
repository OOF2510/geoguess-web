const API_URL = 'https://geo.api.oof2510.space/getImage';

export async function getImageWithCountry() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'User-Agent': 'geoguess-web/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.imageUrl || !data.coordinates) {
      throw new Error('Invalid API response');
    }

    const image = {
      url: data.imageUrl,
      coord: {
        lat: data.coordinates.lat,
        lon: data.coordinates.lon,
      },
    };

    const normalizedCountryName = data.countryName
      ? normalizeCountry(data.countryName)
      : '';
    const normalizedCountryCode = data.countryCode
      ? data.countryCode.trim().toUpperCase()
      : '';
    const displayName =
      (data.countryName && data.countryName.trim()) ||
      normalizedCountryCode ||
      'Unknown';

    const hasCountry = Boolean(
      normalizedCountryName || normalizedCountryCode,
    );

    const countryInfo = hasCountry
      ? {
          country:
            normalizedCountryName || normalizedCountryCode.toLowerCase(),
          countryCode: normalizedCountryCode,
          displayName,
        }
      : null;

    return { image, countryInfo };
  } catch (error) {
    console.error('Error fetching image with country:', error);
    return null;
  }
}

export function normalizeCountry(text) {
  const normalized = (text || '').trim().toLowerCase();
  return normalized
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchGuess(guess, country, code) {
  if (!guess) return false;
  if (code && (guess === code || guess === code.toLowerCase())) return true;
  if (!country) return false;
  const aliases = countryAliases(country, code);
  return aliases.some(alias => guess === alias);
}

export function countryAliases(country, code) {
  const base = new Set();
  const c = (country || '').toLowerCase();
  const cc = (code || '').toLowerCase();

  if (c) base.add(c);
  if (cc) base.add(cc);

  if (c.includes('united states')) {
    base.add('usa');
    base.add('us');
    base.add('united states of america');
    base.add('america');
  }
  if (c.includes('united kingdom')) {
    base.add('uk');
    base.add('great britain');
    base.add('britain');
    base.add('england');
  }
  if (c.includes('russia')) {
    base.add('russian federation');
  }
  if (c.includes('south korea')) {
    base.add('korea');
    base.add('republic of korea');
  }
  if (c.includes('north korea')) {
    base.add('dprk');
    base.add('democratic peoples republic of korea');
  }
  if (c.includes('united arab emirates') || c === 'uae') {
    base.add('united arab emirates');
    base.add('uae');
  }
  if (c.includes('czechia')) {
    base.add('czech republic');
  }
  if (c.includes('eswatini')) {
    base.add('swaziland');
  }
  if (c.includes('east timor')) {
    base.add('timor leste');
  }
  if (
    c.includes('ivory coast') ||
    c.includes("côte d'ivoire") ||
    c.includes('cote divoire')
  ) {
    base.add('cote divoire');
    base.add("cote d'ivoire");
    base.add('ivory coast');
  }

  return Array.from(base);
}

const SQFT_PER_SQM = 10.7639104;
// Both units, because Dubai clients think in square feet while the data is stored in square metres.
export const formatArea = (sqm) => {
  const whole = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
  return `${whole.format(sqm)} m\u00B2 (${whole.format(sqm * SQFT_PER_SQM)} sq ft)`;
};

export const paragraphs = (text) => (text ?? '').split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

export const formatProjectLocation = ({ title, city, country }) => {
  const cityParts = (city ?? '').split(',').map((part) => part.trim()).filter(Boolean);
  const [district, ...remainingCity] = cityParts;
  const repeatedDistrict = remainingCity.length > 0
    && title.toLowerCase().includes(district.toLowerCase());
  const visibleCity = (repeatedDistrict ? remainingCity : cityParts).join(', ');
  return [visibleCity, country].filter(Boolean).join(', ');
};

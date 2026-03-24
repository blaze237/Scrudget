export const theme = {
  colors: {
    background: '#0d1b2a',
    surface: '#1b2838',
    surfaceLight: '#243447',
    border: '#2a3a4a',
    accent: '#e8871e',
    accentDark: '#c06e10',
    positive: '#2ecc71',
    negative: '#e74c3c',
    textPrimary: '#ffffff',
    textSecondary: '#8899aa',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
  },
  fontSize: {
    sm: 13,
    md: 16,
    lg: 20,
    xl: 28,
  },
};

export const formatCurrency = (amount: number): string => {
  const prefix = amount >= 0 ? '+ ' : '- ';
  return `${prefix}£ ${Math.abs(amount).toFixed(2)}`;
};

export const formatCurrencyShort = (amount: number): string => {
  return `£${Math.abs(amount).toFixed(2)}`;
};

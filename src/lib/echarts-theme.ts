/**
 * AMORA ECharts Brand Theme
 * Brand Blue: #1D4ED8 — per brand.html spec (Franklyn / George 2026-03-15)
 * Background: transparent (inherits #060D1C / gray-950 from page)
 */

export const AMORA_ECHARTS_THEME = {
  color: [
    '#1D4ED8', // Brand Blue — primary series
    '#3B82F6', // blue-500 — secondary series
    '#60A5FA', // blue-400
    '#93C5FD', // blue-300
    '#BFDBFE', // blue-200
    '#2563EB', // blue-600 — accent
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#9CA3AF', // gray-400
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  title: {
    textStyle: { color: '#F9FAFB', fontWeight: '600' },
    subtextStyle: { color: '#6B7280' },
  },
  legend: {
    textStyle: { color: '#9CA3AF' },
  },
  tooltip: {
    backgroundColor: '#111827',   // gray-900
    borderColor: '#1D4ED8',        // Brand Blue border
    borderWidth: 1,
    textStyle: { color: '#F3F4F6', fontSize: 13 },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 16px rgba(29,78,216,0.25);',
  },
  axisLine: { lineStyle: { color: '#374151' } },   // gray-700
  axisTick: { lineStyle: { color: '#374151' } },
  axisLabel: { color: '#6B7280' },                  // gray-500
  splitLine: { lineStyle: { color: '#1F2937', type: 'dashed' } }, // gray-800
  grid: { borderColor: '#374151' },
  line: {
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2 },
    itemStyle: { borderWidth: 2 },
  },
  bar: {
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },
};

export const AMORA_THEME_NAME = 'amora-dark';

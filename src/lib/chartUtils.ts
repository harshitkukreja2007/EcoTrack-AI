export interface HistoryEntry {
  date: string;
  co2Output: number; // tons/year
  ecoScore: number;
}

export interface ChartPoint {
  x: number;
  y: number;
  data: HistoryEntry;
}

export interface ChartDataResult {
  points: ChartPoint[];
  linePath: string;
  areaPath: string;
  minVal: number;
  maxVal: number;
}

export const getChartPaths = (
  history: HistoryEntry[],
  chartWidth: number,
  chartHeight: number,
  paddingX: number,
  paddingY: number
): ChartDataResult | null => {
  if (!history || history.length === 0) return null;

  const co2Values = history.map((h) => h.co2Output);
  const maxVal = Math.max(...co2Values, 12);
  const minVal = Math.min(...co2Values, 0);

  const range = maxVal - minVal || 1;
  const points: ChartPoint[] = [];

  history.forEach((entry, idx) => {
    const x = paddingX + (idx * (chartWidth - 2 * paddingX)) / Math.max(1, history.length - 1);
    const y = chartHeight - paddingY - ((entry.co2Output - minVal) * (chartHeight - 2 * paddingY)) / range;
    points.push({ x, y, data: entry });
  });

  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${chartHeight - paddingY} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
      areaPath += ` L ${points[i].x} ${points[i].y}`;
    }

    areaPath += ` L ${points[points.length - 1].x} ${chartHeight - paddingY} Z`;
  }

  return { points, linePath, areaPath, minVal, maxVal };
};

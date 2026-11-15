// Converts an Unreal point-cloud export ({count,x[],y[],z[]} in centimeters) into a
// compact heightmap for the SciChart map:
//   public/data/world-heightmap.bin   Float32 top-surface heights in meters, row-major, NaN = no data
//   public/data/world-points.bin      every point: u16 cols, u16 rows, f32 heights (see meta.pointCount)
//   public/data/world-heightmap.json  { cols, rows, cellSize, minHeight, maxHeight, colorMin, colorMax }
//
// Usage: node scripts/convertPointcloud.mjs "G:/Fluke Games/PointcloudData/pointcloudUnrealData1.json"
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/convertPointcloud.mjs <pointcloud.json>');
  process.exit(1);
}

const CM_PER_M = 100;
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data');

const data = JSON.parse(readFileSync(input, 'utf8'));
const { x, y, z } = data;
const n = x.length;
if (y.length !== n || z.length !== n) throw new Error('x, y, z lengths differ');

const sortedQuantile = (arr, p) => {
  const s = Float64Array.from(arr).sort();
  return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
};

// Grid spacing = smallest positive step between unique sorted X values
// (round first: the export has sub-unit float noise that would otherwise create fake columns)
const ux = [...new Set(x.map((v) => Math.round(v)))].sort((a, b) => a - b);
let step = Infinity;
for (let i = 1; i < ux.length; i += 1) {
  const d = ux[i] - ux[i - 1];
  if (d > 1 && d < step) step = d;
}
console.log(`Detected grid step: ${step} units`);

// Crop stray outlier points far from the main block
const xLo = sortedQuantile(x, 0.002);
const xHi = sortedQuantile(x, 0.998);
const yLo = sortedQuantile(y, 0.002);
const yHi = sortedQuantile(y, 0.998);

const cols = Math.round((xHi - xLo) / step) + 1;
const rows = Math.round((yHi - yLo) / step) + 1;
const grid = new Float32Array(cols * rows).fill(NaN);

let kept = 0;
let minH = Infinity;
let maxH = -Infinity;
const heights = [];
// Every kept point (column, row, height). The export can hold several heights per
// map position (terrain + cliffs/overhangs), so the surface grid uses the TOP height
// per cell while the scatter series keeps all points.
const ptCol = new Uint16Array(n);
const ptRow = new Uint16Array(n);
const ptZ = new Float32Array(n);
for (let i = 0; i < n; i += 1) {
  if (x[i] < xLo - step / 2 || x[i] > xHi + step / 2 || y[i] < yLo - step / 2 || y[i] > yHi + step / 2) continue;
  const c = Math.round((x[i] - xLo) / step);
  const r = Math.round((y[i] - yLo) / step);
  if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
  const h = z[i] / CM_PER_M;
  const cell = r * cols + c;
  if (Number.isNaN(grid[cell]) || h > grid[cell]) grid[cell] = h;
  ptCol[kept] = c;
  ptRow[kept] = r;
  ptZ[kept] = h;
  heights.push(h);
  minH = Math.min(minH, h);
  maxH = Math.max(maxH, h);
  kept += 1;
}

let filledCells = 0;
for (let i = 0; i < grid.length; i += 1) if (!Number.isNaN(grid[i])) filledCells += 1;

const meta = {
  cols,
  rows,
  pointCount: kept,
  cellSize: step / CM_PER_M,
  minHeight: minH,
  maxHeight: maxH,
  // Colour ramp ignores the extreme 1% tails so a few spikes don't wash out the map
  colorMin: sortedQuantile(heights, 0.01),
  colorMax: sortedQuantile(heights, 0.99),
};

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'world-heightmap.bin'), Buffer.from(grid.buffer));
writeFileSync(resolve(outDir, 'world-heightmap.json'), JSON.stringify(meta, null, 2));

// All points, laid out as [cols: u16 x kept][rows: u16 x kept][heights: f32 x kept]
const points = Buffer.concat([
  Buffer.from(ptCol.buffer, 0, kept * 2),
  Buffer.from(ptRow.buffer, 0, kept * 2),
  Buffer.from(ptZ.buffer, 0, kept * 4),
]);
writeFileSync(resolve(outDir, 'world-points.bin'), points);

console.log(`Input points: ${n}, kept: ${kept}, dropped outliers: ${n - kept}`);
console.log(`Grid ${cols} x ${rows} (${(cols * rows).toLocaleString()} cells), ${filledCells.toLocaleString()} filled (${((filledCells / (cols * rows)) * 100).toFixed(1)}%)`);
console.log(meta);

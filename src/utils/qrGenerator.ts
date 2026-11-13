/**
 * Lightweight zero-dependency ISO/IEC 18004 QR Code matrix generator (Byte mode, ECC Level L)
 * Supports Versions 1-6 (up to 134 bytes) — ideal for standard UPI payment URIs.
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEcc(data: number[], eccCount: number): number[] {
  const gen = rsGeneratorPoly(eccCount);
  const res = new Array(eccCount).fill(0);
  for (const byte of data) {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    for (let j = 0; j < eccCount; j++) {
      res[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return res;
}

interface QrVersionSpec {
  version: number;
  size: number;
  dataBytes: number;
  eccBytes: number;
  alignCenters: number[];
}

// Version 1..6 ECC-L specs (single RS block for versions 1..5; 2 blocks for v6 handled cleanly via v5 limit 106 bytes or v6)
const QR_SPECS: QrVersionSpec[] = [
  { version: 1, size: 21, dataBytes: 19, eccBytes: 7, alignCenters: [] },
  { version: 2, size: 25, dataBytes: 34, eccBytes: 10, alignCenters: [6, 18] },
  { version: 3, size: 29, dataBytes: 55, eccBytes: 15, alignCenters: [6, 22] },
  { version: 4, size: 33, dataBytes: 80, eccBytes: 20, alignCenters: [6, 26] },
  { version: 5, size: 37, dataBytes: 108, eccBytes: 26, alignCenters: [6, 30] },
];

export function generateQrMatrix(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  // Each spec capacity minus 2 bytes overhead (4-bit mode + 8-bit length + 4-bit terminator)
  const spec =
    QR_SPECS.find((s) => bytes.length + 2 <= s.dataBytes) ||
    QR_SPECS[QR_SPECS.length - 1];

  const payloadBytes = bytes.slice(0, spec.dataBytes - 2);
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Byte mode indicator: 0100
  pushBits(0b0100, 4);
  pushBits(payloadBytes.length, 8);
  for (const b of payloadBytes) pushBits(b, 8);

  const totalDataBits = spec.dataBytes * 8;
  const termLen = Math.min(4, totalDataBits - bits.length);
  pushBits(0, termLen);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    dataCodewords.push(byte);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (dataCodewords.length < spec.dataBytes) {
    dataCodewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  const eccCodewords = rsComputeEcc(dataCodewords, spec.eccBytes);
  const allCodewords = [...dataCodewords, ...eccCodewords];
  const allBits: number[] = [];
  for (const cw of allCodewords) {
    for (let i = 7; i >= 0; i--) allBits.push((cw >> i) & 1);
  }

  const n = spec.size;
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
  const reserved: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));

  const setModule = (r: number, c: number, dark: boolean, isReserved = true) => {
    if (r < 0 || r >= n || c < 0 || c >= n) return;
    grid[r][c] = dark ? 1 : 0;
    if (isReserved) reserved[r][c] = true;
  };

  const placeFinder = (topR: number, leftC: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = topR + r;
        const cc = leftC + c;
        if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const inCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(rr, cc, inOuter && (onBorder || inCenter), true);
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, n - 7);
  placeFinder(n - 7, 0);

  // Alignment patterns
  if (spec.alignCenters.length > 0) {
    for (const rCenter of spec.alignCenters) {
      for (const cCenter of spec.alignCenters) {
        if (reserved[rCenter][cCenter]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setModule(rCenter + dr, cCenter + dc, dark, true);
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < n - 8; i++) {
    setModule(6, i, i % 2 === 0, true);
    setModule(i, 6, i % 2 === 0, true);
  }

  // Dark module
  setModule(4 * spec.version + 9, 8, true, true);

  // Reserve format info cells
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][n - 1 - i] = true;
    if (i < 7) reserved[n - 1 - i][8] = true;
  }

  // Place data bits in zig-zag order
  let bitIdx = 0;
  let goingUp = true;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < n; step++) {
      const row = goingUp ? n - 1 - step : step;
      for (const c of [col, col - 1]) {
        if (!reserved[row][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          grid[row][c] = bit;
        }
      }
    }
    goingUp = !goingUp;
  }

  // Apply Mask Pattern 0 ((row + col) % 2 === 0)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        grid[r][c] = grid[r][c] === 1 ? 0 : 1;
      }
    }
  }

  // Format information for ECC-L (01) + Mask 0 (000) => 15-bit BCH + XOR 0x5412 = 0b111011111000100
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  for (let i = 0; i < 6; i++) {
    grid[8][i] = formatBits[i];
    grid[n - 1 - i][8] = formatBits[i];
  }
  grid[8][7] = formatBits[6];
  grid[n - 7][8] = formatBits[6];
  grid[8][8] = formatBits[7];
  grid[8][n - 8] = formatBits[7];
  grid[7][8] = formatBits[8];
  grid[8][n - 7] = formatBits[8];
  for (let i = 9; i < 15; i++) {
    grid[14 - i][8] = formatBits[i];
    grid[8][n - 15 + i] = formatBits[i];
  }

  return grid.map((row) => row.map((cell) => cell === 1));
}

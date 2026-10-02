import { useTranslation } from 'react-i18next';

export interface VoucherQrProps {
  /** Voucher code the QR stands for (PRD §9.3/§11). */
  code: string;
  size?: number;
}

/**
 * Deterministic offline pseudo-QR for the mock milestone: a hash-seeded
 * module grid with the three finder patterns, plus the plain-code fallback
 * printed underneath. Phase 2 swaps this for a real QR encoder without
 * changing call sites.
 */
export function VoucherQr({ code, size = 168 }: VoucherQrProps) {
  const { t } = useTranslation();
  const modules = 21;
  const grid = buildGrid(code, modules);
  const cell = 100 / modules;
  return (
    <figure className="flex flex-col items-center gap-2">
      <svg
        data-testid="voucher-qr"
        role="img"
        aria-label={t('zhiya.commons.qr.label', { code })}
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
        className="rounded-xl border border-border-subtle bg-white p-2"
      >
        {grid.map((row, rowIndex) =>
          row.map((filled, colIndex) =>
            filled ? (
              <rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * cell}
                y={rowIndex * cell}
                width={cell}
                height={cell}
                fill="#18181b"
              />
            ) : null,
          ),
        )}
      </svg>
      <figcaption className="font-mono text-sm tracking-widest text-primary">{code}</figcaption>
      <p className="text-xs text-muted">{t('zhiya.commons.qr.hint')}</p>
    </figure>
  );
}

function hashChar(code: string, index: number): number {
  let hash = 5381;
  const source = `${code}:${index}`;
  for (let position = 0; position < source.length; position += 1) {
    hash = ((hash << 5) + hash + source.charCodeAt(position)) | 0;
  }
  return Math.abs(hash);
}

function buildGrid(code: string, modules: number): boolean[][] {
  const grid: boolean[][] = Array.from({ length: modules }, () => Array.from({ length: modules }, () => false));
  const inFinder = (row: number, col: number): boolean => {
    const finder = (top: number, left: number): boolean =>
      row >= top && row < top + 7 && col >= left && col < left + 7;
    return finder(0, 0) || finder(0, modules - 7) || finder(modules - 7, 0);
  };
  for (let row = 0; row < modules; row += 1) {
    for (let col = 0; col < modules; col += 1) {
      if (inFinder(row, col)) {
        continue;
      }
      grid[row]![col] = hashChar(code, row * modules + col) % 3 !== 0;
    }
  }
  drawFinder(grid, 0, 0);
  drawFinder(grid, 0, modules - 7);
  drawFinder(grid, modules - 7, 0);
  return grid;
}

function drawFinder(grid: boolean[][], top: number, left: number): void {
  // Standard 7×7 finder: filled border ring, white ring, filled 3×3 center.
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const ring = Math.max(Math.abs(row - 3), Math.abs(col - 3));
      grid[top + row]![left + col] = ring !== 2;
    }
  }
}

export function qrModuleCount(code: string): number {
  return buildGrid(code, 21).flat().filter(Boolean).length;
}

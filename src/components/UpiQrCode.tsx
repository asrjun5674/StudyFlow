import React, { useMemo } from 'react';
import { generateQrMatrix } from '../utils/qrGenerator';
import { UPI_NUMBER, UPI_VPA } from '../utils/proAndPlugins';

interface UpiQrCodeProps {
  upiUri: string;
  amountInr: number;
  planName: string;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({ upiUri, amountInr, planName }) => {
  const matrix = useMemo(() => generateQrMatrix(upiUri), [upiUri]);
  const n = matrix.length;
  const quiet = 2;
  const viewSize = n + quiet * 2;

  return (
    <div className="inline-flex flex-col items-center p-4 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
          Scan &amp; Pay via Any UPI App
        </span>
      </div>

      <svg
        width="184"
        height="184"
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={`UPI QR Code for paying ₹${amountInr} to ${UPI_VPA}`}
        className="rounded-lg bg-white"
      >
        <rect x="0" y="0" width={viewSize} height={viewSize} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((dark, c) =>
            dark ? (
              <rect
                key={`${r}-${c}`}
                x={c + quiet}
                y={r + quiet}
                width="1"
                height="1"
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>

      <div className="mt-2.5 text-center space-y-0.5">
        <div className="text-xs font-extrabold text-slate-900 font-mono">
          {UPI_VPA}
        </div>
        <div className="text-[11px] text-slate-600 font-semibold">
          UPI Mobile: <span className="font-mono text-emerald-700">{UPI_NUMBER}</span> • ₹{amountInr} ({planName})
        </div>
      </div>
    </div>
  );
};

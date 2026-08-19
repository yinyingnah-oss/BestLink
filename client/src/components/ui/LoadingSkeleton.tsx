import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="w-10 h-10 text-matcha-500 animate-spin" />
      <p className="text-stone-500 font-medium animate-pulse">正在加载数据，请稍候...</p>
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <div className="w-full bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
      <div className="flex border-b border-stone-100 bg-stone-50 p-4 gap-4">
        {Array(columns).fill(0).map((_, i) => (
          <div key={`th-${i}`} className="h-4 bg-stone-200 rounded animate-pulse flex-1"></div>
        ))}
      </div>
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={`tr-${rowIndex}`} className="flex border-b border-stone-50 p-4 gap-4">
          {Array(columns).fill(0).map((_, colIndex) => (
            <div key={`td-${rowIndex}-${colIndex}`} className="h-10 bg-stone-100 rounded animate-[shimmer_2s_infinite] flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

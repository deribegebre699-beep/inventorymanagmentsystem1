import React, { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataViewProps<T> {
  data: T[];
  columns: Column<T>[];
  cardRender: (item: T, index: number) => React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  emptySubMessage?: string;
  keyExtractor: (item: T) => string | number;
  animated?: boolean;
}

function DataView<T>({
  data,
  columns,
  cardRender,
  emptyIcon,
  emptyMessage = 'No data found.',
  emptySubMessage,
  keyExtractor,
  // animated = true,
}: DataViewProps<T>) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showCards = isMobile || viewMode === 'card';

  return (
    <div>
      {/* Desktop toggle */}
      {!isMobile && (
        <div className="flex justify-end mb-3">
          <div className="bg-slate-100 rounded-lg p-0.5 flex items-center gap-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-12 text-center text-slate-500">
          {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
          <p className="text-base text-slate-600 font-medium">{emptyMessage}</p>
          {emptySubMessage && <p className="text-sm text-slate-400 mt-1">{emptySubMessage}</p>}
        </div>
      ) : showCards ? (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, index) => (
            <div key={keyExtractor(item)}>
              {cardRender(item, index)}
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-sm uppercase tracking-wider">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-6 py-4 font-semibold ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={keyExtractor(item)} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                        }`}
                      >
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataView;

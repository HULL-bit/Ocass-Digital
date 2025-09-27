import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { Search, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react';
import Button from './Button';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  exportable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  virtualizeRows?: boolean;
  pageSize?: number;
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  onRowClick,
  selectable = false,
  exportable = false,
  searchable = true,
  filterable = true,
  virtualizeRows = false,
  pageSize = 50,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: selectable,
  });

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const selectedCount = Object.keys(rowSelection).length;

  const exportData = () => {
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...data.map(row => 
        columns.map(col => {
          const value = (row as any)[col.accessorKey as string];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-dark-800 dark:to-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Rechercher..."
                  className="input-premium pl-10 w-64"
                />
              </div>
            )}
            
            {filterable && (
              <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>
                Filtres
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectable && selectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedCount} sélectionné(s)
                </span>
                <Button variant="secondary" size="sm">
                  Actions groupées
                </Button>
              </motion.div>
            )}
            
            {exportable && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={exportData}
              >
                Exporter
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{table.getFilteredRowModel().rows.length} résultat(s)</span>
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span>Chargement...</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="relative">
        {virtualizeRows ? (
          <div ref={parentRef} className="h-96 overflow-auto">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className="flex-1 text-sm text-gray-900 dark:text-gray-100"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  {table.getHeaderGroups()[0]?.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp 
                              className={`w-3 h-3 ${
                                header.column.getIsSorted() === 'asc' 
                                  ? 'text-primary-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                            <ChevronDown 
                              className={`w-3 h-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc' 
                                  ? 'text-primary-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors"
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-dark-800 bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-300">Chargement des données...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
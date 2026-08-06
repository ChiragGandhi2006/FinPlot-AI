import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import EmptyState from './EmptyState'
import { SearchX } from 'lucide-react'

export default function DataTable({ columns, data, loading, pageSize = 8, emptyComponent }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => c.key === sortKey)
    const getVal = col?.sortValue || ((r) => r[sortKey])
    return [...data].sort((a, b) => {
      const av = getVal(a)
      const bv = getVal(b)
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [data, sortKey, sortDir, columns])

  useEffect(() => {
    setPage(1)
  }, [data.length])

  const totalPages = Math.max(Math.ceil(sorted.length / pageSize), 1)
  const safePage = Math.min(page, totalPages)
  const rows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      ) : (
                        <ChevronsUpDown size={12} className="opacity-50" />
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-4">
                      <Skeleton height={16} width={c.loadingWidth || 100} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyComponent || (
                    <EmptyState
                      icon={SearchX}
                      title="Nothing here"
                      description="Try adjusting your filters or add a new record."
                    />
                  )}
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {rows.map((row) => (
                  <motion.tr
                    key={row.id ?? row[columns[0]?.key]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="group border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/50 dark:hover:bg-slate-800/40"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 text-sm ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-2 py-3 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-400">
            Showing <b>{sorted.length ? (safePage - 1) * pageSize + 1 : 0}</b>–<b>{Math.min(safePage * pageSize, sorted.length)}</b> of <b>{sorted.length}</b>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-16 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

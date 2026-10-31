import { AdminEmptyState } from './AdminState'

function alignClass(align) {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function SkeletonRows({ count }) {
  return Array.from({ length: count }, (_, index) => (
    <tr key={index} className="border-b border-[#f1f5f9] last:border-0">
      {Array.from({ length: 5 }, (_, cellIndex) => (
        <td key={cellIndex} className="px-4 py-3.5">
          <span className="block h-3 w-24 animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ))
}

export default function AdminDataTable({
  columns,
  rows,
  getRowId,
  loading = false,
  loadingRows = 4,
  emptyTitle = 'Nothing to show yet',
  emptyDescription = 'New records will appear here once they are added.',
  emptyAction,
}) {
  if (!loading && rows.length === 0) {
    return (
      <AdminEmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }

  const firstColumn = columns[0]
  const detailColumns = columns.slice(1)

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f1f5f9]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-slate-500 ${alignClass(column.align)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows count={loadingRows} />
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-[#f1f5f9] transition-colors last:border-0 hover:bg-[#f8fafc]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3.5 align-middle text-[12.5px] text-slate-600 ${alignClass(column.align)} ${column.className ?? ''}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-[#f1f5f9] md:hidden">
        {loading
          ? Array.from({ length: loadingRows }, (_, index) => (
              <li key={index} className="space-y-3 px-4 py-4">
                <span className="block h-4 w-40 animate-pulse rounded bg-slate-100" />
                <span className="block h-3 w-28 animate-pulse rounded bg-slate-100" />
                <span className="block h-3 w-32 animate-pulse rounded bg-slate-100" />
              </li>
            ))
          : rows.map((row) => (
              <li key={getRowId(row)} className="px-4 py-4">
                <div className="min-w-0">{firstColumn.render(row)}</div>
                <dl className="mt-3 grid gap-2">
                  {detailColumns
                    .filter((column) => column.mobile !== false)
                    .map((column) => (
                      <div
                        key={column.key}
                        className="flex items-start justify-between gap-3 text-[12px]"
                      >
                        <dt className="shrink-0 font-medium text-slate-500">{column.header}</dt>
                        <dd className="min-w-0 text-right text-slate-700">{column.render(row)}</dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
      </ul>
    </>
  )
}

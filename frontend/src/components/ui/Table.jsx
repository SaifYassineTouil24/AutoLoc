export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </td>
  )
}

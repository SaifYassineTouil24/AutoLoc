import { forwardRef } from 'react'

const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select
        ref={ref}
        className={`
          block w-full rounded-lg border px-3 py-2 text-sm shadow-sm
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 dark:disabled:bg-gray-700
          ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Select

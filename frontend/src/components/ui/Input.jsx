import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ label, error, icon: Icon, className = '', ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
        )}
        <input
          ref={ref}
          className={`input ${Icon ? 'pl-10' : ''} ${error ? '!border-red-400 focus:!ring-red-500/15' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select ref={ref} className={`input appearance-none pr-9 ${error ? '!border-red-400' : ''} ${className}`} {...props}>
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, className = '', ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea ref={ref} className={`input min-h-[90px] resize-none ${error ? '!border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
})

export function Field({ label, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
    </div>
  )
}

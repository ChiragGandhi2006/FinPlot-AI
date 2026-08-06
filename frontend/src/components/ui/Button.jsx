import { forwardRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  icon: 'btn-icon',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon: Icon, children, className = '', loading = false, disabled, onClick, ...props },
  ref
) {
  const handleClick = useCallback(
    (e) => {
      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const ripple = document.createElement('span')
      const diameter = Math.max(rect.width, rect.height)
      ripple.style.width = ripple.style.height = `${diameter}px`
      ripple.style.left = `${e.clientX - rect.left - diameter / 2}px`
      ripple.style.top = `${e.clientY - rect.top - diameter / 2}px`
      ripple.className = 'ripple-ink'
      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 700)
      onClick?.(e)
    },
    [onClick]
  )

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={size !== 'icon' ? { y: -1 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} strokeWidth={2.2} />
      )}
      {children}
    </motion.button>
  )
})

export default Button

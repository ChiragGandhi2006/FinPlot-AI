import Skeleton from 'react-loading-skeleton'

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <Skeleton height={14} width={120} containerClassName="mb-3" />
      <Skeleton height={28} width={160} />
      <Skeleton height={12} width={90} className="mt-3" />
    </div>
  )
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <Skeleton height={16} width={180} containerClassName="mb-6" />
      <Skeleton height={200} containerClassName="flex-1" />
    </div>
  )
}

export default Skeleton

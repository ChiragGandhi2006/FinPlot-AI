import CountUp from 'react-countup'

export default function AnimatedNumber({ value, duration = 1.6, prefix = '', suffix = '', decimals = 0, className = '', formattingFn }) {
  return (
    <CountUp
      end={Number(value || 0)}
      duration={duration}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      formattingFn={formattingFn}
      className={className}
      separator=","
    />
  )
}

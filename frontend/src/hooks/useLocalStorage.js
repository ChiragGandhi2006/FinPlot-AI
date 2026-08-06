import { useEffect, useRef, useState } from 'react'
import { getItem, setItem } from '../utils/storage'

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => getItem(key, fallback))

  useEffect(() => {
    setItem(key, value)
  }, [key, value])

  return [value, setValue]
}

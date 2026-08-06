import { useEffect, useState } from 'react'
import { getSettings, subscribeSettings } from '../utils/storage'

export function useSettings() {
  const [settings, setSettings] = useState(getSettings)
  useEffect(() => subscribeSettings(setSettings), [])
  return settings
}

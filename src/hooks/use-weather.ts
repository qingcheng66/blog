"use client"

import { useEffect, useState } from "react"
import { site } from "@/data/site"

export interface WeatherData {
  temp: string
  text: string
  loading: boolean
  error: boolean
}

/** Fetch QWeather now API once on mount. Returns weather data with loading state. */
export function useWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>({
    temp: "--°C",
    text: "",
    loading: true,
    error: false,
  })

  useEffect(() => {
    let cancelled = false
    const { apiHost, apiKey, locationId } = site.weather
    const url = `https://${apiHost}/v7/weather/now?location=${locationId}&key=${apiKey}`

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.code === "200" && json.now) {
          setData({
            temp: `${json.now.temp}°C`,
            text: json.now.text || "",
            loading: false,
            error: false,
          })
        } else {
          setData((prev) => ({ ...prev, loading: false, error: true }))
        }
      })
      .catch(() => {
        if (!cancelled) setData((prev) => ({ ...prev, loading: false, error: true }))
      })

    return () => { cancelled = true }
  }, [])

  return data
}

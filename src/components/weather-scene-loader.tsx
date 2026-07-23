"use client"

import dynamic from "next/dynamic"

const WeatherSceneInner = dynamic(
  () => import("@/components/weather-scene").then((m) => ({ default: m.WeatherScene })),
  { ssr: false }
)

export function WeatherSceneLoader() {
  return <WeatherSceneInner />
}

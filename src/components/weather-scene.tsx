"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useWeather } from "@/hooks/use-weather"
import { useTimeOfDay } from "@/hooks/use-time-of-day"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

type WeatherType = "clear" | "cloudy" | "overcast" | "rain" | "snow"

interface Particle {
  x: number; y: number; z: number
  baseSpeed: number
  phase: number
  baseAlpha: number
  size: number
}

interface WeatherConfig {
  color: string
  count: number
  countMobile: number
  sizeMin: number; sizeMax: number
  speed: number
  blending: THREE.Blending
}

const WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
  clear:    { color: "#FFD700", count: 150, countMobile: 80, sizeMin: 3, sizeMax: 10, speed: 0.3, blending: THREE.AdditiveBlending },
  cloudy:   { color: "#E8E8E8", count: 80,  countMobile: 45, sizeMin: 5, sizeMax: 16, speed: 0.15,blending: THREE.AdditiveBlending },
  overcast: { color: "#999999", count: 90,  countMobile: 50, sizeMin: 3, sizeMax: 8,  speed: 0.08,blending: THREE.NormalBlending },
  rain:     { color: "#87CEEB", count: 200, countMobile:120, sizeMin: 1, sizeMax: 3,  speed: 2.5, blending: THREE.AdditiveBlending },
  snow:     { color: "#FFFFFF", count: 120, countMobile: 70, sizeMin: 3, sizeMax: 12, speed: 0.5, blending: THREE.AdditiveBlending },
}

function classifyWeather(text: string): WeatherType {
  if (!text) return "clear"
  if (text.includes("雪")) return "snow"
  if (text.includes("雨")) return "rain"
  if (text.includes("阴")) return "overcast"
  if (text.includes("多云") || text.includes("云")) return "cloudy"
  if (text.includes("晴")) return "clear"
  const lower = text.toLowerCase()
  if (lower.includes("snow")) return "snow"
  if (lower.includes("rain")) return "rain"
  if (lower.includes("overcast")) return "overcast"
  if (lower.includes("cloud")) return "cloudy"
  if (lower.includes("clear") || lower.includes("sunny")) return "clear"
  return "clear"
}

function createGlowTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0,    "rgba(255,255,255,1)")
  gradient.addColorStop(0.15, "rgba(255,255,255,0.9)")
  gradient.addColorStop(0.4,  "rgba(255,255,255,0.5)")
  gradient.addColorStop(0.7,  "rgba(255,255,255,0.1)")
  gradient.addColorStop(1,    "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/** Build or rebuild the BufferGeometry for a given particle array + count. */
function buildGeometry(particles: Particle[], count: number, geometry: THREE.BufferGeometry) {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const alphas = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = particles[i].x
    positions[i * 3 + 1] = particles[i].y
    positions[i * 3 + 2] = particles[i].z
    sizes[i]  = particles[i].size
    alphas[i] = particles[i].baseAlpha
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("size",     new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute("alpha",    new THREE.BufferAttribute(alphas, 1))
}

function createParticles(count: number, cfg: WeatherConfig, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * w,
    y: (Math.random() - 0.5) * h,
    z: Math.random() * 5,
    baseSpeed: 0.7 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
    baseAlpha: 0.45 + Math.random() * 0.55,   // was 0.3-0.9, now 0.45-1.0 → visibly brighter
    size: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
  }))
}

export function WeatherScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    camera: THREE.OrthographicCamera
    scene: THREE.Scene
    geometry: THREE.BufferGeometry
    material: THREE.ShaderMaterial
    texture: THREE.Texture
    points: THREE.Points
    particles: Particle[]
    config: WeatherConfig
    animFrame: number
    weatherType: WeatherType
  } | null>(null)

  // Refs updated on every render so the animation closure always reads current values
  const weatherTypeRef = useRef<WeatherType>("clear")
  const isNightRef = useRef(false)
  const reducedMotionRef = useRef(false)

  const { text: weatherText, loading } = useWeather()
  const isNight = useTimeOfDay()
  const reducedMotion = useReducedMotion()

  const weatherType: WeatherType = loading ? "clear" : classifyWeather(weatherText)

  // Keep refs up to date on every render
  weatherTypeRef.current = weatherType
  isNightRef.current = isNight
  reducedMotionRef.current = reducedMotion

  // ── One-time Three.js setup ──
  const setupRef = useRef(false)
  useEffect(() => {
    if (setupRef.current || typeof window === "undefined") return
    setupRef.current = true

    const isMobile = window.innerWidth < 768
    const config = WEATHER_CONFIGS[weatherType]
    const count = isMobile ? config.countMobile : config.count

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.position = "fixed"
    renderer.domElement.style.inset = "0"
    renderer.domElement.style.zIndex = "-8"
    renderer.domElement.style.pointerEvents = "none"
    renderer.domElement.setAttribute("aria-hidden", "true")
    containerRef.current?.appendChild(renderer.domElement)

    // Camera
    const w = window.innerWidth, h = window.innerHeight
    const camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 1000)
    camera.position.z = 10

    const scene = new THREE.Scene()
    const texture = createGlowTexture()
    const geometry = new THREE.BufferGeometry()

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor:   { value: new THREE.Color(config.color) },
        uOpacity: { value: 1.0 },
        uTexture: { value: texture },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = alpha;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform sampler2D uTexture;
        varying float vAlpha;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(uColor, tex.a * vAlpha * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: config.blending,
    })

    const particles = createParticles(count, config, w, h)
    buildGeometry(particles, count, geometry)

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const state = { renderer, camera, scene, geometry, material, texture, points, particles, config, animFrame: 0, weatherType }
    stateRef.current = state

    // ── Animation loop — reads everything from refs so values stay current ──
    let elapsed = 0
    let nightFactor = isNightRef.current ? 1 : 0

    function animate() {
      const st = stateRef.current!
      if (reducedMotionRef.current) {
        st.renderer.render(st.scene, st.camera)
        return
      }
      st.animFrame = requestAnimationFrame(animate)
      elapsed += 0.016

      // Smooth night transition
      const targetNight = isNightRef.current ? 1 : 0
      nightFactor += (targetNight - nightFactor) * 0.02

      const wt = weatherTypeRef.current
      const cfg = WEATHER_CONFIGS[wt]
      const halfW = window.innerWidth / 2
      const halfH = window.innerHeight / 2
      const { particles, geometry } = st
      const posAttr = geometry.attributes.position as THREE.BufferAttribute
      const alphaAttr = geometry.attributes.alpha as THREE.BufferAttribute
      const positions = posAttr.array as Float32Array
      const alphas = alphaAttr.array as Float32Array
      const pCount = particles.length

      for (let i = 0; i < pCount; i++) {
        const p = particles[i]
        const spd = cfg.speed * p.baseSpeed

        switch (wt) {
          case "clear":
            p.y += spd * 0.7
            p.x += Math.sin(elapsed * 1.8 + i * 0.5) * 0.4
            alphas[i] = p.baseAlpha * (0.55 + 0.45 * Math.sin(elapsed * 3 + i * 0.7))
            if (p.y > halfH * 0.85) { p.y = -halfH; p.x = (Math.random() - 0.5) * window.innerWidth }
            break
          case "cloudy":
            p.x += spd * 0.2
            p.y += Math.sin(elapsed * 0.5 + i) * 0.15
            alphas[i] = p.baseAlpha * (0.6 + 0.4 * Math.sin(elapsed * 0.8 + i))
            if (p.x > halfW + 20) p.x = -halfW - 20
            if (p.x < -halfW - 20) p.x = halfW + 20
            break
          case "overcast":
            p.x += spd * 0.1
            alphas[i] = p.baseAlpha * 0.75
            if (p.x > halfW + 20) p.x = -halfW - 20
            break
          case "rain":
            p.y -= spd * 1.6 * p.baseSpeed
            p.x -= spd * 0.2
            alphas[i] = p.baseAlpha
            if (p.y < -halfH) { p.y = halfH; p.x = (Math.random() - 0.5) * window.innerWidth }
            break
          case "snow":
            p.y -= spd * 0.5 * p.baseSpeed
            p.x += Math.sin(elapsed * 1.4 + p.phase) * 0.7
            alphas[i] = p.baseAlpha * (0.65 + 0.35 * Math.sin(elapsed * 2 + i * 1.1))
            if (p.y < -halfH) { p.y = halfH; p.x = (Math.random() - 0.5) * window.innerWidth }
            break
        }

        positions[i * 3] = p.x
        positions[i * 3 + 1] = p.y
      }

      geometry.attributes.position.needsUpdate = true
      geometry.attributes.alpha.needsUpdate = true

      // Night dimming
      const dim = 1.0 - nightFactor * 0.5
      st.material.uniforms.uOpacity.value = dim
      const dayCol = new THREE.Color(cfg.color)
      const nightCol = dayCol.clone().multiplyScalar(0.5).lerp(new THREE.Color("#1a1a3e"), 0.3)
      st.material.uniforms.uColor.value = dayCol.clone().lerp(nightCol, nightFactor)

      st.renderer.render(st.scene, st.camera)
    }

    if (reducedMotion) {
      renderer.render(scene, camera)
    } else {
      state.animFrame = requestAnimationFrame(animate)
    }

    // Visibility
    const onVisibility = () => {
      const st = stateRef.current!
      if (!st) return
      if (document.hidden) {
        if (st.animFrame) cancelAnimationFrame(st.animFrame)
      } else if (!reducedMotionRef.current) {
        st.animFrame = requestAnimationFrame(animate)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    // Resize (debounced)
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const nw = window.innerWidth, nh = window.innerHeight
        renderer.setSize(nw, nh)
        camera.left = -nw / 2; camera.right = nw / 2
        camera.top = nh / 2; camera.bottom = -nh / 2
        camera.updateProjectionMatrix()
      }, 200)
    }
    window.addEventListener("resize", onResize)

    return () => {
      if (state.animFrame) cancelAnimationFrame(state.animFrame)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
      clearTimeout(resizeTimer)
      scene.remove(points)
      geometry.dispose()
      material.dispose()
      texture.dispose()
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      stateRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // one-time mount only — all dynamic updates via refs

  // ── Handle weather type changes after initial setup ──
  const prevWeatherRef = useRef<WeatherType>("clear")
  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    if (state.weatherType === weatherType) return
    state.weatherType = weatherType

    const cfg = WEATHER_CONFIGS[weatherType]
    const isMobile = window.innerWidth < 768
    const newCount = isMobile ? cfg.countMobile : cfg.count

    // Rebuild particles with new count + config
    const w = window.innerWidth, h = window.innerHeight
    state.particles = createParticles(newCount, cfg, w, h)
    state.config = cfg

    // Rebuild geometry to match new count
    state.geometry.dispose()
    state.geometry = new THREE.BufferGeometry()
    buildGeometry(state.particles, newCount, state.geometry)
    state.points.geometry = state.geometry

    // Update material
    state.material.uniforms.uColor.value = new THREE.Color(cfg.color)
    state.material.blending = cfg.blending
    state.material.needsUpdate = true

    prevWeatherRef.current = weatherType
  }, [weatherType])

  return <div ref={containerRef} />
}

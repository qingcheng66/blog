"use client"

import { useRef, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useTouchDevice } from "@/hooks/use-touch-device"

gsap.registerPlugin(ScrollTrigger)

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  speed?: number
}

export function ParallaxImage({ src, alt, className = "", speed = 0.15 }: ParallaxImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const offsetRef = useRef(0)
  const reducedMotion = useReducedMotion()
  const isTouch = useTouchDevice()

  // Cache getBoundingClientRect to avoid layout thrashing in animation loop
  useEffect(() => {
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return
    offsetRef.current = -(img.getBoundingClientRect().height - wrap.getBoundingClientRect().height) * speed
  }, [src, speed])

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      const wrap = wrapRef.current
      const img = imgRef.current
      if (!wrap || !img) return
      offsetRef.current = -(img.getBoundingClientRect().height - wrap.getBoundingClientRect().height) * speed
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [speed])

  useGSAP(() => {
    if (reducedMotion) return

    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return

    gsap.to(img, {
      y: offsetRef.current,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        scrub: isTouch ? 0.5 : 1.5, // Faster scrub on touch for less lag
      },
    })
  }, { scope: wrapRef, dependencies: [reducedMotion, isTouch] })

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden rounded-lg min-h-[200px] sm:min-h-[300px] ${className}`}
      style={{ clipPath: "inset(0)" }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

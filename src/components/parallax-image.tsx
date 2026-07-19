"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

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

  useGSAP(() => {
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return

    gsap.to(img, {
      y: () => -(img.getBoundingClientRect().height - wrap.getBoundingClientRect().height) * 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    })
  }, { scope: wrapRef })

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden rounded-lg ${className}`}
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

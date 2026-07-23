import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// 全局注册一次，避免多模块重复注册
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

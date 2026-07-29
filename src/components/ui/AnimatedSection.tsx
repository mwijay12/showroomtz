"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

type Direction = "up" | "down" | "left" | "right" | "none" | "scale"

const variants = {
  up:    { hidden: { y: 24,  opacity: 0 }, 
           visible: { y: 0,  opacity: 1 } },
  down:  { hidden: { y: -24, opacity: 0 }, 
           visible: { y: 0,  opacity: 1 } },
  left:  { hidden: { x: 24,  opacity: 0 }, 
           visible: { x: 0,  opacity: 1 } },
  right: { hidden: { x: -24, opacity: 0 }, 
           visible: { x: 0,  opacity: 1 } },
  none:  { hidden: { opacity: 0 },          
           visible: { opacity: 1 } },
  scale: { hidden: { scale: 0.96, opacity: 0 }, 
           visible: { scale: 1,   opacity: 1 } },
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  margin = "-20px",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: Direction
  margin?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: margin as any })
  const v = variants[direction]
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={shouldReduce ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      } : {
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: {
            duration: 0.5,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
  delayChildren = 0.05,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-20px" as any })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode
  className?: string
  direction?: Direction
}) {
  const v = variants[direction]
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      variants={shouldReduce ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      } : {
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

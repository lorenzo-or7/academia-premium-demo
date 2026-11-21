import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from 'motion/react'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { useRef, useState, type ReactNode, type PointerEvent } from 'react'
import { getImage, type ImageName } from '../content/images'
import { site } from '../config/site'
import { useMediaQuery } from '../hooks'

/* ---------------------------------------------------------------
 * Img — srcset responsivo, dimensões intrínsecas e fallback de falha
 * ------------------------------------------------------------- */
interface ImgProps {
  name: ImageName
  sizes: string
  priority?: boolean
  className?: string
  /** Sobrescreve o alt padrão. Use "" para imagens decorativas. */
  alt?: string
  position?: string
}

export function Img({ name, sizes, priority, className = '', alt, position }: ImgProps) {
  const img = getImage(name)
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className={`img-fallback ${className}`} role={alt === '' ? undefined : 'img'} aria-label={alt === '' ? undefined : (alt ?? img.alt)}>
        <span aria-hidden="true">{site.brand.name}</span>
      </span>
    )
  }
  return (
    <img
      className={className}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt ?? img.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      style={position ? { objectPosition: position } : undefined}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

/* ---------------------------------------------------------------
 * Marca tipográfica fictícia
 * ------------------------------------------------------------- */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark__name">{site.brand.name}</span>
      <span className="wordmark__mark" aria-hidden="true" />
    </span>
  )
}

/* ---------------------------------------------------------------
 * Magnetic — atração discreta ao cursor (somente ponteiro fino)
 * ------------------------------------------------------------- */
export function Magnetic({ children, strength = 0.2 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 240, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 240, damping: 18, mass: 0.4 })
  const enabled = fine && !reduce

  const onMove = (e: PointerEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span ref={ref} className="magnetic" style={enabled ? { x: sx, y: sy } : undefined} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  )
}

/* ---------------------------------------------------------------
 * Botões com spring press
 * ------------------------------------------------------------- */
type Variant = 'accent' | 'solid' | 'ghost' | 'line'

const press = { scale: 0.965 }
const pressSpring = { type: 'spring', stiffness: 520, damping: 28 } as const

interface BtnBase {
  variant?: Variant
  icon?: LucideIcon | null
  size?: 'md' | 'lg'
  children: ReactNode
}

export function ButtonLink({
  variant = 'accent',
  icon: Icon = ArrowRight,
  size = 'md',
  children,
  className = '',
  ...rest
}: BtnBase & Omit<HTMLMotionProps<'a'>, 'children'>) {
  return (
    <motion.a whileTap={press} transition={pressSpring} className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      <span className="btn__label">{children}</span>
      {Icon && (
        <span className="btn__icon" aria-hidden="true">
          <Icon size={16} strokeWidth={1.75} />
        </span>
      )}
    </motion.a>
  )
}

export function Button({
  variant = 'accent',
  icon: Icon = ArrowRight,
  size = 'md',
  children,
  className = '',
  type = 'button',
  ...rest
}: BtnBase & Omit<HTMLMotionProps<'button'>, 'children'>) {
  return (
    <motion.button type={type} whileTap={rest.disabled ? undefined : press} transition={pressSpring} className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      <span className="btn__label">{children}</span>
      {Icon && (
        <span className="btn__icon" aria-hidden="true">
          <Icon size={16} strokeWidth={1.75} />
        </span>
      )}
    </motion.button>
  )
}

/* ---------------------------------------------------------------
 * Índice de seção: "04 —— TRAINING EXPERIENCES"
 * ------------------------------------------------------------- */
export function SectionIndex({ index, label, className = '' }: { index: string; label: string; className?: string }) {
  return (
    <p className={`section-index ${className}`}>
      <span className="section-index__num">{index}</span>
      <span className="section-index__rule" aria-hidden="true" />
      <span>{label}</span>
    </p>
  )
}

/** Selo de conteúdo demonstrativo. */
export function DemoTag({ children = 'Demonstrativo' }: { children?: ReactNode }) {
  if (!site.demoMode) return null
  return <span className="demo-tag">{children}</span>
}

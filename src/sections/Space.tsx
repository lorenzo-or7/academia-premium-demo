import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import { useCallback, useRef, useState, type KeyboardEvent } from 'react'
import { LineReveal } from '../components/motion'
import { Img, SectionIndex } from '../components/ui'
import { EASE, EASE_IN_OUT } from '../components/easing'
import { spaces } from '../content/data'
import { useDialog, useScrollLock } from '../hooks'

export function Space() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [lightbox, setLightbox] = useState(false)
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const total = spaces.length
  const current = spaces[index]

  const go = useCallback(
    (next: number) => {
      const n = (next + total) % total
      setDir(next > index ? 1 : -1)
      setIndex(n)
    },
    [index, total],
  )

  useScrollLock(lightbox)
  useDialog(lightbox, dialogRef, () => setLightbox(false))

  const onKeys = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { clipPath: d > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)', scale: 1.08 }),
    center: reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
    exit: reduce ? { opacity: 0 } : { opacity: 0.4, scale: 1 },
  }

  return (
    <section id="espaco" className="space inverse" aria-labelledby="space-title">
      <div className="shell space__head">
        <SectionIndex index="03" label="The Space" />
        <LineReveal id="space-title" className="display space__title" lines={['Designed', 'for Greatness.']} label="Designed for Greatness." />
        <p className="space__lede">
          Ambientes projetados para foco, fluxo e recuperação. As imagens são ilustrativas e representam o conceito do espaço.
        </p>
      </div>

      <div className="shell space__body" role="region" aria-roledescription="galeria" aria-label="Galeria do espaço" onKeyDown={onKeys}>
        <div className="space__stage">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.button
              type="button"
              key={current.id}
              className="space__frame"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.9, ease: EASE_IN_OUT }}
              onClick={() => setLightbox(true)}
              aria-label={`Ampliar imagem: ${current.name}`}
            >
              <Img name={current.image} sizes="(min-width: 1024px) 64vw, 100vw" />
              <span className="space__expand" aria-hidden="true">
                <Maximize2 size={16} />
              </span>
            </motion.button>
          </AnimatePresence>

          <div className="space__overlay" aria-live="polite">
            <p className="space__count">
              <span>{String(index + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <h3 className="space__name">{current.name}</h3>
                <p className="space__caption">{current.caption}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="space__side">
          <ol className="space__list">
            {spaces.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={`space__item ${i === index ? 'is-active' : ''}`} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)}>
                  <span className="space__item-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="space__item-name">{s.name}</span>
                  <span className="space__item-bar" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          <p className="space__detail">{current.detail}</p>
          <div className="space__controls">
            <button type="button" className="round-btn" onClick={() => go(index - 1)} aria-label="Imagem anterior">
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button type="button" className="round-btn" onClick={() => go(index + 1)} aria-label="Próxima imagem">
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <span className="space__hint">Use ← → para navegar</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${current.name}, imagem ${index + 1} de ${total}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onKeyDown={onKeys}
            onClick={(e) => e.target === e.currentTarget && setLightbox(false)}
          >
            <button type="button" className="lightbox__close round-btn" onClick={() => setLightbox(false)} aria-label="Fechar galeria" data-autofocus>
              <X size={20} aria-hidden="true" />
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={current.id}
                className="lightbox__figure"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Img name={current.image} sizes="92vw" />
                <figcaption>
                  <strong>{current.name}</strong> — {current.caption}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <div className="lightbox__nav">
              <button type="button" className="round-btn" onClick={() => go(index - 1)} aria-label="Imagem anterior">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <span className="lightbox__count">
                {index + 1} / {total}
              </span>
              <button type="button" className="round-btn" onClick={() => go(index + 1)} aria-label="Próxima imagem">
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

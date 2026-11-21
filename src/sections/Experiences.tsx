import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, Plus } from 'lucide-react'
import { useId, useState, type CSSProperties } from 'react'
import { LineReveal, FadeUp } from '../components/motion'
import { Img, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { modalities } from '../content/data'
import { useApp, scrollToId } from '../lib/app-context'
import { useMediaQuery } from '../hooks'

export const SCHEDULE_FILTER_EVENT = 'vertex:schedule-filter'

export function Experiences() {
  const [active, setActive] = useState(0)
  const { startBooking } = useApp()
  const reduce = useReducedMotion()
  const hoverable = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 1024px)')
  const uid = useId()

  return (
    <section id="experiencias" className="exp" aria-labelledby="exp-title">
      <div className="shell exp__head">
        <SectionIndex index="02" label="Training Experiences" />
        <LineReveal id="exp-title" className="display exp__title" lines={['Seis formas de', 'treinar no seu limite.']} label="Seis formas de treinar no seu limite." />
        <FadeUp className="exp__lede">
          <p>
            Cada experiência tem método, ambiente e equipe próprios. Explore as modalidades e encontre o ponto de partida certo para a sua rotina.
          </p>
        </FadeUp>
      </div>

      <div className="shell">
        <ul className="panels" role="list">
          {modalities.map((m, i) => {
            const isActive = i === active
            const bodyId = `${uid}-body-${m.id}`
            return (
              <li
                key={m.id}
                className={`panel ${isActive ? 'is-active' : ''}`}
                onPointerEnter={() => hoverable && setActive(i)}
                style={{ '--i': i } as CSSProperties}
              >
                <div className="panel__media" aria-hidden="true">
                  <Img name={m.image} sizes="(min-width: 1024px) 50vw, 100vw" position={m.position} alt="" />
                </div>
                <div className="panel__shade" aria-hidden="true" />

                <h3 className="panel__heading">
                  <button
                    type="button"
                    className="panel__trigger"
                    aria-expanded={isActive}
                    aria-controls={bodyId}
                    onClick={() => setActive(i)}
                    onFocus={() => hoverable && setActive(i)}
                  >
                    <span className="panel__num">0{i + 1}</span>
                    <span className="panel__name">{m.name}</span>
                    <span className="panel__short" aria-hidden="true">
                      {m.short}
                    </span>
                    <span className="panel__plus" aria-hidden="true">
                      <Plus size={18} strokeWidth={1.75} />
                    </span>
                  </button>
                </h3>

                <div id={bodyId} className="panel__body" inert={!isActive} aria-hidden={!isActive}>
                  <motion.div
                    className="panel__content"
                    initial={false}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 20 }}
                    transition={{ duration: isActive ? 0.6 : 0.2, ease: EASE, delay: isActive ? 0.2 : 0 }}
                  >
                    <p className="panel__kicker">{m.kicker}</p>
                    <p className="panel__desc">{m.description}</p>
                    <ul className="panel__benefits">
                      {m.benefits.map((b) => (
                        <li key={b}>
                          <Check size={14} strokeWidth={2} aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="panel__cta"
                      onClick={() => {
                        if (m.id === 'group') {
                          window.dispatchEvent(new CustomEvent(SCHEDULE_FILTER_EVENT, { detail: 'group' }))
                          scrollToId('agenda')
                        } else {
                          startBooking({ modality: m.id, source: m.name })
                        }
                      }}
                    >
                      {m.cta}
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </motion.div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

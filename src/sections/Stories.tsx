import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { LineReveal } from '../components/motion'
import { Img, SectionIndex } from '../components/ui'
import { EASE, EASE_IN_OUT } from '../components/easing'
import { modalityById, stories } from '../content/data'
import { useApp } from '../lib/app-context'

export function Stories() {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()
  const { startBooking } = useApp()
  const tabsRef = useRef<HTMLDivElement>(null)
  const s = stories[index]

  const onKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    let ni = index
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (index + 1) % stories.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ni = (index - 1 + stories.length) % stories.length
    else return
    e.preventDefault()
    setIndex(ni)
    tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[ni]?.focus()
  }

  return (
    <section id="historias" className="stories" aria-labelledby="stories-title">
      <div className="shell stories__head">
        <SectionIndex index="07" label="Member Stories" />
        <LineReveal id="stories-title" className="display stories__title" lines={['Histórias de', 'hábito, não de atalho.']} label="Histórias de hábito, não de atalho." />
        <p className="stories__notice">
          <strong>Histórias ilustrativas.</strong> Personas criadas para demonstrar o formato editorial. Não são depoimentos de pessoas reais nem promessas de resultado.
        </p>
      </div>

      <div className="shell stories__body">
        <div className="stories__tabs" role="tablist" aria-label="Histórias" aria-orientation="vertical" ref={tabsRef} onKeyDown={onKeys}>
          {stories.map((st, i) => (
            <button
              key={st.id}
              type="button"
              role="tab"
              id={`story-tab-${st.id}`}
              aria-selected={i === index}
              aria-controls="story-panel"
              tabIndex={i === index ? 0 : -1}
              className={`stories__tab ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <span className="stories__tab-num">0{i + 1}</span>
              <span className="stories__tab-text">
                <span className="stories__tab-title">{st.routine}</span>
                <span className="stories__tab-persona">{st.persona}</span>
              </span>
            </button>
          ))}
        </div>

        <div id="story-panel" role="tabpanel" aria-labelledby={`story-tab-${s.id}`} className="story">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article key={s.id} className="story__inner" initial="hidden" animate="show" exit="exit">
              <motion.div
                className="story__media"
                variants={{
                  hidden: reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' },
                  show: reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.9, ease: EASE_IN_OUT } },
                  exit: reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)', transition: { duration: 0.5, ease: EASE_IN_OUT } },
                }}
              >
                <Img name={s.image} sizes="(min-width: 1024px) 40vw, 100vw" position={s.position} />
                <span className="story__label">Persona ilustrativa</span>
              </motion.div>
              <motion.div
                className="story__text"
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.2 } },
                  exit: { opacity: 0, transition: { duration: 0.25 } },
                }}
              >
                <h3 className="story__title">{s.title}</h3>
                {s.body.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
                <dl className="story__habit">
                  <div>
                    <dt>Antes</dt>
                    <dd>{s.habit.before}</dd>
                  </div>
                  <span className="story__arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                  <div>
                    <dt>Hábito construído</dt>
                    <dd>{s.habit.after}</dd>
                  </div>
                </dl>
                <button type="button" className="text-link" onClick={() => startBooking({ modality: s.modality, source: `História: ${modalityById[s.modality].name}` })}>
                  Começar por {modalityById[s.modality].name}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </motion.div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

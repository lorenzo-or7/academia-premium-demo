import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { LineReveal } from '../components/motion'
import { Button, Img, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { modalityById, planById } from '../content/data'
import { isComplete, questions, recommend, type FinderAnswers } from '../lib/finder'
import { useApp } from '../lib/app-context'

export function Finder() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<FinderAnswers>({})
  const [showError, setShowError] = useState(false)
  const [done, setDone] = useState(false)
  const [dir, setDir] = useState(1)
  const reduce = useReducedMotion()
  const { startBooking } = useApp()
  const uid = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)

  const total = questions.length
  const q = questions[step]
  const value = answers[q.key]
  const result = done && isComplete(answers) ? recommend(answers) : null

  const focusLater = (el: () => HTMLElement | null) => requestAnimationFrame(() => setTimeout(() => el()?.focus({ preventScroll: true }), 60))

  const next = () => {
    if (!value) {
      setShowError(true)
      return
    }
    setShowError(false)
    setDir(1)
    if (step < total - 1) {
      setStep(step + 1)
      focusLater(() => headingRef.current)
    } else if (isComplete(answers)) {
      setDone(true)
      focusLater(() => resultRef.current)
    }
  }
  const back = () => {
    setShowError(false)
    setDir(-1)
    if (done) {
      setDone(false)
      focusLater(() => headingRef.current)
      return
    }
    if (step > 0) {
      setStep(step - 1)
      focusLater(() => headingRef.current)
    }
  }
  const restart = () => {
    setAnswers({})
    setStep(0)
    setDone(false)
    setShowError(false)
    setDir(-1)
    focusLater(() => headingRef.current)
  }

  const select = (v: string) => {
    setAnswers((a) => ({ ...a, [q.key]: v }))
    setShowError(false)
  }

  /** Radiogroup com setas (padrão ARIA). */
  const onRadioKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const opts = q.options
    const radios = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')]
    const focused = radios.indexOf(document.activeElement as HTMLElement)
    const cur = focused !== -1 ? focused : opts.findIndex((o) => o.value === value)
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1
    const ni = cur === -1 ? 0 : (cur + delta + opts.length) % opts.length
    select(opts[ni].value)
    radios[ni]?.focus()
  }

  const progress = done ? 1 : step / total
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -40 }),
  }

  return (
    <section id="encontre" className="finder tone-dark" aria-labelledby="finder-title">
      <div className="finder__bg" aria-hidden="true">
        <Img name="finder" sizes="100vw" alt="" position="50% 60%" />
      </div>
      <div className="shell finder__grid">
        <div className="finder__intro">
          <SectionIndex index="04" label="Find Your Training" />
          <LineReveal id="finder-title" className="display finder__title" lines={['Encontre o', 'seu treino.']} label="Encontre o seu treino." />
          <p className="finder__lede">Quatro perguntas rápidas para sugerir um ponto de partida. É uma simulação demonstrativa, não uma avaliação física nem uma prescrição de treino.</p>

          <ol className="finder__steps" aria-label="Etapas">
            {questions.map((qq, i) => {
              const state = done || i < step ? 'done' : i === step ? 'current' : 'todo'
              return (
                <li key={qq.key} className={`finder__step is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                  <span className="finder__step-dot" aria-hidden="true">
                    {state === 'done' ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                  </span>
                  <span>{qq.title}</span>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="finder__panel">
          <div className="finder__progress" role="progressbar" aria-label="Progresso do simulador" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done ? total : step}>
            <motion.span className="finder__progress-bar" animate={{ scaleX: progress }} transition={{ duration: 0.6, ease: EASE }} />
          </div>

          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {!result ? (
              <motion.div key={`q-${step}`} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: EASE }}>
                <p className="finder__count">
                  Pergunta {step + 1} de {total}
                </p>
                <h3 className="finder__q" id={`${uid}-q`} ref={headingRef} tabIndex={-1}>
                  {q.title}
                </h3>
                <p className="finder__hint" id={`${uid}-hint`}>
                  {q.hint}
                </p>
                <div
                  className="finder__options"
                  role="radiogroup"
                  aria-labelledby={`${uid}-q`}
                  aria-describedby={showError ? `${uid}-err` : `${uid}-hint`}
                  aria-invalid={showError || undefined}
                  aria-required="true"
                  onKeyDown={onRadioKeys}
                >
                  {q.options.map((o, i) => {
                    const checked = value === o.value
                    const focusable = checked || (!value && i === 0)
                    return (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        tabIndex={focusable ? 0 : -1}
                        className={`option ${checked ? 'is-checked' : ''}`}
                        onClick={() => select(o.value)}
                      >
                        <span className="option__mark" aria-hidden="true">
                          {checked && <Check size={14} strokeWidth={2.5} />}
                        </span>
                        <span className="option__text">
                          <span className="option__label">{o.label}</span>
                          <span className="option__detail">{o.detail}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="field-error" id={`${uid}-err`} role="alert">
                  {showError ? 'Selecione uma opção para continuar.' : ''}
                </p>
                <div className="finder__nav">
                  <Button variant="line" icon={null} onClick={back} disabled={step === 0} aria-label="Pergunta anterior">
                    <ArrowLeft size={16} aria-hidden="true" /> Voltar
                  </Button>
                  <Button onClick={next}>{step === total - 1 ? 'Ver recomendação' : 'Continuar'}</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" className="result" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, ease: EASE }}>
                <p className="finder__count">Sugestão demonstrativa</p>
                <h3 className="result__title" ref={resultRef} tabIndex={-1}>
                  <span className="result__label">Modalidade sugerida</span>
                  {modalityById[result.modality].name}
                </h3>
                <div className="result__media" aria-hidden="true">
                  <Img name={modalityById[result.modality].image} sizes="(min-width: 1024px) 30vw, 90vw" position={modalityById[result.modality].position} alt="" />
                </div>
                <dl className="result__facts">
                  <div>
                    <dt>Frequência recomendada</dt>
                    <dd>{result.frequency}</dd>
                  </div>
                  <div>
                    <dt>Complemento</dt>
                    <dd>{modalityById[result.secondary].name}</dd>
                  </div>
                  <div>
                    <dt>Plano de interesse</dt>
                    <dd>{planById[result.plan].name}</dd>
                  </div>
                </dl>
                <p className="result__why">{result.rationale}</p>
                <h4 className="result__sub">Benefícios potenciais</h4>
                <ul className="result__benefits">
                  {result.benefits.map((b) => (
                    <li key={b}>
                      <Check size={14} strokeWidth={2.25} aria-hidden="true" /> {b}
                    </li>
                  ))}
                </ul>
                <p className="result__note">Sugestão ilustrativa gerada a partir das suas respostas. A orientação real acontece com um profissional, na aula experimental.</p>
                <div className="finder__nav">
                  <Button variant="line" icon={RotateCcw} onClick={restart}>
                    Refazer
                  </Button>
                  <Button
                    icon={ArrowRight}
                    onClick={() =>
                      startBooking({
                        modality: result.modality,
                        plan: result.plan,
                        source: `Sugestão do simulador: ${modalityById[result.modality].name}`,
                      })
                    }
                  >
                    Agendar aula experimental
                  </Button>
                </div>
                <button type="button" className="text-link" onClick={back}>
                  <ArrowLeft size={14} aria-hidden="true" /> Revisar respostas
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

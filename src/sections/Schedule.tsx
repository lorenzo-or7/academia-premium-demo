import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CalendarX2, Clock, MapPin, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { LineReveal } from '../components/motion'
import { DemoTag, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { modalities, modalityById, schedule, weekDays, type ClassSlot, type ModalityId } from '../content/data'
import { useApp } from '../lib/app-context'
import { nextDateForWeekday, timeSlots } from '../lib/booking'
import { SCHEDULE_FILTER_EVENT } from './Experiences'

type Filter = ModalityId | 'all'

function initialDay() {
  const d = new Date().getDay()
  return d === 0 ? 1 : d
}

export function Schedule() {
  const [day, setDay] = useState<number>(initialDay)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const { startBooking } = useApp()
  const reduce = useReducedMotion()
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onFilter = (e: Event) => {
      const id = (e as CustomEvent<ModalityId>).detail
      if (modalityById[id]) setFilter(id)
    }
    window.addEventListener(SCHEDULE_FILTER_EVENT, onFilter)
    return () => window.removeEventListener(SCHEDULE_FILTER_EVENT, onFilter)
  }, [])

  const items = useMemo(() => schedule.filter((s) => s.day === day && (filter === 'all' || s.modality === filter)), [day, filter])
  const countFor = (d: number) => schedule.filter((s) => s.day === d && (filter === 'all' || s.modality === filter)).length
  const selectedSlot = schedule.find((s) => s.id === selected) ?? null
  const dayLabel = weekDays.find((w) => w.day === day)?.long ?? ''

  const onTabKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = weekDays.findIndex((w) => w.day === day)
    let ni = idx
    if (e.key === 'ArrowRight') ni = (idx + 1) % weekDays.length
    else if (e.key === 'ArrowLeft') ni = (idx - 1 + weekDays.length) % weekDays.length
    else if (e.key === 'Home') ni = 0
    else if (e.key === 'End') ni = weekDays.length - 1
    else return
    e.preventDefault()
    setDay(weekDays[ni].day)
    setSelected(null)
    tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[ni]?.focus()
  }

  const book = (s: ClassSlot) => {
    startBooking({
      modality: s.modality,
      date: nextDateForWeekday(s.day),
      time: timeSlots.includes(s.time) ? s.time : undefined,
      source: `Aula selecionada: ${s.title} · ${weekDays.find((w) => w.day === s.day)?.long} ${s.time}`,
    })
  }

  return (
    <section id="agenda" className="sched" aria-labelledby="sched-title">
      <div className="shell sched__head">
        <SectionIndex index="06" label="Class Schedule" />
        <LineReveal id="sched-title" className="display sched__title" lines={['A semana', 'em movimento.']} label="A semana em movimento." />
        <p className="sched__lede">
          Escolha o dia, filtre por modalidade e selecione uma aula para iniciar o pré-agendamento. <DemoTag>Horários demonstrativos</DemoTag>
        </p>
      </div>

      <div className="shell sched__body">
        <div className="sched__bar">
          <div className="days" role="tablist" aria-label="Dias da semana" ref={tabsRef} onKeyDown={onTabKeys}>
            {weekDays.map((w) => {
              const active = w.day === day
              const count = countFor(w.day)
              return (
                <button
                  key={w.day}
                  type="button"
                  role="tab"
                  id={`day-tab-${w.day}`}
                  aria-selected={active}
                  aria-controls="day-panel"
                  tabIndex={active ? 0 : -1}
                  className={`day ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    setDay(w.day)
                    setSelected(null)
                  }}
                >
                  {active && <motion.span layoutId="day-pill" className="day__pill" transition={{ type: 'spring', stiffness: 440, damping: 36 }} />}
                  <span className="day__short">{w.short}</span>
                  <span className="day__count" aria-label={`${count} aulas`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="chips" role="group" aria-label="Filtrar por modalidade">
            <button type="button" className={`chip ${filter === 'all' ? 'is-active' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
              Todas
            </button>
            {modalities.map((m) => (
              <button key={m.id} type="button" className={`chip ${filter === m.id ? 'is-active' : ''}`} aria-pressed={filter === m.id} onClick={() => setFilter(m.id)}>
                {m.short}
              </button>
            ))}
          </div>
        </div>

        <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className="sched__panel" tabIndex={-1}>
          <p className="visually-hidden" aria-live="polite">
            {items.length} {items.length === 1 ? 'aula' : 'aulas'} na {dayLabel}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            {items.length === 0 ? (
              <motion.div key={`empty-${day}-${filter}`} className="sched__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CalendarX2 size={28} strokeWidth={1.5} aria-hidden="true" />
                <p className="sched__empty-title">Nenhuma aula de {filter !== 'all' ? modalityById[filter].short : ''} na {dayLabel.toLowerCase()}.</p>
                <p>Experimente outro dia ou veja todas as modalidades.</p>
                <button type="button" className="btn btn--line btn--md" onClick={() => setFilter('all')}>
                  <span className="btn__label">Ver todas as modalidades</span>
                </button>
              </motion.div>
            ) : (
              <motion.ul key={`${day}-${filter}`} className="slots" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}>
                {items.map((s) => {
                  const full = s.spots === 0
                  const isSel = selected === s.id
                  return (
                    <motion.li
                      key={s.id}
                      variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}
                      className={`slot ${isSel ? 'is-selected' : ''} ${full ? 'is-full' : ''}`}
                    >
                      <button type="button" className="slot__main" aria-pressed={isSel} disabled={full} onClick={() => setSelected(isSel ? null : s.id)}>
                        <span className="slot__time">{s.time}</span>
                        <span className="slot__info">
                          <span className="slot__title">{s.title}</span>
                          <span className="slot__meta">
                            <span>{modalityById[s.modality].name}</span>
                            <span>
                              <Clock size={13} aria-hidden="true" /> {s.duration} min
                            </span>
                            <span>
                              <MapPin size={13} aria-hidden="true" /> {s.room}
                            </span>
                          </span>
                        </span>
                        <span className="slot__side">
                          <span className="slot__level">{s.level}</span>
                          <span className={`slot__spots ${s.spots <= 3 ? 'is-low' : ''}`}>{full ? 'Turma completa' : `${s.spots} vagas demo`}</span>
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isSel && (
                          <motion.div
                            className="slot__expand"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                          >
                            <div className="slot__expand-inner">
                              <p>
                                {weekDays.find((w) => w.day === s.day)?.long}, {s.time} · {s.duration} min · {s.level}
                              </p>
                              <button type="button" className="btn btn--accent btn--md" onClick={() => book(s)}>
                                <span className="btn__label">Agendar esta aula</span>
                                <span className="btn__icon" aria-hidden="true">
                                  <ArrowRight size={16} />
                                </span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>
          {selectedSlot === null && items.length > 0 && <p className="sched__tip">Selecione uma aula para agendar.</p>}
        </div>
      </div>
    </section>
  )
}

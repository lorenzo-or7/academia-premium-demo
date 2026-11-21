import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AlertCircle, Check, Copy, MessageCircle, RotateCcw, Info } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { LineReveal } from '../components/motion'
import { Button, Img, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { site, whatsappConfigured } from '../config/site'
import { modalities, modalityById, planById, plans } from '../content/data'
import { useApp } from '../lib/app-context'
import {
  buildMessage,
  clean,
  emptyBooking,
  formatDate,
  maskPhone,
  maxDateISO,
  timeSlots,
  todayISO,
  validate,
  whatsappUrl,
  type BookingData,
  type BookingErrors,
} from '../lib/booking'

type Status = 'editing' | 'ready'

const fieldOrder: (keyof BookingData)[] = ['name', 'phone', 'modality', 'plan', 'date', 'time', 'consent']
const fieldLabels: Record<keyof BookingData, string> = {
  name: 'Nome',
  phone: 'Telefone',
  modality: 'Modalidade',
  plan: 'Plano de interesse',
  date: 'Data preferencial',
  time: 'Horário preferencial',
  consent: 'Consentimento',
}

export function Book() {
  const { prefill } = useApp()
  const [data, setData] = useState<BookingData>(emptyBooking)
  const [errors, setErrors] = useState<BookingErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof BookingData, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('editing')
  const [copied, setCopied] = useState(false)
  const [source, setSource] = useState<string | undefined>()
  const uid = useId()
  const reduce = useReducedMotion()
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const readyRef = useRef<HTMLHeadingElement>(null)

  // Aplica pré-preenchimento vindo de outras seções (ajuste de estado durante o render).
  const [appliedNonce, setAppliedNonce] = useState(0)
  if (prefill.nonce !== appliedNonce) {
    setAppliedNonce(prefill.nonce)
    setData((d) => ({
      ...d,
      modality: prefill.modality ?? d.modality,
      plan: prefill.plan ?? d.plan,
      date: prefill.date ?? d.date,
      time: prefill.time ?? d.time,
    }))
    setSource(prefill.source)
    setStatus('editing')
  }

  // Leva o foco ao primeiro campo depois da rolagem.
  useEffect(() => {
    if (!prefill.nonce) return
    const t = setTimeout(() => {
      formRef.current?.querySelector<HTMLInputElement>('#' + CSS.escape(`${uid}-name`))?.focus({ preventScroll: true })
    }, 700)
    return () => clearTimeout(t)
  }, [prefill, uid])

  const set = <K extends keyof BookingData>(key: K, value: BookingData[K]) => {
    setData((d) => {
      const next = { ...d, [key]: value }
      if (submitted || touched[key]) setErrors(validate(next))
      return next
    })
  }

  const onBlur = (key: keyof BookingData) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(data))
  }

  const show = (key: keyof BookingData) => (submitted || touched[key]) && errors[key]

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const sanitized = { ...data, name: clean(data.name).trim() }
    setData(sanitized)
    const errs = validate(sanitized)
    setErrors(errs)
    setSubmitted(true)
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setStatus('ready')
    requestAnimationFrame(() => setTimeout(() => readyRef.current?.focus(), 80))
  }

  const reset = () => {
    setData(emptyBooking)
    setErrors({})
    setTouched({})
    setSubmitted(false)
    setStatus('editing')
    setSource(undefined)
    setCopied(false)
  }

  const message = buildMessage(data)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(false)
    }
  }

  const errorList = fieldOrder.filter((k) => errors[k])
  const describedBy = (key: keyof BookingData, hint?: boolean) =>
    [hint ? `${uid}-${key}-hint` : '', show(key) ? `${uid}-${key}-err` : ''].filter(Boolean).join(' ') || undefined

  const err = (key: keyof BookingData) => (
    <p className="field-error" id={`${uid}-${key}-err`}>
      {show(key) ? (
        <>
          <AlertCircle size={14} aria-hidden="true" /> {errors[key]}
        </>
      ) : null}
    </p>
  )

  return (
    <section id="agendar" className="book" aria-labelledby="book-title">
      <div className="shell book__grid">
        <div className="book__intro">
          <SectionIndex index="08" label="Book Your Experience" />
          <LineReveal id="book-title" className="display book__title" lines={['Sua primeira', 'sessão começa aqui.']} label="Sua primeira sessão começa aqui." />
          <p className="book__lede">
            Preencha o pré-agendamento e envie pelo WhatsApp. A equipe confirma disponibilidade e horário — nada é reservado automaticamente.
          </p>
          <div className="book__media" aria-hidden="true">
            <Img name="book" sizes="(min-width: 1024px) 30vw, 0px" alt="" position="50% 30%" />
          </div>
          <ul className="book__policy">
            <li>Seus dados ficam apenas neste navegador até você decidir enviar.</li>
            <li>Nenhuma informação é armazenada ou enviada em segundo plano.</li>
            <li>O envio acontece somente pelo WhatsApp, quando configurado.</li>
          </ul>
        </div>

        <div className="book__panel">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'editing' ? (
              <motion.form
                key="form"
                ref={formRef}
                className="form"
                noValidate
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={{ duration: 0.45, ease: EASE }}
                aria-describedby={`${uid}-req`}
              >
                {source && (
                  <p className="form__source">
                    <Info size={14} aria-hidden="true" /> {source}
                  </p>
                )}
                <p className="form__req" id={`${uid}-req`}>
                  Todos os campos são obrigatórios.
                </p>

                <div ref={summaryRef} tabIndex={-1} className={`form__summary ${submitted && errorList.length ? 'is-visible' : ''}`} role="alert">
                  {submitted && errorList.length > 0 && (
                    <>
                      <p>
                        <strong>Revise {errorList.length === 1 ? '1 campo' : `${errorList.length} campos`}:</strong>
                      </p>
                      <ul>
                        {errorList.map((k) => (
                          <li key={k}>
                            <a href={`#${uid}-${k}`}>
                              {fieldLabels[k]}: {errors[k]}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="form__row">
                  <div className={`field ${show('name') ? 'is-invalid' : ''}`}>
                    <label htmlFor={`${uid}-name`}>Nome</label>
                    <input
                      id={`${uid}-name`}
                      name="name"
                      autoComplete="name"
                      maxLength={80}
                      value={data.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set('name', e.target.value.slice(0, 80))}
                      onBlur={onBlur('name')}
                      aria-invalid={Boolean(show('name'))}
                      aria-describedby={describedBy('name')}
                      required
                    />
                    {err('name')}
                  </div>
                  <div className={`field ${show('phone') ? 'is-invalid' : ''}`}>
                    <label htmlFor={`${uid}-phone`}>Telefone (WhatsApp)</label>
                    <input
                      id={`${uid}-phone`}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(11) 91234-5678"
                      value={data.phone}
                      onChange={(e) => set('phone', maskPhone(e.target.value))}
                      onBlur={onBlur('phone')}
                      aria-invalid={Boolean(show('phone'))}
                      aria-describedby={describedBy('phone')}
                      required
                    />
                    {err('phone')}
                  </div>
                </div>

                <div className="form__row">
                  <div className={`field ${show('modality') ? 'is-invalid' : ''}`}>
                    <label htmlFor={`${uid}-modality`}>Modalidade</label>
                    <select
                      id={`${uid}-modality`}
                      name="modality"
                      value={data.modality}
                      onChange={(e) => set('modality', e.target.value as BookingData['modality'])}
                      onBlur={onBlur('modality')}
                      aria-invalid={Boolean(show('modality'))}
                      aria-describedby={describedBy('modality')}
                      required
                    >
                      <option value="">Selecione</option>
                      {modalities.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    {err('modality')}
                  </div>
                  <div className={`field ${show('plan') ? 'is-invalid' : ''}`}>
                    <label htmlFor={`${uid}-plan`}>Plano de interesse</label>
                    <select
                      id={`${uid}-plan`}
                      name="plan"
                      value={data.plan}
                      onChange={(e) => set('plan', e.target.value as BookingData['plan'])}
                      onBlur={onBlur('plan')}
                      aria-invalid={Boolean(show('plan'))}
                      aria-describedby={describedBy('plan')}
                      required
                    >
                      <option value="">Selecione</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {err('plan')}
                  </div>
                </div>

                <div className="form__row">
                  <div className={`field ${show('date') ? 'is-invalid' : ''}`}>
                    <label htmlFor={`${uid}-date`}>Data preferencial</label>
                    <input
                      id={`${uid}-date`}
                      name="date"
                      type="date"
                      min={todayISO()}
                      max={maxDateISO()}
                      value={data.date}
                      onChange={(e) => set('date', e.target.value)}
                      onBlur={onBlur('date')}
                      aria-invalid={Boolean(show('date'))}
                      aria-describedby={describedBy('date', true)}
                      required
                    />
                    <p className="field-hint" id={`${uid}-date-hint`}>
                      Segunda a sábado, nos próximos 60 dias.
                    </p>
                    {err('date')}
                  </div>
                  <fieldset className={`field field--times ${show('time') ? 'is-invalid' : ''}`} aria-describedby={describedBy('time')}>
                    <legend id={`${uid}-time`} tabIndex={-1}>
                      Horário preferencial
                    </legend>
                    <div className="times">
                      {timeSlots.map((t) => (
                        <label key={t} className={`time ${data.time === t ? 'is-checked' : ''}`}>
                          <input type="radio" name="time" value={t} checked={data.time === t} onChange={() => set('time', t)} onBlur={onBlur('time')} />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                    {err('time')}
                  </fieldset>
                </div>

                <div className={`field field--check ${show('consent') ? 'is-invalid' : ''}`}>
                  <label className="check" htmlFor={`${uid}-consent`}>
                    <input
                      id={`${uid}-consent`}
                      type="checkbox"
                      name="consent"
                      checked={data.consent}
                      onChange={(e) => set('consent', e.target.checked)}
                      aria-invalid={Boolean(show('consent'))}
                      aria-describedby={describedBy('consent')}
                      required
                    />
                    <span className="check__box" aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span>Autorizo a equipe a entrar em contato pelo telefone informado para confirmar este pré-agendamento.</span>
                  </label>
                  {err('consent')}
                </div>

                <aside className="recap" aria-label="Resumo das escolhas">
                  <p className="recap__title">Resumo</p>
                  <dl>
                    <div>
                      <dt>Modalidade</dt>
                      <dd>{data.modality ? modalityById[data.modality].name : '—'}</dd>
                    </div>
                    <div>
                      <dt>Plano</dt>
                      <dd>{data.plan ? planById[data.plan].name : '—'}</dd>
                    </div>
                    <div>
                      <dt>Quando</dt>
                      <dd>{data.date ? `${formatDate(data.date)}${data.time ? `, ${data.time}` : ''}` : '—'}</dd>
                    </div>
                  </dl>
                </aside>

                <div className="form__actions">
                  <Button type="submit" size="lg">
                    Revisar pré-agendamento
                  </Button>
                  {!whatsappConfigured && <p className="form__demo">Modo demonstrativo: nenhum dado será enviado.</p>}
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="ready"
                className="ready"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <p className="ready__kicker">{whatsappConfigured ? 'Pronto para enviar' : 'Modo demonstrativo'}</p>
                <h3 className="ready__title" ref={readyRef} tabIndex={-1}>
                  {whatsappConfigured ? 'Revise e envie pelo WhatsApp.' : 'Pré-agendamento montado. Nada foi enviado.'}
                </h3>
                <p className="ready__text">
                  {whatsappConfigured
                    ? 'Ao tocar no botão, o WhatsApp abre com a mensagem abaixo. A aula só é confirmada quando a equipe responder.'
                    : `O número de WhatsApp de ${site.brand.name} ainda não foi configurado. Em produção, este botão abriria a conversa com a mensagem abaixo. Esta não é uma reserva confirmada.`}
                </p>
                <pre className="ready__msg" aria-label="Mensagem que seria enviada">
                  {message}
                </pre>
                <div className="ready__actions">
                  {whatsappConfigured ? (
                    <a className="btn btn--accent btn--lg" href={whatsappUrl(site.whatsappNumber, message)} target="_blank" rel="noopener noreferrer">
                      <span className="btn__label">Abrir WhatsApp</span>
                      <span className="btn__icon" aria-hidden="true">
                        <MessageCircle size={16} />
                      </span>
                    </a>
                  ) : (
                    <button type="button" className="btn btn--accent btn--lg" disabled aria-describedby={`${uid}-wa-note`}>
                      <span className="btn__label">Abrir WhatsApp</span>
                      <span className="btn__icon" aria-hidden="true">
                        <MessageCircle size={16} />
                      </span>
                    </button>
                  )}
                  <Button variant="line" icon={copied ? Check : Copy} onClick={copy}>
                    {copied ? 'Mensagem copiada' : 'Copiar mensagem'}
                  </Button>
                </div>
                {!whatsappConfigured && (
                  <p className="ready__note" id={`${uid}-wa-note`}>
                    Envio desativado: configure <code>whatsappNumber</code> em <code>src/config/site.ts</code>.
                  </p>
                )}
                <div className="ready__foot">
                  <button type="button" className="text-link" onClick={() => setStatus('editing')}>
                    Editar dados
                  </button>
                  <button type="button" className="text-link" onClick={reset}>
                    <RotateCcw size={14} aria-hidden="true" /> Recomeçar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

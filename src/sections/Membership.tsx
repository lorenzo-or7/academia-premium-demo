import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Minus } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { LineReveal } from '../components/motion'
import { Button, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { planMatrix, plans, type PlanId } from '../content/data'
import { useApp } from '../lib/app-context'

type Billing = 'monthly' | 'yearly'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function Membership() {
  const [selected, setSelected] = useState<PlanId>('performance')
  const [billing, setBilling] = useState<Billing>('monthly')
  const { startBooking } = useApp()
  const reduce = useReducedMotion()
  const selIndex = plans.findIndex((p) => p.id === selected)
  const plan = plans[selIndex]

  const onRadioKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const dirs: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    if (!(e.key in dirs)) return
    e.preventDefault()
    const ni = (selIndex + dirs[e.key] + plans.length) % plans.length
    setSelected(plans[ni].id)
    e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[ni]?.focus()
  }

  const price = (monthly: number) => (billing === 'monthly' ? monthly : Math.round(monthly * 0.85))

  return (
    <section id="planos" className="plans" aria-labelledby="plans-title">
      <div className="shell plans__head">
        <SectionIndex index="05" label="Membership" />
        <LineReveal id="plans-title" className="display plans__title" lines={['Escolha o seu', 'nível de acesso.']} label="Escolha o seu nível de acesso." />
        <div className="plans__controls">
          <div className="seg" role="group" aria-label="Forma de cobrança">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button key={b} type="button" className={`seg__btn ${billing === b ? 'is-active' : ''}`} aria-pressed={billing === b} onClick={() => setBilling(b)}>
                {billing === b && <motion.span layoutId="seg-pill" className="seg__pill" transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
                <span className="seg__label">{b === 'monthly' ? 'Mensal' : 'Anual'}</span>
              </button>
            ))}
          </div>
          <p className="plans__disclaimer">
            <strong>Valores fictícios.</strong> Preços apenas para demonstrar o layout; não representam uma oferta.
          </p>
        </div>
      </div>

      <div className="shell">
        <div className="matrix" style={{ ['--sel' as string]: selIndex }}>
          <div className="matrix__cols" role="radiogroup" aria-label="Planos" onKeyDown={onRadioKeys}>
            <div className="matrix__corner" aria-hidden="true">
              <span>Plano</span>
            </div>
            {plans.map((p, i) => {
              const checked = p.id === selected
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  className={`plan ${checked ? 'is-selected' : ''}`}
                  onClick={() => setSelected(p.id)}
                >
                  {checked && <motion.span layoutId="plan-frame" className="plan__frame" transition={{ type: 'spring', stiffness: 380, damping: 34 }} aria-hidden="true" />}
                  <span className="plan__top">
                    <span className="plan__num">0{i + 1}</span>
                    {p.id === 'performance' && <span className="plan__badge">Mais escolhido*</span>}
                  </span>
                  <span className="plan__name">{p.name}</span>
                  <span className="plan__line">{p.line}</span>
                  <span className="plan__price">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={billing}
                        className="plan__amount"
                        initial={{ y: reduce ? 0 : '60%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: reduce ? 0 : '-60%', opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                      >
                        {brl(price(p.demoMonthly))}
                      </motion.span>
                    </AnimatePresence>
                    <span className="plan__per">/mês{billing === 'yearly' ? ' no anual' : ''}</span>
                  </span>
                  <span className="plan__demo">valor demonstrativo</span>
                </button>
              )
            })}
          </div>

          <table className="matrix__table">
            <caption className="visually-hidden">Comparação de recursos entre os planos Essential, Performance e Elite</caption>
            <thead className="visually-hidden">
              <tr>
                <th scope="col">Recurso</th>
                {plans.map((p) => (
                  <th scope="col" key={p.id}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planMatrix.map((row) => (
                <tr key={row.label}>
                  <th scope="row">
                    {row.label}
                    {row.note && <span className="matrix__note"> ({row.note})</span>}
                  </th>
                  {plans.map((p, i) => {
                    const has = i >= row.from
                    return (
                      <td key={p.id} className={`${i === selIndex ? 'is-selected' : ''} ${has ? 'has' : 'not'}`}>
                        {has ? <Check size={16} strokeWidth={2.25} aria-label="Incluído" /> : <Minus size={16} aria-label="Não incluído" />}
                        <span className="matrix__cell-label" aria-hidden="true">
                          {p.name}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="plans__summary" aria-live="polite">
          <div>
            <p className="plans__summary-label">Plano selecionado</p>
            <p className="plans__summary-name">
              {plan.name} <span>· {plan.features.join(' · ')}</span>
            </p>
          </div>
          <Button size="lg" onClick={() => startBooking({ plan: plan.id, source: `Plano ${plan.name}` })}>
            Quero o plano {plan.name}
          </Button>
        </div>
        <p className="plans__foot">* Destaque ilustrativo. Condições, valores e benefícios reais são definidos por cada academia.</p>
      </div>
    </section>
  )
}

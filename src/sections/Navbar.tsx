import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { Menu, Moon, Sun, X, ArrowRight } from 'lucide-react'
import { useRef, useState, type MouseEvent } from 'react'
import { Wordmark } from '../components/ui'
import { EASE } from '../components/easing'
import { useActiveSection, useScrollLock, useDialog } from '../hooks'
import { useApp } from '../lib/app-context'
import type { Theme } from '../hooks/useTheme'
import { navLinks } from '../content/nav'


const ids = navLinks.map((l) => l.id)

export function Navbar({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: (o?: { x: number; y: number }) => void }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(ids)
  const { startBooking } = useApp()
  const reduce = useReducedMotion()
  const sheetRef = useRef<HTMLDivElement>(null)
  useScrollLock(open)
  useDialog(open, sheetRef, () => setOpen(false))

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    setHidden(y > 640 && y > prev + 4 && !open)
    if (y < prev - 4) setHidden(false)
  })

  const themeLabel = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
  const onTheme = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onToggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : 'tone-dark'}`}
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={{ y: hidden ? '-130%' : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="nav__bar">
          <a href="#topo" className="nav__brand" aria-label="VERTEX Performance Club, voltar ao topo">
            <Wordmark />
          </a>

          <nav className="nav__links" aria-label="Seções principais">
            <ul>
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} aria-current={active === l.id ? 'location' : undefined} className={active === l.id ? 'is-active' : ''}>
                    {active === l.id && <motion.span layoutId="nav-pill" className="nav__pill" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                    <span className="nav__label">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__actions">
            <button type="button" className="icon-btn" onClick={onTheme} aria-label={themeLabel} title={themeLabel}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  className="icon-btn__glyph"
                  initial={{ rotate: -60, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 60, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} aria-hidden="true" /> : <Moon size={18} strokeWidth={1.75} aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button type="button" className="btn btn--accent btn--sm nav__cta" onClick={() => startBooking({ source: 'Aula experimental' })}>
              <span className="btn__label">Aula experimental</span>
            </button>
            <button
              type="button"
              className="icon-btn nav__menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={sheetRef}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="sheet__top">
              <Wordmark />
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Fechar menu" data-autofocus>
                <X size={22} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Menu mobile" className="sheet__nav">
              <ol>
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={reduce ? false : { y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: EASE }}
                  >
                    <a href={`#${l.id}`} onClick={() => setOpen(false)} aria-current={active === l.id ? 'location' : undefined}>
                      <span className="sheet__num">0{i + 1}</span>
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <div className="sheet__foot">
              <button
                type="button"
                className="btn btn--accent btn--lg"
                onClick={() => {
                  setOpen(false)
                  startBooking({ source: 'Aula experimental' })
                }}
              >
                <span className="btn__label">Agendar aula experimental</span>
                <span className="btn__icon" aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
              </button>
              <button type="button" className="btn btn--line btn--lg" onClick={onTheme}>
                <span className="btn__label">{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
                <span className="btn__icon" aria-hidden="true">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

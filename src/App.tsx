import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { AppContext, scrollToId, type BookingPrefill } from './lib/app-context'
import { useTheme } from './hooks/useTheme'
import { Navbar } from './sections/Navbar'
import { Hero } from './sections/Hero'
import { Philosophy } from './sections/Philosophy'
import { Experiences } from './sections/Experiences'
import BelowFold from './sections/BelowFold'

export default function App() {
  const { theme, toggle } = useTheme()
  const [prefill, setPrefill] = useState<BookingPrefill & { nonce: number }>({ nonce: 0 })
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  const startBooking = useCallback((p: BookingPrefill = {}) => {
    setPrefill((prev) => ({ ...p, nonce: prev.nonce + 1 }))
    scrollToId('agendar')
  }, [])

  const ctx = useMemo(() => ({ prefill, startBooking }), [prefill, startBooking])

  return (
    <AppContext.Provider value={ctx}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <motion.div className="progress" style={{ scaleX: reduce ? scrollYProgress : progress }} aria-hidden="true" />
      <Navbar theme={theme} onToggleTheme={toggle} />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Philosophy />
        <Experiences />
        <BelowFold />
      </main>
    </AppContext.Provider>
  )
}

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { LineReveal } from '../components/motion'
import { Button, Img, Magnetic } from '../components/ui'
import { useApp } from '../lib/app-context'

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { startBooking } = useApp()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['-30%', '0%'])
  const imgScale = useTransform(scrollYProgress, [0, 0.6], [1.25, 1])
  const clip = useTransform(scrollYProgress, [0.05, 0.45], ['inset(16% 20% 16% 20%)', 'inset(0% 0% 0% 0%)'])

  const ghost = (text: string) => Array.from({ length: 4 }, () => text).join(' — ')

  return (
    <section ref={ref} id="comecar" className="finale tone-dark" aria-labelledby="finale-title">
      <motion.div className="finale__media" style={reduce ? undefined : { clipPath: clip }} aria-hidden="true">
        <motion.div className="finale__img" style={reduce ? undefined : { scale: imgScale }}>
          <Img name="finale" sizes="100vw" alt="" position="50% 25%" />
        </motion.div>
      </motion.div>
      <div className="finale__shade" aria-hidden="true" />

      {/* Camada decorativa em movimento; a headline legível fica estática à frente */}
      <div className="finale__ghost" aria-hidden="true">
        <motion.span style={reduce ? undefined : { x: x1 }}>{ghost('THE NEXT LEVEL')}</motion.span>
        <motion.span style={reduce ? undefined : { x: x2 }}>{ghost('STARTS HERE')}</motion.span>
      </div>

      <div className="shell finale__content">
        <LineReveal
          id="finale-title"
          className="finale__title"
          lines={[
            'THE NEXT LEVEL',
            <>
              STARTS HERE<span className="accent-dot">.</span>
            </>,
          ]}
          label="The next level starts here."
        />
        <div className="finale__cta">
          <p>Uma aula experimental. Nenhum compromisso. O próximo passo é seu.</p>
          <Magnetic>
            <Button size="lg" onClick={() => startBooking({ source: 'Começar minha experiência' })}>
              Começar minha experiência
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}

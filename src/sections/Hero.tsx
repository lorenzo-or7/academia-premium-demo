import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, CalendarCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, ButtonLink, Img, Magnetic } from '../components/ui'
import { EASE } from '../components/easing'
import { site } from '../config/site'
import { useApp } from '../lib/app-context'

const words = [
  ['YOUR', 'LIMITS.'],
  ['REDEFINED', '.'],
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { startBooking } = useApp()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const video = site.heroVideo
  const [videoFailed, setVideoFailed] = useState(false)
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (reduce) videoRef.current?.pause()
  }, [reduce])

  return (
    <section ref={ref} id="topo" className="hero tone-dark" aria-labelledby="hero-title">
      <motion.div className="hero__media" style={reduce ? undefined : { y: imgY, scale: imgScale }}>
        <Img name="hero" priority sizes="100vw" className="hero__img" position="50% 35%" alt="" />
        {video && !videoFailed && (
          <video
            ref={videoRef}
            className="hero__video"
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            <source src={video.mp4} type="video/mp4" />
          </video>
        )}
      </motion.div>
      <div className="hero__shade" aria-hidden="true" />

      <motion.div className="hero__inner shell" style={reduce ? undefined : { y: textY, opacity: fade }}>
        <motion.p
          className="hero__eyebrow"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          <span className="dot" aria-hidden="true" />
          {site.brand.name} {site.brand.descriptor}
        </motion.p>

        <h1 id="hero-title" className="hero__title" aria-label="Your limits. Redefined.">
          {words.map((line, li) => (
            <span className="hero__line" key={li} aria-hidden="true">
              {line.map((w, wi) => (
                <span className="mask" key={wi}>
                  <motion.span
                    className={w === '.' ? 'accent-dot' : undefined}
                    initial={reduce ? { opacity: 0 } : { y: '110%' }}
                    animate={reduce ? { opacity: 1 } : { y: '0%' }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.35 + li * 0.16 + wi * 0.08 }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="hero__foot">
          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.95 }}
          >
            Um novo padrão de performance começa aqui.
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
          >
            <Magnetic>
              <ButtonLink href="#filosofia" size="lg">
                Conhecer a experiência
              </ButtonLink>
            </Magnetic>
            <Button variant="ghost" size="lg" icon={CalendarCheck} onClick={() => startBooking({ source: 'Aula experimental' })}>
              Agendar aula experimental
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="hero__rail shell" aria-hidden={false}>
        <a href="#filosofia" className="scroll-cue">
          <span className="scroll-cue__track" aria-hidden="true">
            <span className="scroll-cue__thumb" />
          </span>
          <span>Role para explorar</span>
          <ArrowDown size={14} aria-hidden="true" />
        </a>
        {video && !videoFailed && (
          <button
            type="button"
            className="hero__video-toggle"
            onClick={() => {
              const v = videoRef.current
              if (!v) return
              if (v.paused) {
                void v.play()
                setPaused(false)
              } else {
                v.pause()
                setPaused(true)
              }
            }}
          >
            {paused ? 'Reproduzir vídeo' : 'Pausar vídeo'}
          </button>
        )}
        <p className="hero__meta">
          <span>{site.demoMode ? 'Protótipo demonstrativo · marca fictícia' : site.brand.descriptor}</span>
          <span aria-hidden="true">/</span>
          <span>Strength · Conditioning · Recovery</span>
        </p>
      </div>
    </section>
  )
}

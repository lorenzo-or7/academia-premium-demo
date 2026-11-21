import { FadeUp, ImageReveal, LineReveal, Parallax, ScrollWords } from '../components/motion'
import { Img, SectionIndex } from '../components/ui'

const principles = [
  {
    n: '01',
    title: 'Disciplina',
    text: 'Constância vence intensidade isolada. Cada rotina é desenhada para caber na sua vida real.',
  },
  {
    n: '02',
    title: 'Método',
    text: 'Progressão planejada, técnica revisada e ciclos com começo, meio e revisão.',
  },
  {
    n: '03',
    title: 'Ambiente',
    text: 'Espaço, luz e silêncio pensados para concentração. Nada compete com o seu treino.',
  },
]

export function Philosophy() {
  return (
    <section id="filosofia" className="philo" aria-labelledby="philo-title">
      <div className="shell philo__grid">
        <div className="philo__head">
          <SectionIndex index="01" label="The Philosophy" />
          <LineReveal id="philo-title" className="display philo__title" lines={['Mais que', 'treinar.', <em key="e">Evoluir.</em>]} label="Mais que treinar. Evoluir." />
        </div>

        <div className="philo__visual">
          <ImageReveal className="philo__main" from="bottom">
            <Parallax distance={50}>
              <Img name="philosophy" sizes="(min-width: 1024px) 38vw, 80vw" position="50% 30%" />
            </Parallax>
          </ImageReveal>
          <ImageReveal className="philo__detail" from="left" delay={0.25}>
            <Img name="grip" sizes="(min-width: 1024px) 18vw, 40vw" position="50% 40%" />
          </ImageReveal>
          <p className="philo__caption" aria-hidden="true">
            <span>Fig. 01</span> Preparação antes da carga
          </p>
        </div>

        <div className="philo__copy">
          <ScrollWords
            className="philo__statement"
            text="A VERTEX nasce para quem entende o treino como parte da identidade. Não vendemos atalhos: oferecemos estrutura, atenção e um ambiente que torna a constância natural."
          />
        </div>
        <ol className="philo__list">
          {principles.map((p, i) => (
            <FadeUp as="li" key={p.n} delay={i * 0.08} className="philo__item">
              <span className="philo__n">{p.n}</span>
              <h3 className="philo__item-title">{p.title}</h3>
              <p>{p.text}</p>
            </FadeUp>
          ))}
        </ol>
      </div>
    </section>
  )
}

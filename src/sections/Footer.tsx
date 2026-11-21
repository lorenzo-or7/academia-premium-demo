import { ArrowUpRight } from 'lucide-react'
import { Wordmark } from '../components/ui'
import { site } from '../config/site'
import { modalities, plans } from '../content/data'
import { useApp } from '../lib/app-context'
import { navLinks } from '../content/nav'

export function Footer() {
  const { startBooking } = useApp()
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <Wordmark className="footer__mark" />
          <p className="footer__tag">{site.brand.tagline}</p>
          <button type="button" className="btn btn--line btn--md" onClick={() => startBooking({ source: 'Rodapé' })}>
            <span className="btn__label">Agendar aula experimental</span>
          </button>
        </div>

        <nav className="footer__col" aria-label="Navegação do rodapé">
          <h2 className="footer__h">Navegação</h2>
          <ul>
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#encontre">Simulador de treino</a>
            </li>
            <li>
              <a href="#agendar">Pré-agendamento</a>
            </li>
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="footer__h">Modalidades</h2>
          <ul>
            {modalities.map((m) => (
              <li key={m.id}>
                <button type="button" className="footer__link" onClick={() => startBooking({ modality: m.id, source: m.name })}>
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h2 className="footer__h">Planos</h2>
          <ul>
            {plans.map((p) => (
              <li key={p.id}>
                <button type="button" className="footer__link" onClick={() => startBooking({ plan: p.id, source: `Plano ${p.name}` })}>
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h2 className="footer__h">Contato demonstrativo</h2>
          <address>
            {site.contact.addressLines.map((l) => (
              <span key={l}>{l}</span>
            ))}
            <span>{site.contact.phoneDisplay}</span>
            <span>{site.contact.email}</span>
          </address>
          <dl className="footer__hours">
            {site.contact.hours.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
          {site.socials.length > 0 && (
            <ul className="footer__social">
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="shell footer__big" aria-hidden="true" data-word={site.brand.name} />

      <div className="shell footer__base">
        {site.demoMode && (
          <p className="footer__demo">
            Protótipo demonstrativo. {site.brand.name} é uma marca fictícia; preços, horários, histórias, contatos e endereço são ilustrativos. Fotografias: Unsplash.
          </p>
        )}
        <p className="footer__credit">
          Design &amp; desenvolvimento{' '}
          <a href={site.credit.href} target="_blank" rel="noopener noreferrer">
            {site.credit.label}
          </a>
        </p>
      </div>
    </footer>
  )
}

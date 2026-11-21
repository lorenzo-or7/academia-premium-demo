# Or7.dev · 06.02 — Academia Premium

Protótipo comercial demonstrativo de website para academia premium.
Marca fictícia: **VERTEX — Performance Club**. Conceito: *Performance Is a Lifestyle*.

React 19 · TypeScript · Vite · Motion · Lucide · CSS moderno (sem framework de UI).

> Tudo aqui é demonstrativo: marca, preços, horários, vagas, histórias (personas ilustrativas), contato e endereço.
> Nenhum dado é enviado ou armazenado. O pré-agendamento só sai pelo WhatsApp quando um número for configurado.

## Executar

```bash
npm install
npm run dev            # desenvolvimento
npm run build          # typecheck + build de produção (dist/)
npm run preview        # serve o build em http://localhost:4173
```

## Verificações

```bash
npm run typecheck      # tsc -b
npm run lint           # oxlint
npm run test:e2e       # 106 verificações em Chrome/Edge local (precisa do preview rodando)
SHOTS=1 npm run test:e2e   # também salva capturas em ./test-results
```

O e2e cobre: navegação, seção ativa, tema claro/escuro, painéis de modalidades, galeria + lightbox,
simulador (validação, voltar, reiniciar), planos, agenda (teclado, filtros, estado vazio), pré-agendamento
(validação acessível, máscara, consentimento, estado demonstrativo), menu mobile, touch targets, overflow
horizontal em 320–1920 px nos dois temas, `prefers-reduced-motion` e axe-core (WCAG A/AA, carregado de
cdnjs.cloudflare.com durante o teste). `BASE_URL` muda o endereço testado; `BROWSER_PATH` aponta outro navegador.

## Personalizar para um cliente

| O quê | Onde |
|---|---|
| Nome, descritor, WhatsApp, vídeo da hero, contato, horários, redes, modo demo | `src/config/site.ts` |
| Modalidades, espaços, planos, matriz de benefícios, agenda, histórias | `src/content/data.ts` |
| Links da navbar | `src/content/nav.ts` |
| Lógica do simulador (pesos por objetivo/formato/experiência) | `src/lib/finder.ts` |
| Validação, máscara e mensagem do pré-agendamento | `src/lib/booking.ts` |
| Fotografias e textos alternativos | `scripts/images.json` + `npm run images`, alt em `src/content/images.ts` |
| Paleta, tipografia, tons claro/escuro | `src/styles/tokens.css` |

- **WhatsApp:** defina `whatsappNumber` (somente dígitos com DDI, ex.: `"5511900000000"`). Vazio = modo demonstrativo: o botão fica desabilitado e a mensagem pode ser copiada.
- **Vídeo da hero:** defina `heroVideo: { mp4, webm? }` com um asset licenciado. Sem vídeo, a hero usa a fotografia (fallback estático). Com vídeo, há botão de pausa e respeito a `prefers-reduced-motion`.
- **Redes sociais:** só aparecem no rodapé quando `socials` tiver itens.
- **Modo demo:** `demoMode: false` remove os selos de conteúdo demonstrativo.

## Estrutura

```
src/
  config/site.ts        configuração comercial
  content/              dados, navegação, imagens
  components/           ui (Img com fallback, botões, magnetic), motion (reveals, parallax, scroll words)
  hooks/                seção ativa, trava de scroll, diálogo acessível, tema
  lib/                  simulador, pré-agendamento, contexto de app
  sections/             Navbar, Hero, Philosophy, Experiences, Space, Finder, Membership,
                        Schedule, Stories, Book, FinalCta, Footer
  styles/               tokens, base, sections
public/fonts            Clash Display e Satoshi (Fontshare, ITF Free Font License), auto-hospedadas
scripts/                fetch-images, e2e
```

Fotografias: [Unsplash](https://unsplash.com/license) — URLs de origem em `src/content/image-meta.json`.

## GitHub Pages

Repositorio: `academia-premium-demo` em **Settings > Pages > GitHub Actions**.

Site: https://lorenzo-or7.github.io/academia-premium-demo/

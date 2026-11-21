/**
 * Testes de ponta a ponta com o Chrome/Edge instalado (playwright-core).
 *
 *   npm run build && npm run preview   (em outro terminal)
 *   npm run test:e2e                    (BASE_URL opcional, padrão http://localhost:4173)
 *   SHOTS=1 npm run test:e2e            (salva capturas em ./test-results)
 *
 * A auditoria axe-core carrega o script de cdnjs.cloudflare.com durante o teste.
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const SHOTS = Boolean(process.env.SHOTS)
const outDir = path.resolve('test-results')
if (SHOTS) fs.mkdirSync(outDir, { recursive: true })

const executablePath = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
  .filter(Boolean)
  .find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('Nenhum Chrome/Edge encontrado. Defina BROWSER_PATH.')
  process.exit(2)
}

const results = []
const check = (cond, name, info = '') => results.push({ ok: Boolean(cond), name, info })

const browser = await chromium.launch({ executablePath, headless: true })

async function newPage(viewport, opts = {}, theme = 'dark') {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts })
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem('vertex-theme', t)
    } catch {
      /* ignore */
    }
  }, theme)
  const page = await ctx.newPage()
  const errors = []
  const posts = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('request', (r) => {
    if (r.method() !== 'GET') posts.push(`${r.method()} ${r.url()}`)
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  return { page, ctx, errors, posts }
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 70))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1200)
}

/** Detecta conteúdo além da viewport que não está recortado por um contêiner rolável/oculto. */
const overflow = (page) =>
  page.evaluate(() => {
    const doc = document.documentElement
    const cw = doc.clientWidth
    const offenders = []
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || (r.right <= cw + 1 && r.left >= -1)) continue
      const cs = getComputedStyle(el)
      if (cs.position === "fixed" || el.closest("[aria-hidden=true]")) continue
      let clipped = false
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX
        if (ox !== "visible") {
          const ar = a.getBoundingClientRect()
          if (ar.right <= cw + 1 && ar.left >= -1) {
            clipped = true
            break
          }
        }
      }
      if (!clipped) offenders.push(el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0] + "@" + Math.round(r.left) + ".." + Math.round(r.right))
      if (offenders.length > 6) break
    }
    return { sw: doc.scrollWidth, cw, offenders }
  })

const prefillValues = (page) =>
  page.evaluate(() => {
    const form = document.querySelector('#agendar form')
    if (!form) return null
    const get = (n) => form.querySelector(`[name="${n}"]`)
    return {
      modality: get('modality')?.value,
      plan: get('plan')?.value,
      date: get('date')?.value,
      time: form.querySelector('input[name="time"]:checked')?.value ?? '',
      source: form.querySelector('.form__source')?.textContent?.trim() ?? '',
    }
  })

/* ------------------------------------------------------------------ */
/* 1. Fluxos funcionais — desktop                                      */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors, posts } = await newPage({ width: 1440, height: 900 })
  await page.waitForTimeout(1500)

  // Skip link + teclado
  await page.keyboard.press('Tab')
  check(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'Tab inicial foca "Pular para o conteúdo"')

  // Hero
  check((await page.locator('h1').count()) === 1, 'existe exatamente um h1')
  check((await page.locator('h1').getAttribute('aria-label')) === 'Your limits. Redefined.', 'h1 com headline acessível')
  check(await page.getByRole('link', { name: 'Conhecer a experiência' }).isVisible(), 'CTA "Conhecer a experiência" visível')

  // Navbar: transição ao rolar e seção ativa
  await page.evaluate(() => document.getElementById('planos').scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(900)
  check(await page.locator('.nav.is-scrolled').count(), 'navbar muda de estado após o scroll')
  await page.evaluate(() => window.scrollBy(0, -10))
  await page.waitForTimeout(700)
  check((await page.locator('.nav__links a[aria-current="location"]').textContent()) === 'Planos', 'indicador de seção ativa aponta "Planos"')

  // Tema
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Ativar modo claro' }).click()
  await page.waitForTimeout(900)
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'light', 'alternância para modo claro')
  check((await page.evaluate(() => localStorage.getItem('vertex-theme'))) === 'light', 'preferência de tema persistida')
  check(
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) === 'rgb(243, 244, 239)',
    'modo claro aplica background #F3F4EF',
  )
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click()
  await page.waitForTimeout(900)
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'retorno ao modo escuro')

  await scrollThrough(page)

  // Experiences
  const triggers = page.locator('.panel__trigger')
  check((await triggers.count()) === 6, '6 modalidades')
  await triggers.nth(3).click()
  await page.waitForTimeout(900)
  check((await triggers.nth(3).getAttribute('aria-expanded')) === 'true', 'painel Recovery expande ao clicar')
  check((await triggers.nth(0).getAttribute('aria-expanded')) === 'false', 'painel anterior recolhe')
  const recW = await page.locator('.panel').nth(3).evaluate((el) => el.getBoundingClientRect().width)
  const strW = await page.locator('.panel').nth(0).evaluate((el) => el.getBoundingClientRect().width)
  check(recW > strW * 3, 'painel ativo ocupa a maior largura', `${recW} vs ${strW}`)
  await page.locator('.panel').nth(1).hover()
  await page.waitForTimeout(500)
  check((await triggers.nth(1).getAttribute('aria-expanded')) === 'true', 'hover em painel ativa a modalidade (desktop)')
  await triggers.nth(3).click()
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: 'Experimentar Recovery' }).click()
  await page.waitForTimeout(1500)
  let pf = await prefillValues(page)
  check(pf?.modality === 'recovery', 'CTA de modalidade pré-seleciona Recovery no formulário', JSON.stringify(pf))
  check(
    await page.evaluate(() => document.activeElement?.getAttribute('name') === 'name'),
    'após CTA, foco vai para o campo Nome',
  )
  // Group CTA -> agenda filtrada
  await page.evaluate(() => document.getElementById('experiencias').scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(400)
  await triggers.nth(5).click()
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: 'Ver aulas na agenda' }).click()
  await page.waitForTimeout(1200)
  check((await page.locator('.chip[aria-pressed="true"]').textContent()) === 'Classes', 'CTA Group Classes filtra a agenda')
  await page.locator('.chip', { hasText: 'Todas' }).click()

  // Space gallery
  await page.evaluate(() => document.getElementById('espaco').scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(600)
  const name = () => page.locator('.space__name').first().textContent()
  check((await name()) === 'Área de musculação', 'galeria inicia na área de musculação')
  await page.getByRole('button', { name: 'Próxima imagem' }).first().click()
  await page.waitForTimeout(1000)
  check((await name()) === 'Espaço funcional', 'botão próxima imagem avança')
  await page.locator('.space__item').nth(3).click()
  await page.waitForTimeout(1000)
  check((await name()) === 'Recovery zone', 'lista lateral seleciona Recovery zone')
  await page.locator('.space__item').nth(3).focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1000)
  check((await name()) === 'Vestiários premium', 'seta → navega a galeria')
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1000)
  check((await name()) === 'Área de musculação', 'galeria é circular')
  await page.locator('.space__frame').last().click()
  await page.waitForTimeout(700)
  check(await page.getByRole('dialog').isVisible(), 'lightbox abre')
  check(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Fechar galeria'), 'foco vai para fechar no lightbox')
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)
  check((await page.locator('.lightbox figcaption strong').textContent()) === 'Espaço funcional', 'seta navega dentro do lightbox')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  check((await page.getByRole('dialog').count()) === 0, 'Esc fecha o lightbox')
  check(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'scroll liberado após fechar')

  // Finder
  await page.evaluate(() => document.getElementById('encontre').scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(600)
  const cont = page.getByRole('button', { name: 'Continuar' })
  check(await page.getByRole('button', { name: 'Pergunta anterior' }).isDisabled(), 'Voltar desabilitado na primeira pergunta')
  await cont.click()
  await page.waitForTimeout(300)
  check((await page.locator('.finder .field-error').textContent())?.includes('Selecione'), 'validação exige uma opção')
  await page.getByRole('radio', { name: /Ganhar força/ }).click()
  await cont.click()
  await page.waitForTimeout(600)
  check((await page.locator('.finder__q').textContent()) === 'Qual sua experiência?', 'avança para a pergunta 2')
  await page.getByRole('radio', { name: /Começando agora/ }).focus()
  await page.keyboard.press('ArrowDown')
  check((await page.getByRole('radio', { name: /Retomando/ }).getAttribute('aria-checked')) === 'true', 'setas selecionam opções no radiogroup')
  await page.getByRole('button', { name: 'Pergunta anterior' }).click()
  await page.waitForTimeout(600)
  check((await page.getByRole('radio', { name: /Ganhar força/ }).getAttribute('aria-checked')) === 'true', 'voltar preserva a resposta anterior')
  await cont.click()
  await page.waitForTimeout(600)
  await cont.click()
  await page.waitForTimeout(600)
  await page.getByRole('radio', { name: /3 a 4 dias/ }).click()
  await cont.click()
  await page.waitForTimeout(600)
  await page.getByRole('radio', { name: /Acompanhado/ }).click()
  await page.getByRole('button', { name: 'Ver recomendação' }).click()
  await page.waitForTimeout(900)
  const resTitle = await page.locator('.result__title').textContent()
  check(['Personal Training', 'Performance Coaching', 'Strength'].some((m) => resTitle?.includes(m)), 'recomendação coerente (força + retomando + acompanhado)', resTitle)
  check((await page.locator('.result__facts dd').nth(2).textContent()) === 'Elite', 'formato acompanhado sugere plano Elite')
  check((await page.locator('.result__facts dd').first().textContent())?.includes('3 sessões'), 'frequência ajustada para quem retoma')
  await page.getByRole('button', { name: 'Refazer' }).click()
  await page.waitForTimeout(700)
  check((await page.locator('.finder__q').textContent()) === 'Qual seu principal objetivo?', 'reiniciar volta à pergunta 1')
  check((await page.locator('.finder [role="radio"][aria-checked="true"]').count()) === 0, 'reiniciar limpa as respostas')

  // Membership
  await page.evaluate(() => document.getElementById('planos').scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(500)
  check(await page.getByRole('button', { name: 'Quero o plano Performance' }).isVisible(), 'Performance selecionado por padrão')
  await page.getByRole('radio', { name: /Elite/ }).click()
  await page.waitForTimeout(500)
  check(await page.getByRole('button', { name: 'Quero o plano Elite' }).isVisible(), 'CTA dinâmico acompanha o plano Elite')
  await page.getByRole('radio', { name: /Elite/ }).focus()
  await page.keyboard.press('ArrowLeft')
  check((await page.getByRole('radio', { name: /Performance/ }).getAttribute('aria-checked')) === 'true', 'setas trocam de plano')
  const before = await page.locator('.plan__amount').first().textContent()
  await page.getByRole('button', { name: 'Anual' }).click()
  await page.waitForTimeout(700)
  const after = await page.locator('.plan__amount').first().textContent()
  check(before !== after, 'alternância mensal/anual atualiza valores', `${before} → ${after}`)
  check((await page.locator('.plans__disclaimer').textContent())?.includes('fictícios'), 'aviso de valores fictícios')
  await page.getByRole('button', { name: 'Quero o plano Performance' }).click()
  await page.waitForTimeout(1300)
  pf = await prefillValues(page)
  check(pf?.plan === 'performance', 'CTA do plano pré-seleciona o plano no formulário', JSON.stringify(pf))

  // Schedule
  await page.evaluate(() => document.getElementById('agenda').scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(500)
  await page.getByRole('tab', { name: /Seg/ }).click()
  await page.waitForTimeout(600)
  check((await page.locator('.slot').count()) === 5, 'segunda tem 5 aulas')
  await page.getByRole('tab', { name: /Seg/ }).focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(600)
  check((await page.getByRole('tab', { name: /Ter/ }).getAttribute('aria-selected')) === 'true', 'seta → muda o dia')
  await page.keyboard.press('End')
  await page.waitForTimeout(600)
  check((await page.getByRole('tab', { name: /Sáb/ }).getAttribute('aria-selected')) === 'true', 'End vai para sábado')
  await page.locator('.chip', { hasText: 'Coaching' }).click()
  await page.waitForTimeout(600)
  check(await page.locator('.sched__empty').isVisible(), 'estado vazio quando não há aulas')
  await page.getByRole('button', { name: 'Ver todas as modalidades' }).click()
  await page.waitForTimeout(600)
  check((await page.locator('.slot').count()) === 3, 'limpar filtro restaura as aulas')
  await page.getByRole('tab', { name: /Qua/ }).click()
  await page.waitForTimeout(600)
  check(await page.locator('.slot.is-full .slot__main').isDisabled(), 'turma completa fica desabilitada')
  await page.locator('.slot__main', { hasText: 'Express Conditioning' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Agendar esta aula' }).click()
  await page.waitForTimeout(1400)
  pf = await prefillValues(page)
  const isWed = pf?.date ? new Date(pf.date + 'T12:00:00').getDay() === 3 : false
  check(pf?.modality === 'group' && pf?.time === '12:15' && isWed, 'aula selecionada pré-preenche modalidade, quarta-feira e 12:15', JSON.stringify(pf))
  check(pf?.source?.includes('Express Conditioning'), 'formulário mostra a aula selecionada')

  // Booking — validação
  await page.evaluate(() => {
    const f = document.querySelector('#agendar form')
    f.querySelector('[name="modality"]').value = ''
  })
  await page.getByRole('button', { name: 'Revisar pré-agendamento' }).click()
  await page.waitForTimeout(500)
  const summary = page.locator('.form__summary')
  check(await summary.isVisible(), 'resumo de erros aparece ao enviar vazio')
  check(await page.evaluate(() => document.activeElement?.classList.contains('form__summary')), 'foco vai para o resumo de erros')
  check((await page.locator('[aria-invalid="true"]').count()) >= 3, 'campos inválidos marcados com aria-invalid')
  await page.locator('.form__summary a').first().click()
  check(await page.evaluate(() => document.activeElement?.getAttribute('name') === 'name'), 'link do resumo leva ao campo')
  await page.fill('[name="name"]', 'A')
  await page.locator('[name="phone"]').focus()
  await page.waitForTimeout(200)
  check((await page.locator('#agendar .field-error').first().textContent())?.includes('3 caracteres'), 'erro de nome curto')
  await page.fill('[name="name"]', 'Pessoa Teste')
  await page.fill('[name="phone"]', '119876')
  await page.locator('[name="phone"]').blur()
  check((await page.locator('[name="phone"]').inputValue()) === '(11) 9876', 'máscara de telefone')
  await page.fill('[name="phone"]', '11987654321')
  check((await page.locator('[name="phone"]').inputValue()) === '(11) 98765-4321', 'máscara de celular completa')
  await page.selectOption('[name="modality"]', 'group')
  // domingo deve ser rejeitado
  const sunday = await page.evaluate(() => {
    const d = new Date()
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7))
    return d.toISOString().slice(0, 10)
  })
  await page.fill('[name="date"]', sunday)
  await page.getByRole('button', { name: 'Revisar pré-agendamento' }).click()
  await page.waitForTimeout(400)
  check((await page.locator('.form__summary').textContent())?.includes('domingos'), 'domingo é rejeitado')
  pf = await prefillValues(page)
  const monday = await page.evaluate(() => {
    const d = new Date()
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7))
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  })
  await page.fill('[name="date"]', monday)
  await page.getByRole('button', { name: 'Revisar pré-agendamento' }).click()
  await page.waitForTimeout(400)
  check((await page.locator('.form__summary').textContent())?.includes('Autorize'), 'consentimento é obrigatório')
  await page.locator('label.check').click()
  await page.locator('.recap').waitFor()
  check((await page.locator('.recap').textContent())?.includes('Group Classes'), 'resumo das escolhas atualiza em tempo real')
  await page.getByRole('button', { name: 'Revisar pré-agendamento' }).click()
  await page.waitForTimeout(900)
  check(await page.locator('.ready').isVisible(), 'formulário válido mostra a etapa de revisão')
  check((await page.locator('.ready__title').textContent())?.includes('Nada foi enviado'), 'sem número configurado: estado demonstrativo explícito')
  check(await page.locator('.ready button:has-text("Abrir WhatsApp")').isDisabled(), 'WhatsApp desabilitado sem número configurado')
  check((await page.locator('a[href*="wa.me"]').count()) === 0, 'nenhum link para contato inventado')
  const msg = await page.locator('.ready__msg').textContent()
  check(msg?.includes('Pessoa Teste') && msg?.includes('pré-agendamento'), 'mensagem contém o resumo do pré-agendamento')
  check(!/confirmad[ao]/i.test((await page.locator('.ready').textContent()).replace('não é uma reserva confirmada', '').replace('confirmada quando', '')), 'nenhuma confirmação de reserva simulada')
  await page.getByRole('button', { name: 'Editar dados' }).click()
  await page.waitForTimeout(700)
  check((await page.locator('[name="name"]').inputValue()) === 'Pessoa Teste', 'editar preserva os dados')
  await page.getByRole('button', { name: 'Revisar pré-agendamento' }).click()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Recomeçar' }).click()
  await page.waitForTimeout(800)
  check((await page.locator('[name="name"]').inputValue()) === '', 'recomeçar limpa o formulário')

  // Final CTA + footer
  await page.getByRole('button', { name: 'Começar minha experiência' }).click()
  await page.waitForTimeout(1200)
  check((await prefillValues(page))?.source?.includes('Começar minha experiência'), 'CTA final leva ao pré-agendamento')
  check((await page.locator('footer').textContent())?.includes('Protótipo demonstrativo'), 'rodapé exibe aviso de protótipo')
  const ext = await page.$$eval('a[target="_blank"]', (as) => as.every((a) => (a.rel || '').includes('noopener')))
  check(ext, 'links externos com rel="noopener"')

  check(posts.length === 0, 'nenhuma requisição de envio de dados (somente GET)', posts.join(', '))
  check(errors.length === 0, 'sem erros de console (desktop)', errors.join(' | '))
  if (SHOTS) await page.screenshot({ path: path.join(outDir, 'desktop-full.png'), fullPage: true })
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 2. Mobile: menu dedicado, acordeão, overflow                        */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors } = await newPage({ width: 390, height: 844 }, { isMobile: true, hasTouch: true })
  await page.waitForTimeout(1200)
  check(!(await page.locator('.nav__links').isVisible()), 'links desktop ocultos no mobile')
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.waitForTimeout(800)
  check(await page.getByRole('dialog', { name: 'Menu' }).isVisible(), 'menu mobile abre')
  check(await page.evaluate(() => document.body.style.overflow === 'hidden'), 'menu trava o scroll')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(700)
  check((await page.getByRole('dialog').count()) === 0, 'Esc fecha o menu')
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.waitForTimeout(800)
  await page.getByRole('dialog').getByRole('link', { name: /Planos/ }).click()
  await page.waitForTimeout(1500)
  check((await page.getByRole('dialog').count()) === 0, 'link do menu fecha o menu')
  const top = await page.evaluate(() => document.getElementById('planos').getBoundingClientRect().top)
  check(Math.abs(top) < 140, 'link do menu leva à seção', String(top))

  await scrollThrough(page)
  const t = page.locator('.panel__trigger')
  await t.nth(2).click()
  await page.waitForTimeout(900)
  const h = await page.locator('.panel').nth(2).evaluate((el) => el.getBoundingClientRect().height)
  check(h > 300, 'acordeão mobile expande a modalidade', String(h))
  check(await page.getByRole('button', { name: 'Conversar sobre Coaching' }).isVisible(), 'CTA contextual visível no mobile')

  // touch targets
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button, a[href], input[type="checkbox"] + .check__box, .time span')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.closest('[inert]') && !el.closest('.visually-hidden') && !el.classList.contains('skip-link')
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return { el: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`, w: Math.round(r.width), h: Math.round(r.height) }
      })
      .filter((x) => (x.h < 44 || x.w < 44) && !x.el.includes('check__box')),
  )
  check(small.length === 0, 'touch targets ≥ 44px no mobile', JSON.stringify(small.slice(0, 8)))
  check(errors.length === 0, 'sem erros de console (mobile)', errors.join(' | '))
  if (SHOTS) await page.screenshot({ path: path.join(outDir, 'mobile-full.png'), fullPage: true })
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 3. Overflow horizontal em várias larguras e nos dois temas          */
/* ------------------------------------------------------------------ */
for (const theme of ['dark', 'light']) {
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    const { page, ctx } = await newPage({ width, height: 900 }, {}, theme)
    await scrollThrough(page)
    const o = await overflow(page)
    check(o.sw <= o.cw + 1 && o.offenders.length === 0, `sem overflow horizontal em ${width}px (${theme})`, JSON.stringify(o))
    if (SHOTS && (width === 390 || width === 768 || width === 1440)) {
      await page.screenshot({ path: path.join(outDir, `${theme}-${width}.png`), fullPage: true })
    }
    await ctx.close()
  }
}

/* ------------------------------------------------------------------ */
/* 4. Reduced motion                                                   */
/* ------------------------------------------------------------------ */
{
  const { page, ctx, errors } = await newPage({ width: 1280, height: 800 }, { reducedMotion: 'reduce' })
  await page.waitForTimeout(800)
  const opacity = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__title .mask > span')).opacity)
  check(Number(opacity) > 0.95, 'reduced motion: headline visível sem animação de máscara', opacity)
  const tr = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__title .mask > span')).transform)
  check(tr === 'none' || tr === 'matrix(1, 0, 0, 1, 0, 0)', 'reduced motion: sem deslocamento da headline', tr)
  check(errors.length === 0, 'sem erros com reduced motion', errors.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------------ */
/* 5. Acessibilidade (axe-core) nos dois temas                         */
/* ------------------------------------------------------------------ */
for (const theme of ['dark', 'light']) {
  const { page, ctx } = await newPage({ width: 1280, height: 900 }, { reducedMotion: 'reduce' }, theme)
  await scrollThrough(page)
  try {
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' })
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })
      return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' ; ')}`)
    })
    check(res.length === 0, `axe WCAG A/AA sem violações (${theme})`, res.join('\n    '))
  } catch (e) {
    check(false, `axe carregado (${theme})`, e.message)
  }
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${!r.ok && r.info ? `\n    ${r.info}` : ''}`)
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram.`)
process.exit(failed.length ? 1 : 0)

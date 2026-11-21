import { modalityById, planById, type ModalityId, type PlanId } from '../content/data'
import { site } from '../config/site'

export interface BookingData {
  name: string
  phone: string
  modality: ModalityId | ''
  plan: PlanId | ''
  date: string
  time: string
  consent: boolean
}

export type BookingErrors = Partial<Record<keyof BookingData, string>>

export const emptyBooking: BookingData = {
  name: '',
  phone: '',
  modality: '',
  plan: '',
  date: '',
  time: '',
  consent: false,
}

/** Horários preferenciais oferecidos (demonstrativos). */
export const timeSlots = ['06:30', '07:30', '09:00', '12:15', '18:00', '18:30', '19:45', '20:00']

/** Remove caracteres de controle e limita tamanho. */
export function clean(value: string, max = 80) {
  const printable = Array.from(value)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0
      return code >= 32 && code !== 127 && ch !== '<' && ch !== '>'
    })
    .join('')
  return printable.replace(/\s+/g, ' ').slice(0, max)
}

export function digits(value: string) {
  return value.replace(/\D/g, '')
}

/** Máscara brasileira: (11) 91234-5678 ou (11) 1234-5678. */
export function maskPhone(value: string) {
  const d = digits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO() {
  return toISODate(new Date())
}

export function maxDateISO() {
  const d = new Date()
  d.setDate(d.getDate() + 60)
  return toISODate(d)
}

/** Próxima data (a partir de hoje) para um dia da semana (1 = segunda … 6 = sábado). */
export function nextDateForWeekday(weekday: number, from = new Date()) {
  const d = new Date(from)
  const current = d.getDay() // 0 = domingo
  let diff = (weekday - current + 7) % 7
  if (diff === 0) diff = 7
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

export function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export function validate(data: BookingData): BookingErrors {
  const e: BookingErrors = {}
  const name = data.name.trim()
  if (!name) e.name = 'Informe seu nome.'
  else if (name.length < 3 || !/^[\p{L}][\p{L}' .-]+$/u.test(name)) e.name = 'Use apenas letras, com pelo menos 3 caracteres.'

  const phone = digits(data.phone)
  if (!phone) e.phone = 'Informe um telefone com DDD.'
  else if (phone.length < 10 || phone.length > 11) e.phone = 'O telefone precisa ter DDD e 8 ou 9 dígitos.'

  if (!data.modality) e.modality = 'Escolha uma modalidade.'
  if (!data.plan) e.plan = 'Escolha um plano de interesse.'

  if (!data.date) e.date = 'Escolha uma data.'
  else if (data.date < todayISO()) e.date = 'Escolha uma data a partir de hoje.'
  else if (data.date > maxDateISO()) e.date = 'Escolha uma data nos próximos 60 dias.'
  else {
    const [y, m, d] = data.date.split('-').map(Number)
    if (new Date(y, m - 1, d).getDay() === 0) e.date = 'Aulas experimentais não acontecem aos domingos.'
  }

  if (!data.time) e.time = 'Escolha um horário.'
  else if (!timeSlots.includes(data.time)) e.time = 'Escolha um horário da lista.'

  if (!data.consent) e.consent = 'Autorize o contato para continuar.'
  return e
}

export function buildMessage(data: BookingData) {
  const lines = [
    `Olá, ${site.brand.name}! Gostaria de agendar uma aula experimental.`,
    '',
    `Nome: ${clean(data.name)}`,
    `Telefone: ${maskPhone(data.phone)}`,
    `Modalidade: ${data.modality ? modalityById[data.modality].name : '-'}`,
    `Plano de interesse: ${data.plan ? planById[data.plan].name : '-'}`,
    `Data preferencial: ${formatDate(data.date)}`,
    `Horário preferencial: ${data.time}`,
    '',
    'Entendo que este é um pré-agendamento e aguardo a confirmação da equipe.',
  ]
  return lines.join('\n')
}

export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${digits(number)}?text=${encodeURIComponent(message)}`
}

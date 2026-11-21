import { createContext, useContext } from 'react'
import type { ModalityId, PlanId } from '../content/data'

export interface BookingPrefill {
  modality?: ModalityId
  plan?: PlanId
  date?: string
  time?: string
  /** Texto de contexto mostrado no formulário, ex.: "Aula selecionada: Power Class". */
  source?: string
}

export interface AppContextValue {
  prefill: BookingPrefill & { nonce: number }
  /** Pré-preenche o formulário e leva o usuário até ele. */
  startBooking: (prefill?: BookingPrefill) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp precisa de AppContext')
  return ctx
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

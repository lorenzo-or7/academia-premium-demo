import type { ModalityId, PlanId } from '../content/data'

/**
 * Simulador demonstrativo de treino.
 * Combina afinidades por pontuação. Não avalia saúde, não prescreve treino.
 */

export type Goal = 'strength' | 'conditioning' | 'wellbeing' | 'routine'
export type Experience = 'new' | 'returning' | 'regular' | 'advanced'
export type Days = '2' | '3-4' | '5+'
export type Format = 'solo' | 'group' | 'guided'

export interface FinderAnswers {
  goal?: Goal
  experience?: Experience
  days?: Days
  format?: Format
}

export interface FinderQuestion<K extends keyof FinderAnswers = keyof FinderAnswers> {
  key: K
  title: string
  hint: string
  options: { value: NonNullable<FinderAnswers[K]>; label: string; detail: string }[]
}

export const questions: FinderQuestion[] = [
  {
    key: 'goal',
    title: 'Qual seu principal objetivo?',
    hint: 'Escolha o que mais pesa hoje.',
    options: [
      { value: 'strength', label: 'Ganhar força', detail: 'Levantar melhor, com técnica' },
      { value: 'conditioning', label: 'Condicionamento', detail: 'Fôlego, ritmo e energia' },
      { value: 'wellbeing', label: 'Mobilidade e bem-estar', detail: 'Mover-se com mais liberdade' },
      { value: 'routine', label: 'Criar constância', detail: 'Transformar treino em hábito' },
    ],
  },
  {
    key: 'experience',
    title: 'Qual sua experiência?',
    hint: 'Sem julgamento: serve para ajustar o ponto de partida.',
    options: [
      { value: 'new', label: 'Começando agora', detail: 'Pouca ou nenhuma prática' },
      { value: 'returning', label: 'Retomando', detail: 'Já treinei, estou voltando' },
      { value: 'regular', label: 'Treino com frequência', detail: 'Rotina ativa há meses' },
      { value: 'advanced', label: 'Experiente', detail: 'Treino estruturado há anos' },
    ],
  },
  {
    key: 'days',
    title: 'Quantos dias pretende treinar?',
    hint: 'Pense em uma semana realista, não ideal.',
    options: [
      { value: '2', label: '2 dias', detail: 'Encaixar na agenda' },
      { value: '3-4', label: '3 a 4 dias', detail: 'Ritmo consistente' },
      { value: '5+', label: '5 ou mais', detail: 'Treino como prioridade' },
    ],
  },
  {
    key: 'format',
    title: 'Qual formato prefere?',
    hint: 'Como você se sente melhor treinando.',
    options: [
      { value: 'solo', label: 'No meu ritmo', detail: 'Autonomia na estrutura' },
      { value: 'group', label: 'Em turma', detail: 'Energia coletiva' },
      { value: 'guided', label: 'Acompanhado', detail: 'Atenção individual' },
    ],
  },
]

export interface Recommendation {
  modality: ModalityId
  secondary: ModalityId
  frequency: string
  plan: PlanId
  benefits: string[]
  rationale: string
}

const goalWeights: Record<Goal, Partial<Record<ModalityId, number>>> = {
  strength: { strength: 4, personal: 2, coaching: 2 },
  conditioning: { functional: 4, group: 3, strength: 1 },
  wellbeing: { recovery: 4, group: 1, personal: 1 },
  routine: { group: 3, coaching: 3, functional: 1 },
}

const formatWeights: Record<Format, Partial<Record<ModalityId, number>>> = {
  solo: { strength: 2, functional: 1, recovery: 1 },
  group: { group: 3, functional: 2 },
  guided: { personal: 3, coaching: 3 },
}

const experienceWeights: Record<Experience, Partial<Record<ModalityId, number>>> = {
  new: { group: 1, personal: 1, recovery: 1 },
  returning: { recovery: 1, coaching: 1, group: 1 },
  regular: { functional: 1, strength: 1 },
  advanced: { strength: 2, coaching: 1 },
}

const order: ModalityId[] = ['strength', 'functional', 'coaching', 'recovery', 'personal', 'group']

const benefitsByModality: Record<ModalityId, string[]> = {
  strength: ['Base técnica sólida nos padrões de força', 'Progressão acompanhada, sem pressa', 'Mais confiança com cargas livres'],
  functional: ['Mais disposição para o dia a dia', 'Coordenação e ritmo em circuitos', 'Treinos variados que evitam a monotonia'],
  coaching: ['Clareza sobre o que treinar e por quê', 'Revisões periódicas de hábito', 'Registro da sua evolução'],
  recovery: ['Rotina de mobilidade guiada', 'Momento dedicado a desacelerar', 'Mais conforto para os demais treinos'],
  personal: ['Atenção individual em cada sessão', 'Agenda organizada ao seu redor', 'Ajustes de execução em tempo real'],
  group: ['Constância puxada pela turma', 'Horários fixos que viram hábito', 'Comunidade que acompanha você'],
}

export function isComplete(a: FinderAnswers): a is Required<FinderAnswers> {
  return Boolean(a.goal && a.experience && a.days && a.format)
}

export function recommend(a: Required<FinderAnswers>): Recommendation {
  const score = Object.fromEntries(order.map((m) => [m, 0])) as Record<ModalityId, number>
  for (const table of [goalWeights[a.goal], formatWeights[a.format], experienceWeights[a.experience]]) {
    for (const [m, w] of Object.entries(table)) score[m as ModalityId] += w ?? 0
  }
  const ranked = [...order].sort((x, y) => score[y] - score[x] || order.indexOf(x) - order.indexOf(y))
  const modality = ranked[0]
  // Complemento: recuperação sempre que a frequência é alta, senão a segunda afinidade.
  const secondary = a.days === '5+' && modality !== 'recovery' ? 'recovery' : ranked[1]

  const beginner = a.experience === 'new' || a.experience === 'returning'
  const frequency =
    a.days === '2'
      ? '2 sessões por semana, em dias não consecutivos'
      : a.days === '3-4'
        ? beginner
          ? '3 sessões por semana para começar, evoluindo para 4'
          : '3 a 4 sessões por semana'
        : beginner
          ? '4 sessões por semana, com 1 dia de recuperação ativa'
          : '5 sessões por semana, com recuperação ativa incluída'

  const plan: PlanId =
    a.format === 'guided' || modality === 'personal'
      ? 'elite'
      : a.format === 'group' || modality === 'group' || modality === 'coaching' || a.days !== '2'
        ? 'performance'
        : 'essential'

  const rationale = beginner
    ? 'Como você está começando ou retomando, a sugestão prioriza técnica, constância e um ritmo sustentável.'
    : 'Como você já tem rotina, a sugestão foca em estrutura e em formatos que mantêm o treino desafiador.'

  return {
    modality,
    secondary,
    frequency,
    plan,
    benefits: benefitsByModality[modality],
    rationale,
  }
}

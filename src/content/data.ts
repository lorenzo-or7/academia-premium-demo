import type { ImageName } from './images'

/* ------------------------------------------------------------------
 * Modalidades (fictícias)
 * ---------------------------------------------------------------- */
export type ModalityId = 'strength' | 'functional' | 'coaching' | 'recovery' | 'personal' | 'group'

export interface Modality {
  id: ModalityId
  name: string
  short: string
  kicker: string
  image: ImageName
  position?: string
  description: string
  benefits: string[]
  cta: string
}

export const modalities: Modality[] = [
  {
    id: 'strength',
    name: 'Strength & Conditioning',
    short: 'Strength',
    kicker: 'Força como base',
    image: 'm-strength',
    position: '45% 40%',
    description:
      'Blocos de força com barra, progressão planejada e condicionamento metabólico. Técnica antes de carga, sempre.',
    benefits: ['Progressão de carga acompanhada', 'Técnica revisada a cada ciclo', 'Condicionamento integrado'],
    cta: 'Experimentar Strength',
  },
  {
    id: 'functional',
    name: 'Functional Training',
    short: 'Functional',
    kicker: 'Movimento real',
    image: 'm-functional',
    position: '50% 55%',
    description:
      'Padrões de movimento do dia a dia em circuitos dinâmicos: empurrar, puxar, carregar, girar e acelerar.',
    benefits: ['Coordenação e potência', 'Sessões dinâmicas de 50 min', 'Escalável para cada nível'],
    cta: 'Experimentar Functional',
  },
  {
    id: 'coaching',
    name: 'Performance Coaching',
    short: 'Coaching',
    kicker: 'Método e dados',
    image: 'm-coaching',
    position: '50% 35%',
    description:
      'Acompanhamento por ciclos, com metas de hábito, revisões periódicas e leitura simples dos seus registros de treino.',
    benefits: ['Revisões periódicas com coach', 'Metas de hábito, não de promessa', 'Registro de evolução'],
    cta: 'Conversar sobre Coaching',
  },
  {
    id: 'recovery',
    name: 'Recovery & Mobility',
    short: 'Recovery',
    kicker: 'Treinar também é recuperar',
    image: 'm-recovery',
    position: '50% 60%',
    description:
      'Mobilidade guiada, liberação miofascial e protocolos de respiração para o corpo voltar pronto para o próximo treino.',
    benefits: ['Mobilidade articular guiada', 'Rotina de recuperação', 'Acesso à recovery zone'],
    cta: 'Experimentar Recovery',
  },
  {
    id: 'personal',
    name: 'Personal Training',
    short: 'Personal',
    kicker: 'Atenção total',
    image: 'm-personal',
    position: '45% 40%',
    description:
      'Sessões individuais com agenda reservada e um profissional dedicado à sua rotina, ao seu ritmo e às suas preferências.',
    benefits: ['Agenda individual', 'Planejamento por objetivo', 'Ajustes em tempo real'],
    cta: 'Agendar com um personal',
  },
  {
    id: 'group',
    name: 'Group Classes',
    short: 'Classes',
    kicker: 'Energia coletiva',
    image: 'm-group',
    position: '50% 40%',
    description:
      'Turmas reduzidas, trilha sonora pensada para cada formato e coaches que conhecem cada aluno pelo nome.',
    benefits: ['Turmas reduzidas', 'Formatos variados na semana', 'Comunidade e constância'],
    cta: 'Ver aulas na agenda',
  },
]

export const modalityById = Object.fromEntries(modalities.map((m) => [m.id, m])) as Record<ModalityId, Modality>

/* ------------------------------------------------------------------
 * O espaço
 * ---------------------------------------------------------------- */
export interface SpaceItem {
  id: string
  name: string
  caption: string
  detail: string
  image: ImageName
}

export const spaces: SpaceItem[] = [
  {
    id: 'floor',
    name: 'Área de musculação',
    caption: 'Linhas de equipamentos organizadas por padrão de movimento.',
    detail: 'Fluxo pensado para reduzir espera e deixar o treino contínuo.',
    image: 's-floor',
  },
  {
    id: 'functional',
    name: 'Espaço funcional',
    caption: 'Piso técnico, kettlebells, cordas e área livre para deslocamento.',
    detail: 'Zona aberta para circuitos, sprints curtos e trabalho de potência.',
    image: 's-functional',
  },
  {
    id: 'studio',
    name: 'Sala de atividades',
    caption: 'Luz natural, tratamento acústico e materiais para aulas guiadas.',
    detail: 'Recebe as turmas reduzidas de mobilidade, core e condicionamento.',
    image: 's-studio',
  },
  {
    id: 'recovery',
    name: 'Recovery zone',
    caption: 'Ambiente silencioso para desacelerar depois do esforço.',
    detail: 'Sauna, área de alongamento e iluminação indireta.',
    image: 's-recovery',
  },
  {
    id: 'lockers',
    name: 'Vestiários premium',
    caption: 'Madeira, iluminação baixa e armários individuais.',
    detail: 'Amenities selecionadas e áreas de preparo reservadas.',
    image: 's-lockers',
  },
]

/* ------------------------------------------------------------------
 * Planos (fictícios)
 * ---------------------------------------------------------------- */
export type PlanId = 'essential' | 'performance' | 'elite'

export interface Plan {
  id: PlanId
  name: string
  line: string
  /** Valores fictícios, somente para demonstração de layout. */
  demoMonthly: number
  features: string[]
}

export const plans: Plan[] = [
  {
    id: 'essential',
    name: 'Essential',
    line: 'Para quem treina com autonomia.',
    demoMonthly: 289,
    features: ['Acesso à estrutura', 'Treinamento independente', 'Experiência premium básica'],
  },
  {
    id: 'performance',
    name: 'Performance',
    line: 'Para quem quer método e comunidade.',
    demoMonthly: 429,
    features: ['Benefícios Essential', 'Aulas coletivas', 'Avaliação inicial demonstrativa'],
  },
  {
    id: 'elite',
    name: 'Elite',
    line: 'Para quem quer atenção total.',
    demoMonthly: 749,
    features: ['Benefícios Performance', 'Atendimento personalizado', 'Experiências exclusivas'],
  },
]

/** Matriz de comparação: o índice indica a partir de qual plano o recurso entra. */
export const planMatrix: { label: string; from: 0 | 1 | 2; note?: string }[] = [
  { label: 'Acesso à estrutura completa', from: 0 },
  { label: 'Treinamento independente', from: 0 },
  { label: 'Vestiários premium', from: 0 },
  { label: 'Aulas coletivas', from: 1 },
  { label: 'Avaliação inicial', from: 1, note: 'demonstrativa' },
  { label: 'Recovery zone', from: 1 },
  { label: 'Atendimento personalizado', from: 2 },
  { label: 'Experiências exclusivas', from: 2 },
]

export const planById = Object.fromEntries(plans.map((p) => [p.id, p])) as Record<PlanId, Plan>

/* ------------------------------------------------------------------
 * Agenda semanal (horários fictícios)
 * ---------------------------------------------------------------- */
export interface ClassSlot {
  id: string
  /** 1 = segunda … 6 = sábado */
  day: number
  time: string
  title: string
  modality: ModalityId
  duration: number
  level: 'Todos os níveis' | 'Iniciante' | 'Intermediário' | 'Avançado'
  room: string
  /** Vagas demonstrativas. */
  spots: number
}

export const weekDays = [
  { day: 1, short: 'Seg', long: 'Segunda' },
  { day: 2, short: 'Ter', long: 'Terça' },
  { day: 3, short: 'Qua', long: 'Quarta' },
  { day: 4, short: 'Qui', long: 'Quinta' },
  { day: 5, short: 'Sex', long: 'Sexta' },
  { day: 6, short: 'Sáb', long: 'Sábado' },
] as const

const slot = (
  day: number,
  time: string,
  title: string,
  modality: ModalityId,
  duration: number,
  level: ClassSlot['level'],
  room: string,
  spots: number,
): ClassSlot => ({ id: `${day}-${time}-${modality}`, day, time, title, modality, duration, level, room, spots })

export const schedule: ClassSlot[] = [
  slot(1, '06:30', 'Strength Foundations', 'strength', 50, 'Todos os níveis', 'Musculação', 6),
  slot(1, '07:30', 'Engine Circuit', 'functional', 45, 'Intermediário', 'Funcional', 4),
  slot(1, '12:15', 'Mobility Reset', 'recovery', 40, 'Todos os níveis', 'Sala de atividades', 9),
  slot(1, '18:30', 'Power Class', 'group', 50, 'Intermediário', 'Sala de atividades', 2),
  slot(1, '19:45', 'Barbell Club', 'strength', 60, 'Avançado', 'Musculação', 5),

  slot(2, '06:30', 'Athletic Functional', 'functional', 50, 'Todos os níveis', 'Funcional', 7),
  slot(2, '09:00', 'Coaching Check-in', 'coaching', 30, 'Todos os níveis', 'Estúdio de coaching', 3),
  slot(2, '18:00', 'Core & Control', 'group', 45, 'Iniciante', 'Sala de atividades', 8),
  slot(2, '20:00', 'Recovery Flow', 'recovery', 40, 'Todos os níveis', 'Recovery zone', 6),

  slot(3, '06:30', 'Strength Foundations', 'strength', 50, 'Todos os níveis', 'Musculação', 5),
  slot(3, '07:30', 'Engine Circuit', 'functional', 45, 'Intermediário', 'Funcional', 0),
  slot(3, '12:15', 'Express Conditioning', 'group', 30, 'Todos os níveis', 'Sala de atividades', 10),
  slot(3, '19:00', 'Personal Open Lab', 'personal', 60, 'Todos os níveis', 'Musculação', 2),

  slot(4, '06:30', 'Athletic Functional', 'functional', 50, 'Todos os níveis', 'Funcional', 6),
  slot(4, '12:15', 'Mobility Reset', 'recovery', 40, 'Todos os níveis', 'Sala de atividades', 8),
  slot(4, '18:30', 'Power Class', 'group', 50, 'Intermediário', 'Sala de atividades', 5),
  slot(4, '19:45', 'Barbell Club', 'strength', 60, 'Avançado', 'Musculação', 3),

  slot(5, '06:30', 'Strength Foundations', 'strength', 50, 'Todos os níveis', 'Musculação', 7),
  slot(5, '09:00', 'Coaching Check-in', 'coaching', 30, 'Todos os níveis', 'Estúdio de coaching', 4),
  slot(5, '18:00', 'Friday Engine', 'functional', 45, 'Intermediário', 'Funcional', 6),

  slot(6, '08:00', 'Weekend Strength', 'strength', 60, 'Todos os níveis', 'Musculação', 8),
  slot(6, '09:30', 'Community Class', 'group', 50, 'Todos os níveis', 'Sala de atividades', 12),
  slot(6, '11:00', 'Long Recovery', 'recovery', 60, 'Todos os níveis', 'Recovery zone', 6),
]

/* ------------------------------------------------------------------
 * Histórias ilustrativas (personas, não depoimentos reais)
 * ---------------------------------------------------------------- */
export interface Story {
  id: string
  persona: string
  routine: string
  image: ImageName
  position?: string
  title: string
  body: string[]
  habit: { before: string; after: string }
  modality: ModalityId
}

export const stories: Story[] = [
  {
    id: 'early',
    persona: 'Persona ilustrativa · 34 anos',
    routine: 'Treina às 6h30, antes do trabalho',
    image: 'story-1',
    position: '40% 50%',
    title: 'O treino virou o primeiro compromisso do dia.',
    body: [
      'Ela chegou querendo constância, não um recomeço a cada segunda-feira. O coach propôs três manhãs fixas e uma técnica nova por ciclo.',
      'O que mudou primeiro foi a agenda: a semana passou a ser montada a partir do treino, e não o contrário.',
    ],
    habit: { before: 'Treinos esporádicos', after: '3 manhãs fixas na semana' },
    modality: 'strength',
  },
  {
    id: 'return',
    persona: 'Persona ilustrativa · 41 anos',
    routine: 'Voltou a treinar depois de anos parado',
    image: 'story-2',
    position: '50% 45%',
    title: 'Voltar com calma também é performance.',
    body: [
      'O retorno começou pelo básico: mobilidade, padrões de movimento e cargas leves, sem pressa de recuperar o tempo perdido.',
      'A turma das quintas virou o motivo para não faltar. A comunidade sustentou o que a força de vontade sozinha não sustentava.',
    ],
    habit: { before: 'Sem rotina de exercício', after: 'Aulas coletivas 2x por semana' },
    modality: 'group',
  },
  {
    id: 'night',
    persona: 'Persona ilustrativa · 29 anos',
    routine: 'Treina no fim do dia, depois das 19h',
    image: 'story-3',
    position: '50% 50%',
    title: 'Menos improviso, mais método.',
    body: [
      'Ele treinava sozinho, copiando fichas da internet. No coaching, aprendeu a registrar sessões e a entender quando subir a carga.',
      'Hoje o treino tem começo, meio e revisão. A sensação de estar andando em círculos ficou para trás.',
    ],
    habit: { before: 'Fichas improvisadas', after: 'Ciclos revisados com coach' },
    modality: 'coaching',
  },
]

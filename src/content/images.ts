import meta from './image-meta.json'

const alts = {
  hero: 'Atleta se preparando para um levantamento terra em um ambiente escuro, iluminado por luz lateral',
  philosophy: 'Atleta de costas em uma área de treino com iluminação linear',
  grip: 'Mãos firmes segurando a barra antes do movimento',
  'm-strength': 'Atleta executando levantamento terra com concentração',
  'm-functional': 'Treino com cordas navais sobre grama sintética',
  'm-coaching': 'Coach revisando métricas de treino com uma aluna em um tablet',
  'm-recovery': 'Liberação miofascial com bola sob os pés, sobre um tapete',
  'm-personal': 'Treinador acompanhando de perto a execução de uma aluna no equipamento',
  'm-group': 'Aula coletiva com elásticos em uma sala com iluminação de estúdio',
  's-floor': 'Área de musculação com equipamentos alinhados e iluminação em linhas de LED',
  's-functional': 'Fileira de kettlebells sobre o piso emborrachado do espaço funcional',
  's-studio': 'Sala de atividades clara, com painel acústico e tapetes',
  's-recovery': 'Sauna de madeira com iluminação indireta na recovery zone',
  's-lockers': 'Vestiário com bancos de madeira e armários escuros',
  'story-1': 'Aluna agachando com barra enquanto um coach observa',
  'story-2': 'Aluna segurando um kettlebell entre os treinos',
  'story-3': 'Aluno em um banco da área de musculação, entre séries',
  book: 'Atleta em um rack de agachamento, em silhueta',
  finale: 'Atleta fazendo barra fixa, visto de costas, em preto e branco',
  finder: 'Área de treino em penumbra com luz natural ao fundo',
} as const

export type ImageName = keyof typeof alts

const widths = [480, 960, 1600] as const

export function getImage(name: ImageName) {
  const m = (meta as Record<string, { w: number; h: number }>)[name]
  return {
    src: `${import.meta.env.BASE_URL}images/${name}-960.webp`,
    srcSet: widths.map((w) => `${import.meta.env.BASE_URL}images/${name}-${w}.webp ${w}w`).join(', '),
    width: m?.w ?? 1600,
    height: m?.h ?? 1067,
    alt: alts[name],
  }
}

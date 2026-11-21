/**
 * Configuração comercial centralizada.
 * Tudo o que muda de um cliente para outro começa aqui.
 */

export interface SocialLink {
  label: string
  href: string
}

export const site = {
  brand: {
    name: 'VERTEX',
    descriptor: 'Performance Club',
    tagline: 'Performance is a lifestyle.',
  },

  /** Exibe avisos de conteúdo demonstrativo em toda a interface. */
  demoMode: true,

  /**
   * Número de WhatsApp de destino do pré-agendamento.
   * Somente dígitos com DDI, ex.: "5511900000000".
   * Vazio = modo demonstrativo: nada é enviado, o resumo pode ser copiado.
   */
  whatsappNumber: '',

  /**
   * Vídeo da hero (MP4/WebM licenciado). Vazio = fallback fotográfico.
   * Ex.: { mp4: '/media/hero.mp4', webm: '/media/hero.webm' }
   */
  heroVideo: null as null | { mp4: string; webm?: string },

  contact: {
    /** Endereço e telefone demonstrativos. Substituir pelos dados do cliente. */
    addressLines: ['Endereço demonstrativo', 'Cidade — UF'],
    phoneDisplay: '(00) 0000-0000',
    email: 'contato@exemplo.com',
    hours: [
      { days: 'Segunda a sexta', time: '05h30 – 23h00' },
      { days: 'Sábado', time: '07h00 – 18h00' },
      { days: 'Domingo e feriados', time: '08h00 – 14h00' },
    ],
  },

  /** Redes só aparecem quando configuradas. */
  socials: [] as SocialLink[],

  credit: {
    label: 'Or7.dev',
    href: 'https://or7.dev',
  },
} as const

export const whatsappConfigured = /^\d{12,15}$/.test(site.whatsappNumber)

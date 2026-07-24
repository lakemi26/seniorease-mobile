export type HelpCategoryId =
  | 'gettingStarted'
  | 'account'
  | 'activities'
  | 'reminders'
  | 'personalization'
  | 'security'

export type AllowedOrigin =
  | 'dashboard'
  | 'atividades'
  | 'calendario'
  | 'historico'
  | 'perfil'
  | 'configuracoes'
  | 'execucao'

export interface HelpArticleStep {
  id: string
  title: string
  description: string
}

export interface HelpArticle {
  id: string
  slug: string
  categoryId: HelpCategoryId
  title: string
  summary: string
  keywords: string[]
  steps?: HelpArticleStep[]
  content?: string[]
  relatedArticleIds?: string[]
  relatedRoute?: string
  relatedRouteLabel?: string
  availableInBasicMode: boolean
}

export interface HelpCategory {
  id: HelpCategoryId
  title: string
  description: string
  icon: string
  priority: number
}

export interface HelpFaqItem {
  question: string
  answer: string
  articleSlug?: string
}

export interface HelpQuickLink {
  title: string
  description: string
  articleSlug: string
  icon: string
}

export const ALLOWED_ORIGINS: AllowedOrigin[] = [
  'dashboard',
  'atividades',
  'calendario',
  'historico',
  'perfil',
  'configuracoes',
  'execucao',
]

export const ORIGIN_LABELS: Record<AllowedOrigin, string> = {
  dashboard: 'dashboard',
  atividades: 'atividades',
  calendario: 'calendário',
  historico: 'histórico',
  perfil: 'perfil',
  configuracoes: 'configurações',
  execucao: 'execução da atividade',
}

export const categories: HelpCategory[] = [
  { id: 'gettingStarted', title: 'Primeiros passos', description: 'Orientações para começar a utilizar o SeniorEase.', icon: 'Compass', priority: 1 },
  { id: 'account', title: 'Minha conta', description: 'Ajuda para acessar e cuidar da sua conta.', icon: 'User', priority: 4 },
  { id: 'activities', title: 'Atividades', description: 'Orientações para criar, acompanhar e concluir atividades.', icon: 'ListTodo', priority: 2 },
  { id: 'reminders', title: 'Lembretes e calendário', description: 'Ajuda para acompanhar datas, horários e avisos.', icon: 'Calendar', priority: 5 },
  { id: 'personalization', title: 'Personalização', description: 'Ajuda para ajustar a forma como o SeniorEase aparece.', icon: 'SlidersHorizontal', priority: 3 },
  { id: 'security', title: 'Segurança e confiança', description: 'Explicações sobre confirmações, salvamento e proteção das informações.', icon: 'Shield', priority: 6 },
]

export const articles: HelpArticle[] = [
  {
    id: '1',
    slug: 'conhecer-dashboard',
    categoryId: 'gettingStarted',
    title: 'Conhecer o dashboard',
    summary: 'O dashboard é a tela principal onde você vê um resumo das suas atividades e pode navegar para outras áreas.',
    keywords: ['dashboard', 'inicio', 'início', 'principal', 'tela inicial', 'resumo', 'painel'],
    content: [
      'O dashboard é a primeira tela que aparece depois de entrar no SeniorEase.',
      'Nele você encontra:',
      'Sua próxima atividade: a atividade mais próxima que precisa de atenção.',
      'Atividades de hoje: as tarefas e compromissos agendados para o dia de hoje.',
      'Atividades em andamento: atividades que você já começou e pode continuar.',
      'Atalhos rápidos: botões para criar atividade, ver calendário e acessar a ajuda.',
      'Lembretes: avisos sobre atividades que estão perto do horário.',
    ],
    relatedArticleIds: ['2', '3'],
    relatedRoute: '/dashboard',
    relatedRouteLabel: 'Abrir dashboard',
    availableInBasicMode: true,
  },
  {
    id: '2',
    slug: 'modo-basico-completo',
    categoryId: 'gettingStarted',
    title: 'Entender o modo básico e completo',
    summary: 'Escolha entre um modo mais simples ou completo de usar o SeniorEase.',
    keywords: ['modo', 'basico', 'básico', 'completo', 'interface', 'simples', 'completo', 'alternar'],
    content: [
      'O SeniorEase possui dois modos de uso: básico e completo.',
      'No modo básico, você vê apenas os recursos mais importantes: dashboard, atividades, perfil e ajuda. A tela fica mais limpa e com menos informações ao mesmo tempo.',
      'No modo completo, você tem acesso a todos os recursos: calendário, histórico, configurações e mais detalhes em cada tela.',
      'Você pode alternar entre os modos a qualquer momento na página de personalização.',
    ],
    relatedArticleIds: ['26', '23'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '3',
    slug: 'navegar-pelo-seniorease',
    categoryId: 'gettingStarted',
    title: 'Navegar pelo SeniorEase',
    summary: 'Conheça os menus e saiba como se movimentar entre as telas.',
    keywords: ['navegar', 'navegação', 'menu', 'menus', 'sidebar', 'lateral', 'mobile', 'celular'],
    content: [
      'Para se movimentar entre as telas, utilize o menu lateral no computador ou o menu inferior no celular.',
      'No computador, o menu fica do lado esquerdo da tela. Cada item leva para uma seção: Início, Atividades, Perfil e Ajuda (e mais itens no modo completo).',
      'No celular, o menu fica na parte inferior da tela, com ícones e nomes das seções.',
      'No topo da tela, você encontra o cabeçalho com o logotipo, a data e os botões de notificações e ajustes.',
    ],
    relatedArticleIds: ['1', '2'],
    relatedRoute: '/dashboard',
    relatedRouteLabel: 'Ir para o dashboard',
    availableInBasicMode: true,
  },
  {
    id: '4',
    slug: 'voltar-tela-anterior',
    categoryId: 'gettingStarted',
    title: 'Voltar para a tela anterior',
    summary: 'Saiba como retornar à tela que estava antes.',
    keywords: ['voltar', 'retornar', 'anterior', 'tela', 'navegação', 'atrás'],
    content: [
      'Você pode voltar à tela anterior usando o botão Voltar do seu navegador ou dispositivo.',
      'No celular, utilize o gesto de voltar ou o botão Voltar do sistema.',
      'Os links e botões do SeniorEase sempre indicam para onde vão levar.',
      'Se precisar de ajuda para encontrar uma tela, use o menu de navegação.',
    ],
    relatedArticleIds: ['3'],
    availableInBasicMode: true,
  },
  {
    id: '5',
    slug: 'entrar-conta',
    categoryId: 'account',
    title: 'Entrar na conta',
    summary: 'Saiba como acessar sua conta no SeniorEase.',
    keywords: ['entrar', 'login', 'acessar', 'conta', 'acesso', 'email', 'senha'],
    steps: [
      { id: 's1', title: 'Abrir a tela de entrada', description: 'Na página inicial, selecione "Entrar" no canto superior direito.' },
      { id: 's2', title: 'Informar seu e-mail', description: 'Digite o e-mail que você usou no cadastro.' },
      { id: 's3', title: 'Digitar sua senha', description: 'Informe sua senha de acesso.' },
      { id: 's4', title: 'Selecionar "Entrar"', description: 'Escolha "Entrar" e aguarde enquanto acessamos sua conta.' },
    ],
    relatedArticleIds: ['7', '6'],
    relatedRoute: '/login',
    relatedRouteLabel: 'Ir para a tela de entrada',
    availableInBasicMode: true,
  },
  {
    id: '6',
    slug: 'redefinir-senha',
    categoryId: 'account',
    title: 'Redefinir a senha',
    summary: 'Caso tenha esquecido sua senha, veja como criar uma nova.',
    keywords: ['senha', 'redefinir', 'esqueci', 'recuperar', 'nova senha', 'resetar'],
    steps: [
      { id: 's1', title: 'Abrir "Esqueci minha senha"', description: 'Na tela de entrada, selecione o link "Esqueci minha senha".' },
      { id: 's2', title: 'Informar seu e-mail', description: 'Digite o mesmo e-mail usado no cadastro.' },
      { id: 's3', title: 'Verificar seu e-mail', description: 'Você receberá uma mensagem com instruções para criar uma nova senha.' },
      { id: 's4', title: 'Criar a nova senha', description: 'Siga o link do e-mail e escolha uma nova senha com pelo menos 8 caracteres, incluindo uma letra e um número.' },
    ],
    relatedArticleIds: ['5', '17'],
    relatedRoute: '/recuperar-senha',
    relatedRouteLabel: 'Ir para recuperar senha',
    availableInBasicMode: true,
  },
  {
    id: '7',
    slug: 'atualizar-nome',
    categoryId: 'account',
    title: 'Atualizar o nome',
    summary: 'Saiba como alterar seu nome exibido no SeniorEase.',
    keywords: ['nome', 'atualizar', 'alterar', 'mudar', 'perfil', 'editar'],
    steps: [
      { id: 's1', title: 'Abrir o Perfil', description: 'No menu, selecione "Perfil".' },
      { id: 's2', title: 'Selecionar "Editar nome"', description: 'Ao lado do seu nome atual, escolha a opção de editar.' },
      { id: 's3', title: 'Digitar o novo nome', description: 'Informe o nome que deseja usar.' },
      { id: 's4', title: 'Salvar a alteração', description: 'Selecione "Salvar" para confirmar.' },
    ],
    relatedArticleIds: ['5', '22'],
    relatedRoute: '/perfil',
    relatedRouteLabel: 'Abrir meu perfil',
    availableInBasicMode: true,
  },
  {
    id: '8',
    slug: 'sair-conta',
    categoryId: 'account',
    title: 'Sair da conta',
    summary: 'Veja como sair do SeniorEase com segurança.',
    keywords: ['sair', 'logout', 'conta', 'desconectar', 'encerrar', 'sessão'],
    steps: [
      { id: 's1', title: 'Abrir o menu do perfil', description: 'No canto superior direito, selecione o círculo com a inicial do seu nome.' },
      { id: 's2', title: 'Selecionar "Sair"', description: 'No menu, escolha "Sair" para encerrar sua sessão.' },
      { id: 's3', title: 'Confirmar a saída', description: 'Confirme que deseja sair da sua conta.' },
    ],
    relatedArticleIds: ['5', '16'],
    availableInBasicMode: true,
  },
  {
    id: '9',
    slug: 'criar-atividade',
    categoryId: 'activities',
    title: 'Criar uma atividade',
    summary: 'Cadastre uma tarefa ou compromisso e, se desejar, divida em etapas.',
    keywords: ['criar', 'nova', 'atividade', 'tarefa', 'compromisso', 'cadastrar', 'adicionar'],
    steps: [
      { id: 's1', title: 'Abrir "Minhas atividades"', description: 'No menu, selecione "Atividades".' },
      { id: 's2', title: 'Selecionar "Nova atividade"', description: 'Escolha o botão "Nova atividade" ou o ícone + no menu inferior do celular.' },
      { id: 's3', title: 'Informar o título e a data', description: 'Dê um nome para a atividade e escolha a data e horário.' },
      { id: 's4', title: 'Adicionar etapas, se desejar', description: 'Você pode dividir a atividade em passos menores, um de cada vez.' },
      { id: 's5', title: 'Selecionar "Salvar atividade"', description: 'Confirme para salvar. A atividade aparecerá na sua lista.' },
    ],
    content: [
      'Você pode criar quantas atividades desejar.',
      'Cada atividade pode ter: um título, uma descrição opcional, uma categoria, data e horário, prioridade, etapas e um lembrete.',
      'As atividades aparecem no dashboard, no calendário e podem ter lembretes.',
    ],
    relatedArticleIds: ['10', '11', '13'],
    relatedRoute: '/atividades?modal=nova',
    relatedRouteLabel: 'Criar nova atividade',
    availableInBasicMode: true,
  },
  {
    id: '10',
    slug: 'adicionar-etapas',
    categoryId: 'activities',
    title: 'Adicionar etapas',
    summary: 'Divida uma atividade em passos menores para acompanhar melhor o progresso.',
    keywords: ['etapas', 'passos', 'dividir', 'sub-tarefa', 'subpasso', 'detalhar'],
    steps: [
      { id: 's1', title: 'Criar ou editar uma atividade', description: 'Abra a tela de criação ou edição de uma atividade.' },
      { id: 's2', title: 'Selecionar "Adicionar etapa"', description: 'Na seção de etapas, escolha "Adicionar etapa".' },
      { id: 's3', title: 'Escrever o nome da etapa', description: 'Descreva o passo que precisa ser feito.' },
      { id: 's4', title: 'Adicionar mais etapas, se quiser', description: 'Repita para cada passo da atividade. Você pode adicionar até 20 etapas.' },
    ],
    relatedArticleIds: ['9', '14', '15'],
    relatedRoute: '/atividades?modal=nova',
    relatedRouteLabel: 'Criar nova atividade',
    availableInBasicMode: true,
  },
  {
    id: '11',
    slug: 'editar-atividade',
    categoryId: 'activities',
    title: 'Editar uma atividade',
    summary: 'Altere informações de uma atividade que já foi criada.',
    keywords: ['editar', 'alterar', 'modificar', 'atualizar', 'mudar', 'atividade'],
    steps: [
      { id: 's1', title: 'Encontrar a atividade', description: 'Na lista de atividades, localize a que deseja editar.' },
      { id: 's2', title: 'Abrir os detalhes', description: 'Selecione a atividade para ver seus detalhes.' },
      { id: 's3', title: 'Selecionar "Editar"', description: 'Escolha a opção "Editar" para fazer alterações.' },
      { id: 's4', title: 'Fazer as alterações e salvar', description: 'Altere o que precisar e selecione "Salvar".' },
    ],
    relatedArticleIds: ['9', '12', '10'],
    availableInBasicMode: true,
  },
  {
    id: '12',
    slug: 'excluir-atividade',
    categoryId: 'activities',
    title: 'Excluir uma atividade',
    summary: 'Remova uma atividade que não é mais necessária.',
    keywords: ['excluir', 'remover', 'apagar', 'deletar', 'cancelar', 'atividade'],
    steps: [
      { id: 's1', title: 'Encontrar a atividade', description: 'Na lista de atividades, localize a que deseja excluir.' },
      { id: 's2', title: 'Abrir os detalhes', description: 'Selecione a atividade para ver seus detalhes.' },
      { id: 's3', title: 'Selecionar "Excluir"', description: 'Escolha a opção "Excluir".' },
      { id: 's4', title: 'Confirmar a exclusão', description: 'Uma mensagem de confirmação será exibida. Confirme para excluir.' },
    ],
    relatedArticleIds: ['19', '11'],
    availableInBasicMode: true,
  },
  {
    id: '13',
    slug: 'comecar-atividade',
    categoryId: 'activities',
    title: 'Começar uma atividade',
    summary: 'Inicie a execução de uma atividade e acompanhe cada etapa.',
    keywords: ['comecar', 'iniciar', 'executar', 'começar', 'início', 'introdução'],
    steps: [
      { id: 's1', title: 'Encontrar a atividade', description: 'No dashboard ou na lista de atividades, localize a atividade que deseja começar.' },
      { id: 's2', title: 'Selecionar a atividade', description: 'Escolha a atividade para abrir os detalhes.' },
      { id: 's3', title: 'Selecionar "Começar"', description: 'Na tela de introdução, leia as informações e selecione "Começar".' },
      { id: 's4', title: 'Seguir as etapas', description: 'Cada etapa aparecerá uma de cada vez. Complete uma para passar para a próxima.' },
    ],
    relatedArticleIds: ['9', '14', '15', '18'],
    relatedRoute: '/atividades',
    relatedRouteLabel: 'Abrir atividades',
    availableInBasicMode: true,
  },
  {
    id: '14',
    slug: 'concluir-etapa',
    categoryId: 'activities',
    title: 'Concluir uma etapa',
    summary: 'Marque uma etapa como concluída durante a execução de uma atividade.',
    keywords: ['concluir', 'etapa', 'passo', 'completar', 'finalizar', 'marcar', 'próximo'],
    steps: [
      { id: 's1', title: 'Ler a etapa atual', description: 'Durante a execução, leia com atenção o que a etapa pede.' },
      { id: 's2', title: 'Realizar o que foi pedido', description: 'Faça o que a etapa descreve.' },
      { id: 's3', title: 'Selecionar "Concluir etapa"', description: 'Após realizar, selecione "Concluir etapa" para marcar como feita.' },
      { id: 's4', title: 'Seguir para a próxima', description: 'Uma mensagem de feedback aparecerá. Selecione "Próxima" para continuar.' },
    ],
    relatedArticleIds: ['13', '15', '16'],
    availableInBasicMode: true,
  },
  {
    id: '15',
    slug: 'continuar-atividade',
    categoryId: 'activities',
    title: 'Continuar uma atividade',
    summary: 'Retome uma atividade que você começou mas não terminou.',
    keywords: ['continuar', 'retomar', 'prosseguir', 'em andamento', 'incompleto', 'pendente'],
    steps: [
      { id: 's1', title: 'Abrir o dashboard', description: 'No menu, selecione "Início" para ver o dashboard.' },
      { id: 's2', title: 'Localizar "Continuar"', description: 'Na seção de atividades em andamento, encontre a atividade que deseja retomar.' },
      { id: 's3', title: 'Selecionar "Continuar"', description: 'Escolha "Continuar" para voltar ao ponto onde parou.' },
    ],
    relatedArticleIds: ['13', '14', '16'],
    relatedRoute: '/atividades',
    relatedRouteLabel: 'Abrir atividades',
    availableInBasicMode: true,
  },
  {
    id: '16',
    slug: 'reabrir-atividade',
    categoryId: 'activities',
    title: 'Reabrir uma atividade',
    summary: 'Reabra uma atividade que foi concluída anteriormente.',
    keywords: ['reabrir', 'reopen', 'concluida', 'completa', 'finalizada', 'novamente'],
    steps: [
      { id: 's1', title: 'Abrir o Histórico', description: 'No menu completo, selecione "Histórico" para ver atividades concluídas.' },
      { id: 's2', title: 'Encontrar a atividade', description: 'Localize a atividade que deseja reabrir.' },
      { id: 's3', title: 'Selecionar "Reabrir"', description: 'Escolha a opção "Reabrir" para trazer a atividade de volta.' },
      { id: 's4', title: 'Confirmar a reabertura', description: 'Confirme que deseja reabrir a atividade.' },
    ],
    relatedArticleIds: ['15', '17', '14'],
    relatedRoute: '/historico',
    relatedRouteLabel: 'Abrir histórico',
    availableInBasicMode: false,
  },
  {
    id: '17',
    slug: 'adicionar-lembrete',
    categoryId: 'reminders',
    title: 'Adicionar um lembrete',
    summary: 'Configure um aviso para não esquecer uma atividade importante.',
    keywords: ['lembrete', 'adicionar', 'aviso', 'notificar', 'alerta', 'horário'],
    steps: [
      { id: 's1', title: 'Criar ou editar uma atividade', description: 'Na tela de criação ou edição de uma atividade, localize a seção de lembrete.' },
      { id: 's2', title: 'Ativar o lembrete', description: 'Escolha a opção "Sim, quero um lembrete" ou selecione uma das opções disponíveis.' },
      { id: 's3', title: 'Escolher o horário', description: 'Defina se o lembrete será no horário da atividade ou antes.' },
      { id: 's4', title: 'Salvar a atividade', description: 'Confirme a atividade. O lembrete será ativado automaticamente.' },
    ],
    relatedArticleIds: ['9', '18', '20'],
    availableInBasicMode: true,
  },
  {
    id: '18',
    slug: 'dispensar-lembrete',
    categoryId: 'reminders',
    title: 'Dispensar um lembrete',
    summary: 'Saiba como fechar um lembrete que apareceu na tela.',
    keywords: ['dispensar', 'fechar', 'lembrete', 'aviso', 'notificação', 'ignorar'],
    steps: [
      { id: 's1', title: 'Ler o lembrete', description: 'Quando um lembrete aparecer, leia qual atividade ele está avisando.' },
      { id: 's2', title: 'Escolher uma ação', description: 'Você pode selecionar a atividade para abri-la ou escolher "Dispensar" para fechar o aviso.' },
    ],
    relatedArticleIds: ['17', '20', '9'],
    availableInBasicMode: true,
  },
  {
    id: '19',
    slug: 'ver-atividades-calendario',
    categoryId: 'reminders',
    title: 'Ver atividades no calendário',
    summary: 'Visualize suas atividades em um calendário mensal.',
    keywords: ['calendario', 'calendário', 'ver', 'visualizar', 'mês', 'mensal', 'dias'],
    steps: [
      { id: 's1', title: 'Abrir o Calendário', description: 'No menu completo, selecione "Calendário".' },
      { id: 's2', title: 'Navegar entre os meses', description: 'Use as setas para avançar ou voltar no calendário.' },
      { id: 's3', title: 'Selecionar um dia', description: 'Escolha um dia para ver as atividades agendadas.' },
    ],
    relatedArticleIds: ['20', '21', '17'],
    relatedRoute: '/calendario',
    relatedRouteLabel: 'Abrir calendário',
    availableInBasicMode: false,
  },
  {
    id: '20',
    slug: 'visualizar-agenda',
    categoryId: 'reminders',
    title: 'Usar a visualização de agenda',
    summary: 'Veja suas atividades organizadas em formato de lista para o dia.',
    keywords: ['agenda', 'visualizar', 'lista', 'dia', 'diário', 'programação'],
    steps: [
      { id: 's1', title: 'Abrir o Calendário', description: 'No menu completo, selecione "Calendário".' },
      { id: 's2', title: 'Selecionar um dia', description: 'Escolha um dia no calendário para ver a agenda.' },
      { id: 's3', title: 'Ver a lista de atividades', description: 'As atividades do dia aparecem organizadas em ordem de horário.' },
    ],
    relatedArticleIds: ['19', '21', '17'],
    relatedRoute: '/calendario',
    relatedRouteLabel: 'Abrir calendário',
    availableInBasicMode: false,
  },
  {
    id: '21',
    slug: 'consultar-historico',
    categoryId: 'reminders',
    title: 'Consultar o histórico',
    summary: 'Acompanhe as atividades que você já concluiu.',
    keywords: ['historico', 'histórico', 'consultar', 'concluido', 'concluído', 'passado', 'finalizado'],
    steps: [
      { id: 's1', title: 'Abrir o Histórico', description: 'No menu completo, selecione "Histórico".' },
      { id: 's2', title: 'Filtrar os resultados', description: 'Use os filtros para buscar por período, categoria ou texto.' },
      { id: 's3', title: 'Selecionar uma atividade', description: 'Escolha uma atividade para ver seus detalhes.' },
    ],
    relatedArticleIds: ['16', '19', '17'],
    relatedRoute: '/historico',
    relatedRouteLabel: 'Abrir histórico',
    availableInBasicMode: false,
  },
  {
    id: '22',
    slug: 'aumentar-texto',
    categoryId: 'personalization',
    title: 'Aumentar o tamanho dos textos',
    summary: 'Deixe os textos maiores para ler com mais conforto.',
    keywords: ['aumentar', 'texto', 'fonte', 'tamanho', 'letra', 'maior', 'leitura'],
    steps: [
      { id: 's1', title: 'Abrir a Personalização', description: 'No menu completo, selecione "Configurações"' },
      { id: 's2', title: 'Localizar "Tamanho da fonte"', description: 'Encontre a seção de tamanho da fonte.' },
      { id: 's3', title: 'Escolher um tamanho', description: 'Selecione entre "Normal", "Grande" ou "Extra grande". Você pode ver a prévia ao lado.' },
      { id: 's4', title: 'Salvar a preferência', description: 'Selecione "Salvar" para aplicar a alteração.' },
    ],
    relatedArticleIds: ['23', '24', '25', '26'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '23',
    slug: 'alterar-contraste',
    categoryId: 'personalization',
    title: 'Alterar o contraste',
    summary: 'Escolha entre contraste normal, alto ou o modo escuro.',
    keywords: ['contraste', 'alto', 'escuro', 'dark', 'modo', 'cores', 'visível'],
    steps: [
      { id: 's1', title: 'Abrir a Personalização', description: 'No menu completo, selecione "Configurações".' },
      { id: 's2', title: 'Localizar "Contraste"', description: 'Encontre a seção de contraste.' },
      { id: 's3', title: 'Escolher uma opção', description: 'Selecione entre "Normal", "Alto contraste" ou "Modo escuro".' },
      { id: 's4', title: 'Salvar a preferência', description: 'Selecione "Salvar" para aplicar a alteração.' },
    ],
    relatedArticleIds: ['22', '24', '26'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '24',
    slug: 'aumentar-espacamento',
    categoryId: 'personalization',
    title: 'Aumentar o espaçamento',
    summary: 'Deixe mais espaço entre os elementos da tela para facilitar a leitura.',
    keywords: ['espacamento', 'espaçamento', 'ampliar', 'espaço', 'compacto', 'expandido', 'leitura'],
    steps: [
      { id: 's1', title: 'Abrir a Personalização', description: 'No menu completo, selecione "Configurações".' },
      { id: 's2', title: 'Localizar "Espaçamento"', description: 'Encontre a seção de espaçamento.' },
      { id: 's3', title: 'Escolher "Expandido"', description: 'Selecione "Expandido" para aumentar o espaço entre os elementos.' },
      { id: 's4', title: 'Salvar a preferência', description: 'Selecione "Salvar" para aplicar.' },
    ],
    relatedArticleIds: ['22', '23', '26'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '25',
    slug: 'ativar-modo-basico',
    categoryId: 'personalization',
    title: 'Ativar o modo básico',
    summary: 'Simplifique a interface para ver apenas o essencial.',
    keywords: ['basico', 'básico', 'simples', 'simplificar', 'essencial', 'interface', 'modo'],
    steps: [
      { id: 's1', title: 'Abrir a Personalização', description: 'No menu completo, selecione "Configurações".' },
      { id: 's2', title: 'Localizar "Interface"', description: 'Encontre a seção de modo de interface.' },
      { id: 's3', title: 'Selecionar "Modo básico"', description: 'Escolha "Básico" para ver apenas os recursos principais.' },
      { id: 's4', title: 'Salvar a preferência', description: 'Selecione "Salvar" para aplicar.' },
    ],
    relatedArticleIds: ['2', '22', '23', '26'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '26',
    slug: 'reduzir-animacoes',
    categoryId: 'personalization',
    title: 'Reduzir animações',
    summary: 'Diminua os movimentos na tela para uma experiência mais estável.',
    keywords: ['reduzir', 'animacao', 'animação', 'movimento', 'estável', 'motion', 'quieto'],
    steps: [
      { id: 's1', title: 'Abrir a Personalização', description: 'No menu completo, selecione "Configurações".' },
      { id: 's2', title: 'Localizar "Reduzir animações"', description: 'Encontre a opção de animações.' },
      { id: 's3', title: 'Ativar a redução', description: 'Marque a opção "Reduzir animações".' },
      { id: 's4', title: 'Salvar a preferência', description: 'Selecione "Salvar" para aplicar.' },
    ],
    relatedArticleIds: ['22', '23', '24', '27'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '27',
    slug: 'restaurar-padrao',
    categoryId: 'personalization',
    title: 'Restaurar as configurações padrão',
    summary: 'Volte todas as preferências para os valores originais.',
    keywords: ['restaurar', 'padrao', 'padrão', 'original', 'redefinir', 'resetar', 'configurações'],
    steps: [
      { id: 's1', title: 'Abrir a Personalização', description: 'No menu completo, selecione "Configurações".' },
      { id: 's2', title: 'Localizar "Restaurar"', description: 'Role até o final da página e encontre a opção "Restaurar configurações padrão".' },
      { id: 's3', title: 'Confirmar a restauração', description: 'Uma mensagem de confirmação aparecerá. Confirme para restaurar.' },
    ],
    relatedArticleIds: ['22', '23', '24', '25', '26'],
    relatedRoute: '/configuracoes',
    relatedRouteLabel: 'Abrir personalização',
    availableInBasicMode: true,
  },
  {
    id: '28',
    slug: 'mensagens-confirmacao',
    categoryId: 'security',
    title: 'Entender as mensagens de confirmação',
    summary: 'Saiba por que o SeniorEase pede confirmação antes de ações importantes.',
    keywords: ['confirmacao', 'confirmação', 'mensagem', 'dialogo', 'diálogo', 'certeza', 'segurança'],
    content: [
      'O SeniorEase exibe mensagens de confirmação antes de ações que não podem ser desfeitas facilmente.',
      'Isso evita que você exclua ou altere algo sem querer.',
      'Leia a mensagem com atenção e escolha "Sim" para confirmar ou "Não" para cancelar.',
      'Você pode desativar essas confirmações na página de personalização, se preferir.',
    ],
    relatedArticleIds: ['27', '12', '29'],
    availableInBasicMode: true,
  },
  {
    id: '29',
    slug: 'sair-sem-perder',
    categoryId: 'security',
    title: 'Sair sem perder o progresso',
    summary: 'Entenda que seu progresso é salvo automaticamente.',
    keywords: ['salvar', 'progresso', 'perder', 'automático', 'sair', 'fechar', 'segurança'],
    content: [
      'Suas atividades e preferências são salvas automaticamente enquanto você usa o SeniorEase.',
      'Se você sair da tela de execução de uma atividade, seu progresso é mantido.',
      'Quando voltar, poderá continuar de onde parou.',
      'Não é necessário se preocupar em perder informações ao navegar entre as telas.',
    ],
    relatedArticleIds: ['15', '16', '28'],
    availableInBasicMode: true,
  },
  {
    id: '30',
    slug: 'recuperar-senha',
    categoryId: 'security',
    title: 'Recuperar a senha',
    summary: 'Procedimento seguro para criar uma nova senha caso tenha esquecido.',
    keywords: ['recuperar', 'senha', 'esqueci', 'perdi', 'acesso', 'segurança', 'email'],
    content: [
      'Se você não lembra sua senha, pode solicitar a recuperação pela tela de entrada.',
      'Um e-mail será enviado com instruções para criar uma nova senha.',
      'A nova senha deve ter pelo menos 8 caracteres, incluindo uma letra e um número.',
      'Mantenha sua senha em local seguro e não compartilhe com outras pessoas.',
    ],
    relatedArticleIds: ['6', '5', '28'],
    relatedRoute: '/recuperar-senha',
    relatedRouteLabel: 'Ir para recuperar senha',
    availableInBasicMode: true,
  },
  {
    id: '31',
    slug: 'quem-pode-ver',
    categoryId: 'security',
    title: 'Entender quem pode ver as atividades',
    summary: 'Suas atividades são pessoais e somente você pode vê-las.',
    keywords: ['privacidade', 'ver', 'visualizar', 'compartilhar', 'pessoal', 'privado', 'segurança'],
    content: [
      'Suas atividades são pessoais e privadas.',
      'Nenhum outro usuário tem acesso às suas atividades, lembretes ou informações do perfil.',
      'O SeniorEase não compartilha suas informações com terceiros.',
      'Você pode ficar tranquilo: apenas você vê o que cadastra.',
    ],
    relatedArticleIds: ['28', '29', '30'],
    availableInBasicMode: true,
  },
  {
    id: '32',
    slug: 'excluir-atividade-seguranca',
    categoryId: 'security',
    title: 'O que acontece ao excluir uma atividade',
    summary: 'Entenda o que ocorre quando você exclui uma atividade.',
    keywords: ['excluir', 'deletar', 'remover', 'acontece', 'perder', 'recuperar', 'segurança'],
    content: [
      'Quando você exclui uma atividade, ela é removida permanentemente.',
      'A exclusão não pode ser desfeita.',
      'Por isso, o SeniorEase sempre pede uma confirmação antes de excluir.',
      'Se você não tiver certeza, pode manter a atividade sem concluí-la.',
    ],
    relatedArticleIds: ['12', '28', '29'],
    availableInBasicMode: true,
  },
]

export const faqItems: HelpFaqItem[] = [
  {
    question: 'Como crio uma atividade?',
    answer: 'Acesse "Atividades" no menu e selecione "Nova atividade". Preencha o título e a data, depois escolha "Salvar atividade".',
    articleSlug: 'criar-atividade',
  },
  {
    question: 'Posso dividir uma atividade em etapas?',
    answer: 'Sim. Ao criar ou editar uma atividade, você pode adicionar etapas para dividir o que precisa fazer em passos menores.',
    articleSlug: 'adicionar-etapas',
  },
  {
    question: 'Como continuo uma atividade que comecei?',
    answer: 'No dashboard, localize a atividade em andamento e selecione "Continuar". Você voltará ao ponto onde parou.',
    articleSlug: 'continuar-atividade',
  },
  {
    question: 'Como aumento o tamanho dos textos?',
    answer: 'Acesse "Configurações" no menu, localize "Tamanho da fonte" e escolha "Grande" ou "Extra grande".',
    articleSlug: 'aumentar-texto',
  },
  {
    question: 'Como altero o contraste?',
    answer: 'Em "Configurações", localize a seção "Contraste" e escolha entre "Normal", "Alto contraste" ou "Modo escuro".',
    articleSlug: 'alterar-contraste',
  },
  {
    question: 'Como redefino minha senha?',
    answer: 'Na tela de entrada, selecione "Esqueci minha senha" e siga as instruções enviadas para seu e-mail.',
    articleSlug: 'redefinir-senha',
  },
  {
    question: 'O meu progresso fica salvo?',
    answer: 'Sim. O SeniorEase salva automaticamente seu progresso nas atividades. Você pode sair e voltar depois sem perder nada.',
    articleSlug: 'sair-sem-perder',
  },
  {
    question: 'O que acontece quando excluo uma atividade?',
    answer: 'A atividade é removida permanentemente. O sistema sempre pede confirmação antes de excluir para evitar acidentes.',
    articleSlug: 'excluir-atividade-seguranca',
  },
]

export const quickLinks: HelpQuickLink[] = [
  { title: 'Criar uma atividade', description: 'Saiba como cadastrar uma nova atividade', articleSlug: 'criar-atividade', icon: 'PlusCircle' },
  { title: 'Continuar uma atividade', description: 'Retome uma atividade em andamento', articleSlug: 'continuar-atividade', icon: 'PlayCircle' },
  { title: 'Aumentar o tamanho do texto', description: 'Deixe a leitura mais confortável', articleSlug: 'aumentar-texto', icon: 'Type' },
  { title: 'Redefinir minha senha', description: 'Crie uma nova senha de acesso', articleSlug: 'redefinir-senha', icon: 'KeyRound' },
]

export function getCategoryLabel(categoryId: HelpCategoryId): string {
  const category = categories.find((c) => c.id === categoryId)
  return category?.title ?? categoryId
}

export function getArticlesByCategory(categoryId: HelpCategoryId): HelpArticle[] {
  return articles.filter((a) => a.categoryId === categoryId)
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  if (!article.relatedArticleIds) return []
  return article.relatedArticleIds
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is HelpArticle => a !== undefined)
}

export function getBasicModeCategories(): HelpCategory[] {
  return categories.filter((c) => ['gettingStarted', 'activities', 'personalization', 'account'].includes(c.id))
}

export function getRecommendedArticles(hasActivities: boolean, interfaceMode: 'basic' | 'complete'): HelpArticle[] {
  if (!hasActivities) {
    return [getArticleBySlug('criar-atividade'), getArticleBySlug('adicionar-etapas')].filter((a): a is HelpArticle => a !== undefined)
  }
  if (interfaceMode === 'basic') {
    return [getArticleBySlug('modo-basico-completo'), getArticleBySlug('ativar-modo-basico')].filter((a): a is HelpArticle => a !== undefined)
  }
  return [getArticleBySlug('continuar-atividade'), getArticleBySlug('conhecer-dashboard'), getArticleBySlug('adicionar-lembrete')].filter((a): a is HelpArticle => a !== undefined)
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function searchArticles(query: string): HelpArticle[] {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return []

  return articles.filter((article) => {
    const title = normalizeText(article.title)
    const summary = normalizeText(article.summary)
    const keywords = article.keywords.map(normalizeText)
    const category = normalizeText(getCategoryLabel(article.categoryId))

    return (
      title.includes(normalizedQuery) ||
      summary.includes(normalizedQuery) ||
      keywords.some((k) => k.includes(normalizedQuery)) ||
      category.includes(normalizedQuery)
    )
  })
}

// Espelha EXATAMENTE os TextChoices de leads/models.py (Lead.ProjectType e
// Lead.BudgetRange) no backend. Se um choice mudar lá, replique aqui — é a
// única duplicação "manual" deste projeto, porque o frontend e o backend
// são repositórios/deploys diferentes e não compartilham código.

export const TIPOS_PROJETO = [
  { valor: 'landing_page', rotulo: 'Landing Page' },
  { valor: 'site_institucional', rotulo: 'Site Institucional' },
  { valor: 'ecommerce', rotulo: 'E-commerce' },
  { valor: 'sistema_web', rotulo: 'Sistema Web' },
  { valor: 'outro', rotulo: 'Outro' },
];

export const FAIXAS_ORCAMENTO = [
  { valor: 'ate_2k', rotulo: 'Até R$ 2.000' },
  { valor: 'de_2k_a_5k', rotulo: 'R$ 2.000 – R$ 5.000' },
  { valor: 'de_5k_a_10k', rotulo: 'R$ 5.000 – R$ 10.000' },
  { valor: 'acima_10k', rotulo: 'Acima de R$ 10.000' },
  { valor: 'nao_sei_ainda', rotulo: 'Ainda não sei' },
];

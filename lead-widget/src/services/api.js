const API_URL = import.meta.env.VITE_API_URL;

/**
 * Erro estruturado que carrega os erros de campo devolvidos pelo DRF
 * (ex: { email: ["Informe um e-mail..."] }), para o formulário conseguir
 * mapear cada mensagem de volta ao campo certo.
 */
export class LeadApiError extends Error {
  constructor(camposComErro) {
    super('Não foi possível enviar sua solicitação.');
    this.name = 'LeadApiError';
    this.camposComErro = camposComErro || {};
  }
}

/**
 * Envia a submissão do formulário para o endpoint público de criação de
 * leads. Não faz retry nem cache — é uma chamada única, disparada pelo
 * hook de formulário no submit.
 */
export async function enviarLead(payload) {
  let resposta;

  try {
    resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Falha de rede (backend fora do ar, sem CORS, sem internet).
    throw new LeadApiError({ __geral: ['Não foi possível conectar ao servidor. Tente novamente em instantes.'] });
  }

  if (resposta.status === 429) {
    throw new LeadApiError({ __geral: ['Muitas tentativas em pouco tempo. Aguarde um pouco antes de tentar de novo.'] });
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new LeadApiError(corpo);
  }

  return resposta.json();
}

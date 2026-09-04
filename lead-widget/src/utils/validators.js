// Espelha (não substitui) a validação que já existe no backend
// (leads/validators.py e Lead.clean()). A fonte da verdade continua sendo
// o Django — isso aqui só existe para dar feedback instantâneo no campo,
// sem esperar a resposta da API.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(valor) {
  if (!valor || !valor.trim()) return 'Informe um e-mail.';
  if (!EMAIL_REGEX.test(valor.trim())) return 'Informe um e-mail válido.';
  return null;
}

export function validarWhatsapp(valor) {
  const apenasDigitos = (valor || '').replace(/\D/g, '');
  if (apenasDigitos.length < 10 || apenasDigitos.length > 11) {
    return 'Informe um WhatsApp válido, com DDD.';
  }
  return null;
}

export function validarNome(valor) {
  if (!valor || !valor.trim()) return 'Informe seu nome.';
  return null;
}

export function validarDescricao(valor) {
  if (!valor || valor.trim().length < 10) {
    return 'Conte um pouco mais sobre o projeto (mínimo 10 caracteres).';
  }
  return null;
}

export function validarTipoProjeto(valor) {
  if (!valor) return 'Selecione o tipo de projeto.';
  return null;
}

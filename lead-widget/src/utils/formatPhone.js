/**
 * Aplica a máscara "(DD) 9XXXX-XXXX" enquanto o usuário digita.
 * Recebe o valor bruto do input e devolve o valor já formatado.
 */
export function formatarWhatsapp(valorBruto) {
  const digitos = valorBruto.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

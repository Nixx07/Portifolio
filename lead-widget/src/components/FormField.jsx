/**
 * Envolve qualquer input/textarea/grupo de botões com o mesmo par
 * label + mensagem de erro, no vocabulário visual do site (label
 * monoespaçado, uppercase, tom apagado — igual ao <dt> das specs-row).
 * Recebe o campo de verdade via children em vez de reimplementar um
 * <input>, para servir tanto texto simples quanto grupos de chips.
 */
export default function FormField({ label, error, children }) {
  return (
    <div className="lw-field">
      <label className="lw-field-label">{label}</label>
      {children}
      {error && <p className="lw-field-error">{error}</p>}
    </div>
  );
}

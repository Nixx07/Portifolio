/**
 * Dois botões exclusivos (E-mail / WhatsApp), no estilo .btn entre
 * colchetes do próprio site. De propósito, não é um <select> — a decisão
 * de UX é deixar as duas opções sempre visíveis e a escolha ser um único
 * clique.
 */
export default function ContactMethodToggle({ valorSelecionado, onSelecionar }) {
  return (
    <div className="lw-toggle-group" role="radiogroup" aria-label="Método de contato preferido">
      <button
        type="button"
        className={`lw-toggle-btn ${valorSelecionado === 'email' ? 'lw-toggle-btn--active' : ''}`}
        role="radio"
        aria-checked={valorSelecionado === 'email'}
        onClick={() => onSelecionar('email')}
      >
        E-mail
      </button>
      <button
        type="button"
        className={`lw-toggle-btn ${valorSelecionado === 'whatsapp' ? 'lw-toggle-btn--active' : ''}`}
        role="radio"
        aria-checked={valorSelecionado === 'whatsapp'}
        onClick={() => onSelecionar('whatsapp')}
      >
        WhatsApp
      </button>
    </div>
  );
}

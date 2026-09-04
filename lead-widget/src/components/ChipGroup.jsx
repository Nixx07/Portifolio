/**
 * Grupo de botões de seleção única. Genérico de propósito: tanto "Tipo de
 * projeto" quanto "Faixa de orçamento" usam este mesmo componente, só
 * trocando a lista de opções — evita duplicar o mesmo botão duas vezes
 * com nomes diferentes.
 */
export default function ChipGroup({ opcoes, valorSelecionado, onSelecionar, ariaLabel }) {
  return (
    <div className="lw-chip-group" role="radiogroup" aria-label={ariaLabel}>
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          className={`lw-chip ${valorSelecionado === opcao.valor ? 'lw-chip--active' : ''}`}
          role="radio"
          aria-checked={valorSelecionado === opcao.valor}
          onClick={() => onSelecionar(opcao.valor)}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}

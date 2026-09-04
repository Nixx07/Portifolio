import { useEffect } from 'react';
import { useLeadForm } from '../hooks/useLeadForm.js';
import { formatarWhatsapp } from '../utils/formatPhone.js';
import { TIPOS_PROJETO, FAIXAS_ORCAMENTO } from '../utils/opcoes.js';
import FormField from './FormField.jsx';
import ContactMethodToggle from './ContactMethodToggle.jsx';
import ChipGroup from './ChipGroup.jsx';
import ConfirmationStamp from './ConfirmationStamp.jsx';

/**
 * Modal "Ficha de Projeto" — o formulário de captação inteiro. Reaproveita
 * classes já existentes no site (.plate, .eyebrow, .btn, .btn-primary,
 * .specs-row) para nascer visualmente idêntico ao resto do portfólio, sem
 * redefinir nenhuma delas.
 */
export default function LeadModal({ isOpen, onClose }) {
  const {
    valores, erros, erroGeral, status,
    setCampo, selecionarMetodoContato, enviar, reiniciar,
  } = useLeadForm();

  useEffect(() => {
    if (!isOpen) return undefined;
    function aoTeclarEsc(evento) {
      if (evento.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', aoTeclarEsc);
    return () => document.removeEventListener('keydown', aoTeclarEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function fecharEReiniciar() {
    onClose();
    // Pequeno atraso: reinicia o formulário só depois do fade-out, para o
    // usuário não ver o conteúdo "piscar" limpo antes do modal sumir.
    setTimeout(reiniciar, 300);
  }

  const contatoConfirmado =
    (valores.metodo_contato === 'email' && !erros.email && valores.email) ||
    (valores.metodo_contato === 'whatsapp' && !erros.whatsapp && valores.whatsapp);

  return (
    <div
      className="lw-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) fecharEReiniciar();
      }}
    >
      <div className="lw-modal plate" role="dialog" aria-modal="true" aria-labelledby="lw-modal-title">
        <div className="lw-modal-head">
          <div>
            <span className="eyebrow">Solicitação — LD·01</span>
            <h2 id="lw-modal-title">Ficha de Projeto</h2>
          </div>
          <button type="button" className="lw-modal-close" aria-label="Fechar" onClick={fecharEReiniciar}>
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div className="lw-modal-body">
            <ConfirmationStamp />
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <div className="lw-modal-body">
              {/* Honeypot: invisível para uma pessoa, visível para um bot
                  que preenche todo input que encontra. */}
              <div className="lw-honeypot" aria-hidden="true">
                <label htmlFor="lw-endereco">Endereço</label>
                <input
                  id="lw-endereco"
                  type="text"
                  name="endereco"
                  tabIndex={-1}
                  autoComplete="off"
                  value={valores.endereco}
                  onChange={(evento) => setCampo('endereco', evento.target.value)}
                />
              </div>

              <section className="lw-section">
                <span className="lw-section-label">Quem está pedindo?</span>

                <FormField label="Nome" error={erros.nome}>
                  <input
                    className="lw-input"
                    type="text"
                    value={valores.nome}
                    onChange={(evento) => setCampo('nome', evento.target.value)}
                    autoFocus
                  />
                </FormField>

                <FormField label="Método de contato preferido" error={erros.metodo_contato}>
                  <ContactMethodToggle
                    valorSelecionado={valores.metodo_contato}
                    onSelecionar={selecionarMetodoContato}
                  />
                </FormField>

                {valores.metodo_contato === 'email' && (
                  <FormField label="E-mail" error={erros.email}>
                    <input
                      className="lw-input"
                      type="email"
                      placeholder="voce@email.com"
                      value={valores.email}
                      onChange={(evento) => setCampo('email', evento.target.value)}
                    />
                  </FormField>
                )}

                {valores.metodo_contato === 'whatsapp' && (
                  <FormField label="WhatsApp" error={erros.whatsapp}>
                    <input
                      className="lw-input"
                      type="tel"
                      placeholder="(11) 91234-5678"
                      value={valores.whatsapp}
                      onChange={(evento) => setCampo('whatsapp', formatarWhatsapp(evento.target.value))}
                    />
                  </FormField>
                )}

                {contatoConfirmado && (
                  <div className="specs-row" style={{ marginTop: 4 }}>
                    <dt>Vamos falar em</dt>
                    <span className="leader" />
                    <dd>{valores.metodo_contato === 'email' ? valores.email : valores.whatsapp}</dd>
                  </div>
                )}
              </section>

              <section className="lw-section">
                <span className="lw-section-label">O que você quer construir</span>

                <FormField label="Tipo de projeto" error={erros.tipo_projeto}>
                  <ChipGroup
                    opcoes={TIPOS_PROJETO}
                    valorSelecionado={valores.tipo_projeto}
                    onSelecionar={(valor) => setCampo('tipo_projeto', valor)}
                    ariaLabel="Tipo de projeto"
                  />
                </FormField>

                <FormField label="Descreva o projeto" error={erros.descricao}>
                  <textarea
                    className="lw-textarea"
                    placeholder="Conte o que você precisa: objetivo do site, referências, prazo..."
                    value={valores.descricao}
                    onChange={(evento) => setCampo('descricao', evento.target.value)}
                  />
                </FormField>

                <FormField label="Faixa de orçamento (opcional)">
                  <ChipGroup
                    opcoes={FAIXAS_ORCAMENTO}
                    valorSelecionado={valores.orcamento_faixa}
                    onSelecionar={(valor) => setCampo('orcamento_faixa', valor)}
                    ariaLabel="Faixa de orçamento"
                  />
                </FormField>
              </section>

              {erroGeral && <p className="lw-error-banner">{erroGeral}</p>}
            </div>

            <div className="lw-modal-foot">
              <button type="button" className="btn" onClick={fecharEReiniciar}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary lw-submit-btn"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Enviando' : 'Enviar solicitação'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

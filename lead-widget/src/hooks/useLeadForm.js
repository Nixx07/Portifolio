import { useRef, useState } from 'react';
import { enviarLead, LeadApiError } from '../services/api.js';
import {
  validarDescricao,
  validarEmail,
  validarNome,
  validarTipoProjeto,
  validarWhatsapp,
} from '../utils/validators.js';

// Nomes de campo em snake_case de propósito: é o mesmo nome que o
// Lead (backend) e a LeadSerializer usam. Evita uma camada de tradução
// camelCase <-> snake_case que só criaria oportunidade de bug.
const VALORES_INICIAIS = {
  nome: '',
  metodo_contato: null, // 'email' | 'whatsapp'
  email: '',
  whatsapp: '',
  tipo_projeto: null,
  descricao: '',
  orcamento_faixa: null,
  endereco: '', // honeypot — deve permanecer sempre vazio
};

const TEMPO_MINIMO_MS = 2000;

export function useLeadForm() {
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | success

  // Timestamp de quando o formulário foi montado — enviado ao backend para
  // a checagem de "tempo mínimo de preenchimento" (leads/serializers.py).
  const renderizadoEmRef = useRef(Date.now() / 1000);

  function setCampo(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => {
      if (!atual[campo]) return atual;
      const { [campo]: _removido, ...resto } = atual;
      return resto;
    });
  }

  function selecionarMetodoContato(metodo) {
    setValores((atual) => ({ ...atual, metodo_contato: metodo }));
    setErros((atual) => {
      const { email: _e, whatsapp: _w, ...resto } = atual;
      return resto;
    });
  }

  function validarTudo() {
    const proximosErros = {};

    const erroNome = validarNome(valores.nome);
    if (erroNome) proximosErros.nome = erroNome;

    if (!valores.metodo_contato) {
      proximosErros.metodo_contato = 'Escolha como prefere ser contatado.';
    } else if (valores.metodo_contato === 'email') {
      const erroEmail = validarEmail(valores.email);
      if (erroEmail) proximosErros.email = erroEmail;
    } else {
      const erroWhatsapp = validarWhatsapp(valores.whatsapp);
      if (erroWhatsapp) proximosErros.whatsapp = erroWhatsapp;
    }

    const erroTipo = validarTipoProjeto(valores.tipo_projeto);
    if (erroTipo) proximosErros.tipo_projeto = erroTipo;

    const erroDescricao = validarDescricao(valores.descricao);
    if (erroDescricao) proximosErros.descricao = erroDescricao;

    setErros(proximosErros);
    return Object.keys(proximosErros).length === 0;
  }

  function aplicarErrosDaApi(camposComErro) {
    const CAMPOS_DE_FORMULARIO = new Set([
      'nome', 'email', 'whatsapp', 'tipo_projeto', 'descricao', 'orcamento_faixa',
    ]);
    const proximosErros = {};
    let mensagemGeral = null;

    Object.entries(camposComErro).forEach(([campo, mensagens]) => {
      const mensagem = Array.isArray(mensagens) ? mensagens[0] : String(mensagens);
      if (CAMPOS_DE_FORMULARIO.has(campo)) {
        proximosErros[campo] = mensagem;
      } else {
        // detail (throttle), non_field_errors, endereco/renderizado_em
        // (honeypot e antispam) — tudo isso vira uma mensagem genérica,
        // nunca aponta pro usuário que existe um honeypot.
        mensagemGeral = 'Não foi possível enviar sua solicitação. Confira os dados e tente novamente.';
      }
    });

    setErros((atual) => ({ ...atual, ...proximosErros }));
    setErroGeral(mensagemGeral);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral(null);

    // Bloqueio client-side de envio muito rápido — evita até uma chamada
    // de rede desnecessária quando é claramente um bot. O backend valida
    // isso de qualquer forma; isso aqui é só uma otimização.
    if (Date.now() - renderizadoEmRef.current * 1000 < TEMPO_MINIMO_MS) {
      return;
    }

    if (!validarTudo()) return;

    setStatus('submitting');
    try {
      await enviarLead({
        nome: valores.nome.trim(),
        metodo_contato: valores.metodo_contato,
        email: valores.metodo_contato === 'email' ? valores.email.trim() : null,
        whatsapp: valores.metodo_contato === 'whatsapp' ? valores.whatsapp : null,
        tipo_projeto: valores.tipo_projeto,
        descricao: valores.descricao.trim(),
        orcamento_faixa: valores.orcamento_faixa,
        endereco: valores.endereco,
        renderizado_em: renderizadoEmRef.current,
      });
      setStatus('success');
    } catch (erro) {
      setStatus('idle');
      if (erro instanceof LeadApiError) {
        aplicarErrosDaApi(erro.camposComErro);
      } else {
        setErroGeral('Não foi possível enviar sua solicitação. Tente novamente em instantes.');
      }
    }
  }

  function reiniciar() {
    setValores(VALORES_INICIAIS);
    setErros({});
    setErroGeral(null);
    setStatus('idle');
    renderizadoEmRef.current = Date.now() / 1000;
  }

  return {
    valores,
    erros,
    erroGeral,
    status,
    setCampo,
    selecionarMetodoContato,
    enviar,
    reiniciar,
  };
}

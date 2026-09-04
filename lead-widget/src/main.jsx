import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/widget.css';

// Guarda a referência do setState de "aberto/fechado" para o objeto
// global (window.NixxLeadWidget) conseguir acioná-lo a partir de fora do
// React — é o único ponto de contato entre o botão vanilla do site e a
// árvore React.
let definirAberto = null;

function receberControleDeAbertura(fn) {
  definirAberto = fn;
}

function montar() {
  let raiz = document.getElementById('lead-widget-root');
  if (!raiz) {
    raiz = document.createElement('div');
    raiz.id = 'lead-widget-root';
    document.body.appendChild(raiz);
  }
  if (raiz.dataset.montado === 'true') return;
  raiz.dataset.montado = 'true';
  createRoot(raiz).render(<App onOpenChange={receberControleDeAbertura} />);
}

montar();

// API pública mínima consumida pelo script.js do portfólio:
//   window.NixxLeadWidget.open()
window.NixxLeadWidget = {
  open: () => definirAberto && definirAberto(true),
  close: () => definirAberto && definirAberto(false),
};

// Só em desenvolvimento (npm run dev): abre o modal automaticamente para
// visualização, já que aqui não existe o botão real do portfólio clicando
// nele. Isso nunca entra no build de produção (import.meta.env.DEV é
// eliminado pelo Vite no build final).
if (import.meta.env.DEV) {
  setTimeout(() => window.NixxLeadWidget.open(), 200);
}

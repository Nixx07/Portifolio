# lead-widget

Widget React isolado do botão "Quero meu site". Roda dentro do portfólio
vanilla como uma única ilha de interatividade — o site continua HTML/CSS/JS
puro em tudo o mais.

## Desenvolvimento local

```
npm install
npm run dev
```

Abre em `http://localhost:5173` com o modal já aberto automaticamente (só em
dev, veja o final de `src/main.jsx`), usando `VITE_API_URL` de
`.env.development` (aponta para `http://127.0.0.1:8000/api/leads/` — o
backend precisa estar rodando).

## Build de produção

```
cp .env.production.example .env.production   # preencha com a URL real do backend
npm run build
```

Gera exatamente dois arquivos em `dist/`:

- `lead-widget.js` — bundle único (React incluso), formato IIFE clássico
- `lead-widget.css` — estilos do widget

## Integração no portfólio

1. Copie `dist/lead-widget.js` e `dist/lead-widget.css` para dentro da pasta
   `Portifólio/` (ex: `Portifólio/lead-widget/`).
2. No `index.html` do portfólio, adicione o link do CSS no `<head>`, depois
   do `style/style.css`, e a `<div id="lead-widget-root"></div>` antes do
   `</body>` (veja o patch completo na conversa).
3. No `script/script.js`, adicione o listener do botão que carrega o
   `lead-widget.js` sob demanda no primeiro clique.

O bundle nunca é baixado no carregamento inicial da página — só quando o
botão "Quero meu site" é clicado pela primeira vez.

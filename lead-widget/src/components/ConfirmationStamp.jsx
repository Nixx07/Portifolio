import { useEffect, useState } from 'react';

/**
 * Reaproveita a mesma técnica de assinatura visual do herói do site
 * (specs-panel__mark): um traço SVG que se desenha via stroke-dashoffset.
 * O estado "visivel" só vira true um frame depois do mount, para o
 * navegador ter algo para de fato animar (senão o traço já nasceria
 * desenhado, sem transição).
 */
export default function ConfirmationStamp() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisivel(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="lw-success">
      <svg
        className={`lw-success-mark ${visivel ? 'lw-success-mark--visible' : ''}`}
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <path d="M14,34 L26,46 L50,18" />
      </svg>
      <p className="lw-success-title">Solicitação recebida.</p>
      <p className="lw-success-text">
        Recebi os detalhes do seu projeto e vou entrar em contato em breve
        pelo canal que você escolheu.
      </p>
    </div>
  );
}

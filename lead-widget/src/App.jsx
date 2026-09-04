import { useEffect, useState } from 'react';
import LeadModal from './components/LeadModal.jsx';

/**
 * Componente raiz. A única responsabilidade dele é guardar se o modal está
 * aberto e expor esse controle para fora do React (main.jsx), já que quem
 * dispara a abertura é um <button> comum do site vanilla, fora da árvore
 * React.
 */
export default function App({ onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange(setIsOpen);
  }, [onOpenChange]);

  return <LeadModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}

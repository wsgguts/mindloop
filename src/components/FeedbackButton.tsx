// Botão "Dar opinião": pílula colorida com ícone e texto (não só um ícone solto), presente no Início e no topo das
// telas. Enquanto a pessoa nunca enviou uma opinião, ele brilha de leve de tempos em tempos para chamar atenção;
// depois do primeiro envio fica calmo (sem animação), mas continua visível para novas opiniões.
interface Props {
  onClick: () => void;
  /** Já enviou opinião: sem animação. */
  calm?: boolean;
  /** Rótulo curto no topo das telas (espaço menor); completo no Início. */
  compact?: boolean;
  className?: string;
}

export default function FeedbackButton({ onClick, calm, compact, className = "" }: Props) {
  return (
    <button type="button" className={`fb-btn${calm ? " calm" : ""}${compact ? " compact" : ""} ${className}`.trim()} onClick={onClick}
      aria-label="Dar opinião sobre o MindLoop" title="Dar opinião">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z" />
        <path d="m12 8.2.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="currentColor" stroke="none" />
      </svg>
      <span>{compact ? "Opinião" : "Dar opinião"}</span>
    </button>
  );
}

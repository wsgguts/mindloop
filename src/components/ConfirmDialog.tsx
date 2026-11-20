"use client";
// Confirmação das partidas ("Reiniciar", "Encerrar"): uma janela de verdade, centralizada na tela.
// Antes era um aviso dentro do cartão da partida, que recorta o que passa das bordas (cantos arredondados) — no
// celular a caixa ficava cortada embaixo, sem os botões. Agora ela é desenhada fora do cartão (portal no <body>).
import { createPortal } from "react-dom";
import Modal from "./Modal";

interface Props {
  text: string;
  /** Texto do botão que confirma (ex.: "Sim, reiniciar"). */
  confirm: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ text, confirm, onConfirm, onCancel }: Props) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <Modal title="Tem certeza?" onClose={onCancel} closeLabel="Cancelar">
      <div className="stack gconfirm-body">
        <p>{text}</p>
        <div className="row">
          <button type="button" className="btn cta" onClick={onConfirm}>{confirm}</button>
          <button type="button" className="btn sec" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </Modal>,
    document.body
  );
}

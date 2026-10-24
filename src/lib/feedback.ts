// Ponto de integração FUTURO para opiniões. Hoje não há destino configurado:
// nada é enviado nem armazenado. Quando houver um endpoint oficial, implemente aqui.
export interface Feedback { rating: number | null; comment: string }
export const FEEDBACK_CONFIGURED = false;
export async function submitFeedback(_feedback: Feedback): Promise<void> {
  throw new Error("Destino de avaliações ainda não configurado.");
}

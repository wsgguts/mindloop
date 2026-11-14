// Modo Administrador (só para testes da equipe).
// Enquanto está ligado:
//   • a conta real fica PAUSADA: progresso, conquistas, apelido e identidade ficam guardados e não mudam;
//   • o app usa um jogador de teste ("Administrador") numa área separada do aparelho (ver lib/storage.ts);
//   • tudo fica liberado (todos os níveis, capítulos, investigações e o jogo bônus);
//   • nada vai para o servidor: sem sincronização, sem ranking e sem pontuação.
// Ao desligar, a área de testes é apagada e a pessoa volta para a própria conta, do ponto em que parou.
// A senha está no código de propósito: é uma trava contra toques acidentais, não uma proteção de segurança.
import { ADMIN_FLAG, adminActive, enterAdminArea, leaveAdminArea } from "./storage";

export const ADMIN_KEY = ADMIN_FLAG;
export const ADMIN_PASSWORD = "admin";
export const ADMIN_NICK = "Administrador";

export const checkAdminPassword = (typed: string): boolean => typed.trim().toLowerCase() === ADMIN_PASSWORD;
export const parseAdmin = (raw: string | null): boolean => raw === "1";
export const isAdmin = adminActive;
export const enterAdmin = () => enterAdminArea(ADMIN_NICK);
export const leaveAdmin = leaveAdminArea;

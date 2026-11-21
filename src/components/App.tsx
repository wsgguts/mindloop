"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import BottomNav, { type Tab } from "./BottomNav";
import Game from "./Game";
import Gem, { type GemKind } from "./Gem";
import Journey from "./Journey";
import LevelComplete, { type LeaveTo, type LevelResult } from "./LevelComplete";
import AchievementToast from "./AchievementToast";
import Achievements from "./Achievements";
import Ranking from "./Ranking";
import Stats from "./Stats";
import { ACH_KEY, type Achievement, type Unlocked, evaluate, parseUnlocked } from "../lib/achievements";
import { HISTORY_KEY, type PlayerLog, addMatch, emptyLog, importLegacy, matchId, parseLog, startMatch } from "../lib/history";
import { RANK_KEY, RankError, rankingConfig, renamePlayer, syncGame } from "../lib/ranking";
import { type Identity, STORE_PREFIX, createPlayer, emptySnapshot, hasProgress, issueRecovery, loadRemote, mergeSnapshots, parseIdentityFull, readSnapshot, recoverPlayer, resetPlayer, sameSnapshot, setListed, syncSnapshot, TUTORIAL_KEY, writeSnapshot } from "../lib/cloud";
import { NickModal, Settings } from "./account/Account";
import { RulesContent, type RulesGame } from "./Rules";
import GuidedPlay, { type GuidedEnd } from "./guided/GuidedPlay";
import { guidedScript, guidedTitle } from "./guided/scripts";
import { GUIDED_KEY, type GuidedPart, guidedFor, parseGuided, serializeGuided } from "../lib/guided";
import PatchesGame from "./PatchesGame";
import { initSound } from "../lib/sound/engine";
import TangoGame from "./TangoGame";
import ZipGame from "./ZipGame";
import AstrosGame from "./AstrosGame";
import AstrosDemo, { type DemoStage } from "./AstrosDemo";
import FeedbackButton from "./FeedbackButton";
import { ASTROS_PUZZLES } from "../lib/astros";
import { ASK_KEY, type AskState, COMMENT_MAX, countWin, decline, parseAsk, submitFeedback, validateFeedback } from "../lib/feedback";
import { ALL_GAMES, BONUS_GAME, EVERY_GAME, GAME_META, bonusUnlocked, isMainGame, visibleGames } from "../lib/games";
import { LEVELS_PER_GAME, doneCount, emptyProgress, focusLevel, isComplete, isDone, markDone, parseLevel, parseProgress } from "../lib/journey";
import { PUZZLES, puzzleGrid } from "../lib/puzzles";
import { type Times, parseTimes, recordTime } from "../lib/records";
import type { Grid } from "../lib/sudoku";
import { validateNick } from "../lib/nick";
import { KEYS, clearStore, onStoreWrite, readStore, writeStore } from "../lib/storage";
import { AVATAR_KEY, AVATARS_SEEN_KEY, parseSeen } from "../lib/cast";
import { AvatarPic, AvatarsPanel, avatarStats, currentAvatar, newAvatars } from "./account/Avatars";
import { enterAdmin, isAdmin, leaveAdmin } from "../lib/admin";
import Sobre from "./Sobre";
import HomeFx from "./HomeFx";
import { FX_DESKTOP, FX_MOBILE } from "../lib/homeFx";
import { SOBRE } from "../content/sobre";
import { PATCHES_PUZZLES } from "../lib/patches";
import { TANGO_PUZZLES } from "../lib/tango";
import { ZIP_PUZZLES } from "../lib/zip";
import CaseOffer from "./cases/CaseOffer";
import CaseScreen, { type SolveResult } from "./cases/CaseScreen";
import CaseBook, { CaseSummary } from "./cases/CaseBook";
import { afterContinue, caseById, casesOf } from "../lib/cases/catalog";
import { CASES_KEY, type CaseLog, type Draft, emptyCaseLog, isSolved, parseCaseLog, recordOf, recordSkip, recordSolve, saveDraft, shouldOffer, solvedCount } from "../lib/cases/progress";

type View = "home" | "journey" | "game" | "rules" | "profile" | "feedback" | "ranking" | "achievements" | "case" | "casebook" | "demo";
/**
 * Investigação aberta. "offer" = convite depois do Continuar; "play" = investigando.
 * next: a fase tradicional que vem depois (convite da jornada); sem next, veio do caderno de investigações.
 */
type CaseRun = { id: string; mode: "offer" | "play"; next?: { game: RulesGame; idx: number }; /** aberta pelo cristal Extra do mapa: volta para a jornada */ fromMap?: boolean };
type Save = { id: string; grid: Grid; ms?: number };
type Session = { game: RulesGame; idx: number; round: number };
/** Volta à trilha logo após uma vitória: qual nível animar como concluído e qual como recém-liberado. */
type Arrival = { game: RulesGame; justDone: number; justUnlocked?: number };
type PerGame<T> = Record<RulesGame, T>;
const CODE_UNSEEN_KEY = "mindloop:code-unseen"; // código de recuperação ainda não visto
const FRESH_KEY = "mindloop:fresh"; // sessionStorage: acabou de reiniciar o jogo
const SYNC_DELAY_MS = 2500; // espera juntar várias gravações antes de enviar
/** Gravações que não são progresso (identidade, partida em andamento): não disparam sincronização. */
/** Já enviou ao menos uma opinião (o botão para de chamar atenção e a tela de parabéns para de pedir nota). */
const FB_SENT_KEY = "mindloop:fb-sent";
const NO_SYNC = new Set([RANK_KEY, KEYS.save, KEYS.nick, CODE_UNSEEN_KEY, FB_SENT_KEY]);

// Para onde o "Voltar" da tela de opinião leva (ela pode ser aberta de qualquer tela pelo botão flutuante).
const BACK_LABEL: Record<Exclude<View, "feedback">, string> = {
  home: "Voltar ao início", demo: "Voltar à prévia", journey: "Voltar à jornada", game: "Voltar ao jogo", rules: "Voltar às regras", profile: "Voltar ao perfil",
  ranking: "Voltar ao ranking", achievements: "Voltar às conquistas", case: "Voltar à investigação", casebook: "Voltar às investigações",
};
const TAB_OF: Record<View, Tab> = { home: "home", journey: "home", game: "home", rules: "rules", profile: "profile", feedback: "profile", ranking: "ranking", achievements: "achievements", case: "home", casebook: "home", demo: "home" };
// Chave de "já viu as regras" de cada jogo (a do Sudoku é a original, mantida por compatibilidade).
// Tutorial antigo de cada jogo ("done"/"skipped"). Só é lido: quem já viu não é obrigado a ver a partida guiada.
// Progresso salvo no aparelho, por jogo.
const PROGRESS_KEY = (g: RulesGame) => `mindloop:progress:${g}`;
const TIMES_KEY = (g: RulesGame) => `mindloop:times:${g}`; // melhor tempo de cada nível
const LAST_KEY = (g: RulesGame) => `mindloop:last:${g}`; // último nível jogado (referência de retorno)
const perGame = <T,>(f: (g: RulesGame) => T): PerGame<T> => ({ sudoku: f("sudoku"), zip: f("zip"), tango: f("tango"), patches: f("patches"), astros: f("astros") });

// Áreas clicáveis sobre os cristais da arte do Início (em % da imagem home-art.webp, 944 × 1680; original em art/home/home-art.jpg).
// Cada área cobre o cristal e a etiqueta com o nome do jogo. O Astros não tem cristal na arte: é o jogo extra,
// que aparece na lista de jogos aberta pelo "Jogar agora".
const ART_SPOTS: { id: RulesGame; left: number; top: number; width: number; height: number }[] = [
  { id: "sudoku", left: 4, top: 14, width: 33, height: 14 },
  { id: "zip", left: 61, top: 13.5, width: 32, height: 14.5 },
  { id: "tango", left: 3, top: 38, width: 26, height: 16 },
  { id: "patches", left: 68, top: 40.5, width: 31, height: 15 },
];
// Arte do computador (paisagem, home-art-desktop.webp, 2196 × 1236; original em art/home/home-art-desktop.jpg): os mesmos
// cristais e o botão, em outras posições. Qual arte aparece é decidido no CSS (globals.css, "Início no computador").
const DESK_SPOTS: typeof ART_SPOTS = [
  { id: "sudoku", left: 25, top: 3.5, width: 18, height: 25 },
  { id: "zip", left: 55.5, top: 2, width: 17.5, height: 25.5 },
  { id: "tango", left: 26, top: 47, width: 13, height: 25 },
  { id: "patches", left: 60, top: 49.5, width: 17, height: 24.5 },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("home");
  const [nick, setNick] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null); // avatar escolhido (validado contra o progresso)
  const [avSeen, setAvSeen] = useState<Set<string>>(() => new Set()); // avatares liberados que já apareceram na coleção
  const [nickModal, setNickModal] = useState<null | { then: () => void }>(null); // o que fazer depois de salvar
  // ---- Partida guiada (item 3): substitui o tutorial passo a passo ----
  /** Partes já vistas de cada jogo ("base" = a completa; "c3" = a curta do capítulo 3…). */
  const [guidedSeen, setGuidedSeen] = useState<PerGame<Set<GuidedPart>>>(() => perGame(() => new Set()));
  /**
   * Partida guiada aberta. mode: "first" (primeira vez no jogo: ao terminar conta como partida completa e vai para a
   * comemoração), "short" (capítulo novo: ao terminar volta ao nível) ou "replay" (pedida pelo "?" ou pela aba Regras).
   * idx: nível que a pessoa ia jogar (o "Jogar o nível N" da comemoração abre ele).
   */
  const [guided, setGuided] = useState<null | { game: RulesGame; part: GuidedPart; mode: "first" | "short" | "replay"; idx?: number; from: "journey" | "game" | "demo" }>(null);
  const [guidedRun, setGuidedRun] = useState(0); // cada abertura recomeça do zero
  /** Comemoração do fim da partida guiada (com o nível a abrir no "Jogar o nível N"). */
  const [guidedWin, setGuidedWin] = useState<null | { game: RulesGame; idx: number }>(null);
  // ---- Pedido de opinião na comemoração (item 4) ----
  const askRef = useRef<AskState>({ wins: 0, declinedAt: null });
  const [askNow, setAskNow] = useState(false); // a comemoração atual pede opinião
  /** Prévia do Astros (jogo bônus bloqueado): etapa e rodada (cada "Jogar de novo" recomeça do zero). */
  const [demo, setDemo] = useState<DemoStage | null>(null);
  const [demoRound, setDemoRound] = useState(0);
  const [rulesTab, setRulesTab] = useState<RulesGame>("sudoku");
  const [save, setSave] = useState<Save | null>(null);
  const [journeyGame, setJourneyGame] = useState<RulesGame>("sudoku");
  const [progress, setProgress] = useState<PerGame<string>>(() => perGame(emptyProgress));
  const [times, setTimes] = useState<PerGame<Times>>(() => perGame(() => ({})));
  const [lastPlayed, setLastPlayed] = useState<PerGame<number | null>>(() => perGame(() => null));
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<LevelResult | null>(null); // vitória recém-conquistada
  const [showComplete, setShowComplete] = useState(false); // tela de parabéns aberta
  const [arrival, setArrival] = useState<Arrival | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [fbStatus, setFbStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [fbError, setFbError] = useState<string | null>(null);
  const [bot, setBot] = useState(""); // campo-armadilha contra robôs
  const [fbFrom, setFbFrom] = useState<Exclude<View, "feedback">>("profile"); // tela de onde a opinião foi aberta
  const [fbSent, setFbSent] = useState(false); // já enviou alguma opinião
  // Histórico central de partidas, conquistas e ranking (todos alimentados pelo mesmo evento de vitória).
  const [log, setLog] = useState<PlayerLog>(emptyLog);
  const [unlocked, setUnlocked] = useState<Unlocked>({});
  const [toasts, setToasts] = useState<Achievement[]>([]); // fila de medalhas novas (uma por vez, fora da partida)
  const [winMedals, setWinMedals] = useState<Achievement[]>([]); // medalhas da vitória atual (tela de parabéns)
  const [newMedals, setNewMedals] = useState(0); // selo na aba Conquistas
  // Identidade anônima (sem login): a mesma para progresso no servidor, recuperação e ranking.
  const [me, setMe] = useState<Identity | null>(null);
  const meRef = useRef(me);
  meRef.current = me;
  const [cloudIssue, setCloudIssue] = useState<null | "taken" | "offline">(null);
  const [profileTab, setProfileTab] = useState<"desempenho" | "avatares" | "ajustes" | "sobre">("desempenho");
  // Modo Administrador (testes): a conta real fica pausada e o app usa um jogador de teste numa área separada,
  // com tudo liberado e sem servidor (sem sincronização, ranking ou pontuação). Ver lib/admin.ts e lib/storage.ts.
  const [admin, setAdmin] = useState(false);
  /** Sem servidor: Supabase não configurado ou Modo Administrador ligado (a conta real não é tocada). */
  const offline = () => isAdmin() || !rankingConfig();
  /** Liga/desliga o modo e recarrega o app já lendo a outra área (testes ↔ conta real). */
  async function changeAdmin(on: boolean) {
    if (on) {
      // Antes de pausar a conta real, envia ao servidor o que ainda estava para sincronizar.
      if (syncTimer.current) { window.clearTimeout(syncTimer.current); syncTimer.current = undefined; }
      await syncNow().catch(() => { /* fica salvo no aparelho e sincroniza na volta */ });
      enterAdmin();
    } else leaveAdmin();
    window.location.reload();
  }
  // Mindloop Investigação: progresso próprio (nunca altera fases, ranking ou desbloqueios).
  const [caseLog, setCaseLog] = useState<CaseLog>(emptyCaseLog);
  const caseLogRef = useRef(caseLog);
  caseLogRef.current = caseLog;
  const [caseRun, setCaseRun] = useState<CaseRun | null>(null);
  const [bookGame, setBookGame] = useState<RulesGame>("sudoku");
  /** Capítulo aberto no caderno de investigações (null = visão geral); volta a ele ao sair de um mistério. */
  const [bookChapter, setBookChapter] = useState<number | null>(null);
  const [bookFrom, setBookFrom] = useState<"journey" | "profile">("journey");
  const logRef = useRef(log);
  logRef.current = log;
  const hintsRef = useRef(0); // dicas pedidas na partida atual
  const sessionWon = useRef(false); // a partida atual já foi vencida (para "Sem Desistir")
  const viewRef = useRef(view);
  viewRef.current = view;
  const toCards = useRef(false); // ao voltar para o Início, rolar até os cards dos jogos

  /** Lê tudo do aparelho para a tela (na abertura e depois de baixar o progresso do servidor). */
  function hydrate() {
    const n = readStore(KEYS.nick) ?? "";
    setNick(n && !validateNick(n) ? n : "");
    setAvatarId(readStore(AVATAR_KEY));
    setAvSeen(parseSeen(readStore(AVATARS_SEEN_KEY)));
    setGuidedSeen(perGame((g) => parseGuided(readStore(GUIDED_KEY(g)), readStore(TUTORIAL_KEY(g)))));
    askRef.current = parseAsk(readStore(ASK_KEY));
    setAdmin(isAdmin());
    const prog = perGame((g) => parseProgress(readStore(PROGRESS_KEY(g))));
    const tms = perGame((g) => parseTimes(readStore(TIMES_KEY(g))));
    setProgress(prog);
    setTimes(tms);
    setLastPlayed(perGame((g) => parseLevel(readStore(LAST_KEY(g)))));
    try { const s = readStore(KEYS.save); if (s) setSave(JSON.parse(s) as Save); } catch { /* ignora */ }
    setFbSent(readStore(FB_SENT_KEY) === "1");
    // Histórico: na primeira abertura desta versão, os recordes já salvos viram registros importados.
    let lg = parseLog(readStore(HISTORY_KEY));
    if (!lg) { lg = importLegacy(tms); writeStore(HISTORY_KEY, JSON.stringify(lg)); }
    setLog(lg);
    // Conquistas: se ainda não existiam, as já merecidas são registradas em silêncio (sem enxurrada de avisos).
    const cl = parseCaseLog(readStore(CASES_KEY));
    setCaseLog(cl);
    const stored = parseUnlocked(readStore(ACH_KEY));
    const ev = evaluate({ log: lg, progress: prog, cases: cl }, stored ?? {}, Date.now());
    setUnlocked(ev.unlocked);
    if (!stored || ev.fresh.length) writeStore(ACH_KEY, JSON.stringify(ev.unlocked));
    if (stored && ev.fresh.length) setToasts(ev.fresh);
  }

  useEffect(() => {
    initSound(); // prepara o áudio; nada toca antes do primeiro toque/clique da pessoa
    hydrate();
    const id = parseIdentityFull(readStore(RANK_KEY));
    meRef.current = id; setMe(id);
    if (readStore(CODE_UNSEEN_KEY)) silently(() => writeStore(CODE_UNSEEN_KEY, null)); // aviso antigo: limpa
    setReady(true);
    // Depois de "Reiniciar jogo": começa como na primeira vez, já pedindo o novo apelido.
    let fresh = false;
    try { fresh = window.sessionStorage.getItem(FRESH_KEY) === "1"; window.sessionStorage.removeItem(FRESH_KEY); } catch { /* ignora */ }
    if (fresh) openNick(() => {});
    connect();
    // Toda gravação de progresso agenda uma sincronização; ao sair do app, sincroniza na hora.
    const off = onStoreWrite((key) => { if (!quiet.current && !NO_SYNC.has(key)) scheduleSync(); });
    const onHide = () => { if (document.visibilityState === "hidden" && syncTimer.current) { window.clearTimeout(syncTimer.current); syncTimer.current = undefined; syncNow(); } };
    document.addEventListener("visibilitychange", onHide);
    return () => { off(); document.removeEventListener("visibilitychange", onHide); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Progresso no servidor (identidade anônima) ----
  const quiet = useRef(false); // gravações feitas pela própria sincronização não reagendam outra
  const syncTimer = useRef<number | undefined>(undefined);
  const syncing = useRef(false);
  const syncAgain = useRef(false);
  const silently = (f: () => void) => { quiet.current = true; try { f(); } finally { quiet.current = false; } };
  function saveMe(id: Identity | null) { meRef.current = id; setMe(id); silently(() => writeStore(RANK_KEY, id ? JSON.stringify(id) : null)); }
  function scheduleSync() {
    if (!meRef.current || offline()) return;
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => { syncTimer.current = undefined; syncNow(); }, SYNC_DELAY_MS);
  }
  /** Baixa, mescla e envia o progresso (mesmo jogador em vários aparelhos: nada se perde, nada duplica). */
  async function syncNow() {
    const m = meRef.current;
    if (!m || offline()) return;
    if (syncing.current) { syncAgain.current = true; return; }
    syncing.current = true;
    try {
      const local = readSnapshot(readStore);
      const r = await syncSnapshot(m, local);
      if (meRef.current?.id !== m.id) return; // a identidade mudou no meio (recuperação ou reinício)
      // Enquanto o servidor respondia, a pessoa pode ter concluído outro nível. Por isso mescla de novo com o que está
      // no aparelho AGORA (e não com a leitura de antes): gravar r.merged direto apagaria esse nível recém-concluído.
      // O que for novo aqui vai para o servidor na próxima sincronização (já agendada por essa gravação).
      const now = readSnapshot(readStore);
      const final = mergeSnapshots(now, r.merged);
      if (!sameSnapshot(final, now)) { silently(() => writeSnapshot(final, writeStore)); hydrate(); }
      if (r.nick && r.nick !== readStore(KEYS.nick)) { silently(() => writeStore(KEYS.nick, r.nick)); setNick(r.nick); }
      saveMe({ ...meRef.current, rev: r.rev, listed: r.listed, nick: r.nick || meRef.current.nick });
      setCloudIssue(null);
    } catch (e) {
      // O servidor não conhece mais este aparelho (conta reiniciada em outro lugar): segue só no aparelho.
      if (e instanceof RankError && e.code === "AUTH") { saveMe(null); setCloudIssue("offline"); }
    } finally {
      syncing.current = false;
      if (syncAgain.current) { syncAgain.current = false; scheduleSync(); }
    }
  }
  /** Garante a identidade: cria uma para quem já tem apelido, gera o código de recuperação e sincroniza. */
  async function connect() {
    if (offline()) return;
    let m = meRef.current;
    if (!m) {
      const n = readStore(KEYS.nick);
      if (!n || validateNick(n)) return;
      try { m = await createPlayer(n, false); saveMe(m); setCloudIssue(null); }
      catch (e) { setCloudIssue(e instanceof RankError && e.code === "NICK_TAKEN" ? "taken" : "offline"); return; }
    } else if (!m.recovery) {
      try { const code = await issueRecovery(m); m = { ...m, recovery: code }; saveMe(m); } catch { /* tenta na próxima abertura */ }
    }
    await syncNow();
  }
  /** Apelido escolhido ou trocado. Com servidor: o apelido é único entre todos os jogadores. */
  async function saveNick(v: string): Promise<string | null> {
    const online = !offline();
    const m = meRef.current;
    if (online && m && v !== m.nick) {
      try { await renamePlayer(m, v); saveMe({ ...m, nick: v }); }
      catch (e) { return e instanceof RankError ? e.message : "Não foi possível salvar agora."; }
    }
    if (online && !m) {
      try {
        const id = await createPlayer(v, false);
        // Item 1: o código de recuperação continua sendo gerado e salvo (id.recovery), mas não aparece mais aqui —
        // fica em Perfil → Ajustes → "Jogar em outro dispositivo".
        saveMe(id); setCloudIssue(null);
      } catch (e) {
        if (e instanceof RankError && (e.code === "NICK_TAKEN" || e.code === "NICK_INVALID")) return e.message;
        setCloudIssue("offline"); // sem internet: segue no aparelho e conecta na próxima abertura
      }
    }
    setNick(v); writeStore(KEYS.nick, v);
    const then = nickModal?.then;
    setNickModal(null);
    then?.();
    scheduleSync();
    return null;
  }
  /** Recupera uma identidade pelo código. Os dados do aparelho são SUBSTITUÍDOS pelos da conta (nunca misturados). */
  async function recoverWith(code: string): Promise<string | null> {
    try {
      const id = await recoverPlayer(code);
      if (meRef.current) { window.clearTimeout(syncTimer.current); await syncNow(); } // guarda o que a conta atual tinha
      const remote = await loadRemote(id);
      silently(() => {
        clearStore(STORE_PREFIX);
        writeSnapshot(remote.data ?? emptySnapshot(), writeStore);
        writeStore(KEYS.nick, remote.nick);
      });
      saveMe({ ...id, nick: remote.nick, rev: remote.rev, listed: remote.listed });
      setCloudIssue(null); setSession(null); setSave(null); setCaseRun(null);
      hydrate();
      const then = nickModal?.then;
      setNickModal(null);
      then?.();
      return null;
    } catch (e) {
      return e instanceof RankError ? e.message : "Não foi possível recuperar agora.";
    }
  }
  /** Reiniciar jogo: primeiro apaga no servidor (tudo ou nada), depois no aparelho, e recomeça do zero. */
  async function resetAll(): Promise<string | null> {
    if (isAdmin()) { leaveAdmin(); window.location.reload(); return null; } // no modo de testes, "reiniciar" só descarta a área de testes
    const m = meRef.current;
    if (m && rankingConfig()) {
      try { await resetPlayer(m); }
      catch (e) {
        if (!(e instanceof RankError && e.code === "AUTH")) // AUTH: a conta já não existe no servidor
          return e instanceof RankError && e.code === "NET" ? "Sem conexão agora. Nada foi apagado — tente de novo com internet." : "Não foi possível reiniciar agora. Nada foi apagado.";
      }
    }
    window.clearTimeout(syncTimer.current);
    meRef.current = null;
    silently(() => clearStore(STORE_PREFIX));
    try { window.sessionStorage.setItem(FRESH_KEY, "1"); } catch { /* ignora */ }
    window.location.reload();
    return null;
  }

  // Cada tela começa do topo; a jornada cuida da própria rolagem (centraliza o nível destacado).
  useEffect(() => {
    if (view === "journey") return;
    if (view === "home" && toCards.current) {
      toCards.current = false;
      document.getElementById("jogos")?.scrollIntoView({ block: "start" });
    } else window.scrollTo(0, 0);
    setArrival(null); // a animação de chegada vale só para a volta imediata à trilha
  }, [view]);

  const persist = (s: Save | null) => { setSave(s); writeStore(KEYS.save, s ? JSON.stringify(s) : null); };

  function openNick(then: () => void) { setNickModal({ then }); }
  function onTab(t: Tab) { setView(t); }
  // Ver a aba Conquistas zera o selo de medalhas novas.
  useEffect(() => { if (view === "achievements") setNewMedals(0); }, [view]);
  function goHome(cards = false) { toCards.current = cards; setView("home"); if (cards && view === "home") document.getElementById("jogos")?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  /** Card, nome, arte ou "Jogar agora" de um jogo: abre a jornada dele (pedindo o apelido na primeira vez). */
  // Início: "Jogar agora" leva à lista de jogos (o texto alternativo das artes, homeAlt, fica junto de bonusOpen).
  const goToGames = () => document.getElementById("jogos")?.scrollIntoView({ behavior: "smooth", block: "start" });

  function openGame(id: RulesGame) {
    if (id === BONUS_GAME && !bonusOpen) return openDemo(); // bloqueado: abre a prévia jogável (nunca as fases oficiais)
    // Item 2: o jogo abre direto no mapa da jornada (sem a tela de capítulos no meio).
    // Item 1 + 3: logo depois de criar o apelido, a pessoa já cai na partida guiada (primeira vez neste jogo).
    const go = () => {
      openJourney(id);
      if (!guidedSeen[id].has("base")) openGuided({ game: id, part: "base", mode: "first", idx: focusLevel(progress[id], lastPlayed[id]) - 1, from: "journey" });
    };
    if (nick) go();
    else openNick(go);
  }
  /** Prévia do Astros: começa na apresentação. Não depende de apelido e não grava nada. */
  function openDemo() { setDemo("intro"); setView("demo"); }
  function closeDemo() { setDemo(null); setView("home"); }
  function openJourney(game: RulesGame) { setJourneyGame(game); setArrival(null); setView("journey"); }

  const saveLog = (l: PlayerLog) => { logRef.current = l; setLog(l); writeStore(HISTORY_KEY, JSON.stringify(l)); };

  /**
   * Abre um nível. `fromCelebration`: chamado pelo "Continuar" da tela de parabéns, que ainda cobre a tela —
   * ela continua montada e se desfaz sozinha por cima do novo nível (o cronômetro só começa depois).
   */
  function startGame(game: RulesGame, idx: number, fromCelebration = false) {
    // Partida anterior deixada sem terminar (a do Mini Sudoku guardada para depois não conta como abandono).
    const kept = session?.game === "sudoku" && save?.id === PUZZLES[session.idx].id;
    saveLog(startMatch(logRef.current, game, !!session && !sessionWon.current && !kept));
    hintsRef.current = 0;
    sessionWon.current = false;
    setSession((s) => ({ game, idx, round: (s?.round ?? 0) + 1 }));
    setLastPlayed((l) => ({ ...l, [game]: idx + 1 }));
    writeStore(LAST_KEY(game), String(idx + 1));
    if (!fromCelebration) { setResult(null); setShowComplete(false); }
    setView("game");
    // Partida guiada: a completa na primeira vez neste jogo; a curta no começo de um capítulo que muda algo.
    const part = guidedFor(game, idx + 1, guidedSeen[game], isDone(progress[game], idx + 1));
    if (part) openGuided({ game, part, mode: part === "base" ? "first" : "short", idx, from: "game" });
  }

  /**
   * Nível resolvido — o ÚNICO ponto de registro de uma vitória. Salva na hora (mesmo que a pessoa feche o app
   * durante a animação) e, a partir do mesmo evento: progresso da jornada → recorde → histórico/médias →
   * conquistas → ranking. useLevelPlay garante uma chamada por partida, então nada é contado duas vezes.
   */
  function winLevel(game: RulesGame, level: number, ms: number) {
    const before = progress[game];
    const after = markDone(before, level); // repetir um nível não altera nada do histórico
    const t = recordTime(times[game], level, ms);
    setProgress((p) => ({ ...p, [game]: after }));
    writeStore(PROGRESS_KEY(game), after);
    setTimes((all) => ({ ...all, [game]: t.times }));
    writeStore(TIMES_KEY(game), JSON.stringify(t.times));
    setLastPlayed((l) => ({ ...l, [game]: level }));
    writeStore(LAST_KEY(game), String(level));
    setResult({ game, level, ms, best: t.best, previous: t.previous, isRecord: t.isRecord, before, after });
    countForOpinion();

    const at = Date.now();
    sessionWon.current = true;
    const lg = addMatch(logRef.current, { id: matchId(game, level, at), game, level, ms, at, hints: hintsRef.current, first: !isDone(before, level), record: t.isRecord });
    saveLog(lg);
    const ev = evaluate({ log: lg, progress: { ...progress, [game]: after }, cases: caseLogRef.current }, unlocked, at);
    setWinMedals(ev.fresh);
    if (ev.fresh.length) {
      setUnlocked(ev.unlocked);
      writeStore(ACH_KEY, JSON.stringify(ev.unlocked));
      setNewMedals((n) => n + ev.fresh.length);
    }
    // Ranking online: reenvia os melhores tempos do jogo (o servidor guarda só o melhor de cada nível).
    // O jogo bônus entra no ranking só depois de liberado pelas 4 jornadas (a mesma regra do app: bonusUnlocked;
    // o servidor confere de novo). No Modo Administrador nada vai para o servidor (offline).
    if (meRef.current && !offline() && (isMainGame(game) || bonusUnlocked(progress))) syncGame(meRef.current, game, t.times).catch(() => { /* tenta de novo ao abrir o ranking */ });
  }

  // ---- Mindloop Investigação ----
  const saveCases = (l: CaseLog) => { caseLogRef.current = l; setCaseLog(l); writeStore(CASES_KEY, JSON.stringify(l)); };
  /** Sai da investigação: segue para a próxima fase (convite da jornada) ou volta ao caderno. */
  function leaveCase(run: CaseRun | null = caseRun) {
    setCaseRun(null);
    if (run?.next) startGame(run.next.game, run.next.idx);
    else if (run?.fromMap) openJourney(journeyGame);
    else setView("casebook");
  }
  function skipCase() {
    if (!caseRun) return;
    saveCases(recordSkip(caseLogRef.current, caseRun.id, Date.now())); // pular nunca tira pontos nem bloqueia nada
    leaveCase();
  }
  /** Caderno de investigações: aberto pelo Perfil ou pelo ícone do mapa; o "Voltar" leva de volta para lá. */
  function openCasebook(game: RulesGame, from: "journey" | "profile" = "journey") { setBookGame(game); setBookChapter(null); setCaseRun(null); setBookFrom(from); setView("casebook"); }
  /** Cristal "Extra" do mapa: abre a investigação daquele nível (opcional; ao sair, volta para a jornada). */
  function openCaseFromMap(id: string) { setCaseRun({ id, mode: "play", fromMap: true }); setView("case"); }
  function openCaseFromBook(id: string) { setCaseRun({ id, mode: "play" }); setView("case"); }
  function caseDraft(id: string, d: Draft | null) { saveCases(saveDraft(caseLogRef.current, id, d)); }
  /** Mistério resolvido — ponto único de registro: progresso da investigação → XP → conquistas. */
  function solveCase(id: string, ms: number, hints: number): SolveResult {
    const c = caseById(id)!;
    const at = Date.now();
    const r = recordSolve(saveDraft(caseLogRef.current, id, null), c, ms, hints, at);
    saveCases(r.log);
    const ev = evaluate({ log: logRef.current, progress, cases: r.log }, unlocked, at);
    if (ev.fresh.length) {
      setUnlocked(ev.unlocked);
      writeStore(ACH_KEY, JSON.stringify(ev.unlocked));
      setNewMedals((n) => n + ev.fresh.length);
    }
    return { solve: r.solve, medals: ev.fresh, bestMs: r.log.records[id].bestMs ?? ms };
  }

  /** A animação no tabuleiro terminou: mostra a tela de parabéns (se a pessoa ainda está na partida). */
  function celebrated() {
    if (viewRef.current === "game") setShowComplete(true); // as medalhas novas aparecem na própria tela de parabéns
    else { setResult(null); setToasts((q) => [...q, ...winMedals]); setWinMedals([]); } // saiu antes: avisa fora da partida
  }
  /**
   * Com a tela de parabéns cobrindo tudo, troca o que está por baixo:
   * - "next" (tocou em Continuar): abre o próximo nível da jornada;
   * - "journey" (temporizador terminou) ou último nível: volta para a jornada, já no nível certo.
   */
  function leaveCelebration(to: LeaveTo) {
    if (!result) return;
    const { game, level, before } = result;
    if (to === "next" && level < LEVELS_PER_GAME) {
      // Investigação opcional entre as fases: só no "Continuar", só nas fases agendadas e só se o mistério
      // ainda não foi resolvido nem pulado (nada se repete sozinho).
      const go = afterContinue(game, level, (id) => shouldOffer(caseLogRef.current, id));
      if (go.case) { setCaseRun({ id: go.case.id, mode: "offer", next: { game, idx: go.nextIdx } }); setView("case"); return; }
      return startGame(game, go.nextIdx, true); // idx do próximo = level
    }
    if (to === "achievements") return openAchievements();
    if (to === "home") return goHome();
    if (to === "feedback") { setJourneyGame(game); setArrival(null); return openFeedback(null, "journey"); } // "Dar opinião" da comemoração
    if (askNow) declineOpinion(); // seguiu sem responder: conta como "Agora não"
    const firstTime = !isDone(before, level);
    setJourneyGame(game);
    setView("journey");
    setArrival({ game, justDone: level, justUnlocked: firstTime && level < LEVELS_PER_GAME ? level + 1 : undefined });
  }

  async function sendFeedback(e: React.FormEvent) {
    e.preventDefault();
    const erro = validateFeedback({ rating, comment });
    if (erro) { setFbError(erro); return; }
    setFbError(null); setFbStatus("sending");
    try {
      await submitFeedback({ rating, comment, honeypot: bot });
      setFbStatus("ok"); setRating(null); setComment("");
      setFbSent(true); writeStore(FB_SENT_KEY, "1");
    } catch {
      setFbStatus("error");
      setFbError("Não conseguimos enviar agora. Confira a internet e tente de novo — seu texto foi mantido.");
    }
  }

  /** Abre a tela de opinião (do Perfil ou do botão flutuante); a partida em andamento fica guardada e pausada. */
  function openFeedback(rate: number | null = null, from: Exclude<View, "feedback"> | null = null) {
    if (from) setFbFrom(from); else if (view !== "feedback") setFbFrom(view);
    setRating(rate); setComment(""); setFbStatus("idle"); setFbError(null); setBot("");
    setView("feedback");
  }

  // ---- Pedido de opinião (item 4): regra de frequência em lib/feedback.ts ----
  /** Mais uma partida completa (a guiada também conta): decide se esta comemoração pede opinião. */
  function countForOpinion() {
    const r = countWin(askRef.current, fbSent);
    askRef.current = r.state; writeStore(ASK_KEY, JSON.stringify(r.state));
    setAskNow(r.ask && !admin); // no Modo Administrador (testes) não pede
  }
  /** "Agora não" (ou seguiu sem responder): só volta a pedir depois de algumas partidas. */
  function declineOpinion() {
    askRef.current = decline(askRef.current); writeStore(ASK_KEY, JSON.stringify(askRef.current));
    setAskNow(false);
  }

  // ---- Partida guiada (item 3) ----
  function openGuided(g: NonNullable<typeof guided>) { setGuided(g); setGuidedRun((n) => n + 1); }
  /** "?" do jogo e da jornada, e a aba Regras: rever a partida guiada completa (não muda nada salvo). */
  function replayGuided(game: RulesGame) { openGuided({ game, part: "base", mode: "replay", from: view === "game" ? "game" : view === "demo" ? "demo" : "journey" }); }
  function markGuided(game: RulesGame, part: GuidedPart) {
    const s = new Set(guidedSeen[game]); s.add(part);
    setGuidedSeen((all) => ({ ...all, [game]: s }));
    writeStore(GUIDED_KEY(game), serializeGuided(s));
  }
  /** Fim da partida guiada: concluída ou pulada. */
  function endGuided(how: GuidedEnd) {
    const g = guided;
    setGuided(null);
    if (!g) return;
    if (g.mode !== "replay") markGuided(g.game, g.part);
    if (how === "skipped") {
      if (g.mode === "first") openJourney(g.game); // pular a partida guiada leva para a jornada
      return;
    }
    if (g.mode === "first") {
      // Conta como partida completa: comemoração (com o pedido de opinião) e, depois, o nível de verdade.
      countForOpinion();
      setGuidedWin({ game: g.game, idx: g.idx ?? 0 });
    }
  }
  /** Saída da comemoração da partida guiada. */
  function leaveGuidedWin(to: LeaveTo) {
    const w = guidedWin;
    if (!w) return;
    if (to === "feedback") { setJourneyGame(w.game); return openFeedback(null, "journey"); }
    if (askNow) declineOpinion();
    if (to === "next") return startGame(w.game, w.idx, true);
    if (to === "home") return goHome();
    openJourney(w.game);
  }

  const CARDS: { id: RulesGame; name: string; text: string; kind: GemKind; color: string }[] = ALL_GAMES.map((g) => ({ id: g, kind: g, ...GAME_META[g] }));
  // Jogo bônus: abre com as 4 jornadas principais completas, ou no Modo Administrador (testes).
  const bonusEarned = bonusUnlocked(progress);
  const bonusOpen = admin || bonusEarned;
  const homeAlt = "MindLoop — Desafie sua mente. Uma janela com o botão Jogar agora no céu, sobre ilhas flutuantes, cercada pelos cristais dos jogos Mini Sudoku, Zip, Tango e Patches. Embaixo, o logo da FAETERJ Barra Mansa.";
  const visible = visibleGames(bonusOpen);

  const inGame = !!session && view === "game";
  // O cronômetro só corre com a partida na tela e nada por cima (nem a partida guiada).
  const playing = inGame && !guided && !guidedWin && !nickModal && !showComplete;
  const activeSession = session;
  const sessionProps = (game: RulesGame, idx: number) => ({
    active: playing,
    onMenu: () => openJourney(game),
    onRules: () => replayGuided(game),
    onFeedback: () => openFeedback(),
    onWin: (ms: number) => winLevel(game, idx + 1, ms),
    onCelebrated: celebrated,
    onHint: () => { hintsRef.current += 1; },
  });
  const achCtx = { log, progress, cases: caseLog };
  const avStats = useMemo(() => avatarStats(progress, caseLog), [progress, caseLog]);
  const avatar = currentAvatar(avatarId, avStats);
  const avFresh = useMemo(() => new Set(newAvatars(avStats, avSeen).map((m) => m.id)), [avStats, avSeen]);
  function pickAvatar(id: string) { writeStore(AVATAR_KEY, id); setAvatarId(id); }
  function openAvatars() {
    setProfileTab("avatares"); setView("profile");
  }
  // Ao abrir a coleção, as novidades passam a "vistas" (o selo Novo continua até sair da aba).
  useEffect(() => {
    if (view !== "profile" || profileTab !== "avatares" || avFresh.size === 0) return;
    const all = new Set([...avSeen, ...avFresh]);
    writeStore(AVATARS_SEEN_KEY, JSON.stringify([...all]));
    return () => setAvSeen(all);
  }, [view, profileTab, avFresh, avSeen]);
  const runCase = caseRun ? caseById(caseRun.id) : undefined;
  // O roteiro da partida guiada aberta (montado uma vez por abertura).
  const guidedScriptMemo = useMemo(() => (guided ? guidedScript(guided.game, guided.part) : null), [guided]);
  function openAchievements() { setToasts([]); setView("achievements"); }

  return (
    <>
      {view !== "home" && (
        <header className={`top${view === "game" || view === "case" || view === "demo" ? " in-game" : ""}`}>
          <span className="brand"><img src="/cube.png" alt="" width={36} height={34} /><span className="wordmark">MindLoop</span></span>
          <span className="top-actions">
            {admin ? <span className="chip admin-chip" aria-label="Modo Administrador ligado: jogador de teste, fora do ranking">🔧 Admin</span>
              : nick && <button type="button" className="chip chip-avatar" onClick={openAvatars} aria-label={`Apelido: ${nick}. Avatar: ${avatar.name}${avFresh.size ? `. ${avFresh.size} novo(s) avatar(es) liberado(s)` : ""}`}><AvatarPic m={avatar} size={26} />{nick}{avFresh.size > 0 && <i className="dot" aria-hidden="true" />}</button>}
            {view !== "game" && view !== "feedback" && (
              <FeedbackButton compact calm={fbSent} onClick={() => openFeedback()} />
            )}
          </span>
        </header>
      )}

      <main id="main" className={view === "home" ? "home-main" : view === "game" || view === "case" || view === "demo" ? "page in-game" : "page"}>
        {!ready ? (
          <div className="wrap"><p role="status">Carregando…</p></div>
        ) : view === "home" ? (
          <>
            <section className="home" aria-label="Início">
              <FeedbackButton compact className="home-fb" calm={fbSent} onClick={() => openFeedback()} />
              {/* Duas artes: retrato (celular e telas estreitas) e paisagem (computador); o CSS mostra só uma.
                  O "Jogar agora" leva à lista de jogos, onde também fica o Astros (jogo extra). */}
              {/* Celular: arte em retrato com tudo desenhado nela (nomes, frase, botão). */}
              <div className="art art-m">
                <img src="/home-art.webp" width={944} height={1680} decoding="async" fetchPriority="high" loading="lazy" alt={homeAlt} />
                <HomeFx layout={FX_MOBILE} />
                {ART_SPOTS.map((s) => (
                  <button key={s.id} className="gspot" onClick={() => openGame(s.id)}
                    style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, height: `${s.height}%` }}
                    aria-label={`Jogar ${GAME_META[s.id].name}`} />
                ))}
                <button className="hotspot" onClick={goToGames} aria-label="Jogar agora: ver os jogos">
                  <span aria-hidden="true">Jogar agora</span>
                </button>
              </div>
              {/* Computador: arte em paisagem, também com tudo desenhado nela. */}
              <div className="art art-d">
                <img src="/home-art-desktop.webp" width={2196} height={1236} decoding="async" fetchPriority="high" loading="lazy" alt={homeAlt} />
                <HomeFx layout={FX_DESKTOP} />
                {DESK_SPOTS.map((s) => (
                  <button key={s.id} className="gspot" onClick={() => openGame(s.id)}
                    style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, height: `${s.height}%` }}
                    aria-label={`Jogar ${GAME_META[s.id].name}`} />
                ))}
                <button className="hotspot desk" onClick={goToGames} aria-label="Jogar agora: ver os jogos">
                  <span aria-hidden="true">Jogar agora</span>
                </button>
              </div>
            </section>

            <section id="jogos" className="screen games-home" aria-labelledby="jogos-title">
              <h1 id="jogos-title">Escolha sua aventura</h1>
              <p className="lead">{nick ? `Bora, ${nick}! ` : ""}Quatro jornadas de enigmas e um jogo bônus esperando por você.</p>
              <div className="ggrid">
                {CARDS.map((g) => {
                  const p = progress[g.id];
                  const count = doneCount(p);
                  const full = isComplete(p);
                  return (
                    // O card inteiro é clicável (mouse/toque); o botão é o alvo do teclado e leitores de tela.
                    <article key={g.id} className="gcard" style={{ "--gc": g.color } as React.CSSProperties} onClick={() => openGame(g.id)}>
                      <Gem kind={g.kind} size={88} />
                      <span className={`badge${full ? " full" : ""}`}>{full ? "★ Jornada completa" : "Disponível"}</span>
                      <h2 className="gname">{g.name}</h2>
                      <p className="gtext">{g.text}</p>
                      <div className="gprog" aria-hidden="true"><i style={{ width: `${count}%` }} /></div>
                      <span className="gcount">{count}/{LEVELS_PER_GAME} níveis</span>
                      <button className="btn cta gplay" onClick={(e) => { e.stopPropagation(); openGame(g.id); }}
                        aria-label={`Jogar ${g.name} agora — ${count} de ${LEVELS_PER_GAME} níveis concluídos`}>
                        Jogar agora
                      </button>
                    </article>
                  );
                })}
                {(() => {
                  // Jogo bônus: card próprio. Bloqueado, mostra quanto falta em cada jornada principal.
                  const meta = GAME_META[BONUS_GAME];
                  const count = doneCount(progress[BONUS_GAME]);
                  const full = isComplete(progress[BONUS_GAME]);
                  if (!bonusOpen) {
                    return (
                      <article id="bonus-card" className="gcard bonus locked" style={{ "--gc": meta.color } as React.CSSProperties} aria-labelledby="bonus-name" onClick={openDemo}>
                        <span className="gem-wrap"><Gem kind={BONUS_GAME} size={88} /><span className="gem-lock" aria-hidden="true">🔒</span></span>
                        <span className="badge bonus">Jogo bônus · bloqueado</span>
                        <h2 className="gname" id="bonus-name">{meta.name}</h2>
                        <p className="gtext">Complete as 4 jornadas principais para liberar este jogo.</p>
                        <ul className="bonus-req" aria-label="Jornadas que faltam">
                          {ALL_GAMES.map((g) => {
                            const n = doneCount(progress[g]);
                            return <li key={g} className={n === LEVELS_PER_GAME ? "ok" : ""}><span>{GAME_META[g].name}</span><b>{n === LEVELS_PER_GAME ? "✓ completa" : `${n}/${LEVELS_PER_GAME}`}</b></li>;
                          })}
                        </ul>
                        <button className="btn sec gplay ademo-cta" onClick={(e) => { e.stopPropagation(); openDemo(); }}
                          aria-label={`${meta.name}: experimentar a prévia (o jogo completo libera com as 4 jornadas)`}>▶ Experimentar a prévia</button>
                      </article>
                    );
                  }
                  return (
                    <article id="bonus-card" className="gcard bonus" style={{ "--gc": meta.color } as React.CSSProperties} onClick={() => openGame(BONUS_GAME)}>
                      <Gem kind={BONUS_GAME} size={88} />
                      <span className={`badge bonus${full ? " full" : ""}`}>{full ? "★ Jornada completa" : bonusEarned ? "★ Jogo bônus" : "Bônus · modo administrador"}</span>
                      <h2 className="gname">{meta.name}</h2>
                      <p className="gtext">{meta.text}</p>
                      <div className="gprog" aria-hidden="true"><i style={{ width: `${count}%` }} /></div>
                      <span className="gcount">{count}/{LEVELS_PER_GAME} níveis</span>
                      <button className="btn cta gplay" onClick={(e) => { e.stopPropagation(); openGame(BONUS_GAME); }}
                        aria-label={`Jogar ${meta.name} (jogo bônus) agora — ${count} de ${LEVELS_PER_GAME} níveis concluídos`}>
                        Jogar agora
                      </button>
                    </article>
                  );
                })()}
              </div>
            </section>
          </>
        ) : view === "journey" ? (
          <Journey key={journeyGame} game={journeyGame} done={progress[journeyGame]} admin={admin}
            focus={focusLevel(progress[journeyGame], lastPlayed[journeyGame])}
            justDone={arrival?.game === journeyGame ? arrival.justDone : undefined}
            justUnlocked={arrival?.game === journeyGame ? arrival.justUnlocked : undefined}
            onBack={() => goHome(true)} onHelp={() => replayGuided(journeyGame)} onFeedback={() => openFeedback()} onPlay={(n) => startGame(journeyGame, n - 1)}
            cases={{ solved: solvedCount(caseLog, journeyGame), total: casesOf(journeyGame).length }} onCases={() => openCasebook(journeyGame)}
            caseAt={Object.fromEntries(casesOf(journeyGame).map((c) => [c.level, { id: c.id, solved: isSolved(caseLog, c.id) }]))} onCase={openCaseFromMap} />
        ) : view === "case" && caseRun && runCase ? (
          caseRun.mode === "offer" ? (
            <CaseOffer key={runCase.id} c={runCase} nextLevel={(caseRun.next?.idx ?? 0) + 1}
              onInvestigate={() => setCaseRun({ ...caseRun, mode: "play" })} onSkip={skipCase} />
          ) : (
            <CaseScreen key={runCase.id} c={runCase} record={recordOf(caseLog, runCase.id)}
              active={view === "case" && !guided && !nickModal && !showComplete}
              continueLabel={caseRun.next ? `Continuar para o nível ${caseRun.next.idx + 1}` : caseRun.fromMap ? "Voltar à jornada" : "Voltar às investigações"}
              onContinue={() => leaveCase()}
              exitLabel={caseRun.next || caseRun.fromMap ? "Ir para a jornada" : "Voltar às investigações"}
              onExit={() => { const run = caseRun; setCaseRun(null); if (run.next) openJourney(run.next.game); else if (run.fromMap) openJourney(journeyGame); else setView("casebook"); }}
              onDraft={(d) => caseDraft(runCase.id, d)} onSolve={(ms, h) => solveCase(runCase.id, ms, h)} />
          )
        ) : view === "casebook" ? (
          <CaseBook game={bookGame} log={caseLog} progress={progress} admin={admin} games={visible} onGame={(g) => { setBookGame(g); setBookChapter(null); }} chapter={bookChapter} onChapter={setBookChapter} onOpen={openCaseFromBook} onBack={() => (bookFrom === "profile" ? setView("profile") : openJourney(bookGame))} />
        ) : view === "rules" ? (
          <div className="wrap">
            <h1>Regras</h1>
            <div className="seg" role="group" aria-label="Escolher jogo">
              {visible.map((g) => (
                <button key={g} className={rulesTab === g ? "on" : ""} aria-pressed={rulesTab === g} onClick={() => setRulesTab(g)}>
                  <Gem kind={g} size={28} />{GAME_META[g].name}
                </button>
              ))}
            </div>
            <div className="tut-cta">
              <Gem kind={rulesTab} size={44} />
              <div><b>Partida guiada do {GAME_META[rulesTab].name}</b><span>Jogue uma partida curtinha com o personagem do jogo, que explica cada regra na hora.</span></div>
              <button type="button" className="btn cta" onClick={() => replayGuided(rulesTab)}>Rever partida guiada</button>
            </div>
            <h2>Como jogar o {GAME_META[rulesTab].name}</h2>
            <RulesContent game={rulesTab} />
          </div>
        ) : view === "profile" ? (
          <div className="wrap">
            <div className="page-head profile-head">
              <button type="button" className="profile-avatar" onClick={() => setProfileTab("avatares")} aria-label={`Avatar: ${avatar.name}. Trocar avatar`}><AvatarPic m={avatar} size={72} /><span aria-hidden="true">✎</span></button>
              <h1>{nick || "Perfil"}</h1>
              {nick && <span className="muted small">{EVERY_GAME.reduce((a, g) => a + doneCount(progress[g]), 0)} fases · {Object.keys(unlocked).length} medalhas</span>}
            </div>
            <div className="tabs" role="tablist" aria-label="Seções do perfil">
              {([["desempenho", "Desempenho"], ["avatares", "Avatares"], ["ajustes", "Ajustes"], ["sobre", SOBRE.aba]] as const).map(([id, label]) => (
                <button key={id} role="tab" id={`tab-${id}`} aria-selected={profileTab === id} aria-controls={`panel-${id}`} className={profileTab === id ? "on" : ""} onClick={() => setProfileTab(id)}>
                  {label}{id === "avatares" && avFresh.size > 0 && <i className="dot" aria-label="(novos avatares)" />}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`panel-${profileTab}`} aria-labelledby={`tab-${profileTab}`} className="stack">
              {profileTab === "desempenho" ? (
                <>
                  <CaseSummary log={caseLog} onOpen={() => openCasebook(journeyGame, "profile")} />
                  <Stats log={log} progress={progress} games={visible} />
                </>
              ) : profileTab === "avatares" ? (
                <AvatarsPanel stats={avStats} current={avatar.id} fresh={avFresh} onPick={pickAvatar} />
              ) : profileTab === "sobre" ? (
                <Sobre />
              ) : (
                <Settings nick={nick} me={me} online={!!rankingConfig()} issue={cloudIssue} localProgress={hasProgress(readSnapshot(readStore))}
                  onRename={() => openNick(() => {})} onRecoverCode={recoverWith}
                  onNewCode={async () => {
                    const m = meRef.current; if (!m) return null;
                    try { const code = await issueRecovery(m); saveMe({ ...m, recovery: code }); return null; }
                    catch (e) { return e instanceof RankError ? e.message : "Não foi possível gerar agora."; }
                  }}
                  onRecover={() => setNickModal({ then: () => {} })} onRetry={() => connect()} onReset={resetAll} onFeedback={() => openFeedback()}
                  admin={admin} onAdmin={changeAdmin} />
              )}
            </div>
          </div>
        ) : view === "ranking" && admin ? (
          <div className="wrap stack">
            <h1>Ranking</h1>
            <div className="note warn" role="note"><b aria-hidden="true">🔧</b>
              <span><b>Modo Administrador ligado.</b> O jogador de teste não participa do ranking e não soma pontos. Sua conta está pausada e volta com tudo (pontos, posição e progresso) quando você desligar o modo em Perfil → Ajustes.</span></div>
            <button className="btn sec" onClick={() => { setProfileTab("ajustes"); setView("profile"); }}>Ir para os Ajustes</button>
          </div>
        ) : view === "ranking" ? (
          <Ranking times={times} me={me} games={bonusEarned ? EVERY_GAME : ALL_GAMES}
            onListed={async (l) => { const m = meRef.current; if (!m) return; await setListed(m, l); saveMe({ ...m, listed: l }); }}
            onFixIdentity={() => { setProfileTab("ajustes"); setView("profile"); }}
            onAuthLost={() => { saveMe(null); setCloudIssue("offline"); }} />
        ) : view === "achievements" ? (
          <Achievements ctx={achCtx} unlocked={unlocked} />
        ) : view === "feedback" ? (
          <form className="wrap" onSubmit={sendFeedback} noValidate>
            <h1>Sua opinião</h1>
            {fbStatus === "ok" ? (
              <>
                <div className="note ok" role="status"><b aria-hidden="true">✓</b><span>Obrigado! Sua opinião foi enviada e vai ajudar a melhorar o MindLoop.</span></div>
                <div className="row">
                  <button type="button" className="btn cta" onClick={() => setFbStatus("idle")}>Enviar outra opinião</button>
                  <button type="button" className="btn sec" onClick={() => setView(fbFrom)}>{BACK_LABEL[fbFrom]}</button>
                </div>
              </>
            ) : (
              <>
                <div className="note info" role="note"><b aria-hidden="true">ℹ</b>
                  <span>Sua opinião é anônima: não enviamos seu apelido nem pedimos contato. Não escreva dados pessoais (nome, telefone, endereço) no comentário.</span></div>
                <fieldset className="rating-box">
                  <legend>Como foi sua experiência? (opcional)</legend>
                  <div className="rating" role="radiogroup" aria-label="Nota de 1 a 5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n}><input type="radio" name="rating" value={n} checked={rating === n} onChange={() => { setRating(n); setFbError(null); }} /><span aria-label={`Nota ${n}`}>{n}</span></label>
                    ))}
                  </div>
                  <p className="muted">1 = não gostei · 5 = gostei muito</p>
                </fieldset>
                <div>
                  <label htmlFor="cm">Comentário (opcional)</label>
                  <textarea id="cm" rows={4} maxLength={COMMENT_MAX} value={comment} onChange={(e) => { setComment(e.target.value); setFbError(null); }} />
                  <p className="muted" aria-live="off">{comment.length}/{COMMENT_MAX}</p>
                </div>
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                  <label>Não preencha este campo<input tabIndex={-1} autoComplete="off" name="bot-field" value={bot} onChange={(e) => setBot(e.target.value)} /></label>
                </div>
                {fbError && <div className="note warn" role="alert"><b aria-hidden="true">!</b><span>{fbError}</span></div>}
                <div className="row">
                  <button className="btn cta" type="submit" disabled={fbStatus === "sending"}>{fbStatus === "sending" ? "Enviando…" : "Enviar opinião"}</button>
                  <button type="button" className="btn sec" onClick={() => setView(fbFrom)}>{BACK_LABEL[fbFrom]}</button>
                </div>
              </>
            )}
          </form>
        ) : null}

        {/* Partidas ficam montadas enquanto a pessoa navega, para não perder o progresso. */}
        {activeSession?.game === "sudoku" && (() => {
          const pz = PUZZLES[activeSession.idx];
          const resume = save && save.id === pz.id && save.grid.length === pz.rows.length ? save : null;
          return (
            <div hidden={!inGame}>
              <Game key={`s-${activeSession.idx}-${activeSession.round}`} puzzle={pz}
                initialGrid={resume ? resume.grid : puzzleGrid(pz)} initialMs={resume?.ms ?? 0}
                onSave={(g, ms) => persist(g ? { id: pz.id, grid: g, ms } : null)}
                {...sessionProps("sudoku", activeSession.idx)} />
            </div>
          );
        })()}
        {activeSession?.game === "zip" && (
          <div hidden={!inGame}>
            <ZipGame key={`z-${activeSession.idx}-${activeSession.round}`} puzzle={ZIP_PUZZLES[activeSession.idx]} {...sessionProps("zip", activeSession.idx)} />
          </div>
        )}
        {activeSession?.game === "tango" && (
          <div hidden={!inGame}>
            <TangoGame key={`t-${activeSession.idx}-${activeSession.round}`} puzzle={TANGO_PUZZLES[activeSession.idx]} {...sessionProps("tango", activeSession.idx)} />
          </div>
        )}
        {activeSession?.game === "astros" && (
          <div hidden={!inGame}>
            <AstrosGame key={`a-${activeSession.idx}-${activeSession.round}`} puzzle={ASTROS_PUZZLES[activeSession.idx]} {...sessionProps("astros", activeSession.idx)} />
          </div>
        )}
        {activeSession?.game === "patches" && (
          <div hidden={!inGame}>
            <PatchesGame key={`p-${activeSession.idx}-${activeSession.round}`} puzzle={PATCHES_PUZZLES[activeSession.idx]} {...sessionProps("patches", activeSession.idx)} />
          </div>
        )}
        {demo && (<div hidden={view !== "demo"}>
          <AstrosDemo stage={demo} round={demoRound} progress={progress} active={view === "demo" && !guided && !nickModal}
            onStage={(st) => { if (st === "play") setDemoRound((r) => r + 1); setDemo(st); }}
            onClose={closeDemo} onFeedback={() => openFeedback()}
            onRules={() => replayGuided(BONUS_GAME)} />
        </div>)}
      </main>

      {result && showComplete && (
        <LevelComplete key={`${result.game}-${result.level}-${result.ms}`} result={result} medals={winMedals} hasNext={result.level < LEVELS_PER_GAME}
          askOpinion={askNow} onDecline={declineOpinion}
          onSwitch={leaveCelebration} onClose={() => { setShowComplete(false); setResult(null); setWinMedals([]); }} />
      )}

      {/* Medalhas novas fora da tela de parabéns: uma de cada vez e nunca por cima da partida ou de tutoriais. */}
      {ready && toasts.length > 0 && view !== "game" && view !== "case" && view !== "demo" && !showComplete && !guided && !guidedWin && !nickModal && (
        <AchievementToast key={toasts[0].id} a={toasts[0]} left={toasts.length - 1}
          onDone={() => setToasts((q) => q.slice(1))} onOpen={openAchievements} />
      )}

      {guided && (
        <GuidedPlay key={`${guided.game}-${guided.part}-${guidedRun}`} game={guided.game} script={guidedScriptMemo!}
          title={guidedTitle(guided.part)} finish={guided.mode === "first" ? "Continuar" : guided.mode === "short" ? "Jogar" : "Concluir"} onEnd={endGuided} />
      )}
      {guidedWin && (
        <LevelComplete key={`guided-${guidedWin.game}-${guidedRun}`} hasNext medals={[]} guided={{ label: `Jogar o nível ${guidedWin.idx + 1}` }}
          result={{ game: guidedWin.game, level: guidedWin.idx + 1, ms: 0, best: 0, previous: null, isRecord: false, before: progress[guidedWin.game], after: progress[guidedWin.game] }}
          askOpinion={askNow} onDecline={declineOpinion} onSwitch={leaveGuidedWin} onClose={() => setGuidedWin(null)} />
      )}

      {nickModal && (
        <NickModal initial={nick} renaming={!!nick} online={!!rankingConfig()} localProgress={hasProgress(readSnapshot(readStore))}
          onSave={saveNick} onRecover={recoverWith} onClose={() => setNickModal(null)} />
      )}

      <BottomNav active={TAB_OF[view]} onChange={(t) => {
          // Tocar no menu com algo por cima: fecha (a partida guiada conta como vista; a vitória já está salva).
          if (guided) { if (guided.mode !== "replay") markGuided(guided.game, guided.part); setGuided(null); }
          if (showComplete || guidedWin) { if (askNow) declineOpinion(); setShowComplete(false); setResult(null); setWinMedals([]); setGuidedWin(null); }
          if (t === "achievements") openAchievements(); else onTab(t);
        }} inGame={view === "game" || view === "case" || view === "demo"}
        badges={{ achievements: newMedals }} />
    </>
  );
}

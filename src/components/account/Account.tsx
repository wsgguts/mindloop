"use client";
import { useState } from "react";
import Modal from "../Modal";
import SoundControls from "../SoundControls";
import { type Identity, normalizeCode } from "../../lib/cloud";
import { validateNick } from "../../lib/nick";
import { checkAdminPassword } from "../../lib/admin";

// Conta anônima do MindLoop: apelido, código de recuperação e reinício. Sem e-mail, senha ou cadastro.

/** Resultado de uma ação no servidor: null = deu certo; texto = erro para mostrar. */
export type Outcome = Promise<string | null>;

// ---------------------------------------------------------------- apelido / recuperar

interface NickProps {
  initial: string;
  /** Já tem apelido (troca) ou é a primeira vez. */
  renaming: boolean;
  /** O aparelho tem progresso que seria substituído ao recuperar outra conta. */
  localProgress: boolean;
  online: boolean;
  onSave: (nick: string) => Outcome;
  onRecover: (code: string) => Outcome;
  onClose: () => void;
}

export function NickModal({ initial, renaming, localProgress, online, onSave, onRecover, onClose }: NickProps) {
  const [mode, setMode] = useState<"nick" | "recover">("nick");
  const [draft, setDraft] = useState(initial);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const err = validateNick(draft);
    if (err) return setError(err);
    setBusy(true); setError(null);
    const r = await onSave(draft.trim());
    setBusy(false);
    if (r) setError(r);
  }

  async function recover(e: React.FormEvent) {
    e.preventDefault();
    const c = normalizeCode(code);
    if (!c) return setError("O código tem 16 letras e números (ex.: ABCD-EFGH-JKMN-PQRS).");
    if (localProgress && !confirmReplace) return setConfirmReplace(true);
    setBusy(true); setError(null);
    const r = await onRecover(c);
    setBusy(false);
    if (r) { setError(r); setConfirmReplace(false); }
  }

  return (
    <Modal title={mode === "nick" ? (renaming ? "Alterar apelido" : "Como podemos te chamar?") : "Recuperar meu progresso"} onClose={onClose}>
      {mode === "nick" ? (
        <form className="stack" onSubmit={save} noValidate>
          <div>
            <label htmlFor="nick">Apelido</label>
            <input id="nick" value={draft} maxLength={20} autoComplete="off" autoFocus placeholder="Ex.: Lia"
              aria-invalid={!!error} aria-describedby="nick-help"
              onChange={(e) => { setDraft(e.target.value); setError(null); }} />
            <p id="nick-help" className="muted small">Não use seu nome completo. Sem e-mail ou senha.</p>
            {error && <p className="err" role="alert"><b aria-hidden="true">! </b>{error}</p>}
          </div>
          <button className="btn cta" type="submit" disabled={busy}>{busy ? "Salvando…" : renaming ? "Salvar" : "Começar"}</button>
          {!renaming && online && (
            <button type="button" className="linkish" onClick={() => { setMode("recover"); setError(null); }}>Já jogou antes? Recuperar conta</button>
          )}
        </form>
      ) : (
        <form className="stack" onSubmit={recover} noValidate>
          <div>
            <label htmlFor="rcode">Código de recuperação</label>
            <input id="rcode" className="code-input" value={code} maxLength={24} autoComplete="off" autoCapitalize="characters" spellCheck={false} autoFocus
              placeholder="ABCD-EFGH-JKMN-PQRS" aria-invalid={!!error} onChange={(e) => { setCode(e.target.value); setError(null); setConfirmReplace(false); }} />
            {error && <p className="err" role="alert"><b aria-hidden="true">! </b>{error}</p>}
          </div>
          {confirmReplace && (
            <div className="note warn" role="alert"><b aria-hidden="true">!</b>
              <span>O progresso atual deste aparelho será <b>substituído</b> pelo da conta recuperada (eles não se misturam).</span></div>
          )}
          <button className="btn cta" type="submit" disabled={busy}>{busy ? "Recuperando…" : confirmReplace ? "Substituir e recuperar" : "Recuperar"}</button>
          <button type="button" className="linkish" onClick={() => { setMode("nick"); setError(null); }}>‹ Voltar</button>
        </form>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------- Ajustes

interface SettingsProps {
  nick: string;
  me: Identity | null;
  online: boolean;
  /** O servidor já tem esse apelido registrado por outra conta (ou não deu para conectar ainda). */
  issue: null | "taken" | "offline";
  /** O aparelho tem progresso que seria substituído ao recuperar outra conta. */
  localProgress: boolean;
  onRename: () => void;
  onNewCode: () => Outcome;
  /** Recupera a conta com um código digitado aqui mesmo (seção "Jogar em outro dispositivo"). */
  onRecoverCode: (code: string) => Outcome;
  onRecover: () => void;
  onRetry: () => void;
  onReset: () => Outcome;
  onFeedback: () => void;
  /** Modo Administrador (testes): tudo liberado neste aparelho. */
  admin: boolean;
  onAdmin: (on: boolean) => void;
}

export const RESET_WORD = "REINICIAR";

export function Settings({ nick, me, online, issue, localProgress, onRename, onNewCode, onRecoverCode, onRecover, onRetry, onReset, onFeedback, admin, onAdmin }: SettingsProps) {
  const [resetOpen, setResetOpen] = useState(false);
  // Modo Administrador: a conta real está pausada; apelido, nuvem e reinício ficam fora de alcance até desligar.
  if (admin) {
    return (
      <div className="settings stack">
        <AdminSection admin={admin} onAdmin={onAdmin} />
        <section className="card stack" aria-labelledby="snd-title">
          <h2 id="snd-title">Sons</h2>
          <SoundControls />
        </section>
      </div>
    );
  }
  return (
    <div className="settings stack">
      <section className="card set-row">
        <div><span className="muted small">Apelido</span><b>{nick || "—"}</b></div>
        <button className="btn sec sm" onClick={onRename}>{nick ? "Alterar" : "Escolher"}</button>
      </section>

      {online && (me ? (
        <OtherDevice code={me.recovery ?? null} localProgress={localProgress} onNewCode={onNewCode} onRecoverCode={onRecoverCode} />
      ) : (
        <section className="card stack" aria-labelledby="acc-t">
          <h2 id="acc-t">Jogar em outro dispositivo</h2>
          {issue === "taken" ? (
            <div className="note warn" role="note"><b aria-hidden="true">!</b>
              <span>O apelido <b>{nick}</b> já está registrado por outra conta. Se é você, use seu código; se não, escolha outro apelido.
                <span className="row" style={{ marginTop: 8 }}>
                  <button className="btn cta sm" onClick={onRecover}>Usar código</button>
                  <button className="btn sec sm" onClick={onRename}>Trocar apelido</button>
                </span></span></div>
          ) : (
            <div className="note info" role="note"><b aria-hidden="true">ℹ</b>
              <span>{nick ? "Sem conexão com o servidor agora: seu progresso continua salvo neste aparelho." : "Escolha um apelido para salvar seu progresso."}
                {nick && <button className="linkish" onClick={onRetry}> Tentar de novo</button>}</span></div>
          )}
          <button className="linkish" onClick={onRecover}>Já tenho um código</button>
        </section>
      ))}

      <section className="card stack" aria-labelledby="snd-title">
        <h2 id="snd-title">Sons</h2>
        <SoundControls />
      </section>

      <section className="card set-row">
        <div><b>Sua opinião</b><span className="muted small">Anônima. Ajuda a melhorar o MindLoop.</span></div>
        <button className="btn sec sm" onClick={onFeedback}>Enviar</button>
      </section>

      <AdminSection admin={admin} onAdmin={onAdmin} />

      <section className="card stack danger-zone" aria-labelledby="rst-t">
        <h2 id="rst-t">Reiniciar jogo</h2>
        <p className="muted small">Apaga todo o seu progresso e começa do zero.</p>
        <button className="btn danger" onClick={() => setResetOpen(true)}>Reiniciar jogo…</button>
      </section>

      {resetOpen && <ResetModal online={online} hasCloud={!!me} onReset={onReset} onClose={() => setResetOpen(false)} />}
    </div>
  );
}

/**
 * "Jogar em outro dispositivo" (Perfil → Ajustes). O código de recuperação NÃO aparece mais logo depois de criar o
 * apelido (isso confundia quem estava começando): ele é gerado e salvo do mesmo jeito, e fica aqui para quando
 * a pessoa quiser continuar em outro aparelho.
 *  • Ver meu código: mostra o código, com botão de copiar.
 *  • Já tenho um código: recupera a conta neste aparelho.
 */
function OtherDevice({ code, localProgress, onNewCode, onRecoverCode }: { code: string | null; localProgress: boolean; onNewCode: () => Outcome; onRecoverCode: (code: string) => Outcome }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [typed, setTyped] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(code ?? ""); setCopied(true); } catch { setCopied(false); } }
  async function recover(e: React.FormEvent) {
    e.preventDefault();
    const c = normalizeCode(typed);
    if (!c) return setMsg("O código tem 16 letras e números (ex.: ABCD-EFGH-JKMN-PQRS).");
    if (localProgress && !confirm) return setConfirm(true); // o progresso daqui seria substituído: pergunta antes
    setBusy(true); setMsg(null);
    const r = await onRecoverCode(c);
    setBusy(false);
    if (r) { setMsg(r); setConfirm(false); }
  }
  return (
    <section className="card stack" aria-labelledby="other-t">
      <h2 id="other-t">Jogar em outro dispositivo</h2>
      <div className="stack">
        <b>Ver meu código</b>
        <p className="muted small">Use este código para continuar seu progresso em outro celular ou computador. Não compartilhe com ninguém.</p>
        {!code ? (
          <button className="btn sec sm" onClick={async () => setMsg(await onNewCode())}>Gerar meu código</button>
        ) : show ? (
          <>
            <div className="code-box" aria-label={`Código: ${code.split("").join(" ")}`}><code>{code}</code></div>
            <button className="btn cta sm" onClick={copy}>{copied ? "✓ Copiado" : "Copiar código"}</button>
          </>
        ) : (
          <button className="btn cta sm" onClick={() => setShow(true)}>Ver meu código</button>
        )}
      </div>
      <form className="stack" onSubmit={recover} noValidate>
        <label htmlFor="other-code"><b>Já tenho um código</b></label>
        <input id="other-code" className="code-input" value={typed} maxLength={24} autoComplete="off" autoCapitalize="characters" spellCheck={false}
          placeholder="ABCD-EFGH-JKMN-PQRS" onChange={(e) => { setTyped(e.target.value); setMsg(null); setConfirm(false); }} />
        {confirm && (
          <div className="note warn" role="alert"><b aria-hidden="true">!</b>
            <span>O progresso deste aparelho será <b>substituído</b> pelo da conta do código (eles não se misturam).</span></div>
        )}
        <button className="btn sec sm" type="submit" disabled={busy || !typed.trim()}>{busy ? "Recuperando…" : confirm ? "Substituir e recuperar" : "Recuperar conta"}</button>
      </form>
      {msg && <p className="err" role="alert"><b aria-hidden="true">! </b>{msg}</p>}
    </section>
  );
}

/** Modo Administrador: libera todos os níveis, capítulos e investigações para a equipe testar. */
function AdminSection({ admin, onAdmin }: { admin: boolean; onAdmin: (on: boolean) => void }) {
  const [asking, setAsking] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  function enter(e: React.FormEvent) {
    e.preventDefault();
    if (!checkAdminPassword(typed)) { setError(true); return; }
    setBusy(true); onAdmin(true); // o app recarrega já no modo de testes
  }
  return (
    <section className="card stack" aria-labelledby="adm-t">
      <h2 id="adm-t">Modo Administrador</h2>
      {admin ? (
        <>
          <div className="set-row attention">
            <div><b>🔧 Ligado</b><span className="muted small">Jogador de teste com tudo liberado: todos os níveis, investigações e o jogo bônus.</span></div>
            <button className="btn cta sm" disabled={busy} onClick={() => { setBusy(true); onAdmin(false); }}>{busy ? "Saindo…" : "Desligar"}</button>
          </div>
          <ul className="list small">
            <li>Sua conta está <b>pausada</b>: progresso, medalhas e pontos ficam guardados, sem mudança.</li>
            <li>O teste <b>não participa do ranking</b>, não soma pontos e não é enviado ao servidor.</li>
            <li>Ao desligar, tudo o que foi feito no teste é descartado e você volta para a sua conta, de onde parou.</li>
          </ul>
        </>
      ) : asking ? (
        <form className="stack" onSubmit={enter} noValidate>
          <p className="muted small">Sua conta fica pausada enquanto o modo estiver ligado e volta igualzinha quando você desligar.</p>
          <div>
            <label htmlFor="adm-pw">Senha</label>
            <input id="adm-pw" type="password" value={typed} autoComplete="off" autoFocus onChange={(e) => { setTyped(e.target.value); setError(false); }} />
          </div>
          {error && <p className="err" role="alert"><b aria-hidden="true">! </b>Senha incorreta.</p>}
          <div className="row">
            <button className="btn cta sm" type="submit" disabled={!typed.trim() || busy}>{busy ? "Entrando…" : "Entrar"}</button>
            <button className="btn sec sm" type="button" onClick={() => { setAsking(false); setTyped(""); setError(false); }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="set-row">
          <div><span className="muted small">Para a equipe: um jogador de teste com tudo liberado, fora do ranking.</span></div>
          <button className="btn sec sm" onClick={() => setAsking(true)}>Ativar</button>
        </div>
      )}
    </section>
  );
}

function ResetModal({ online, hasCloud, onReset, onClose }: { online: boolean; hasCloud: boolean; onReset: () => Outcome; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ok = typed.trim().toUpperCase() === RESET_WORD;
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!ok) return;
    setBusy(true); setError(null);
    const r = await onReset();
    setBusy(false);
    if (r) setError(r);
  }
  return (
    <Modal title="Reiniciar jogo?" onClose={onClose} closeLabel="Cancelar">
      <form className="stack" onSubmit={go} noValidate>
        <p>Isto apaga <b>definitivamente</b>:</p>
        <ul className="list small">
          <li>apelido, fases e jornadas dos 4 jogos;</li>
          <li>investigações, conquistas, estatísticas e histórico;</li>
          <li>{hasCloud ? "seus pontos no ranking e o progresso salvo no servidor;" : "seus melhores tempos e pontos;"}</li>
          <li>preferências (sons).</li>
        </ul>
        {hasCloud && !online && <p className="err">Conecte-se à internet para reiniciar também o que está no servidor.</p>}
        <div>
          <label htmlFor="rst">Para confirmar, digite <b>{RESET_WORD}</b></label>
          <input id="rst" value={typed} autoComplete="off" autoCapitalize="characters" spellCheck={false} onChange={(e) => { setTyped(e.target.value); setError(null); }} />
        </div>
        {error && <p className="err" role="alert"><b aria-hidden="true">! </b>{error}</p>}
        <div className="row">
          <button className="btn danger" type="submit" disabled={!ok || busy}>{busy ? "Reiniciando…" : "Reiniciar tudo"}</button>
          <button className="btn sec" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}

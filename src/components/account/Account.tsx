"use client";
import { useState } from "react";
import Modal from "../Modal";
import SoundControls from "../SoundControls";
import { type Identity, normalizeCode } from "../../lib/cloud";
import { validateNick } from "../../lib/nick";

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
            <button type="button" className="linkish" onClick={() => { setMode("recover"); setError(null); }}>Já jogou antes? Recuperar com código</button>
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

// ---------------------------------------------------------------- código de recuperação

export function CodeModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); } catch { setCopied(false); }
  }
  return (
    <Modal title="Guarde seu código" onClose={onClose} closeLabel="Fechar">
      <div className="stack">
        <p>Com este código você recupera seu progresso em outro aparelho ou se os dados do navegador forem apagados.</p>
        <div className="code-box" aria-label={`Código: ${code.split("").join(" ")}`}><code>{code}</code></div>
        <div className="row">
          <button className="btn cta" onClick={copy}>{copied ? "✓ Copiado" : "Copiar código"}</button>
          <button className="btn sec" onClick={onClose}>Já guardei</button>
        </div>
        <p className="muted small">Guarde num lugar seguro (anote ou tire um print). Sem ele, não é possível recuperar o progresso. Não compartilhe.</p>
      </div>
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
  codeUnseen: boolean;
  onRename: () => void;
  onShowCode: () => void;
  onNewCode: () => Outcome;
  onRecover: () => void;
  onRetry: () => void;
  onReset: () => Outcome;
  onFeedback: () => void;
}

export const RESET_WORD = "REINICIAR";

export function Settings({ nick, me, online, issue, codeUnseen, onRename, onShowCode, onNewCode, onRecover, onRetry, onReset, onFeedback }: SettingsProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  return (
    <div className="settings stack">
      <section className="card set-row">
        <div><span className="muted small">Apelido</span><b>{nick || "—"}</b></div>
        <button className="btn sec sm" onClick={onRename}>{nick ? "Alterar" : "Escolher"}</button>
      </section>

      {online && (
        <section className="card stack" aria-labelledby="acc-t">
          <h2 id="acc-t">Progresso na nuvem</h2>
          {me ? (
            <>
              <p className="muted small">Seu progresso fica salvo com segurança no servidor, sem e-mail ou senha.</p>
              {me.recovery ? (
                <div className={`set-row${codeUnseen ? " attention" : ""}`}>
                  <div><b>Código de recuperação</b><span className="muted small">{codeUnseen ? "Guarde-o: é a única forma de recuperar seu progresso." : "Para recuperar seu progresso em outro aparelho."}</span></div>
                  <button className="btn cta sm" onClick={onShowCode}>Ver código</button>
                </div>
              ) : (
                <div className="set-row">
                  <div><b>Código de recuperação</b><span className="muted small">Gere um código para não perder seu progresso.</span></div>
                  <button className="btn cta sm" onClick={async () => setCodeMsg(await onNewCode())}>Gerar</button>
                </div>
              )}
              {codeMsg && <p className="err" role="alert">{codeMsg}</p>}
            </>
          ) : issue === "taken" ? (
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
          {!me && <button className="linkish" onClick={onRecover}>Recuperar progresso com um código</button>}
        </section>
      )}

      <section className="card stack" aria-labelledby="snd-title">
        <h2 id="snd-title">Sons</h2>
        <SoundControls />
      </section>

      <section className="card set-row">
        <div><b>Sua opinião</b><span className="muted small">Anônima. Ajuda a melhorar o MindLoop.</span></div>
        <button className="btn sec sm" onClick={onFeedback}>Enviar</button>
      </section>

      <section className="card stack danger-zone" aria-labelledby="rst-t">
        <h2 id="rst-t">Reiniciar jogo</h2>
        <p className="muted small">Apaga todo o seu progresso e começa do zero.</p>
        <button className="btn danger" onClick={() => setResetOpen(true)}>Reiniciar jogo…</button>
      </section>

      {resetOpen && <ResetModal online={online} hasCloud={!!me} onReset={onReset} onClose={() => setResetOpen(false)} />}
    </div>
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

// Ilustração de um personagem do elenco ou de um objeto, pelo nome; sem ilustração, mostra o emoji (num span
// .art-emo, para ganhar o mesmo visual de “cristal” dos objetos ilustrados).
// É decorativa (o nome sempre aparece em texto ao lado), então não tem texto alternativo.

import { artOf } from "../lib/cast";

export default function Art({ e, className = "" }: { e: { label: string; icon?: string }; className?: string }) {
  const src = artOf(e.label);
  if (!src) return e.icon ? <span className={`art-emo ${className}`}>{e.icon}</span> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`art ${src.startsWith("/cast/") ? "is-cast" : "is-item"} ${className}`} src={src} alt="" width={96} height={96} loading="lazy" decoding="async" draggable={false} />;
}

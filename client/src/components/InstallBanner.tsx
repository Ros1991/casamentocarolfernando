import { Share, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { isIos, isStandalone, promptInstall, usePwa } from '../lib/pwa';
import { toast } from '../lib/toast';

const DISMISS_KEY = 'galera:install-dismissed-at';
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

function recentlyDismissed(): boolean {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return t > 0 && Date.now() - t < DISMISS_MS;
  } catch {
    return false;
  }
}

/** Convite para instalar o site como app (Android: botão nativo; iPhone: passo a passo). */
export function InstallBanner() {
  const installEvent = usePwa((s) => s.installEvent);
  const installed = usePwa((s) => s.installed);
  const [dismissed, setDismissed] = useState(recentlyDismissed);
  const [busy, setBusy] = useState(false);

  if (installed || isStandalone() || dismissed) return null;
  const ios = isIos();
  if (!installEvent && !ios) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* sem storage */
    }
  };

  const install = async () => {
    setBusy(true);
    const outcome = await promptInstall();
    setBusy(false);
    if (outcome === 'accepted') toast.success('App instalado! Procure o ícone na sua tela inicial.');
    else if (outcome === 'dismissed') dismiss();
  };

  return (
    <div className="flex items-start gap-3 rounded-3xl border border-olive-light bg-olive-pale p-4 animate-fade-in">
      <span className="rounded-full bg-cream p-2 text-olive-dark">
        <Smartphone size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-olive-dark">Instale o app da galera</div>
        {installEvent ? (
          <p className="mt-0.5 text-sm text-ink-soft">Fica na sua tela inicial, abre em tela cheia e recebe avisos de mensagens.</p>
        ) : (
          <p className="mt-0.5 text-sm text-ink-soft">
            No Safari, toque em <Share size={13} className="inline -mt-0.5" /> <strong>Compartilhar</strong> e depois em{' '}
            <strong>"Adicionar à Tela de Início"</strong>. O site vira um app, em tela cheia e com avisos.
          </p>
        )}
        <div className="mt-2 flex gap-2">
          {installEvent && (
            <button
              type="button"
              onClick={install}
              disabled={busy}
              className="rounded-full bg-olive-dark px-4 py-1.5 text-sm font-semibold text-cream disabled:opacity-60"
            >
              {busy ? 'Abrindo…' : 'Instalar'}
            </button>
          )}
          <button type="button" onClick={dismiss} className="rounded-full px-3 py-1.5 text-sm font-semibold text-olive">
            {installEvent ? 'Agora não' : 'Entendi'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { eq } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import { sendNotification, setVapidDetails } from 'web-push';
import { config } from './config.js';
import { db } from './db/index.js';
import { pushSubscriptions } from './db/schema.js';
import type { MessageDTO } from './dto.js';
import { onlineGuestIds } from './realtime.js';

/** No máximo um aviso a cada 2 minutos por aparelho; a tag "mural" substitui o aviso anterior. */
const THROTTLE_MS = 2 * 60 * 1000;

export const pushEnabled = !!(config.vapidPublicKey && config.vapidPrivateKey);
let warn: (details: Record<string, unknown>, msg: string) => void = (details, msg) => console.warn(msg, details);

export function setupPush(logger: FastifyBaseLogger): void {
  warn = (details, msg) => logger.warn(details, msg);
  if (!pushEnabled) {
    logger.info('Web Push desligado (defina VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY para ativar).');
    return;
  }
  setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);
  logger.info('Web Push ativo.');
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * Avisa quem assinou e não está com o app aberto. Roda em segundo plano (não bloqueia a resposta).
 */
export async function notifyNewMessage(message: MessageDTO): Promise<void> {
  if (!pushEnabled) return;
  const now = Date.now();
  const online = new Set(onlineGuestIds());
  const targets = db
    .select()
    .from(pushSubscriptions)
    .all()
    .filter(
      (s) =>
        s.guestId !== message.guestId &&
        !online.has(s.guestId) &&
        (!s.lastNotifiedAt || now - s.lastNotifiedAt > THROTTLE_MS),
    );
  if (targets.length === 0) return;

  const author = firstName(message.guest.name);
  const body = message.photo
    ? `${author} postou uma foto${message.text ? `: ${message.text}` : ''} 📸`
    : `${author}: ${message.text ?? ''}`;
  const payload = JSON.stringify({
    title: 'Galera do casamento',
    body: body.slice(0, 180),
    url: '/mural',
    tag: 'mural',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  });

  await Promise.allSettled(
    targets.map(async (s) => {
      try {
        await sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 * 60, urgency: 'normal' },
        );
        db.update(pushSubscriptions).set({ lastNotifiedAt: now }).where(eq(pushSubscriptions.id, s.id)).run();
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // Assinatura expirada ou revogada: limpa
          db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id)).run();
        } else {
          warn({ err, endpoint: s.endpoint.slice(0, 60) }, 'Falha ao enviar push');
        }
      }
    }),
  );
}

import { Download, Images, MessageCircle, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { api, errorMessage } from '../lib/api';
import { formatDateTime, formatDayMonth, whatsappLink } from '../lib/format';
import type { Accommodation, GuestPublic } from '../lib/types';
import { useStore } from '../store';

interface Stats {
  guests: number;
  people: number;
  photos: number;
  messages: number;
  online: number;
  guestsWithoutArrival: number;
}

interface AdminGuest extends GuestPublic {
  phone: string;
  phoneFormatted: string;
  showPhone: boolean;
  accommodation: Accommodation | null;
}

export function Admin() {
  const isAdmin = useStore((s) => s.isAdmin);
  const authStatus = useStore((s) => s.authStatus);
  const [stats, setStats] = useState<Stats | null>(null);
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, g] = await Promise.all([api<Stats>('/api/admin/stats'), api<{ guests: AdminGuest[] }>('/api/admin/guests')]);
      setStats(s);
      setGuests(g.guests);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  if (authStatus === 'authed' && !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5 px-4 pt-4 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold text-olive-dark">
          <ShieldCheck size={24} /> Administração
        </h1>
        <button type="button" onClick={load} disabled={loading} className="rounded-full p-2 text-olive hover:bg-olive-pale disabled:opacity-50" aria-label="Atualizar">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <div className="rounded-2xl bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</div>}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat icon={<Users size={16} />} label="Cadastros" value={stats.guests} />
          <Stat icon={<Users size={16} />} label="Pessoas" value={stats.people} />
          <Stat icon={<Images size={16} />} label="Fotos" value={stats.photos} />
          <Stat icon={<MessageCircle size={16} />} label="Mensagens" value={stats.messages} />
          <Stat icon={<span className="size-2 rounded-full bg-emerald-500" />} label="Online" value={stats.online} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <a href="/api/admin/guests.csv" download className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2 text-sm font-semibold text-cream">
          <Download size={15} /> Lista de convidados (CSV)
        </a>
        <a href="/api/admin/photos.zip" download className="flex items-center gap-1.5 rounded-full border border-olive px-4 py-2 text-sm font-semibold text-olive-dark">
          <Download size={15} /> Todas as fotos (ZIP)
        </a>
      </div>

      <p className="text-xs text-ink-soft">
        Para apagar uma mensagem ou foto imprópria, use a lixeira ao lado dela no mural ou no visualizador de fotos: como admin, você
        pode apagar qualquer conteúdo.
      </p>

      <section className="overflow-hidden rounded-3xl border border-sand bg-white/60">
        <div className="border-b border-sand px-4 py-3 font-serif text-lg font-semibold text-olive-dark">
          Convidados ({guests.length})
          {stats && stats.guestsWithoutArrival > 0 && (
            <span className="ml-2 font-sans text-xs font-normal text-ink-soft">{stats.guestsWithoutArrival} sem data de chegada</span>
          )}
        </div>
        <ul className="divide-y divide-sand/70">
          {guests.map((g) => (
            <li key={g.id} className="flex items-start gap-3 px-4 py-3">
              <Avatar guest={g} size={38} />
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold text-ink">{g.name}</span>
                  {g.isAdmin && <span className="rounded-full bg-olive-pale px-2 text-[10px] font-bold text-olive-dark uppercase">admin</span>}
                  {g.companions?.length > 0 && (
                    <span className="rounded-full bg-rose/10 px-2 text-[10px] font-bold text-rose uppercase">+{g.companions.length}</span>
                  )}
                </div>
                {g.companions?.length > 0 && <div className="text-ink-soft">Com {g.companions.join(', ')}</div>}
                <div className="text-ink-soft">
                  <a href={whatsappLink(g.phone)} target="_blank" rel="noreferrer" className="underline">
                    {g.phoneFormatted}
                  </a>
                  {g.showPhone ? '' : ' · oculto para os outros'}
                </div>
                <div className="text-ink-soft">
                  {g.accommodation ? `${g.accommodation.name} (${g.accommodation.city})` : g.customPlaceLabel ? `${g.customPlaceLabel}${g.customCity && g.customCity !== 'Outro' ? ` (${g.customCity})` : ''}` : 'Hospedagem não informada'}
                </div>
                <div className="text-ink-soft">
                  {g.arrivalDate ? `Chega ${formatDayMonth(g.arrivalDate)}` : 'Sem data de chegada'}
                  {g.departureDate ? ` · sai ${formatDayMonth(g.departureDate)}` : ''}
                </div>
                <div className="text-[11px] text-ink-soft/80">
                  Entrou {formatDateTime(g.createdAt)} · visto {formatDateTime(g.lastSeenAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-sand bg-white/60 p-3 shadow-soft">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-olive uppercase">
        {icon} {label}
      </div>
      <div className="font-serif text-3xl font-semibold text-olive-dark">{value}</div>
    </div>
  );
}

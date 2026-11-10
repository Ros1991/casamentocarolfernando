import {
  CalendarDays,
  ExternalLink,
  Images,
  LocateFixed,
  MapPinned,
  MessageCircle,
  Navigation,
  Shirt,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Countdown } from '../components/Countdown';
import { EventCard } from '../components/EventCard';
import { GiftsCard } from '../components/GiftsCard';
import { InstallBanner } from '../components/InstallBanner';
import { Monogram } from '../components/Monogram';
import { NotificationsCard } from '../components/NotificationsCard';
import { PhotoCapture } from '../components/PhotoCapture';
import { addDays, countPeople, firstName, formatDateShort, toDateOnly } from '../lib/format';
import { warmUpLocationPermission } from '../lib/geo';
import { toast } from '../lib/toast';
import { useStore } from '../store';

const LOCATION_HINT_KEY = 'galera:location-hint-dismissed';

export function Home() {
  const me = useStore((s) => s.me);
  const isAdmin = useStore((s) => s.isAdmin);
  const config = useStore((s) => s.config);
  const guests = useStore((s) => s.guests);
  const guestsLoaded = useStore((s) => s.guestsLoaded);
  const loadGuests = useStore((s) => s.loadGuests);
  const photos = useStore((s) => s.photos);
  const photosLoaded = useStore((s) => s.photosLoaded);
  const loadPhotos = useStore((s) => s.loadPhotos);
  const messagesLoaded = useStore((s) => s.messagesLoaded);
  const loadMessages = useStore((s) => s.loadMessages);
  const events = useStore((s) => s.events);
  const eventsLoaded = useStore((s) => s.eventsLoaded);
  const loadEvents = useStore((s) => s.loadEvents);
  const online = useStore((s) => s.online);
  const [hintDismissed, setHintDismissed] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_HINT_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [askingLocation, setAskingLocation] = useState(false);

  useEffect(() => {
    if (!guestsLoaded) void loadGuests().catch(() => undefined);
    if (!photosLoaded) void loadPhotos().catch(() => undefined);
    if (!messagesLoaded) void loadMessages().catch(() => undefined);
    if (!eventsLoaded) void loadEvents().catch(() => undefined);
  }, [guestsLoaded, photosLoaded, messagesLoaded, eventsLoaded, loadGuests, loadPhotos, loadMessages, loadEvents]);

  const guestList = useMemo(() => Object.values(guests), [guests]);
  const today = toDateOnly(new Date());
  /** Combinados dos noivos que ainda estão por vir e que eu não respondi */
  const pendingOfficial = useMemo(
    () => events.filter((e) => e.date >= today && e.isOfficial && !e.rsvps.some((r) => r.guestId === me?.id)),
    [events, today, me?.id],
  );
  // No Início: primeiro os que faltam responder; sem pendências, os dois próximos
  const featuredEvents = useMemo(() => {
    if (pendingOfficial.length > 0) return pendingOfficial.slice(0, 2);
    const upcoming = events.filter((e) => e.date >= today);
    const official = upcoming.filter((e) => e.isOfficial);
    return (official.length > 0 ? official : upcoming).slice(0, 2);
  }, [events, today, pendingOfficial]);
  const tomorrow = addDays(today, 1);
  const arrivingSoon = useMemo(
    () => guestList.filter((g) => g.arrivalDate === today || g.arrivalDate === tomorrow),
    [guestList, today, tomorrow],
  );
  const inTown = useMemo(
    () =>
      guestList.filter(
        (g) => g.arrivalDate && g.arrivalDate <= today && (!g.departureDate || g.departureDate >= today),
      ),
    [guestList, today],
  );

  if (!config || !me) return null;
  const w = config.wedding;

  const dismissHint = () => {
    setHintDismissed(true);
    try {
      localStorage.setItem(LOCATION_HINT_KEY, '1');
    } catch {
      /* sem storage */
    }
  };

  const askLocation = async () => {
    setAskingLocation(true);
    const ok = await warmUpLocationPermission();
    setAskingLocation(false);
    if (ok) {
      toast.success('Localização ativada! Suas fotos vão aparecer no mapa.');
      dismissHint();
    } else {
      toast.info('Sem permissão de localização. Você ainda pode marcar o lugar no mapa na hora de postar.');
    }
  };

  return (
    <div className="pb-8">
      <section className="watercolor-stripes px-5 pt-6 pb-7 text-center">
        <Monogram size={96} className="mx-auto" />
        <h1 className="mt-1 font-serif text-3xl font-semibold text-olive-dark">{w.couple}</h1>
        <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-olive uppercase">
          {w.dateLabel} · {w.timeLabel}
        </p>
        <div className="mt-5">
          <Countdown target={w.dateTime} />
        </div>
        <p className="mt-3 font-script text-3xl text-olive-dark">Olá, {firstName(me.name)}!</p>
      </section>

      <div className="space-y-4 px-4 pt-4">
        <InstallBanner />
        <NotificationsCard dismissable />
        {!hintDismissed && (
          <div className="flex items-start gap-3 rounded-3xl border border-sky bg-sky-light p-4 animate-fade-in">
            <span className="rounded-full bg-cream p-2 text-olive-dark">
              <LocateFixed size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-olive-dark">Ative a localização</div>
              <p className="mt-0.5 text-sm text-ink-soft">
                Assim as fotos que você tirar aparecem no lugar certo do mapa. Pedimos só uma vez.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={askLocation}
                  disabled={askingLocation}
                  className="rounded-full bg-olive-dark px-4 py-1.5 text-sm font-semibold text-cream disabled:opacity-60"
                >
                  {askingLocation ? 'Pedindo…' : 'Ativar'}
                </button>
                <button type="button" onClick={dismissHint} className="rounded-full px-3 py-1.5 text-sm font-semibold text-olive">
                  Depois
                </button>
              </div>
            </div>
          </div>
        )}

        {featuredEvents.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-olive-dark">
                <CalendarDays size={20} /> {featuredEvents[0].isOfficial ? 'Combinados dos noivos' : 'Próximos combinados'}
              </h2>
              <Link to="/agenda" className="text-sm font-semibold text-olive underline">
                Ver agenda
              </Link>
            </div>
            {pendingOfficial.length > 0 && (
              <p className="rounded-2xl bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
                {pendingOfficial.length === 1
                  ? `Falta responder 1 combinado dos noivos: ${pendingOfficial[0].title}.`
                  : `Falta responder ${pendingOfficial.length} combinados dos noivos${pendingOfficial.length > 2 ? ' (os primeiros estão abaixo; o resto na Agenda)' : ''}.`}
              </p>
            )}
            {featuredEvents.map((e) => (
              <EventCard key={e.id} event={e} compact />
            ))}
          </section>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Link to="/mapa" className="rounded-3xl border border-sand bg-white/60 p-3 text-center shadow-soft">
            <div className="font-serif text-3xl font-semibold text-olive-dark">{countPeople(guestList)}</div>
            <div className="text-[11px] font-semibold tracking-wider text-olive uppercase">
              {countPeople(guestList) === 1 ? 'pessoa' : 'pessoas'}
            </div>
          </Link>
          <Link to="/fotos" className="rounded-3xl border border-sand bg-white/60 p-3 text-center shadow-soft">
            <div className="font-serif text-3xl font-semibold text-olive-dark">{photos.length}</div>
            <div className="text-[11px] font-semibold tracking-wider text-olive uppercase">fotos</div>
          </Link>
          <Link to="/mural" className="rounded-3xl border border-sand bg-white/60 p-3 text-center shadow-soft">
            <div className="font-serif text-3xl font-semibold text-olive-dark">{online.length}</div>
            <div className="text-[11px] font-semibold tracking-wider text-olive uppercase">online</div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PhotoCapture variant="button" label="Tirar foto" className="w-full" />
          <Link to="/mural" className="flex items-center justify-center gap-2 rounded-2xl border border-olive bg-cream px-4 py-3 font-semibold text-olive-dark shadow-soft">
            <MessageCircle size={20} /> Mural
          </Link>
          <Link to="/mapa" className="flex items-center justify-center gap-2 rounded-2xl border border-olive bg-cream px-4 py-3 font-semibold text-olive-dark shadow-soft">
            <MapPinned size={20} /> Mapa da galera
          </Link>
          <Link to="/agenda" className="flex items-center justify-center gap-2 rounded-2xl border border-olive bg-cream px-4 py-3 font-semibold text-olive-dark shadow-soft">
            <CalendarDays size={20} /> Agenda
          </Link>
        </div>

        {(arrivingSoon.length > 0 || inTown.length > 0) && (
          <Link to="/agenda?tab=chegadas" className="block rounded-3xl border border-sand bg-white/60 p-4 shadow-soft">
            <div className="flex items-center gap-2 font-serif text-xl font-semibold text-olive-dark">
              <Users size={20} /> Movimento da galera
            </div>
            {inTown.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {inTown.slice(0, 6).map((g) => (
                    <Avatar key={g.id} guest={g} size={28} />
                  ))}
                </div>
                <span className="text-sm text-ink-soft">
                  {countPeople(inTown) === 1 ? '1 pessoa já está por lá' : `${countPeople(inTown)} pessoas já estão por lá`}
                </span>
              </div>
            )}
            {arrivingSoon.length > 0 && (
              <p className="mt-2 text-sm text-ink-soft">
                Chegando hoje ou amanhã: {arrivingSoon.map((g) => firstName(g.name)).slice(0, 5).join(', ')}
                {arrivingSoon.length > 5 ? ` e mais ${arrivingSoon.length - 5}` : ''}.
              </p>
            )}
          </Link>
        )}

        <div className="rounded-3xl border border-sand bg-white/60 p-4 shadow-soft">
          <div className="flex items-center gap-2 font-serif text-xl font-semibold text-olive-dark">
            <Navigation size={20} /> Quando e onde
          </div>
          <p className="mt-2 text-ink">
            <strong>{w.dateLabel}</strong>, às <strong>{w.timeLabel}</strong>, no <strong>{w.venue}</strong> ({w.venueCity}).
            Cerimônia e recepção no mesmo lugar.
          </p>
          <p className="mt-1 text-sm text-ink-soft">{w.venueNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={w.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2 text-sm font-semibold text-cream"
            >
              <Navigation size={15} /> Como chegar
            </a>
            <Link to="/mapa?lugar=espaco-tua" className="flex items-center gap-1.5 rounded-full border border-olive px-4 py-2 text-sm font-semibold text-olive-dark">
              <MapPinned size={15} /> Ver no mapa da galera
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-sand bg-white/60 p-4 shadow-soft">
          <div className="flex items-center gap-2 font-serif text-xl font-semibold text-olive-dark">
            <Shirt size={20} /> Traje: {w.dressCode}
          </div>
          <p className="mt-2 text-sm text-ink">{w.dressCodeDetails}</p>
        </div>

        {me.arrivalDate && (
          <div className="rounded-3xl border border-sand bg-white/60 p-4 text-sm shadow-soft">
            <span className="font-semibold text-olive-dark">Sua viagem:</span> chega {formatDateShort(me.arrivalDate)}
            {me.departureDate ? ` e vai embora ${formatDateShort(me.departureDate)}` : ''}.{' '}
            <Link to="/perfil" className="font-semibold text-olive underline">
              Alterar
            </Link>
          </div>
        )}

        <GiftsCard />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a href={w.officialSite} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-sand bg-cream px-4 py-3 text-sm font-semibold text-olive-dark">
            Site oficial <ExternalLink size={16} />
          </a>
          <a href={w.rsvpUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-sand bg-cream px-4 py-3 text-sm font-semibold text-olive-dark">
            Confirmar presença <ExternalLink size={16} />
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/fotos" className="flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs font-semibold text-olive-dark">
            <Images size={14} /> Galeria
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 rounded-full border border-olive bg-olive-pale px-3 py-1.5 text-xs font-semibold text-olive-dark">
              <ShieldCheck size={14} /> Administração
            </Link>
          )}
        </div>

        <p className="pt-4 text-center font-serif text-sm text-ink-soft italic">{w.verse}</p>
      </div>
    </div>
  );
}

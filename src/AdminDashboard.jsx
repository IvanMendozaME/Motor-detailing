import { useState, useEffect } from 'react';
import { supabase } from './supabase';

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const INITIAL_INVENTORY = [
  {
    id: 1,
    name: 'AutoShampoo Pro',
    brand: 'Koch Chemie',
    ph: 'neutro',
    stock: 78,
    unit: 'L',
    color: '#22c55e',
    costPerUnit: 85,
  },
  {
    id: 2,
    name: 'Wheel Cleaner Acid',
    brand: 'Gyeon',
    ph: 'ácido',
    stock: 35,
    unit: 'L',
    color: '#f97316',
    costPerUnit: 120,
  },
  {
    id: 3,
    name: 'APC Multipurpose',
    brand: "Meguiar's",
    ph: 'alcalino',
    stock: 60,
    unit: 'L',
    color: '#3b82f6',
    costPerUnit: 95,
  },
  {
    id: 4,
    name: 'Iron Fallout Remover',
    brand: 'CarPro',
    ph: 'ácido',
    stock: 20,
    unit: 'L',
    color: '#f97316',
    costPerUnit: 210,
  },
  {
    id: 5,
    name: 'Leather Conditioner',
    brand: 'Gtechniq',
    ph: 'neutro',
    stock: 90,
    unit: 'mL',
    color: '#22c55e',
    costPerUnit: 45,
  },
  {
    id: 6,
    name: 'Enzyme Interior APC',
    brand: 'Koch Chemie',
    ph: 'alcalino',
    stock: 15,
    unit: 'L',
    color: '#3b82f6',
    costPerUnit: 75,
  },
];

const INITIAL_REQUESTS = [
  {
    id: 1,
    client: 'Carlos Mendoza',
    vehicle: 'SUV',
    plate: 'ABC-123',
    services: ['Lavado Alcalino', 'Limpieza de Cielo'],
    date: '2026-03-10',
    time: '09:00',
    status: 'nueva',
  },
  {
    id: 2,
    client: 'Ana Ríos',
    vehicle: 'Sedán',
    plate: 'XYZ-789',
    services: ['pH Neutro', 'Limpieza de Asientos', 'Renovación de Plásticos'],
    date: '2026-03-10',
    time: '11:30',
    status: 'aceptada',
  },
  {
    id: 3,
    client: 'Luis Garza',
    vehicle: 'Pick-up',
    plate: 'DEF-456',
    services: ['Lavado Ácido', 'Descontaminación Férrica', 'Limpieza de Motor'],
    date: '2026-03-11',
    time: '10:00',
    status: 'aceptada',
  },
  {
    id: 4,
    client: 'Sofía Vega',
    vehicle: 'Coupé',
    plate: 'GHI-321',
    services: ['Lavado Alcalino', 'Limpieza de Tapetes'],
    date: '2026-03-09',
    time: '09:00',
    status: 'finalizada',
  },
  {
    id: 5,
    client: 'Marcos Díaz',
    vehicle: 'Hatchback',
    plate: 'JKL-654',
    services: ['pH Neutro', 'Limpieza de Cielo', 'Renovación de Tablero'],
    date: '2026-03-12',
    time: '15:00',
    status: 'nueva',
  },
];

/* ─── HELPERS ───────────────────────────────────────────────── */
const STATUS_CONFIG = {
  nueva: {
    label: 'Nueva',
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
    pulse: true,
  },
  aceptada: {
    label: 'Aceptada',
    bg: 'bg-violet-500/15',
    text: 'text-violet-400',
    dot: 'bg-violet-400',
    pulse: false,
  },
  rechazada: {
    label: 'Rechazada',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    dot: 'bg-red-400',
    pulse: false,
  },
  finalizada: {
    label: 'Finalizada',
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    dot: 'bg-green-400',
    pulse: false,
  },
};

const PH_CONFIG = {
  neutro: {
    label: 'pH Neutro',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  ácido: {
    label: 'pH Ácido',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  alcalino: {
    label: 'pH Alcalino',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
};

const WEEK = [
  { day: 'LUN', date: '2026-03-09', label: 9 },
  { day: 'MAR', date: '2026-03-10', label: 10 },
  { day: 'MIÉ', date: '2026-03-11', label: 11 },
  { day: 'JUE', date: '2026-03-12', label: 12 },
  { day: 'VIE', date: '2026-03-13', label: 13 },
  { day: 'SAB', date: '2026-03-14', label: 14 },
];

/* ─── TOAST ─────────────────────────────────────────────────── */
const Toast = ({ msg, type, onDone }) => {
  const [phase, setPhase] = useState('sending');
  useState(() => {
    const t1 = setTimeout(() => setPhase('done'), 1800);
    const t2 = setTimeout(() => onDone(), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  const isAccept = type === 'accept';
  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm w-80"
      style={{ animation: 'slideUp 0.35s ease' }}
    >
      <div
        className={`rounded-2xl border px-5 py-4 shadow-2xl ${
          isAccept
            ? 'bg-violet-950/95 border-violet-500/40'
            : 'bg-red-950/95 border-red-500/40'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isAccept ? 'bg-violet-500/20' : 'bg-red-500/20'
            }`}
          >
            {phase === 'sending' ? (
              <div
                className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${
                  isAccept ? 'border-violet-400' : 'border-red-400'
                }`}
              />
            ) : (
              <span className="text-sm font-black">{isAccept ? '✓' : '✕'}</span>
            )}
          </div>
          <div>
            <p
              className={`text-xs font-bold mb-1 ${
                isAccept ? 'text-violet-300' : 'text-red-300'
              }`}
            >
              {phase === 'sending'
                ? 'Enviando notificación al cliente...'
                : isAccept
                ? 'Notificación enviada ✓'
                : 'Rechazo notificado ✓'}
            </p>
            <p className="text-xs text-zinc-400 leading-snug">{msg}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── REJECTION MODAL ───────────────────────────────────────── */
const QUICK_REASONS = [
  'Esa fecha ya está llena',
  'No cuento con el químico ácido por ahora',
  'Fuera de zona de servicio',
  'Agenda completa esta semana',
];

const RejectModal = ({ req, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  return (
    <div
      className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md shadow-2xl"
        style={{ animation: 'scaleIn 0.25s ease' }}
      >
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
              <span className="text-red-400 font-black">✕</span>
            </div>
            <div>
              <h3
                className="text-white font-black text-base leading-none"
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  letterSpacing: '0.04em',
                }}
              >
                RECHAZAR SOLICITUD
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                {req.client} · {req.vehicle} · {req.date}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2.5">
            Motivo rápido
          </p>
          <div className="flex flex-col gap-1.5 mb-4">
            {QUICK_REASONS.map((q) => (
              <button
                key={q}
                onClick={() => setReason(q)}
                className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                  reason === q
                    ? 'border-red-500/50 bg-red-500/10 text-red-300'
                    : 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
            O escribe un motivo personalizado
          </p>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Escribe aquí el motivo..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500/50 resize-none"
          />
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold hover:border-zinc-500 hover:text-zinc-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim()}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              reason.trim()
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── SOLICITUDES VIEW ──────────────────────────────────────── */
const SolicitudesView = ({ requests, onAccept, onReject, onFinalize }) => {
  const [filter, setFilter] = useState('todas');
  const [rejectTarget, setRejectTarget] = useState(null);
  const filtered =
    filter === 'todas' ? requests : requests.filter((r) => r.status === filter);

  return (
    <div>
      {rejectTarget && (
        <RejectModal
          req={rejectTarget}
          onConfirm={(reason) => {
            onReject(rejectTarget.id, reason);
            setRejectTarget(null);
          }}
          onCancel={() => setRejectTarget(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2
            className="text-2xl font-black text-white"
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            SOLICITUDES
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            {requests.filter((r) => r.status === 'nueva').length} nuevas ·{' '}
            {requests.length} total
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['todas', 'nueva', 'aceptada', 'rechazada', 'finalizada'].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  filter === f
                    ? 'bg-orange-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {filtered.map((req) => {
          const sc = STATUS_CONFIG[req.status];
          const isNueva = req.status === 'nueva';
          const isAcep = req.status === 'aceptada';
          const isFinal = req.status === 'finalizada';
          return (
            <div
              key={req.id}
              className={`bg-zinc-900 border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200 flex-wrap ${
                isNueva
                  ? 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.07)]'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isNueva
                    ? 'bg-orange-500/15 border border-orange-500/25'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <span
                  className={`font-black text-sm ${
                    isNueva ? 'text-orange-400' : 'text-zinc-400'
                  }`}
                >
                  {req.client[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-bold text-sm">
                    {req.client}
                  </span>
                  <span className="text-zinc-600 text-xs">·</span>
                  <span className="text-zinc-400 text-xs">{req.vehicle}</span>
                  <span className="text-zinc-700 text-xs font-mono">
                    {req.plate}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {req.services.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {req.rejectReason && (
                  <p className="text-[10px] text-red-400/60 mt-1.5 italic">
                    Motivo rechazo: "{req.rejectReason}"
                  </p>
                )}
              </div>
              <div className="text-center hidden lg:block flex-shrink-0">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                  Fecha · Hora
                </p>
                <p className="text-sm text-white font-bold font-mono mt-0.5">
                  {req.date}
                </p>
                <p className="text-xs text-orange-400 font-mono mt-0.5">
                  {req.time}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-lg ${sc.bg} flex items-center gap-1.5 flex-shrink-0`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${
                    sc.pulse ? 'animate-pulse' : ''
                  }`}
                />
                <span className={`text-xs font-bold ${sc.text}`}>
                  {sc.label}
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {isNueva && (
                  <>
                    <button
                      onClick={() => onAccept(req.id)}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-violet-500 hover:bg-violet-400 text-white transition-all shadow-[0_0_14px_rgba(139,92,246,0.35)]"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => setRejectTarget(req)}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-800 hover:bg-red-500/15 text-red-400 border border-zinc-700 hover:border-red-500/40 transition-all"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {isAcep && (
                  <button
                    onClick={() => onFinalize(req.id)}
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25 hover:border-green-500/50 transition-all"
                  >
                    Finalizar
                  </button>
                )}
                {isFinal && (
                  <span className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-800 cursor-default">
                    ✓ Listo
                  </span>
                )}
                {req.status === 'rechazada' && (
                  <span className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-800/50 cursor-default">
                    Cerrada
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── AGENDA VIEW ───────────────────────────────────────────── */
const AgendaView = ({ requests, jumpDate }) => {
  const initIdx = jumpDate ? WEEK.findIndex((w) => w.date === jumpDate) : 1;
  const [activeIdx, setActiveIdx] = useState(initIdx >= 0 ? initIdx : 0);
  const accepted = requests.filter(
    (r) => r.status === 'aceptada' || r.status === 'finalizada'
  );
  const daySlots = accepted
    .filter((r) => r.date === WEEK[activeIdx]?.date)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-2xl font-black text-white"
          style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
        >
          AGENDA
        </h2>
        <p className="text-zinc-500 text-xs mt-0.5">
          Semana del 9 al 14 de Marzo 2026
        </p>
      </div>
      <div className="grid grid-cols-6 gap-2 mb-6">
        {WEEK.map((w, i) => {
          const count = accepted.filter((r) => r.date === w.date).length;
          return (
            <button
              key={w.day}
              onClick={() => setActiveIdx(i)}
              className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 relative ${
                activeIdx === i
                  ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                  : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  activeIdx === i ? 'text-black' : 'text-zinc-500'
                }`}
              >
                {w.day}
              </span>
              <span
                className={`text-lg font-black ${
                  activeIdx === i ? 'text-black' : 'text-zinc-300'
                }`}
                style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
              >
                {w.label}
              </span>
              {count > 0 && (
                <span
                  className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    activeIdx === i
                      ? 'bg-black/20 text-black'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <div className="absolute left-16 top-0 bottom-0 w-px bg-zinc-800" />
        {daySlots.length === 0 ? (
          <div className="ml-20 py-12 text-center">
            <p className="text-zinc-600 text-sm">
              Sin citas confirmadas para este día.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {daySlots.map((slot, i) => (
              <div
                key={slot.id}
                className="flex gap-4 items-start"
                style={{ animation: `fadeIn 0.3s ease ${i * 0.07}s both` }}
              >
                <span className="text-xs font-mono text-zinc-500 w-12 pt-3.5 text-right flex-shrink-0">
                  {slot.time}
                </span>
                <div className="w-2.5 h-2.5 rounded-full mt-4 flex-shrink-0 ml-1.5 ring-4 ring-zinc-950 bg-orange-500" />
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-white font-bold text-sm">
                      {slot.client}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        STATUS_CONFIG[slot.status].bg
                      } ${STATUS_CONFIG[slot.status].text}`}
                    >
                      {STATUS_CONFIG[slot.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {slot.vehicle} · {slot.plate}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {slot.services.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── INVENTARIO VIEW ───────────────────────────────────────── */
const EMPTY_PRODUCT = {
  name: '',
  brand: '',
  ph: 'neutro',
  stock: 0,
  unit: 'L',
  costPerUnit: 0,
  color: '#22c55e',
};
const PH_COLORS = { neutro: '#22c55e', ácido: '#f97316', alcalino: '#3b82f6' };

const ProductModal = ({ product, onSave, onClose, title }) => {
  const [form, setForm] = useState({ ...product });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handlePhChange = (ph) =>
    setForm((f) => ({ ...f, ph, color: PH_COLORS[ph] }));
  const isValid =
    form.name.trim() &&
    form.brand.trim() &&
    form.stock >= 0 &&
    form.costPerUnit >= 0;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md shadow-2xl"
        style={{ animation: 'scaleIn 0.25s ease' }}
      >
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
              <span className="text-orange-400 text-base">⬟</span>
            </div>
            <h3
              className="text-white font-black text-base"
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: '0.04em',
              }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="AutoShampoo Pro"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">
                Marca
              </label>
              <input
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                placeholder="Koch Chemie"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">
              Tipo de pH
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['neutro', 'ácido', 'alcalino'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePhChange(p)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all duration-150 ${
                    form.ph === p
                      ? p === 'neutro'
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                        : p === 'ácido'
                        ? 'border-orange-500/60 bg-orange-500/15 text-orange-400'
                        : 'border-sky-500/60 bg-sky-500/15 text-sky-400'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">
                Unidad
              </label>
              <select
                value={form.unit}
                onChange={(e) => set('unit', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50 transition-colors"
              >
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="kg">kg</option>
                <option value="pza">pza</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">
                Costo/$
              </label>
              <input
                type="number"
                min="0"
                value={form.costPerUnit}
                onChange={(e) =>
                  set('costPerUnit', parseFloat(e.target.value) || 0)
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>
          {form.costPerUnit > 0 && form.stock > 0 && (
            <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-zinc-500">Valor en estantería</span>
              <span className="text-sm font-black text-orange-400">
                ${(form.costPerUnit * form.stock).toLocaleString('es-MX')} MXN
              </span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold hover:border-zinc-500 hover:text-zinc-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              isValid
                ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_16px_rgba(249,115,22,0.3)]'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const InventarioView = () => {
  const [inventory, setInventory] = useState([]);
  const [phFilter, setPhFilter] = useState('todos');
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true });
      if (data) setInventory(data);
    };
    load();
  }, []);

  const filtered =
    phFilter === 'todos'
      ? inventory
      : inventory.filter((i) => i.ph === phFilter);
  const totalValue = inventory.reduce(
    (sum, i) => sum + i.costPerUnit * i.stock,
    0
  );
  const stepFor = (unit) => (unit === 'mL' ? 100 : 1);

  // PON ESTO:
  const adjustStock = async (id, delta) => {
    const item = inventory.find((i) => i.id === id);
    const newStock = Math.max(0, item.stock + delta);
    // Actualiza la UI inmediatamente (optimistic update)
    setInventory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: newStock } : i))
    );
    // Guarda en base de datos
    await supabase.from('inventory').update({ stock: newStock }).eq('id', id);
  };

  // PON ESTO:
  const handleSave = async (form) => {
    if (modal.mode === 'add') {
      // Inserta en Supabase y usa el ID real que devuelve
      const { data } = await supabase
        .from('inventory')
        .insert([
          {
            name: form.name,
            brand: form.brand,
            ph: form.ph,
            stock: form.stock,
            unit: form.unit,
            color: form.color,
            cost_per_unit: form.costPerUnit,
          },
        ])
        .select()
        .single();
      if (data)
        setInventory((prev) => [
          ...prev,
          {
            ...data,
            costPerUnit: data.cost_per_unit, // mapea el nombre de columna
          },
        ]);
    } else {
      // Actualiza en Supabase
      await supabase
        .from('inventory')
        .update({
          name: form.name,
          brand: form.brand,
          ph: form.ph,
          stock: form.stock,
          unit: form.unit,
          color: form.color,
          cost_per_unit: form.costPerUnit,
        })
        .eq('id', modal.product.id);
      setInventory((prev) =>
        prev.map((i) => (i.id === modal.product.id ? { ...form, id: i.id } : i))
      );
    }
    setModal(null);
  };

  // PON ESTO:
  const handleDelete = async (id) => {
    await supabase.from('inventory').delete().eq('id', id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    setConfirmDelete(null);
  };
  return (
    <div>
      {modal && (
        <ProductModal
          title={modal.mode === 'add' ? 'AGREGAR PRODUCTO' : 'EDITAR PRODUCTO'}
          product={modal.mode === 'add' ? EMPTY_PRODUCT : modal.product}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl"
            style={{ animation: 'scaleIn 0.2s ease' }}
          >
            <p className="text-2xl mb-3">🗑️</p>
            <p className="text-white font-bold text-sm mb-1">
              ¿Eliminar producto?
            </p>
            <p className="text-zinc-500 text-xs mb-5">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold hover:border-zinc-500 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2
            className="text-2xl font-black text-white"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            INVENTARIO
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            {inventory.filter((i) => i.stock < 25).length} stock bajo ·
            <span className="text-orange-400 font-bold">
              {' '}
              ${totalValue.toLocaleString('es-MX')} MXN
            </span>{' '}
            en estantería
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)]"
        >
          + Agregar
        </button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'neutro', label: '🟢 Neutros' },
          { id: 'ácido', label: '🟠 Ácidos' },
          { id: 'alcalino', label: '🔵 Alcalinos' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setPhFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 ${
              phFilter === f.id
                ? 'bg-orange-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const ph = PH_CONFIG[item.ph];
          const low = item.stock < 25;
          const step = stepFor(item.unit);
          const shelfValue = item.costPerUnit * item.stock;
          return (
            <div
              key={item.id}
              className={`bg-zinc-900 rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200 ${
                low
                  ? 'border-orange-500/40'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setModal({ mode: 'edit', product: item })}
                >
                  {low && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />{' '}
                      Stock bajo
                    </div>
                  )}
                  <p className="text-white font-bold text-sm leading-tight truncate">
                    {item.name}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">{item.brand}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-1 rounded-lg border font-bold ${ph.bg} ${ph.text} ${ph.border}`}
                  >
                    {ph.label}
                  </span>
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-600 hover:text-red-400 flex items-center justify-center transition-all text-sm"
                  >
                    🗑
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    Stock
                  </span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      low ? 'text-orange-400' : 'text-zinc-300'
                    }`}
                  >
                    {item.stock} {item.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(item.stock, 100)}%`,
                      backgroundColor: low ? '#f97316' : item.color,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustStock(item.id, -step)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-lg flex items-center justify-center transition-all touch-manipulation"
                  >
                    −
                  </button>
                  <span className="text-[10px] text-zinc-600 px-1">
                    ±{step}
                    {item.unit}
                  </span>
                  <button
                    onClick={() => adjustStock(item.id, step)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-orange-400 font-black text-lg flex items-center justify-center transition-all touch-manipulation"
                  >
                    +
                  </button>
                </div>
                {item.costPerUnit > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                      En estantería
                    </p>
                    <p className="text-xs font-black text-orange-400">
                      ${shelfValue.toLocaleString('es-MX')}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setModal({ mode: 'edit', product: item })}
                className="w-full py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-all"
              >
                ✏️ Editar detalles
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── TENDENCIAS VIEW ───────────────────────────────────────── */
const ALL_TRENDS = [
  {
    id: 1,
    tag: 'Materiales 2026',
    title: 'Grafeno en Cerámicos: La Nueva Era de la Protección',
    body: 'Los recubrimientos con nanopartículas de grafeno están superando los 9H tradicionales. Mayor resistencia química, hidrofobicidad extrema y durabilidad de hasta 7 años.',
    img: '🔬',
    date: 'Mar 5, 2026',
    read: '4 min',
  },
  {
    id: 2,
    tag: 'Técnica PRO',
    title: 'Decontaminación en Dos Fases: Arcilla + Ácido Combinado',
    body: 'El protocolo de doble decontaminación reduce micro-rayones en pintura correctiva hasta un 60%. Técnica adoptada por detailers competitivos en 2025.',
    img: '⚗️',
    date: 'Feb 28, 2026',
    read: '6 min',
  },
  {
    id: 3,
    tag: 'Equipamiento',
    title: 'Pulidoras GDA vs DA: ¿Cuál Elige el Pro en 2026?',
    body: 'La nueva generación de pulidoras Gear-Driven ofrece mayor corte sin el calor de las rotativas. Ideal para pintura blanda de vehículos europeos y asiáticos modernos.',
    img: '🛠️',
    date: 'Feb 20, 2026',
    read: '5 min',
  },
  {
    id: 4,
    tag: 'Negocio',
    title: 'Transparencia en Materiales: +30% en Ticket Promedio',
    body: 'Estudio 2026: mostrar fichas técnicas de productos al cliente incrementa el valor percibido y el ticket promedio. La confianza se traduce directamente en ingresos.',
    img: '📊',
    date: 'Feb 14, 2026',
    read: '3 min',
  },
  {
    id: 5,
    tag: 'Microfibras',
    title: 'GSM y Weave: Cómo Elegir el Paño Correcto para Cada Paso',
    body: 'No todas las microfibras son iguales. Un paño de 300GSM twist para secado difiere radicalmente de uno de 500GSM plush para coating. Guía completa de selección por etapa.',
    img: '🧣',
    date: 'Mar 1, 2026',
    read: '5 min',
  },
  {
    id: 6,
    tag: 'Química',
    title: 'pH en Detailing: La Guía Definitiva Ácido-Alcalino',
    body: 'Entender el pH no es opcional para un detailer profesional. Desde removedores de férreos (pH 2) hasta desengrasantes (pH 12), cada producto tiene su ventana segura de aplicación.',
    img: '🧪',
    date: 'Feb 10, 2026',
    read: '7 min',
  },
  {
    id: 7,
    tag: 'Pulido',
    title: 'Corrección en Un Solo Paso: Compuestos All-in-One 2026',
    body: 'Los nuevos AIO de Menzerna y Rupes logran corte + abrillantado + protección en una sola pasada. ¿El fin del proceso de 3 etapas para autos de mantenimiento?',
    img: '✨',
    date: 'Mar 3, 2026',
    read: '4 min',
  },
  {
    id: 8,
    tag: 'Protección',
    title: 'PPF vs Coating Cerámico: Cuándo Usar Cada Uno',
    body: 'El film de protección de pintura y el cerámico no compiten, se complementan. Conoce los umbrales de daño donde cada tecnología gana, y cuándo combinarlas para máxima protección.',
    img: '🛡️',
    date: 'Feb 25, 2026',
    read: '6 min',
  },
  {
    id: 9,
    tag: 'Interior',
    title: 'Ozono vs Enzimas: Guerra contra Olores Persistentes',
    body: 'Los generadores de ozono eliminan el 99% de bacterias en 30 min, pero pueden dañar plásticos y cuero si se abusa. Los limpiadores enzimáticos son más seguros y específicos.',
    img: '🌬️',
    date: 'Feb 18, 2026',
    read: '4 min',
  },
  {
    id: 10,
    tag: 'Tendencia',
    title: 'Detailing a Domicilio: El Modelo de Negocio que Escala',
    body: 'El mobile detailing creció 40% en 2025 en Latinoamérica. Menor overhead, mayor flexibilidad y ticket premium. Analizamos el equipo mínimo para arrancar con calidad profesional.',
    img: '🚐',
    date: 'Mar 6, 2026',
    read: '5 min',
  },
];

const SkeletonCard = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="bg-zinc-800 h-28" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-3 bg-zinc-800 rounded-full w-24" />
      <div className="h-4 bg-zinc-800 rounded-full w-full" />
      <div className="h-3 bg-zinc-800 rounded-full w-5/6" />
      <div className="h-3 bg-zinc-800 rounded-full w-4/6" />
    </div>
  </div>
);

const TendenciasView = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌐 PUNTO DE INTEGRACIÓN CON API REAL
  // Reemplaza el setTimeout por:
  //   const res  = await fetch("https://TU-API-URL-AQUI.com/endpoint?q=car+detailing");
  //   const data = await res.json();
  //   const mapped = data.articles.slice(0,3).map((a,i) => ({
  //     id: i, tag: "En Vivo", title: a.title, body: a.description,
  //     img: "🌐", date: a.publishedAt?.slice(0,10), read: "— min"
  //   }));
  //   setNews(mapped);

  const fetchNews = () => {
    setLoading(true);
    setNews([]);
    setTimeout(() => {
      const shuffled = [...ALL_TRENDS].sort(() => Math.random() - 0.5);
      setNews(shuffled.slice(0, 3));
      setLoading(false);
    }, 1400);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2
            className="text-2xl font-black text-white"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            TENDENCIAS DETAILING
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Materiales, técnicas y estrategia ·{' '}
            {loading ? 'Actualizando...' : `${news.length} artículos cargados`}
          </p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            loading
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_16px_rgba(249,115,22,0.3)]'
          }`}
        >
          <span
            className={loading ? 'animate-spin inline-block' : 'inline-block'}
          >
            ↻
          </span>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          : news.map((t) => (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-200 group cursor-pointer"
                style={{ animation: 'fadeIn 0.4s ease' }}
              >
                <div className="bg-zinc-800/50 h-28 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                  {t.img}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      {t.tag}
                    </span>
                    <span className="text-zinc-700 text-[10px]">·</span>
                    <span className="text-zinc-600 text-[10px]">
                      {t.read} lectura
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-sm leading-snug mb-2 group-hover:text-orange-300 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3">
                    {t.body}
                  </p>
                  <p className="text-zinc-700 text-[10px] mt-3 font-mono">
                    {t.date}
                  </p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

/* ─── MAIN DASHBOARD ────────────────────────────────────────── */
export default function AdminDashboard() {
  const [active, setActive] = useState('solicitudes');
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [jumpDate, setJumpDate] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: reqs } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (reqs)
        setRequests(
          reqs.map((r) => ({
            ...r,
            services: r.services || [],
          }))
        );
    };

    loadData();

    // Escucha cambios en tiempo real sin refrescar la página
    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => loadData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // PON ESTO:
  const handleAccept = async (id) => {
    const req = requests.find((r) => r.id === id);
    await supabase.from('requests').update({ status: 'aceptada' }).eq('id', id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'aceptada' } : r))
    );
    setToast({
      type: 'accept',
      msg: `Tu cita del ${req.date} a las ${
        req.time
      } está confirmada. ¡Te esperamos, ${req.client.split(' ')[0]}!`,
    });
    setJumpDate(req.date);
    setTimeout(() => setActive('agenda'), 2200);
  };

  const handleReject = async (id, reason) => {
    const req = requests.find((r) => r.id === id);
    await supabase
      .from('requests')
      .update({ status: 'rechazada', reject_reason: reason })
      .eq('id', id);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'rechazada', rejectReason: reason } : r
      )
    );
    setToast({
      type: 'reject',
      msg: `Hola ${req.client.split(' ')[0]}, no podemos atenderte el ${
        req.date
      }. Motivo: ${reason}`,
    });
  };

  const handleFinalize = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'finalizada' } : r))
    );
  };

  const newCount = requests.filter((r) => r.status === 'nueva').length;
  const lowCount = INITIAL_INVENTORY.filter((i) => i.stock < 25).length;

  const NAV_ITEMS = [
    { id: 'solicitudes', icon: '◈', label: 'Solicitudes', badge: newCount },
    { id: 'agenda', icon: '⬡', label: 'Agenda', badge: 0 },
    { id: 'inventario', icon: '⬟', label: 'Inventario', badge: lowCount },
    { id: 'tendencias', icon: '⬠', label: 'Tendencias', badge: 0 },
  ];

  const VIEWS = {
    solicitudes: (
      <SolicitudesView
        requests={requests}
        onAccept={handleAccept}
        onReject={handleReject}
        onFinalize={handleFinalize}
      />
    ),
    agenda: <AgendaView requests={requests} jumpDate={jumpDate} />,
    inventario: <InventarioView />,
    tendencias: <TendenciasView />,
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 flex"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <aside className="w-16 md:w-56 bg-zinc-950 border-r border-zinc-800/60 flex flex-col py-6 flex-shrink-0 sticky top-0 h-screen">
        <div className="px-4 mb-8 hidden md:block">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-px bg-orange-500" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-orange-500 font-bold">
              Admin Panel
            </span>
          </div>
          <h1
            className="text-xl font-black text-white leading-none"
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              letterSpacing: '0.04em',
            }}
          >
            PRIME MOTORING
          </h1>
        </div>
        <div className="px-2 mb-8 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mx-auto">
            <span className="text-black font-black text-xs">PM</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                active === item.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-bold hidden md:block">
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="ml-auto hidden md:flex w-5 h-5 rounded-full bg-orange-500 text-black text-[10px] font-black items-center justify-center flex-shrink-0">
                  {item.badge}
                </span>
              )}
              {active === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>
        import {supabase} from './supabase'; // Dentro del sidebar, reemplaza el
        bloque de usuario:
        <div className="px-3 hidden md:block">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 text-xs font-black">A</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-200 truncate">Admin</p>
              <p className="text-[10px] text-zinc-600 truncate">
                prime.motoring
              </p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-zinc-600 font-mono">SAB 07 MAR 2026</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs text-zinc-500">En línea</span>
          </div>
        </div>
        <div className="p-6">
          <div key={active} style={{ animation: 'fadeIn 0.25s ease' }}>
            {VIEWS[active]}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.93)}      to{opacity:1;transform:scale(1)}      }
        .line-clamp-3 { display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden; }
      `}</style>
    </div>
  );
}

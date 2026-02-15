import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  Calendar, 
  TrendingDown, 
  PiggyBank, 
  Settings, 
  X, 
  RefreshCw, 
  Edit3, 
  Baby, 
  Clock,
  CheckCircle2,
  CreditCard,
  Landmark,
  Home,
  Briefcase,
  Save,
  Plane,
  Share2,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Tipos e Interfaces ---

interface Transaction {
  id: string;
  type: 'income' | 'fixed' | 'priority' | 'debt-min' | 'debt-capital' | 'savings';
  name: string;
  amount: number;
  critical?: boolean;
}

interface Period {
  dateStr: string;
  day: number;
  month: number; 
  year: number;
  transactions: Transaction[];
  endBalance: number; 
  debtStatus: { amex: number; nu: number; bogota: number; };
}

interface DebtConfig { amex: number; nu: number; bogota: number; bogotaCuota: number; }
interface FixedExpensesConfig { bebe: number; emiliano: number; internet: number; renta: number; }

// --- Constantes Iniciales (VALORES ACTUALIZADOS 15 FEB) ---

const INITIAL_INCOME = 5400000;
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const DEFAULT_DEBTS: DebtConfig = {
  amex: 1800000,      
  nu: 2000000,       
  bogota: 2599000,   
  bogotaCuota: 320000 
};

const DEFAULT_FIXED_EXPENSES: FixedExpensesConfig = {
  bebe: 300000,     
  emiliano: 100000, 
  internet: 110000, 
  renta: 1470000,   
};

// --- Helpers de Serialización para Sincronización ---

const encodeState = (debts: DebtConfig, expenses: FixedExpensesConfig, day: number, month: number) => {
  const state = { d: debts, e: expenses, dy: day, m: month };
  return btoa(JSON.stringify(state));
};

const decodeState = (hash: string) => {
  try {
    const decoded = JSON.parse(atob(hash));
    return {
      debts: decoded.d as DebtConfig,
      expenses: decoded.e as FixedExpensesConfig,
      startDay: decoded.dy as number,
      startMonth: decoded.m as number
    };
  } catch (e) {
    return null;
  }
};

const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
const getMonthShortName = (m: number) => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][m];

const getQuincenaDates = (startDay: number, startMonth: number, startYear: number = 2026) => {
  const dates = [];
  let d = startDay, m = startMonth, y = startYear;
  for (let i = 0; i < 14; i++) { 
    dates.push({ day: d, month: m, year: y });
    if (d === 5) { d = 20; } else { d = 5; m++; if (m > 11) { m = 0; y++; } }
  }
  return dates;
};

// --- Componentes ---

function VariablesEditor({ debts, expenses, startDay, startMonth, onSave, onClose }: any) {
  const [lDebts, setLDebts] = useState(debts);
  const [lExpenses, setLExpenses] = useState(expenses);
  const [lDay, setLDay] = useState(startDay);
  const [lMonth, setLMonth] = useState(startMonth);

  const Input = ({ label, icon: Icon, value, onChange, color }: any) => (
    <div className="group">
      <label className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-2 mb-1"><Icon size={12} className={color}/> {label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
        <input type="number" value={value} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mt-6 animate-in fade-in slide-in-from-top-4 shadow-2xl relative z-50">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <h3 className="text-white font-bold flex items-center gap-2"><Settings className="text-emerald-400" /> Modificar Plan de Pagos</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Próximo Movimiento</h4>
          <div className="grid grid-cols-2 gap-4">
             <select value={lMonth} onChange={e => setLMonth(Number(e.target.value))} className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 outline-none">
                {MONTH_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
             </select>
             <div className="flex bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <button onClick={() => setLDay(5)} className={`flex-1 text-xs font-bold ${lDay === 5 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Día 5</button>
                <button onClick={() => setLDay(20)} className={`flex-1 text-xs font-bold ${lDay === 20 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Día 20</button>
             </div>
          </div>
          <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider pt-4">Saldos de Deuda</h4>
          <Input label="AMEX" icon={CreditCard} value={lDebts.amex} onChange={(e:any) => setLDebts({...lDebts, amex: Number(e.target.value)})} color="text-blue-400" />
          <Input label="NU" icon={CreditCard} value={lDebts.nu} onChange={(e:any) => setLDebts({...lDebts, nu: Number(e.target.value)})} color="text-purple-400" />
          <Input label="Banco Bogotá" icon={Landmark} value={lDebts.bogota} onChange={(e:any) => setLDebts({...lDebts, bogota: Number(e.target.value)})} color="text-yellow-400" />
        </div>
        <div className="space-y-4">
          <h4 className="text-orange-400 text-xs font-bold uppercase tracking-wider">Gastos Fijos</h4>
          <Input label="Arriendo" icon={Home} value={lExpenses.renta} onChange={(e:any) => setLExpenses({...lExpenses, renta: Number(e.target.value)})} color="text-orange-400" />
          <Input label="Bebé" icon={Baby} value={lExpenses.bebe} onChange={(e:any) => setLExpenses({...lExpenses, bebe: Number(e.target.value)})} color="text-pink-400" />
          <Input label="Cuota Bogotá" icon={Briefcase} value={lDebts.bogotaCuota} onChange={(e:any) => setLDebts({...lDebts, bogotaCuota: Number(e.target.value)})} color="text-slate-400" />
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-700">
        <button onClick={onClose} className="px-4 py-2 text-slate-400 text-sm">Cerrar</button>
        <button onClick={() => { onSave(lDebts, lExpenses, lDay, lMonth); onClose(); }} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Save size={16}/> Aplicar Cambios</button>
      </div>
    </div>
  );
}

// --- App Principal ---

export default function App() {
  const [debts, setDebts] = useState<DebtConfig>(() => {
    const urlData = decodeState(window.location.hash.replace('#', ''));
    if (urlData) return urlData.debts;
    const saved = localStorage.getItem('finanzas_v4_debts');
    return saved ? JSON.parse(saved) : DEFAULT_DEBTS;
  });
  
  const [expenses, setExpenses] = useState<FixedExpensesConfig>(() => {
    const urlData = decodeState(window.location.hash.replace('#', ''));
    if (urlData) return urlData.expenses;
    const saved = localStorage.getItem('finanzas_v4_expenses');
    return saved ? JSON.parse(saved) : DEFAULT_FIXED_EXPENSES;
  });
  
  const [startDay, setStartDay] = useState<number>(() => {
    const urlData = decodeState(window.location.hash.replace('#', ''));
    if (urlData) return urlData.startDay;
    const saved = localStorage.getItem('finanzas_v4_startDay');
    return saved ? Number(saved) : 20; 
  });
  
  const [startMonth, setStartMonth] = useState<number>(() => {
    const urlData = decodeState(window.location.hash.replace('#', ''));
    if (urlData) return urlData.startMonth;
    const saved = localStorage.getItem('finanzas_v4_startMonth');
    return saved ? Number(saved) : 1; // Febrero
  });

  const [showEditor, setShowEditor] = useState(false);
  const [simulation, setSimulation] = useState<Period[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('finanzas_v4_debts', JSON.stringify(debts));
    localStorage.setItem('finanzas_v4_expenses', JSON.stringify(expenses));
    localStorage.setItem('finanzas_v4_startDay', startDay.toString());
    localStorage.setItem('finanzas_v4_startMonth', startMonth.toString());
    
    // Actualizar URL hash para sincronización fluida
    window.location.hash = encodeState(debts, expenses, startDay, startMonth);
  }, [debts, expenses, startDay, startMonth]);

  const copySyncLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  useEffect(() => {
    const dates = getQuincenaDates(startDay, startMonth);
    let dAmex = debts.amex, dNu = debts.nu, dBogota = debts.bogota;
    const newSim: Period[] = [];

    dates.forEach((d, i) => {
      const dateStr = `${d.day} ${getMonthShortName(d.month)}`;
      const inc = INITIAL_INCOME / 2;
      let cash = inc;
      const txs: Transaction[] = [];
      const isApril = d.month === 3; 
      const isMayOrLater = d.month >= 4;

      txs.push({ id: `inc-${i}`, type: 'income', name: 'Nómina', amount: inc });

      const bCost = expenses.bebe / 2; 
      cash -= bCost;
      txs.push({ id: `be-${i}`, type: 'fixed', name: 'Bebé', amount: bCost, critical: true });
      
      if (d.day === 5) { 
        cash -= expenses.emiliano + expenses.internet; 
        txs.push({ id: `ex-${i}`, type: 'fixed', name: 'Emiliano/Internet', amount: expenses.emiliano + expenses.internet });
      } else { 
        cash -= expenses.renta; 
        txs.push({ id: `re-${i}`, type: 'fixed', name: 'Arriendo', amount: expenses.renta, critical: true });
      }

      const mBogo = d.day === 5 && dBogota > 0 ? debts.bogotaCuota : 0;
      if (mBogo > 0 && cash >= mBogo) { dBogota -= mBogo; cash -= mBogo; txs.push({ id: `mb-${i}`, type: 'debt-min', name: 'Cuota Bogotá', amount: mBogo }); }

      const buffer = isApril ? 550000 : 120000; 
      let surplus = Math.max(0, cash - buffer);

      if (surplus > 0 && !isApril) {
        if (dAmex > 0) { const p = Math.min(surplus, dAmex); dAmex -= p; cash -= p; surplus -= p; txs.push({ id: `ca-${i}`, type: 'debt-capital', name: 'Abono AMEX', amount: p }); }
        if (surplus > 0 && dNu > 0) { const p = Math.min(surplus, dNu); dNu -= p; cash -= p; surplus -= p; txs.push({ id: `cn-${i}`, type: 'debt-capital', name: 'Abono NU', amount: p }); }
        if (surplus > 0 && dBogota > 0) {
            const p = Math.min(surplus, dBogota); 
            dBogota -= p; cash -= p; surplus -= p; 
            txs.push({ id: `cb-${i}`, type: 'debt-capital', name: isMayOrLater ? 'LIQUIDACIÓN BOGOTÁ' : 'Extra Bogotá', amount: p }); 
        }
      }

      if (cash > 0) { txs.push({ id: `sv-${i}`, type: 'savings', name: isApril ? 'Reserva Viaje' : 'Excedente', amount: cash }); }

      newSim.push({
        dateStr, day: d.day, month: d.month, year: d.year, 
        transactions: txs, endBalance: cash,
        debtStatus: { amex: Math.round(Math.max(0, dAmex)), nu: Math.round(Math.max(0, dNu)), bogota: Math.round(Math.max(0, dBogota)) }
      });
    });
    setSimulation(newSim);
  }, [debts, expenses, startDay, startMonth]);

  const currentTotalDebt = debts.amex + debts.nu + debts.bogota;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white pt-10 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-emerald-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
              <Clock size={14}/> 15 Feb • Guía Actualizada • Sincronización en la Nube
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Mis Finanzas 2026</h1>
            <p className="text-slate-400 font-light max-w-lg">Copia tu enlace de sincronización para acceder a tus datos desde cualquier navegador.</p>
          </div>
          <div className="flex flex-wrap gap-3 h-fit">
            <button onClick={copySyncLink} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${copySuccess ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {copySuccess ? <CheckCircle2 size={18}/> : <LinkIcon size={18}/>}
              {copySuccess ? 'Link Copiado' : 'Sincronizar Cloud'}
            </button>
            <button onClick={() => setShowEditor(!showEditor)} className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-lg active:scale-95"><Edit3 size={18}/> Editar Saldos</button>
          </div>
        </div>
        {showEditor && <VariablesEditor debts={debts} expenses={expenses} startDay={startDay} startMonth={startMonth} onSave={(d:any, e:any, day:number, m:number) => { setDebts(d); setExpenses(e); setStartDay(day); setStartMonth(m); }} onClose={() => setShowEditor(false)} />}
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <CheckCircle2 className="text-emerald-500 mb-2" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Homologación</h3>
            <div className="text-2xl font-black text-slate-800">CUBIERTA ✅</div>
            <p className="text-[10px] text-slate-400 mt-1">Fondos ya garantizados</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <TrendingDown className="text-rose-500 mb-2" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Deuda Total</h3>
            <div className="text-3xl font-black text-slate-800">{formatCOP(currentTotalDebt)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Actualizado al 15 de Febrero</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-white border border-slate-700">
            <Plane className="text-sky-400 mb-2" size={32}/>
            <h3 className="text-slate-400 text-xs font-bold uppercase">Meta Abril</h3>
            <div className="text-2xl font-black">VIAJE PROTEGIDO</div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Sin abonos a deuda este mes</p>
          </div>
        </div>

        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8">
            <Calendar className="text-indigo-600"/> Ruta Crítica de Pagos
          </h2>
          <div className="space-y-10">
            {simulation.map((p, i) => (
              <div key={i} className={`relative pl-8 md:pl-24 group ${p.month === 3 ? 'opacity-90' : ''}`}>
                <div className="absolute left-0 md:left-12 top-0 h-full w-0.5 bg-slate-100 group-last:h-8" />
                <div className={`absolute left-[-6px] md:left-[42px] top-1 w-3.5 h-3.5 rounded-full bg-white border-4 shadow-sm transition-transform ${p.month === 3 ? 'border-sky-500' : p.month === 4 ? 'border-yellow-500' : 'border-indigo-500'}`} />
                <div className="absolute left-[-80px] top-0 hidden md:block text-right w-20">
                  <div className={`text-[10px] font-black uppercase ${p.month === 3 ? 'text-sky-500' : 'text-slate-400'}`}>{getMonthShortName(p.month)}</div>
                  <div className="text-xl font-black text-slate-700">{p.day}</div>
                </div>
                
                <div className={`bg-slate-50/50 rounded-2xl border overflow-hidden transition-all hover:bg-white ${p.month === 3 ? 'border-sky-100' : 'border-slate-100'}`}>
                  <div className={`px-6 py-2 border-b flex justify-between items-center ${p.month === 3 ? 'bg-sky-50 border-sky-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{p.day === 5 ? 'Quincena 1' : 'Quincena 2'}</span>
                        {p.month === 3 && <span className="text-[9px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold">VACACIONES</span>}
                        {p.month === 4 && <span className="text-[9px] bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded-full font-bold">LIQUIDACIÓN BOGOTÁ</span>}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">{formatCOP(p.endBalance)} DISPONIBLE</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Gastos Obligatorios</h4>
                      <ul className="space-y-2">
                        {p.transactions.filter(t => ['fixed', 'debt-min'].includes(t.type)).map(t => (
                          <li key={t.id} className="flex justify-between text-xs font-medium">
                            <span className="text-slate-600">{t.name}</span>
                            <span className="text-slate-800">-{formatCOP(t.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Movimiento de Capital</h4>
                      <ul className="space-y-2">
                        {p.transactions.filter(t => ['debt-capital', 'savings'].includes(t.type)).map(t => (
                          <li key={t.id} className="flex justify-between text-xs items-center">
                            <span className={`${t.type === 'debt-capital' ? 'font-bold text-indigo-600' : 'font-bold text-emerald-600'}`}>{t.name}</span>
                            <span className="text-slate-800">{t.type === 'savings' ? '' : '-'}{formatCOP(t.amount)}</span>
                          </li>
                        ))}
                        {p.month === 3 && p.transactions.filter(t => t.type === 'debt-capital').length === 0 && (
                            <li className="text-[10px] text-sky-600 italic">Abonos pausados por viaje.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Sincronización Cloud Activa • 2026</p>
      </footer>
    </div>
  );
}
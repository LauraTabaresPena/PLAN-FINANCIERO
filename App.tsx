import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  PiggyBank, 
  Settings, 
  X, 
  RefreshCw, 
  Edit3, 
  Baby, 
  Clock,
  GraduationCap,
  CreditCard,
  Landmark,
  Home,
  Briefcase
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

// --- Constantes ---

const INITIAL_INCOME = 5400000;
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// VALORES ACTUALIZADOS
const DEFAULT_DEBTS: DebtConfig = {
  amex: 1000000,      
  nu: 2200000,       
  bogota: 2880000,   
  bogotaCuota: 320000 
};

const DEFAULT_FIXED_EXPENSES: FixedExpensesConfig = {
  bebe: 300000,     
  emiliano: 100000, 
  internet: 110000, 
  renta: 1400000,   
};

const GOALS = { homologacion: 900000 };

// --- Helpers ---

const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const getMonthShortName = (m: number) => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][m];

const getQuincenaDates = (startDay: number, startMonth: number, startYear: number = 2026) => {
  const dates = [];
  let d = startDay, m = startMonth, y = startYear;
  for (let i = 0; i < 12; i++) {
    dates.push({ day: d, month: m, year: y });
    if (d === 5) { d = 20; } else { d = 5; m++; if (m > 11) { m = 0; y++; } }
  }
  return dates;
};

// --- Componentes ---

function SavingsGrowthChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <PiggyBank className="text-emerald-500" size={20}/> Crecimiento del Ahorro
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
            <Tooltip formatter={(v: number) => formatCOP(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="Acumulado" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DebtEliminationChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <TrendingDown className="text-rose-500" size={20}/> Eliminación de Deuda
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDeuda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
            <Tooltip formatter={(v: number) => formatCOP(v)} />
            <Area type="monotone" dataKey="Deuda" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDeuda)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
        <h3 className="text-white font-bold flex items-center gap-2"><Settings className="text-emerald-400" /> Ajustar Saldos y Fecha</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Fecha de Inicio</h4>
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
          <Input label="Bebé (Mes)" icon={Baby} value={lExpenses.bebe} onChange={(e:any) => setLExpenses({...lExpenses, bebe: Number(e.target.value)})} color="text-pink-400" />
          <Input label="Cuota Bogotá" icon={Briefcase} value={lDebts.bogotaCuota} onChange={(e:any) => setLDebts({...lDebts, bogotaCuota: Number(e.target.value)})} color="text-slate-400" />
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-700">
        <button onClick={onClose} className="px-4 py-2 text-slate-400 text-sm">Cancelar</button>
        <button onClick={() => { onSave(lDebts, lExpenses, lDay, lMonth); onClose(); }} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><RefreshCw size={16}/> Recalcular</button>
      </div>
    </div>
  );
}

// --- App Principal ---

export default function App() {
  const [debts, setDebts] = useState<DebtConfig>(DEFAULT_DEBTS);
  const [expenses, setExpenses] = useState<FixedExpensesConfig>(DEFAULT_FIXED_EXPENSES);
  const [startDay, setStartDay] = useState(20);
  const [startMonth, setStartMonth] = useState(0); // Inicia 20 Enero
  const [showEditor, setShowEditor] = useState(false);
  const [simulation, setSimulation] = useState<Period[]>([]);

  useEffect(() => {
    const dates = getQuincenaDates(startDay, startMonth);
    // Clonamos saldos iniciales para la simulación
    let curHomologacion = GOALS.homologacion;
    let dAmex = debts.amex;
    let dNu = debts.nu;
    let dBogota = debts.bogota;

    const newSim: Period[] = [];

    dates.forEach((d, i) => {
      const dateStr = `${d.day} ${getMonthShortName(d.month)}`;
      const inc = INITIAL_INCOME / 2;
      let cash = inc;
      const txs: Transaction[] = [];

      txs.push({ id: `inc-${i}`, type: 'income', name: 'Nómina', amount: inc });

      // 1. Gastos Fijos
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

      // 2. Prioridad Absoluta: Homologación (Urgente)
      if (curHomologacion > 0) {
        const pay = Math.min(cash, curHomologacion);
        if (pay > 0) { 
            curHomologacion -= pay; 
            cash -= pay; 
            txs.push({ id: `ho-${i}`, type: 'priority', name: 'Homologación', amount: pay, critical: true }); 
        }
      }

      // 3. Cuotas Mínimas (Para no quedar en mora)
      // AMEX (1M): Intentamos pagarla toda de una vez si es posible, sino mínimo.
      // NU: Mínimo si es dia 20.
      // Bogotá: Cuota fija dia 5.

      const mBogo = d.day === 5 && dBogota > 0 ? debts.bogotaCuota : 0;
      if (mBogo > 0 && cash >= mBogo) { 
          dBogota -= mBogo; 
          cash -= mBogo; 
          txs.push({ id: `mb-${i}`, type: 'debt-min', name: 'Cuota Bogotá', amount: mBogo }); 
      }

      // 4. Estrategia de Capital (Abonos)
      // Prioridad: AMEX (1M) -> NU -> Bogotá
      const buffer = 150000; // Un pequeño colchón por si acaso
      let surplus = Math.max(0, cash - buffer);

      if (surplus > 0) {
        // Pagar AMEX (Es pequeña, 1M, se va rápido)
        if (dAmex > 0) { 
            const p = Math.min(surplus, dAmex); 
            dAmex -= p; 
            cash -= p; 
            surplus -= p; 
            txs.push({ id: `ca-${i}`, type: 'debt-capital', name: 'Pago AMEX', amount: p }); 
        }
        
        // Pagar NU
        if (surplus > 0 && dNu > 0) { 
            const p = Math.min(surplus, dNu); 
            dNu -= p; 
            cash -= p; 
            surplus -= p; 
            txs.push({ id: `cn-${i}`, type: 'debt-capital', name: 'Abono NU', amount: p }); 
        }
        
        // Pagar Bogotá (Si sobra algo despues de AMEX y NU)
        if (surplus > 0 && dBogota > 0) { 
            const p = Math.min(surplus, dBogota); 
            dBogota -= p; 
            cash -= p; 
            txs.push({ id: `cb-${i}`, type: 'debt-capital', name: 'Abono Bogotá', amount: p }); 
        }
      }

      // 5. Saldo final
      if (cash > 0) { 
          const isDebtFree = (dAmex + dNu + dBogota) <= 1000;
          txs.push({ id: `sv-${i}`, type: 'savings', name: isDebtFree ? 'Ahorro Real' : 'Caja Disponible', amount: cash }); 
      }

      newSim.push({
        dateStr, day: d.day, month: d.month, year: d.year, 
        transactions: txs, endBalance: cash,
        debtStatus: { amex: Math.round(Math.max(0, dAmex)), nu: Math.round(Math.max(0, dNu)), bogota: Math.round(Math.max(0, dBogota)) }
      });
    });
    setSimulation(newSim);
  }, [debts, expenses, startDay, startMonth]);

  // Cálculo de totales ACTUALES (para las tarjetas superiores)
  const currentTotalDebt = debts.amex + debts.nu + debts.bogota;

  const chartData = simulation.map(p => ({ name: p.dateStr, Deuda: p.debtStatus.amex + p.debtStatus.nu + p.debtStatus.bogota }));
  const savingsData = useMemo(() => {
    let acc = 0; return simulation.map(p => { acc += p.transactions.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0); return { name: p.dateStr, Acumulado: acc }; });
  }, [simulation]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white pt-10 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-emerald-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
              <Clock size={14}/> Iniciando {startDay} de {MONTH_NAMES[startMonth]}
            </div>
            <h1 className="text-4xl font-black mb-2">Guía Financiera 2026</h1>
            <p className="text-slate-400 font-light max-w-lg">Plan optimizado: Cero intereses, pagos directos a capital y prioridad en homologación.</p>
          </div>
          <div className="flex gap-3 h-fit">
            <button onClick={() => setShowEditor(!showEditor)} className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all"><Edit3 size={18}/> Editar Saldos</button>
          </div>
        </div>
        {showEditor && <VariablesEditor debts={debts} expenses={expenses} startDay={startDay} startMonth={startMonth} onSave={(d:any, e:any, day:number, m:number) => { setDebts(d); setExpenses(e); setStartDay(day); setStartMonth(m); }} onClose={() => setShowEditor(false)} />}
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <GraduationCap className="text-indigo-600 mb-4" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Meta Homologación</h3>
            <div className="text-3xl font-black text-slate-800">{formatCOP(GOALS.homologacion)}</div>
            <p className="text-[10px] text-slate-400 mt-2">Valor fijo a pagar</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <TrendingDown className="text-rose-500 mb-4" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Deuda Total Actual</h3>
            <div className="text-3xl font-black text-slate-800">{formatCOP(currentTotalDebt)}</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3"><div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} /></div>
            <p className="text-[10px] text-slate-400 mt-2">Saldo al día de hoy</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-white">
            <Wallet className="text-emerald-400 mb-4" size={32}/>
            <h3 className="text-slate-400 text-xs font-bold uppercase">Nómina Mensual</h3>
            <div className="text-3xl font-black">{formatCOP(INITIAL_INCOME)}</div>
            <p className="text-[10px] text-slate-500 mt-2">Base de cálculo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DebtEliminationChart data={chartData} />
          <SavingsGrowthChart data={savingsData} />
        </div>

        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Calendar className="text-indigo-600"/> Cronograma de Pagos</h2>
          <div className="space-y-12">
            {simulation.map((p, i) => (
              <div key={i} className="relative pl-8 md:pl-24 group">
                <div className="absolute left-0 md:left-12 top-0 h-full w-0.5 bg-slate-100 group-last:h-8" />
                <div className="absolute left-[-6px] md:left-[42px] top-1 w-3.5 h-3.5 rounded-full bg-white border-4 border-indigo-500 shadow-sm" />
                <div className="absolute left-[-80px] top-0 hidden md:block text-right w-20">
                  <div className="text-[10px] font-black uppercase text-slate-400">{getMonthShortName(p.month)}</div>
                  <div className="text-xl font-black text-slate-700">{p.day}</div>
                </div>
                
                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="px-6 py-3 bg-white border-b border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{p.day === 5 ? 'Quincena 1' : 'Quincena 2'}</span>
                    <span className="text-xs font-medium text-slate-500">Saldo a favor: <span className="text-emerald-600 font-black">{formatCOP(p.endBalance)}</span></span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Obligatorio</h4>
                      <ul className="space-y-3">
                        {p.transactions.filter(t => ['fixed', 'priority', 'debt-min'].includes(t.type)).map(t => (
                          <li key={t.id} className="flex justify-between text-sm">
                            <span className={`${t.type === 'priority' ? 'font-black text-indigo-700' : 'text-slate-600'} flex items-center gap-2`}>
                               {t.name}
                            </span>
                            <span className="font-mono text-slate-800">-{formatCOP(t.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Estrategia Capital</h4>
                      <ul className="space-y-3">
                        {p.transactions.filter(t => ['debt-capital', 'savings'].includes(t.type)).map(t => (
                          <li key={t.id} className="flex justify-between text-sm">
                            <span className={`${t.type === 'debt-capital' ? 'font-bold text-purple-700' : 'text-teal-700 font-bold'}`}>{t.name}</span>
                            <span className="font-mono text-slate-800">{t.type === 'savings' ? '' : '-'}{formatCOP(t.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
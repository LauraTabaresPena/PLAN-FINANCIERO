import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  TrendingDown, 
  PiggyBank, 
  Settings, 
  X, 
  Edit3, 
  Baby, 
  Clock,
  CheckCircle2,
  CreditCard,
  Landmark,
  Home,
  Briefcase,
  Save,
  Link as LinkIcon,
  Search,
  ArrowUpDown,
  Filter,
  TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  debtStatus: { amex: number; nu: number; bogota: number; celular: number; };
}

interface DebtConfig { amex: number; nu: number; bogota: number; bogotaCuota: number; celular: number; }
interface FixedExpensesConfig { bebe: number; emiliano: number; internet: number; renta: number; seguridadSocial: number; gaseosas: number; }

// --- Constantes Iniciales (VALORES ORIGINALES RESTAURADOS) ---

const INITIAL_INCOME = 5400000;
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const DEFAULT_DEBTS: DebtConfig = {
  amex: 1680000,      
  nu: 1551000,       
  bogota: 2000000,   
  bogotaCuota: 320000,
  celular: 850000
};

const DEFAULT_FIXED_EXPENSES: FixedExpensesConfig = {
  bebe: 300000,     
  emiliano: 100000, 
  internet: 110000, 
  renta: 1400000,
  seguridadSocial: 150000,
  gaseosas: 100000
};

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

const getQuincenaDates = () => {
  const dates = [];
  // Force start from March (index 2)
  let m = 2; 
  let d = 20;
  let y = 2026;

  // Proyectar hasta el 20 de Agosto (mes 7)
  while (!(y === 2026 && m === 8 && d === 5)) { 
    dates.push({ day: d, month: m, year: y });
    if (d === 5) { 
      d = 20; 
    } else { 
      d = 5; 
      m++; 
      if (m > 11) { m = 0; y++; } 
    }
  }
  return dates;
};

// --- Componentes ---

function VariablesEditor({ debts, expenses, onSave, onClose }: any) {
  const [lDebts, setLDebts] = useState(debts);
  const [lExpenses, setLExpenses] = useState(expenses);

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
        <h3 className="text-white font-bold flex items-center gap-2"><Settings className="text-emerald-400" /> Modificar Saldos y Gastos</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Saldos de Deuda</h4>
          <Input label="AMEX" icon={CreditCard} value={lDebts.amex} onChange={(e:any) => setLDebts({...lDebts, amex: Number(e.target.value)})} color="text-blue-400" />
          <Input label="NU" icon={CreditCard} value={lDebts.nu} onChange={(e:any) => setLDebts({...lDebts, nu: Number(e.target.value)})} color="text-purple-400" />
          <Input label="Banco Bogotá" icon={Landmark} value={lDebts.bogota} onChange={(e:any) => setLDebts({...lDebts, bogota: Number(e.target.value)})} color="text-yellow-400" />
          <Input label="Celular" icon={CreditCard} value={lDebts.celular} onChange={(e:any) => setLDebts({...lDebts, celular: Number(e.target.value)})} color="text-emerald-400" />
        </div>
        <div className="space-y-4">
          <h4 className="text-orange-400 text-xs font-bold uppercase tracking-wider">Gastos Fijos</h4>
          <Input label="Arriendo" icon={Home} value={lExpenses.renta} onChange={(e:any) => setLExpenses({...lExpenses, renta: Number(e.target.value)})} color="text-orange-400" />
          <Input label="Bebé" icon={Baby} value={lExpenses.bebe} onChange={(e:any) => setLExpenses({...lExpenses, bebe: Number(e.target.value)})} color="text-pink-400" />
          <Input label="Seguridad Social" icon={Briefcase} value={lExpenses.seguridadSocial} onChange={(e:any) => setLExpenses({...lExpenses, seguridadSocial: Number(e.target.value)})} color="text-blue-400" />
          <Input label="Gaseosas" icon={Briefcase} value={lExpenses.gaseosas} onChange={(e:any) => setLExpenses({...lExpenses, gaseosas: Number(e.target.value)})} color="text-emerald-400" />
          <Input label="Cuota Bogotá" icon={Briefcase} value={lDebts.bogotaCuota} onChange={(e:any) => setLDebts({...lDebts, bogotaCuota: Number(e.target.value)})} color="text-slate-400" />
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-700">
        <button onClick={onClose} className="px-4 py-2 text-slate-400 text-sm">Cerrar</button>
        <button onClick={() => { onSave(lDebts, lExpenses); onClose(); }} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Save size={16}/> Aplicar Cambios</button>
      </div>
    </div>
  );
}

// --- Sub-Componentes ---

function TransactionTable({ simulation }: { simulation: Period[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'dateRaw', direction: 'asc' });

  // Flatten the data for the table
  const flatTransactions = useMemo(() => {
    return simulation.flatMap((period, pIdx) => 
      period.transactions.map((t, tIdx) => ({
        ...t,
        dateStr: period.dateStr,
        dateRaw: pIdx, // Use index as chronological proxy
        uniqueId: `${period.year}-${period.month}-${period.day}-${tIdx}`
      }))
    );
  }, [simulation]);

  // Filter and Sort
  const processedData = useMemo(() => {
    let data = [...flatTransactions];

    // Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(t => 
        t.name.toLowerCase().includes(lower) || 
        t.dateStr.toLowerCase().includes(lower)
      );
    }
    if (filterType !== 'all') {
      data = data.filter(t => t.type === filterType);
    }

    // Sort
    data.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [flatTransactions, searchTerm, filterType, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'income': 'Ingreso',
      'fixed': 'Gasto Fijo',
      'priority': 'Prioridad',
      'debt-min': 'Deuda (Mín)',
      'debt-capital': 'Abono Capital',
      'savings': 'Ahorro'
    };
    return map[type] || type;
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'income': 'bg-emerald-100 text-emerald-800',
      'fixed': 'bg-slate-100 text-slate-800',
      'priority': 'bg-blue-100 text-blue-800',
      'debt-min': 'bg-orange-100 text-orange-800',
      'debt-capital': 'bg-purple-100 text-purple-800',
      'savings': 'bg-green-100 text-green-800'
    };
    return map[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <Filter size={18} className="text-slate-500" />
           Explorador de Movimientos
        </h3>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar concepto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-48"
              />
           </div>
           
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
           >
             <option value="all">Todos los tipos</option>
             <option value="income">Ingresos</option>
             <option value="fixed">Gastos Fijos</option>
             <option value="priority">Prioritarios</option>
             <option value="debt-min">Cuotas Deuda</option>
             <option value="debt-capital">Abonos Capital</option>
             <option value="savings">Ahorro</option>
           </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('dateRaw')}>
                <div className="flex items-center gap-1">Fecha <ArrowUpDown size={14} /></div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('name')}>
                <div className="flex items-center gap-1">Concepto <ArrowUpDown size={14} /></div>
              </th>
              <th scope="col" className="px-6 py-3">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('amount')}>
                <div className="flex items-center justify-end gap-1">Monto <ArrowUpDown size={14} /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((t) => (
              <tr key={t.uniqueId} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {t.dateStr}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {t.name}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(t.type)}`}>
                    {getTypeLabel(t.type)}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCOP(t.amount)}
                </td>
              </tr>
            ))}
            {processedData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No se encontraron transacciones con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
         <span>Mostrando {processedData.length} movimientos</span>
         <span>Total filtrado: {formatCOP(processedData.reduce((acc, curr) => acc + (curr.type === 'income' ? 0 : curr.amount), 0))} (Salidas)</span>
      </div>
    </div>
  );
}

// --- App Principal ---

export default function App() {
  const [debts, setDebts] = useState<DebtConfig>(() => {
    const urlData = decodeState(window.location.hash.replace('#', ''));
    if (urlData) return { ...DEFAULT_DEBTS, ...urlData.debts };
    const saved = localStorage.getItem('finanzas_v4_debts');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_DEBTS, ...parsed };
    }
    return DEFAULT_DEBTS;
  });
  
  const [expenses, setExpenses] = useState<FixedExpensesConfig>(() => {
    const urlData = decodeState(window.location.hash.replace('#', ''));
    if (urlData) return { ...DEFAULT_FIXED_EXPENSES, ...urlData.expenses };
    const saved = localStorage.getItem('finanzas_v4_expenses');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_FIXED_EXPENSES, ...parsed };
    }
    return DEFAULT_FIXED_EXPENSES;
  });
  
  // Configuración de inicio fija (Marzo 20, 2026)
  const START_DAY = 20;
  const START_MONTH = 2;

  const [showEditor, setShowEditor] = useState(false);
  const [simulation, setSimulation] = useState<Period[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('finanzas_v4_debts', JSON.stringify(debts));
    localStorage.setItem('finanzas_v4_expenses', JSON.stringify(expenses));
    
    // Actualizar URL hash para sincronización fluida
    window.location.hash = encodeState(debts, expenses, START_DAY, START_MONTH);
  }, [debts, expenses]);

  const copySyncLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  useEffect(() => {
    const dates = getQuincenaDates();
    let dAmex = debts.amex || 0;
    let dNu = debts.nu || 0;
    let dBogota = debts.bogota || 0;
    let dCelular = debts.celular || 0;
    const newSim: Period[] = [];

    dates.forEach((d, i) => {
      const dateStr = `${d.day} ${getMonthShortName(d.month)}`;
      const inc = INITIAL_INCOME / 2;
      let cash = inc;
      const txs: Transaction[] = [];
      const isApril = d.month === 3;
      const isJuneOrEarlier = d.month <= 5;

      txs.push({ id: `inc-${i}`, type: 'income', name: 'Nómina', amount: inc });

      // 1. Gastos Fijos (Prioridad Absoluta)
      const bCost = (expenses.bebe || 0) / 2; 
      cash -= bCost;
      txs.push({ id: `be-${i}`, type: 'fixed', name: 'Bebé', amount: bCost, critical: true });
      
      const gasCost = (expenses.gaseosas || 0) / 2;
      cash -= gasCost;
      txs.push({ id: `gas-${i}`, type: 'fixed', name: 'Gaseosas', amount: gasCost });

      if (d.day === 20) {
        const ssCost = expenses.seguridadSocial || 0;
        cash -= ssCost;
        txs.push({ id: `ss-${i}`, type: 'fixed', name: 'Seguridad Social Alejo', amount: ssCost });
      }

      if (d.day === 5) { 
        const fixed5 = (expenses.emiliano || 0) + (expenses.internet || 0);
        cash -= fixed5; 
        txs.push({ id: `ex-${i}`, type: 'fixed', name: 'Emiliano/Internet', amount: fixed5 });
      } else { 
        const rentaCost = expenses.renta || 0;
        cash -= rentaCost; 
        txs.push({ id: `re-${i}`, type: 'fixed', name: 'Arriendo', amount: rentaCost, critical: true });
      }

      // 3. Deudas (Mínimos)
      const mBogo = d.day === 5 && dBogota > 0 ? (debts.bogotaCuota || 0) : 0;
      if (mBogo > 0 && cash >= mBogo) { 
        dBogota -= mBogo; 
        cash -= mBogo; 
        txs.push({ id: `mb-${i}`, type: 'debt-min', name: 'Cuota Bogotá', amount: mBogo }); 
      }

      // 4. Abonos a Capital (Snowball)
      // En Abril se prioriza el viaje
      const buffer = isApril ? 500000 : 100000; 
      let surplus = Math.max(0, cash - buffer);

      if (surplus > 0 && !isApril) {
        // Distribuir el excedente equitativamente entre las deudas activas
        let payments = { amex: 0, nu: 0, celular: 0, bogota: 0 };
        let activeKeys = [];
        
        if (dAmex > 0) activeKeys.push('amex');
        if (dNu > 0) activeKeys.push('nu');
        
        // Celular recibe abonos a capital solo después de Mayo (mes 4)
        if (dCelular > 0 && d.month > 4) activeKeys.push('celular');
        
        // Bogotá recibe abonos a capital solo si las tarjetas ya se pagaron, o si estamos en Junio/Julio
        const tarjetasPagadas = dAmex <= 0.01 && dNu <= 0.01;
        const esJunioJulio = d.month === 5 || d.month === 6;
        
        if (dBogota > 0 && (tarjetasPagadas || esJunioJulio)) {
          activeKeys.push('bogota');
        }

        while (surplus > 0.01 && activeKeys.length > 0) {
          let share = surplus / activeKeys.length;
          let remainingKeys = [];
          
          for (let key of activeKeys) {
            let p = 0;
            if (key === 'amex') {
              p = Math.min(share, dAmex);
              dAmex -= p; payments.amex += p;
              if (dAmex > 0.01) remainingKeys.push('amex');
            } else if (key === 'nu') {
              p = Math.min(share, dNu);
              dNu -= p; payments.nu += p;
              if (dNu > 0.01) remainingKeys.push('nu');
            } else if (key === 'celular') {
              p = Math.min(share, dCelular);
              dCelular -= p; payments.celular += p;
              if (dCelular > 0.01) remainingKeys.push('celular');
            } else if (key === 'bogota') {
              p = Math.min(share, dBogota);
              dBogota -= p; payments.bogota += p;
              if (dBogota > 0.01) remainingKeys.push('bogota');
            }
            surplus -= p;
            cash -= p;
          }
          activeKeys = remainingKeys;
        }

        if (payments.amex > 0) txs.push({ id: `ca-${i}`, type: 'debt-capital', name: 'Abono AMEX', amount: payments.amex });
        if (payments.nu > 0) txs.push({ id: `cn-${i}`, type: 'debt-capital', name: 'Abono NU', amount: payments.nu });
        if (payments.celular > 0) txs.push({ id: `cc-${i}`, type: 'debt-capital', name: 'Abono Celular', amount: payments.celular });
        if (payments.bogota > 0) txs.push({ id: `cb-${i}`, type: 'debt-capital', name: 'Abono Bogotá', amount: payments.bogota });
      }

      // 5. Ahorro / Bolsita
      if (cash > 0) { 
        txs.push({ id: `sv-${i}`, type: 'savings', name: isApril ? 'Reserva Viaje' : 'Bolsita de Ahorro', amount: cash }); 
      }

      newSim.push({
        dateStr, day: d.day, month: d.month, year: d.year, 
        transactions: txs, endBalance: cash,
        debtStatus: { 
          amex: Math.round(Math.max(0, dAmex || 0)), 
          nu: Math.round(Math.max(0, dNu || 0)), 
          bogota: Math.round(Math.max(0, dBogota || 0)),
          celular: Math.round(Math.max(0, dCelular || 0)) 
        }
      });
    });
    setSimulation(newSim);
  }, [debts, expenses]);

  const currentTotalDebt = debts.amex + debts.nu + debts.bogota + debts.celular;

  const savingsData = useMemo(() => {
    let cumulative = 0;
    return simulation.map(p => {
      const periodSavings = p.transactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0);
      cumulative += periodSavings;
      return {
        name: p.dateStr,
        ahorro: cumulative,
        periodo: periodSavings
      };
    });
  }, [simulation]);

  const monthlySavings = useMemo(() => {
    const months: Record<string, number> = {};
    simulation.forEach(p => {
      const periodSavings = p.transactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthName = MONTH_NAMES[p.month];
      months[monthName] = (months[monthName] || 0) + periodSavings;
    });
    return Object.entries(months).map(([name, total]) => ({ name, total }));
  }, [simulation]);

  const totalSavings = savingsData.length > 0 ? savingsData[savingsData.length - 1].ahorro : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white pt-10 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-emerald-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
              <Clock size={14}/> 18 Mar • Planificación Activa • Proyecciones 2026
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
        {showEditor && <VariablesEditor debts={debts} expenses={expenses} onSave={(d:any, e:any) => { setDebts(d); setExpenses(e); }} onClose={() => setShowEditor(false)} />}
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <CreditCard className="text-emerald-500 mb-2" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Deuda Celular</h3>
            <div className="text-2xl font-black text-slate-800">
              {simulation.length > 0 && simulation[simulation.length - 1].debtStatus.celular === 0 ? 'PAGADO ✅' : formatCOP(debts.celular)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Meta de pago inmediato</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <TrendingDown className="text-rose-500 mb-2" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Deuda Total</h3>
            <div className="text-2xl font-black text-slate-800">{formatCOP(currentTotalDebt)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Tarjetas + Bogotá + Celular</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-white border border-slate-700">
            <TrendingUp className="text-emerald-400 mb-2" size={32}/>
            <h3 className="text-slate-400 text-xs font-bold uppercase">Ahorro Acumulado</h3>
            <div className="text-2xl font-black">{formatCOP(totalSavings)}</div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Bolsita Proyectada</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <PiggyBank className="text-indigo-500 mb-2" size={32}/>
            <h3 className="text-slate-500 text-xs font-bold uppercase">Bolsita Final</h3>
            <div className="text-2xl font-black text-slate-800">{formatCOP(totalSavings)}</div>
            <p className="text-[10px] text-slate-400 mt-1">Excedente al 20 de Septiembre</p>
          </div>
        </div>

        {/* Sección de Ahorros */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <PiggyBank className="text-emerald-600"/> Bolsita de Ahorro
              </h2>
              <p className="text-xs text-slate-500 mt-1">Acumulado proyectado de excedentes quincenales</p>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Proyectado</span>
              <span className="text-xl font-black text-emerald-600">{formatCOP(totalSavings)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsData}>
                  <defs>
                    <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: number) => [formatCOP(value), 'Ahorro Acumulado']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="ahorro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAhorro)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ahorro por Mes</h4>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                {monthlySavings.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-700">{m.name}</span>
                    <span className="text-sm font-black text-emerald-600">+{formatCOP(m.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8">
            <Calendar className="text-indigo-600"/> Ruta Crítica de Pagos
          </h2>
          <div className="space-y-10">
            {simulation.map((p, i) => (
              <div key={i} className={`relative pl-8 md:pl-24 group ${p.month === 3 ? 'opacity-90' : ''}`}>
                <div className="absolute left-0 md:left-12 top-0 h-full w-0.5 bg-slate-100 group-last:h-8" />
                <div className={`absolute left-[-6px] md:left-[42px] top-1 w-3.5 h-3.5 rounded-full bg-white border-4 shadow-sm transition-transform ${p.month === 3 ? 'border-sky-500' : 'border-indigo-500'}`} />
                <div className="absolute left-[-80px] top-0 hidden md:block text-right w-20">
                  <div className={`text-[10px] font-black uppercase ${p.month === 3 ? 'text-sky-500' : 'text-slate-400'}`}>{getMonthShortName(p.month)}</div>
                  <div className="text-xl font-black text-slate-700">{p.day}</div>
                </div>
                
                <div className={`bg-slate-50/50 rounded-2xl border overflow-hidden transition-all hover:bg-white ${p.month === 3 ? 'border-sky-100' : 'border-slate-100'}`}>
                  <div className={`px-6 py-2 border-b flex justify-between items-center ${p.month === 3 ? 'bg-sky-50 border-sky-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{p.day === 5 ? 'Quincena 1' : 'Quincena 2'}</span>
                        {p.month === 3 && <span className="text-[9px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold uppercase">Mes de Viaje ✈️</span>}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">{formatCOP(p.endBalance)} DISPONIBLE</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Gastos Obligatorios</h4>
                      <ul className="space-y-2">
                        {p.transactions.filter(t => ['fixed', 'debt-min', 'priority'].includes(t.type)).map(t => (
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

        {/* Tabla de Transacciones */}
        <section className="pb-12">
           <TransactionTable simulation={simulation} />
        </section>
      </main>
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Sincronización Cloud Activa • 2026</p>
      </footer>
    </div>
  );
}
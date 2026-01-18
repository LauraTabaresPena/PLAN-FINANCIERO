import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Download, 
  Printer,
  ArrowRight,
  TrendingUp,
  Search,
  ArrowUpDown,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Home,
  CreditCard,
  Briefcase,
  Landmark,
  Percent,
  Settings,
  Save,
  X,
  RefreshCw,
  Edit3,
  Baby,
  Wifi,
  ChevronRight,
  Target,
  GraduationCap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Types & Constants ---

interface Transaction {
  id: string;
  type: 'income' | 'fixed' | 'priority' | 'debt-min' | 'debt-capital' | 'savings' | 'interest';
  name: string;
  amount: number;
  critical?: boolean;
}

interface Period {
  dateStr: string;
  day: number;
  month: number; // 0-indexed (0 = Jan)
  year: number;
  totalIncome: number;
  transactions: Transaction[];
  endBalance: number; // Cash left over (savings/buffer)
  debtStatus: {
    amex: number;
    nu: number;
    bogota: number;
  };
  goalsStatus: {
    homologacion: number; // Remaining
  };
}

interface DebtConfig {
  amex: number;
  nu: number;
  bogota: number;
  bogotaCuota: number;
}

interface FixedExpensesConfig {
  bebe: number;
  emiliano: number;
  internet: number;
  renta: number;
}

// Configuración Inicial según requerimientos del usuario
const INITIAL_INCOME = 5400000;

// Gastos Fijos
const DEFAULT_FIXED_EXPENSES: FixedExpensesConfig = {
  bebe: 300000,     // Se divide en 2 quincenas
  emiliano: 100000, // Pago único (Asumimos día 5 por flujo de caja)
  internet: 110000, // Pago único (Asumimos día 5)
  renta: 1400000,   // Pago único día 20 (Inamovible)
};

// Deudas Iniciales
const DEFAULT_DEBTS: DebtConfig = {
  amex: 600000,      // Pagar día 5
  nu: 2200000,       // Pagar día 20
  bogota: 3170000,   // Crédito total
  bogotaCuota: 320000 // Cuota mínima día 5
};

const GOALS = {
  homologacion: 900000, // Prioridad Enero
};

// --- Helper Functions ---

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getQuincenaDates = () => {
  const dates = [];
  const startYear = 2026;
  
  // Ajuste: Iniciar desde el 20 de Enero ya que el 5 de Enero pasó.
  dates.push({ day: 20, month: 0, year: startYear });

  // Simulamos hasta Junio (mes 5)
  for (let month = 1; month <= 6; month++) {
    dates.push({ day: 5, month, year: startYear });
    dates.push({ day: 20, month, year: startYear });
  }
  return dates;
};

const getMonthName = (monthIndex: number) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return months[monthIndex];
};

// --- Sub-Components ---

/**
 * Visualizes the month-over-month accumulated savings growth.
 */
function SavingsGrowthChart({ data }: { data: { name: string, Acumulado: number }[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <PiggyBank className="text-emerald-500" size={20}/>
          Crecimiento del Ahorro
        </h2>
        <p className="text-xs text-slate-400 mt-1">Capital acumulado proyectado mes a mes</p>
      </div>
      <div className="h-64 w-full relative min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} stroke="#94a3b8" />
            <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
            <Tooltip 
              cursor={{ fill: '#f8fafc', radius: 4 }}
              formatter={(value: number) => [formatCOP(value), "Acumulado"]}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
            />
            <Bar 
              dataKey="Acumulado" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              barSize={40}
              className="hover:fill-emerald-400 transition-colors"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Visualizes the Systematic Debt Elimination curve.
 */
function DebtEliminationChart({ data }: { data: { name: string, Deuda: number }[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <TrendingDown className="text-rose-500" size={20}/>
          Curva de Eliminación de Deuda
        </h2>
        <p className="text-xs text-slate-400 mt-1">Proyección quincenal de reducción de pasivos</p>
      </div>
      <div className="h-64 w-full relative min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDeuda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} stroke="#94a3b8" />
            <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
            <Tooltip 
              formatter={(value: number) => [formatCOP(value), "Deuda Total"]}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
            />
            <Area type="monotone" dataKey="Deuda" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDeuda)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VariablesEditor({ 
  currentDebts, 
  currentExpenses,
  onSave, 
  onClose 
}: { 
  currentDebts: DebtConfig; 
  currentExpenses: FixedExpensesConfig;
  onSave: (newDebts: DebtConfig, newExpenses: FixedExpensesConfig) => void;
  onClose: () => void;
}) {
  const [localDebts, setLocalDebts] = useState<DebtConfig>(currentDebts);
  const [localExpenses, setLocalExpenses] = useState<FixedExpensesConfig>(currentExpenses);

  const handleDebtChange = (key: keyof DebtConfig, value: string) => {
    setLocalDebts(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleExpenseChange = (key: keyof FixedExpensesConfig, value: string) => {
    setLocalExpenses(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localDebts, localExpenses);
    onClose();
  };

  const InputField = ({ label, icon: Icon, value, onChange, colorClass }: any) => (
    <div className="group">
      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider flex items-center gap-2 mb-1 group-focus-within:text-white transition-colors">
        <Icon size={12} className={colorClass}/> {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-light">$</span>
        <input 
          type="number" 
          value={value}
          onChange={onChange}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-7 pr-3 text-white text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono shadow-inner"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4 relative z-10">
        <div>
           <h3 className="text-white font-bold flex items-center gap-2 text-xl">
            <Settings className="text-emerald-400" />
            Ajustar Variables
          </h3>
          <p className="text-slate-400 text-xs mt-1">Modifica los saldos iniciales o gastos recurrentes.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-all">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="space-y-5">
                <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-emerald-500/20 pb-2 mb-4 flex justify-between items-center">
                    <span>Deudas Actuales</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">A Pagar</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField 
                        label="AMEX (Total)" 
                        icon={CreditCard} 
                        colorClass="text-blue-400"
                        value={localDebts.amex}
                        onChange={(e: any) => handleDebtChange('amex', e.target.value)}
                    />
                    <InputField 
                        label="NU (Total)" 
                        icon={CreditCard} 
                        colorClass="text-purple-400"
                        value={localDebts.nu}
                        onChange={(e: any) => handleDebtChange('nu', e.target.value)}
                    />
                    <InputField 
                        label="Crédito Bogotá (Total)" 
                        icon={Landmark} 
                        colorClass="text-yellow-400"
                        value={localDebts.bogota}
                        onChange={(e: any) => handleDebtChange('bogota', e.target.value)}
                    />
                    <InputField 
                        label="Cuota Fija Bogotá" 
                        icon={Briefcase} 
                        colorClass="text-slate-400"
                        value={localDebts.bogotaCuota}
                        onChange={(e: any) => handleDebtChange('bogotaCuota', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-5">
                 <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest border-b border-orange-500/20 pb-2 mb-4 flex justify-between items-center">
                    <span>Gastos Fijos</span>
                    <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-[10px]">Mensuales</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField 
                        label="Bebé (Total Mes)" 
                        icon={Baby} 
                        colorClass="text-pink-400"
                        value={localExpenses.bebe}
                        onChange={(e: any) => handleExpenseChange('bebe', e.target.value)}
                    />
                    <InputField 
                        label="Arriendo (Día 20)" 
                        icon={Home} 
                        colorClass="text-orange-400"
                        value={localExpenses.renta}
                        onChange={(e: any) => handleExpenseChange('renta', e.target.value)}
                    />
                    <InputField 
                        label="Internet" 
                        icon={Wifi} 
                        colorClass="text-cyan-400"
                        value={localExpenses.internet}
                        onChange={(e: any) => handleExpenseChange('internet', e.target.value)}
                    />
                    <InputField 
                        label="Emiliano" 
                        icon={Baby} 
                        colorClass="text-indigo-400"
                        value={localExpenses.emiliano}
                        onChange={(e: any) => handleExpenseChange('emiliano', e.target.value)}
                    />
                </div>
            </div>

        </div>

        <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-slate-700/50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={18} className="animate-pulse-slow" />
            Recalcular Plan
          </button>
        </div>
      </form>
    </div>
  );
}

function TransactionTable({ simulation }: { simulation: Period[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const groupedData = useMemo(() => {
    return simulation.map(period => {
      let filteredTransactions = period.transactions;

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filteredTransactions = filteredTransactions.filter(t => 
          t.name.toLowerCase().includes(lower)
        );
      }

      if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
      }

      const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
      const expenses = filteredTransactions.filter(t => t.type !== 'income').reduce((acc, curr) => acc + curr.amount, 0);

      return {
        ...period,
        visibleTransactions: filteredTransactions,
        periodStats: { income, expenses }
      };
    }).filter(p => p.visibleTransactions.length > 0);
  }, [simulation, searchTerm, filterType]);


  const getIconForType = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpCircle size={20} className="text-emerald-500" />;
      case 'fixed': return <Home size={18} className="text-slate-400" />;
      case 'priority': return <AlertCircle size={18} className="text-indigo-500" />;
      case 'debt-min': return <CreditCard size={18} className="text-orange-500" />;
      case 'interest': return <Percent size={18} className="text-orange-400" />;
      case 'debt-capital': return <TrendingDown size={18} className="text-purple-500" />;
      case 'savings': return <Wallet size={18} className="text-teal-600" />;
      default: return <Briefcase size={18} className="text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'income': 'Ingreso Nómina',
      'fixed': 'Gasto Fijo',
      'priority': 'Prioridad Única',
      'debt-min': 'Cuota Obligatoria',
      'interest': 'Intereses',
      'debt-capital': 'Abono a Capital',
      'savings': 'Saldo a Favor'
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-30 transition-all duration-300 hover:shadow-md">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
             <Search size={18} />
           </div>
           <span className="hidden sm:inline">Detalle de</span> Movimientos
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-64 transition-all hover:bg-white"
              />
           </div>
           
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             className="px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer hover:bg-white transition-colors"
           >
             <option value="all">Todo</option>
             <option value="income">💰 Ingresos</option>
             <option value="fixed">🏠 Fijos</option>
             <option value="priority">🚨 Prioritarios</option>
             <option value="debt-min">💳 Cuotas</option>
             <option value="debt-capital">📉 Abonos</option>
           </select>
        </div>
      </div>

      <div className="grid gap-6">
        {groupedData.map((period, idx) => (
          <div key={`${period.year}-${period.month}-${period.day}`} className="bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 group">
            
            <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl border shadow-sm flex flex-col items-center justify-center transition-transform ${period.day === 20 ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-tighter leading-none opacity-60">{getMonthName(period.month)}</span>
                      <span className="text-xl font-black leading-none">{period.day}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      {period.day === 5 ? 'Quincena 1' : 'Quincena 2'}
                    </h4>
                    <p className="text-xs text-slate-500 hidden sm:block font-medium">
                        {period.day === 20 ? 'Pago Renta & NU' : 'Pago Servicios & Bogotá'}
                    </p>
                  </div>
               </div>

               <div className="flex items-center gap-6 text-sm">
                  {period.periodStats.income > 0 && (
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-emerald-600/70 font-bold tracking-wider">Entra</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{formatCOP(period.periodStats.income)}</span>
                     </div>
                  )}
                  {period.periodStats.expenses > 0 && (
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Sale</span>
                        <span className="font-bold text-slate-600">-{formatCOP(period.periodStats.expenses)}</span>
                     </div>
                  )}
               </div>
            </div>

            <div className="divide-y divide-slate-50">
               {period.visibleTransactions.map((t, tIdx) => (
                 <div key={tIdx} className={`px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-all ${t.type === 'interest' ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border shadow-sm transition-transform ${t.type === 'income' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'}`}>
                          {getIconForType(t.type)}
                       </div>
                       <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${t.critical ? 'text-red-600' : 'text-slate-700'}`}>{t.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">
                             {getTypeLabel(t.type)}
                          </span>
                       </div>
                    </div>

                    <div className="text-right">
                       <span className={`block font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : t.type === 'savings' ? 'text-teal-600' : 'text-slate-700'}`}>
                          {t.type === 'income' ? '+' : t.type === 'savings' ? '=' : '-'}{formatCOP(t.amount)}
                       </span>
                       {t.critical && (
                          <span className="text-[10px] text-red-500 font-bold flex items-center justify-end gap-1 mt-1 bg-red-50 px-1.5 py-0.5 rounded-full w-fit ml-auto">
                             Inamovible
                          </span>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const [income, setIncome] = useState(INITIAL_INCOME);
  const [debts, setDebts] = useState<DebtConfig>(DEFAULT_DEBTS);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpensesConfig>(DEFAULT_FIXED_EXPENSES);
  const [showVariablesEditor, setShowVariablesEditor] = useState(false);
  const [simulation, setSimulation] = useState<Period[]>([]);

  useEffect(() => {
    const dates = getQuincenaDates();
    
    // Estado mutable para la simulación
    let currentHomologacionPending = GOALS.homologacion;
    let debtAmex = debts.amex;
    let debtNu = debts.nu;
    let debtBogota = debts.bogota;

    const newSimulation: Period[] = [];

    dates.forEach((dateObj, index) => {
      const { day, month, year } = dateObj;
      const dateStr = `${day} ${getMonthName(month)}`;
      const incomePerQuincena = income / 2;
      
      let cashAvailable = incomePerQuincena;
      const transactions: Transaction[] = [];

      // 1. Ingreso
      transactions.push({ id: `inc-${index}`, type: 'income', name: 'Nómina', amount: incomePerQuincena });

      // 2. Gastos Fijos (Prioridad Absoluta)
      const bebeCost = fixedExpenses.bebe / 2;
      cashAvailable -= bebeCost;
      transactions.push({ id: `bebe-${index}`, type: 'fixed', name: 'Gastos Bebé (Mitad)', amount: bebeCost });

      if (day === 5) {
        // Gastos fijos del día 5
        cashAvailable -= fixedExpenses.emiliano;
        transactions.push({ id: `emi-${index}`, type: 'fixed', name: 'Emiliano', amount: fixedExpenses.emiliano });
        
        cashAvailable -= fixedExpenses.internet;
        transactions.push({ id: `net-${index}`, type: 'fixed', name: 'Internet', amount: fixedExpenses.internet });
      } else { 
        // Gastos fijos del día 20
        cashAvailable -= fixedExpenses.renta;
        transactions.push({ id: `rent-${index}`, type: 'fixed', name: 'Arriendo', amount: fixedExpenses.renta, critical: true });
      }

      // 3. Prioridad Única: Homologación (Solo Enero)
      if (currentHomologacionPending > 0 && month === 0) {
        const payAmount = Math.min(cashAvailable, currentHomologacionPending);
        if (payAmount > 0) {
            currentHomologacionPending -= payAmount;
            cashAvailable -= payAmount;
            transactions.push({ id: `homo-${index}`, type: 'priority', name: 'Homologación (Urgente)', amount: payAmount, critical: true });
        }
      }

      // 4. Cuotas Mínimas de Deudas (No Capital aun)
      // Bogotá: Día 5
      if (day === 5 && debtBogota > 0) {
        const quota = debts.bogotaCuota;
        if (cashAvailable >= quota) {
            cashAvailable -= quota;
            // Asumimos un interés aproximado del 2.2% mensual para calcular cuánto baja el capital real
            // Es una estimación para la visualización
            const interestApprox = debtBogota * 0.022; 
            const capitalPart = Math.max(0, quota - interestApprox);
            debtBogota -= capitalPart;
            transactions.push({ id: `bogo-min-${index}`, type: 'debt-min', name: 'Cuota Crédito Bogotá', amount: quota, critical: true });
        }
      }

      // 5. Estrategia de Capital (Snowball / Avalanche)
      // "Ser generoso": Dejar un pequeño colchón si es posible, o pagar todo si es deuda crítica.
      const SAFE_BUFFER = 200000; // Colchón de seguridad para no quedar en $0
      let investableCash = Math.max(0, cashAvailable - SAFE_BUFFER);
      
      // Si la deuda es pequeña, pagamos todo sin importar el buffer para matarla rápido (ej. AMEX)
      
      if (investableCash > 0 || cashAvailable > 0) {
        
        // Estrategia Día 5: Foco AMEX -> Luego Bogotá
        if (day === 5) {
             // AMEX
             if (debtAmex > 0) {
                 // Para AMEX usamos todo el cashAvailable porque es pequeña y prioritaria
                 const payAmount = Math.min(cashAvailable, debtAmex);
                 debtAmex -= payAmount;
                 cashAvailable -= payAmount;
                 transactions.push({ id: `amex-${index}`, type: 'debt-capital', name: 'Pago Capital AMEX', amount: payAmount });
                 // Recalculamos investable
                 investableCash = Math.max(0, cashAvailable - SAFE_BUFFER);
             }

             // Sobrante a Bogotá
             if (investableCash > 0 && debtBogota > 0 && debtAmex <= 0) {
                 const payAmount = Math.min(investableCash, debtBogota);
                 debtBogota -= payAmount;
                 cashAvailable -= payAmount;
                 transactions.push({ id: `bogo-cap-${index}`, type: 'debt-capital', name: 'Abono Extra Bogotá', amount: payAmount });
             }
        }

        // Estrategia Día 20: Foco NU
        if (day === 20) {
            if (debtNu > 0) {
                // Usamos investableCash para mantener el buffer y pagar la renta seguro el proximo mes
                // Pero como NU es grande, intentamos pagar lo que se pueda.
                const payAmount = Math.min(cashAvailable, debtNu); // Agresivo con NU día 20
                debtNu -= payAmount;
                cashAvailable -= payAmount;
                transactions.push({ id: `nu-${index}`, type: 'debt-capital', name: 'Pago Capital NU', amount: payAmount });
            }
        }
      }

      // 6. Saldo Final (Ahorro/Buffer)
      if (cashAvailable > 0) {
        // Solo es ahorro si ya no hay deudas, sino es flujo de caja
        const isDebtFree = (debtAmex + debtNu + debtBogota) <= 1000;
        transactions.push({ 
            id: `save-${index}`, 
            type: 'savings', 
            name: isDebtFree ? 'Ahorro Libre' : 'Saldo a Favor (Buffer)', 
            amount: cashAvailable 
        });
      }

      newSimulation.push({
        dateStr,
        day,
        month,
        year,
        totalIncome: incomePerQuincena,
        transactions,
        endBalance: cashAvailable,
        debtStatus: { amex: Math.max(0, debtAmex), nu: Math.max(0, debtNu), bogota: Math.max(0, debtBogota) },
        goalsStatus: { homologacion: Math.max(0, currentHomologacionPending) }
      });
    });

    setSimulation(newSimulation);
  }, [income, debts, fixedExpenses]); 

  const finalState = simulation[simulation.length - 1] || { 
      debtStatus: { amex: 0, nu: 0, bogota: 0 }, 
      goalsStatus: { homologacion: 0 } 
  };
  
  const totalDebtRemaining = finalState.debtStatus.amex + finalState.debtStatus.nu + finalState.debtStatus.bogota;

  const chartData = simulation.map(p => ({
    name: p.dateStr,
    Deuda: p.debtStatus.amex + p.debtStatus.nu + p.debtStatus.bogota,
  }));

  const savingsData = useMemo(() => {
    let accumulated = 0;
    const monthlyMap = new Map<number, number>();

    simulation.forEach(p => {
        const periodSavings = p.transactions
            .filter(t => t.type === 'savings')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const current = monthlyMap.get(p.month) || 0;
        monthlyMap.set(p.month, current + periodSavings);
    });

    return Array.from(monthlyMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([monthIndex, monthlyAmount]) => {
            accumulated += monthlyAmount;
            return {
                name: getMonthName(monthIndex),
                Acumulado: accumulated
            };
        });
  }, [simulation]);

  const handleDownloadCSV = () => {
    let csv = "Fecha,Concepto,Tipo,Monto,Saldo Deuda Total\n";
    simulation.forEach(p => {
        const totalDebt = p.debtStatus.amex + p.debtStatus.nu + p.debtStatus.bogota;
        p.transactions.forEach(t => {
            csv += `${p.dateStr},${t.name},${t.type},${t.amount},${totalDebt}\n`;
        });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plan_financiero_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-slate-900 text-white pb-24 pt-10 px-4 md:px-8 print:py-4 print:px-0 print:bg-white print:text-black">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-md mb-3">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                 <span className="text-xs text-emerald-100 font-medium tracking-wide">Plan Enero - Junio 2026</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                Plan Cero Deudas
              </h1>
              <p className="text-slate-400 mt-2 text-lg max-w-2xl font-light">
                Estrategia personalizada: Prioridad Homologación, Renta y eliminación sistemática de pasivos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 no-print">
               <button 
                  onClick={() => setShowVariablesEditor(!showVariablesEditor)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${showVariablesEditor ? 'bg-white text-slate-900' : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 backdrop-blur-md'}`}
               >
                  <Edit3 size={18} /> Editar Saldos
               </button>
               <button onClick={handleDownloadCSV} className="bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-slate-700 backdrop-blur-md hover:scale-105">
                  <Download size={18} /> CSV
               </button>
            </div>
          </div>

          {showVariablesEditor && (
             <VariablesEditor 
                currentDebts={debts}
                currentExpenses={fixedExpenses}
                onClose={() => setShowVariablesEditor(false)}
                onSave={(newDebts, newExpenses) => {
                    setDebts(newDebts);
                    setFixedExpenses(newExpenses);
                }}
             />
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
             {/* Card 1: Homologación Status */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <GraduationCap size={24} />
                    </div>
                    {simulation.find(p => p.month === 0 && p.goalsStatus.homologacion === 0) ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Cubierto Ene</span>
                    ) : (
                         <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Pendiente</span>
                    )}
                </div>
                <div>
                    <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Pago Homologación</h3>
                    <div className="text-3xl font-black text-slate-800 mt-1">{formatCOP(GOALS.homologacion)}</div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} className="text-red-400"/> Vence en Enero
                    </div>
                </div>
             </div>

             {/* Card 2: Debt Projection */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                     <div className="flex flex-col">
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400"/> Proyección Junio
                        </h3>
                     </div>
                     <div className={`p-2 rounded-lg ${totalDebtRemaining === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {totalDebtRemaining === 0 ? <CheckCircle2 size={20} /> : <TrendingDown size={20} />}
                     </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">Deuda Restante Total</span>
                            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full">Objetivo: $0</span>
                        </div>
                        <div className={`text-2xl font-black ${totalDebtRemaining === 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                            {formatCOP(totalDebtRemaining)}
                        </div>
                    </div>
                     <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${Math.max(0, 100 - (totalDebtRemaining / (DEFAULT_DEBTS.amex + DEFAULT_DEBTS.nu + DEFAULT_DEBTS.bogota)) * 100)}%` }}
                        ></div>
                    </div>
                </div>
             </div>

             {/* Card 3: Quick Info */}
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all"></div>
                
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 z-10 relative">
                    <Wallet size={18} className="text-emerald-400"/>
                    Flujo de Caja
                </h3>
                <div className="space-y-4 relative z-10 text-sm text-slate-300">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span>Ingreso Mensual</span>
                      <span className="text-white font-mono">{formatCOP(income)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span>Renta (Día 20)</span>
                      <span className="text-orange-400 font-mono">{formatCOP(fixedExpenses.renta)}</span>
                  </div>
                  <div className="mt-2 text-xs opacity-70 italic">
                      "Nunca faltará para los gastos fijos"
                  </div>
                </div>
             </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <DebtEliminationChart data={chartData} />
            <SavingsGrowthChart data={savingsData} />
        </div>

        {/* Timeline */}
        <section className="relative">
            <div className="absolute left-[26px] sm:left-8 top-12 bottom-0 w-0.5 bg-slate-200 hidden md:block"></div>

            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2 relative z-10">
                <Calendar className="text-indigo-600" size={24}/>
                Hoja de Ruta: Enero - Junio 2026
            </h2>

            <div className="space-y-8 relative z-10">
                {simulation.map((period, idx) => (
                    <div key={idx} className="relative pl-0 md:pl-20">
                        <div className="absolute left-4 top-8 w-8 h-8 rounded-full bg-slate-50 border-4 border-white shadow-md z-10 hidden md:flex items-center justify-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${period.day === 5 ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
                        </div>

                        <div className="absolute left-[-10px] top-8 w-24 text-right pr-4 hidden md:block">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{getMonthName(period.month)}</div>
                             <div className="text-lg font-black text-slate-700">{period.day}</div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                            
                            <div className="md:hidden bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                                <div className="font-bold text-slate-700">{period.day} {getMonthName(period.month)}</div>
                                <div className="text-xs text-slate-400">•</div>
                                <div className="text-xs text-slate-500 font-medium">Disp: {formatCOP(period.endBalance)}</div>
                            </div>

                            <div className="hidden md:flex bg-slate-50/30 px-6 py-3 border-b border-slate-100 justify-between items-center">
                                 <div>
                                    <span className="text-sm font-semibold text-slate-600">
                                        {period.day === 5 ? 'Primera Quincena (Día 5)' : 'Segunda Quincena (Día 20)'}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <div className="text-xs font-medium text-slate-400">Saldo a favor: <span className="text-emerald-600 font-bold">{formatCOP(period.endBalance)}</span></div>
                                 </div>
                            </div>

                            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {/* Left: Obligations */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Obligatorio
                                    </h4>
                                    <ul className="space-y-3">
                                        {period.transactions.filter(t => ['fixed', 'priority', 'debt-min'].includes(t.type)).map(t => (
                                            <li key={t.id} className="flex justify-between items-center text-sm group/item">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${t.type === 'priority' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {t.type === 'priority' ? <AlertCircle size={12}/> : <CheckCircle2 size={12}/>}
                                                    </div>
                                                    <span className={`${t.type === 'priority' ? 'font-bold text-red-700' : 'text-slate-600'} ${t.critical ? 'font-semibold' : ''}`}>
                                                        {t.name}
                                                    </span>
                                                </div>
                                                <span className="text-slate-900 font-mono font-medium">-{formatCOP(t.amount)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Right: Strategy */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Estrategia & Ahorro
                                    </h4>
                                    <ul className="space-y-3">
                                        {period.transactions.filter(t => ['debt-capital', 'savings'].includes(t.type)).map(t => (
                                            <li key={t.id} className="flex justify-between items-center text-sm">
                                                 <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${t.type === 'debt-capital' ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'}`}>
                                                        {t.type === 'debt-capital' ? <TrendingDown size={12}/> : <Wallet size={12}/>}
                                                    </div>
                                                    <span className={`${t.type === 'debt-capital' ? 'font-semibold text-purple-700' : 'text-teal-700 font-medium'}`}>
                                                        {t.name}
                                                    </span>
                                                </div>
                                                <span className="text-slate-900 font-mono font-medium">
                                                    {t.type === 'savings' ? '' : '-'}{formatCOP(t.amount)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            {/* Alertas de Exito */}
                             {(period.debtStatus.amex + period.debtStatus.nu + period.debtStatus.bogota === 0 && 
                               (idx > 0 && simulation[idx-1].debtStatus.amex + simulation[idx-1].debtStatus.nu + simulation[idx-1].debtStatus.bogota > 0)) && (
                                <div className="bg-gradient-to-r from-emerald-100 to-teal-50 px-6 py-4 border-t border-emerald-200 flex items-center gap-3 text-emerald-900 animate-pulse">
                                    <div className="bg-emerald-500 text-white p-1.5 rounded-full"><PiggyBank size={18} /></div>
                                    <span className="font-bold text-lg">¡Meta Cumplida! Cero Deudas.</span>
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section className="mt-20">
            <TransactionTable simulation={simulation} />
        </section>

      </main>
    </div>
  );
}
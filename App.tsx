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
  Target
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
  endBalance: number; // Cash left over (savings)
  debtStatus: {
    amex: number;
    nu: number;
    bogota: number;
  };
  goalsStatus: {
    uni: number; // Remaining
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

const INITIAL_INCOME = 5400000;
const INITIAL_SAVINGS_UNI = 3400000;

// Default Initial Values
const DEFAULT_FIXED_EXPENSES: FixedExpensesConfig = {
  bebe: 300000,
  emiliano: 100000,
  internet: 110000,
  renta: 1400000,
};

const DEFAULT_DEBTS: DebtConfig = {
  amex: 1500000,
  nu: 2200000,
  bogota: 3100000,
  bogotaCuota: 320000,
};

const GOALS = {
  uniTotal: 7000000,
  homologacion: 800000,
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
  for (let month = 0; month <= 5; month++) {
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
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4 relative z-10">
        <div>
           <h3 className="text-white font-bold flex items-center gap-2 text-xl">
            <Settings className="text-emerald-400" />
            Control de Variables
          </h3>
          <p className="text-slate-400 text-xs mt-1">Ajusta los valores para recalcular tu plan financiero.</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-all">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Section 1: Debts */}
            <div className="space-y-5">
                <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-emerald-500/20 pb-2 mb-4 flex justify-between items-center">
                    <span>Deudas & Créditos</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Pasivos</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField 
                        label="AMEX (Corte día 5)" 
                        icon={CreditCard} 
                        colorClass="text-blue-400"
                        value={localDebts.amex}
                        onChange={(e: any) => handleDebtChange('amex', e.target.value)}
                    />
                    <InputField 
                        label="NU (Corte día 20)" 
                        icon={CreditCard} 
                        colorClass="text-purple-400"
                        value={localDebts.nu}
                        onChange={(e: any) => handleDebtChange('nu', e.target.value)}
                    />
                    <InputField 
                        label="Banco Bogotá (Saldo)" 
                        icon={Landmark} 
                        colorClass="text-yellow-400"
                        value={localDebts.bogota}
                        onChange={(e: any) => handleDebtChange('bogota', e.target.value)}
                    />
                    <InputField 
                        label="Bogotá (Cuota Fija)" 
                        icon={Briefcase} 
                        colorClass="text-slate-400"
                        value={localDebts.bogotaCuota}
                        onChange={(e: any) => handleDebtChange('bogotaCuota', e.target.value)}
                    />
                </div>
            </div>

            {/* Section 2: Fixed Expenses */}
            <div className="space-y-5">
                 <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest border-b border-orange-500/20 pb-2 mb-4 flex justify-between items-center">
                    <span>Gastos Fijos Mensuales</span>
                    <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-[10px]">Recurrentes</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField 
                        label="Gastos Bebé (Mes)" 
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
      case 'priority': return <AlertCircle size={18} className="text-blue-500" />;
      case 'debt-min': return <CreditCard size={18} className="text-orange-500" />;
      case 'interest': return <Percent size={18} className="text-orange-400" />;
      case 'debt-capital': return <TrendingDown size={18} className="text-purple-500" />;
      case 'savings': return <PiggyBank size={18} className="text-teal-600" />;
      default: return <Briefcase size={18} className="text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'income': 'Ingreso',
      'fixed': 'Gasto Fijo',
      'priority': 'Prioridad',
      'debt-min': 'Cuota Deuda',
      'interest': 'Intereses',
      'debt-capital': 'Abono Capital',
      'savings': 'Ahorro'
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar - Modernized */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-30 transition-all duration-300 hover:shadow-md">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
             <Search size={18} />
           </div>
           <span className="hidden sm:inline">Explorador de</span> Movimientos
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar (ej. Arriendo)..." 
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
             <option value="all">Todas las categorías</option>
             <option value="income">💰 Ingresos</option>
             <option value="fixed">🏠 Gastos Fijos</option>
             <option value="priority">🚨 Prioritarios</option>
             <option value="debt-min">💳 Cuotas Deuda</option>
             <option value="debt-capital">📉 Abonos Capital</option>
             <option value="savings">🐷 Ahorro</option>
           </select>
        </div>
      </div>

      {/* Grouped Lists */}
      <div className="grid gap-6">
        {groupedData.map((period, idx) => (
          <div key={`${period.year}-${period.month}-${period.day}`} className="bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 group">
            
            {/* Group Header */}
            <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                      <span className="text-[10px] font-extrabold uppercase tracking-tighter leading-none text-slate-400">{getMonthName(period.month)}</span>
                      <span className="text-xl font-black leading-none text-slate-800">{period.day}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      {period.day === 5 ? 'Primera Quincena' : 'Segunda Quincena'}
                    </h4>
                    <p className="text-xs text-slate-500 hidden sm:block font-medium">Resumen del periodo</p>
                  </div>
               </div>

               {/* Mini Stats */}
               <div className="flex items-center gap-6 text-sm">
                  {period.periodStats.income > 0 && (
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-emerald-600/70 font-bold tracking-wider">Entradas</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{formatCOP(period.periodStats.income)}</span>
                     </div>
                  )}
                  {period.periodStats.expenses > 0 && (
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Salidas</span>
                        <span className="font-bold text-slate-600">-{formatCOP(period.periodStats.expenses)}</span>
                     </div>
                  )}
               </div>
            </div>

            {/* Transactions Items */}
            <div className="divide-y divide-slate-50">
               {period.visibleTransactions.map((t, tIdx) => (
                 <div key={tIdx} className={`px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-all ${t.type === 'interest' ? 'opacity-60 bg-slate-50/30' : ''}`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border shadow-sm transition-transform ${t.type === 'income' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'}`}>
                          {getIconForType(t.type)}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">
                             {getTypeLabel(t.type)}
                          </span>
                       </div>
                    </div>

                    <div className="text-right">
                       <span className={`block font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCOP(t.amount)}
                       </span>
                       {t.critical && (
                          <span className="text-[10px] text-red-500 font-bold flex items-center justify-end gap-1 mt-1 bg-red-50 px-1.5 py-0.5 rounded-full w-fit ml-auto">
                             Prioritario
                          </span>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
       <div className="text-center text-xs text-slate-400 pt-8 pb-12">
         Mostrando {groupedData.length} periodos
      </div>
    </div>
  );
}


export default function App() {
  const [income, setIncome] = useState(INITIAL_INCOME);
  const [savingsUni, setSavingsUni] = useState(INITIAL_SAVINGS_UNI);
  const [interestRate, setInterestRate] = useState(2.2); 
  const [debts, setDebts] = useState<DebtConfig>(DEFAULT_DEBTS);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpensesConfig>(DEFAULT_FIXED_EXPENSES);
  const [showVariablesEditor, setShowVariablesEditor] = useState(false);
  const [simulation, setSimulation] = useState<Period[]>([]);

  useEffect(() => {
    const dates = getQuincenaDates();
    let currentUniPending = GOALS.uniTotal - savingsUni;
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

      transactions.push({ id: `inc-${index}`, type: 'income', name: 'Nómina', amount: incomePerQuincena });

      const bebeCost = fixedExpenses.bebe / 2;
      cashAvailable -= bebeCost;
      transactions.push({ id: `bebe-${index}`, type: 'fixed', name: 'Gastos Bebé', amount: bebeCost });

      if (day === 5) {
        cashAvailable -= fixedExpenses.emiliano;
        transactions.push({ id: `emi-${index}`, type: 'fixed', name: 'Emiliano', amount: fixedExpenses.emiliano });
        
        cashAvailable -= fixedExpenses.internet;
        transactions.push({ id: `net-${index}`, type: 'fixed', name: 'Internet', amount: fixedExpenses.internet });
      } else { 
        cashAvailable -= fixedExpenses.renta;
        transactions.push({ id: `rent-${index}`, type: 'fixed', name: 'Arriendo', amount: fixedExpenses.renta, critical: true });
      }

      if (currentHomologacionPending > 0 && month === 0) {
        const payAmount = Math.min(cashAvailable, currentHomologacionPending);
        if (payAmount > 0) {
          currentHomologacionPending -= payAmount;
          cashAvailable -= payAmount;
          transactions.push({ id: `homo-${index}`, type: 'priority', name: 'Homologación', amount: payAmount, critical: true });
        }
      }

      const isUniDeadline = (month === 1 && day === 5);
      const isUniPeriod = (month === 0) || isUniDeadline;

      if (day === 5 && debtBogota > 0) {
        const estimatedInterest = Math.round(debtBogota * (interestRate / 100));
        let quotaToPay = debts.bogotaCuota;
        
        if ((debtBogota + estimatedInterest) < quotaToPay) {
            quotaToPay = debtBogota + estimatedInterest;
        }

        if (cashAvailable >= quotaToPay) {
            cashAvailable -= quotaToPay;
            const capitalContribution = Math.max(0, quotaToPay - estimatedInterest);
            debtBogota -= capitalContribution;
            transactions.push({ id: `bogo-min-${index}`, type: 'debt-min', name: 'Cuota Fija Bogotá', amount: quotaToPay });
        } else {
             const payWhatWeCan = cashAvailable;
             const capitalContribution = Math.max(0, payWhatWeCan - estimatedInterest);
             debtBogota -= capitalContribution;
             cashAvailable = 0;
             transactions.push({ id: `bogo-min-${index}`, type: 'debt-min', name: 'Abono Parcial Bogotá', amount: payWhatWeCan, critical: true });
        }
      }

      if (currentUniPending > 0 && isUniPeriod) {
        const payAmount = Math.min(cashAvailable, currentUniPending);
        if (payAmount > 0) {
          currentUniPending -= payAmount;
          cashAvailable -= payAmount;
          transactions.push({ id: `uni-${index}`, type: 'priority', name: 'Universidad', amount: payAmount, critical: true });
        }
      }
      
      if (cashAvailable > 0) {
        if (day === 5 && debtAmex > 0) {
            const payAmount = Math.min(cashAvailable, debtAmex);
            debtAmex -= payAmount;
            cashAvailable -= payAmount;
            transactions.push({ id: `amex-${index}`, type: 'debt-capital', name: 'Capital AMEX', amount: payAmount });
        }

        if (day === 20 && debtNu > 0) {
            const payAmount = Math.min(cashAvailable, debtNu);
            debtNu -= payAmount;
            cashAvailable -= payAmount;
            transactions.push({ id: `nu-${index}`, type: 'debt-capital', name: 'Capital NU', amount: payAmount });
        }

        if (day === 5 && debtBogota > 0 && cashAvailable > 0 && debtAmex <= 0) {
             const payAmount = Math.min(cashAvailable, debtBogota);
             debtBogota -= payAmount;
             cashAvailable -= payAmount;
             transactions.push({ id: `bogo-cap-${index}`, type: 'debt-capital', name: 'Abono Extra Bogotá', amount: payAmount });
        }
        
        if (day === 20 && debtBogota > 0 && cashAvailable > 0 && debtNu <= 0) {
             const payAmount = Math.min(cashAvailable, debtBogota);
             debtBogota -= payAmount;
             cashAvailable -= payAmount;
             transactions.push({ id: `bogo-cap-20-${index}`, type: 'debt-capital', name: 'Abono Extra Bogotá', amount: payAmount });
        }
      }

      if (cashAvailable > 0) {
        transactions.push({ id: `save-${index}`, type: 'savings', name: 'Disponible / Ahorro', amount: cashAvailable });
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
        goalsStatus: { uni: Math.max(0, currentUniPending), homologacion: Math.max(0, currentHomologacionPending) }
      });
    });

    setSimulation(newSimulation);
  }, [income, savingsUni, interestRate, debts, fixedExpenses]); 

  const finalState = simulation[simulation.length - 1] || { 
      debtStatus: { amex: 0, nu: 0, bogota: 0 }, 
      goalsStatus: { uni: 0, homologacion: 0 } 
  };
  
  const totalDebtRemaining = finalState.debtStatus.amex + finalState.debtStatus.nu + finalState.debtStatus.bogota;
  const isUniPaid = simulation.find(p => p.month === 1 && p.day === 5)?.goalsStatus.uni === 0;

  const chartData = simulation.map(p => ({
    name: p.dateStr,
    Deuda: p.debtStatus.amex + p.debtStatus.nu + p.debtStatus.bogota,
    Uni: p.goalsStatus.uni
  }));

  const savingsData = useMemo(() => {
    let cumulative = 0;
    return simulation.map(p => {
      cumulative += p.endBalance;
      return {
        name: p.dateStr,
        cumulative: cumulative
      };
    });
  }, [simulation]);

  const monthlySavings = useMemo(() => {
    const grouped: { monthIndex: number; name: string; amount: number }[] = [];
    simulation.forEach(p => {
      const existing = grouped.find(g => g.monthIndex === p.month);
      if (existing) {
        existing.amount += p.endBalance;
      } else {
        grouped.push({
          monthIndex: p.month,
          name: getMonthName(p.month),
          amount: p.endBalance
        });
      }
    });
    return grouped;
  }, [simulation]);

  const totalPotentialSavings = savingsData.length > 0 ? savingsData[savingsData.length - 1].cumulative : 0;

  const handlePrint = () => window.print();

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
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-md mb-3">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                 <span className="text-xs text-emerald-100 font-medium tracking-wide">Planificación Activa 2026</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                Libertad Financiera
              </h1>
              <p className="text-slate-400 mt-2 text-lg max-w-2xl font-light">
                Tu hoja de ruta personalizada para eliminar deudas y construir patrimonio, optimizada quincena a quincena.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 no-print">
               <button 
                  onClick={() => setShowVariablesEditor(!showVariablesEditor)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${showVariablesEditor ? 'bg-white text-slate-900' : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 backdrop-blur-md'}`}
               >
                  <Edit3 size={18} /> Ajustar Variables
               </button>
               <button onClick={handleDownloadCSV} className="bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-slate-700 backdrop-blur-md hover:scale-105">
                  <Download size={18} /> CSV
               </button>
               <button onClick={handlePrint} className="bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-slate-700 backdrop-blur-md hover:scale-105">
                  <Printer size={18} />
               </button>
            </div>
          </div>

          {/* Variables Editor Panel (Inline) */}
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
             {/* Card 1: Uni Status */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Target size={24} />
                    </div>
                    {isUniPaid ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Completado</span>
                    ) : (
                         <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Pendiente</span>
                    )}
                </div>
                <div>
                    <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Meta Universidad</h3>
                    <div className="text-3xl font-black text-slate-800 mt-1">{formatCOP(GOALS.uniTotal)}</div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar size={12}/> Fecha Límite: 5 Feb
                    </div>
                </div>
             </div>

             {/* Card 2: Financial Projection June (Modified) */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                     <div className="flex flex-col">
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400"/> Junio 2026
                        </h3>
                     </div>
                     <div className={`p-2 rounded-lg ${totalDebtRemaining === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {totalDebtRemaining === 0 ? <CheckCircle2 size={20} /> : <TrendingUp size={20} />}
                     </div>
                </div>

                <div className="space-y-5">
                    {/* Debt */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">Deuda Restante</span>
                            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">Pasivo</span>
                        </div>
                        <div className="text-2xl font-black text-slate-800">{formatCOP(totalDebtRemaining)}</div>
                    </div>

                    {/* Divider with gradient */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                    {/* Savings (Motivating) */}
                    <div>
                         <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-emerald-600 uppercase">Ahorro Esperado</span>
                            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Activo</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-500">{formatCOP(totalPotentialSavings)}</div>
                    </div>
                </div>
             </div>

              {/* Card 3: Quick Controls */}
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all"></div>
                
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 z-10 relative">
                    <Settings size={18} className="text-emerald-400"/>
                    Ajustes Rápidos
                </h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                      <label className="text-slate-300 text-xs font-medium">Ahorro U Actual</label>
                      <input 
                          type="number" 
                          value={savingsUni} 
                          onChange={(e) => setSavingsUni(Number(e.target.value))}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 text-right text-white w-32 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                  </div>
                  <div className="flex items-center justify-between">
                      <label className="text-slate-300 text-xs font-medium">Ingreso Total</label>
                      <input 
                          type="number" 
                          value={income} 
                          onChange={(e) => setIncome(Number(e.target.value))}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 text-right text-white w-32 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                  </div>
                </div>
             </div>
        </div>
        
        {/* Charts Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 print:block print:mb-6">
            
            {/* Chart 1: Debt */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                 <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingDown className="text-red-500" size={20}/>
                            Reducción de Deuda
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Proyección quincenal</p>
                    </div>
                 </div>
                <div className="h-64 w-full relative min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDeuda" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorUni" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} stroke="#94a3b8" />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(val) => `$${val/1000000}M`} />
                            <Tooltip 
                                formatter={(value: number) => formatCOP(value)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            />
                            <Area type="monotone" dataKey="Deuda" stroke="#ef4444" fillOpacity={1} fill="url(#colorDeuda)" strokeWidth={3} />
                            <Area type="monotone" dataKey="Uni" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUni)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Savings */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <PiggyBank className="text-emerald-500" size={20}/>
                            Crecimiento de Ahorros
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Excedentes acumulados</p>
                    </div>
                     <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600 block">{formatCOP(totalPotentialSavings)}</span>
                        <span className="text-[10px] text-emerald-600/60 uppercase font-bold tracking-wider">Proyectado Junio</span>
                    </div>
                 </div>
               <div className="h-64 w-full relative min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={savingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} stroke="#94a3b8" />
                     <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(val) => `$${val/1000000}M`} />
                     <Tooltip 
                          formatter={(value: number) => [formatCOP(value), "Acumulado"]}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                     <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="url(#colorSavings)" strokeWidth={3} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
        </div>

        {/* Timeline Visual - Connector Line */}
        <section className="relative">
            {/* The vertical connector line */}
            <div className="absolute left-[26px] sm:left-8 top-12 bottom-0 w-0.5 bg-slate-200 hidden md:block"></div>

            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2 relative z-10">
                <Calendar className="text-indigo-600" size={24}/>
                Hoja de Ruta Detallada
            </h2>

            <div className="space-y-8 relative z-10">
                {simulation.map((period, idx) => (
                    <div key={idx} className="relative pl-0 md:pl-20">
                        {/* Timeline Dot */}
                        <div className="absolute left-4 top-8 w-8 h-8 rounded-full bg-slate-50 border-4 border-white shadow-md z-10 hidden md:flex items-center justify-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${period.day === 5 ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                        </div>

                        {/* Date Label (Desktop) */}
                        <div className="absolute left-[-10px] top-8 w-24 text-right pr-4 hidden md:block">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{getMonthName(period.month)}</div>
                             <div className="text-lg font-black text-slate-700">{period.day}</div>
                        </div>

                        {/* Card Content */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                            
                            {/* Mobile Date Header */}
                            <div className="md:hidden bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                                <div className="font-bold text-slate-700">{period.day} {getMonthName(period.month)}</div>
                                <div className="text-xs text-slate-400">•</div>
                                <div className="text-xs text-slate-500 font-medium">Ingreso: {formatCOP(period.totalIncome)}</div>
                            </div>

                            {/* Desktop Header inside card */}
                            <div className="hidden md:flex bg-slate-50/30 px-6 py-3 border-b border-slate-100 justify-between items-center">
                                 <div>
                                    <span className="text-sm font-semibold text-slate-600">
                                        {period.day === 5 ? 'Primera Quincena' : 'Segunda Quincena'}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <div className="text-xs font-medium text-slate-400">Ingreso: <span className="text-emerald-600">{formatCOP(period.totalIncome)}</span></div>
                                     <div className="h-4 w-px bg-slate-200"></div>
                                     <div className="text-xs font-medium text-slate-400">Restante: <span className="text-slate-600">{formatCOP(period.debtStatus.amex + period.debtStatus.nu + period.debtStatus.bogota)}</span></div>
                                 </div>
                            </div>

                            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {/* Left: Obligations */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Obligaciones
                                    </h4>
                                    <ul className="space-y-3">
                                        {period.transactions.filter(t => ['fixed', 'priority', 'debt-min'].includes(t.type)).map(t => (
                                            <li key={t.id} className="flex justify-between items-center text-sm group/item">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${t.type === 'priority' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {t.type === 'priority' ? <AlertCircle size={12}/> : <CheckCircle2 size={12}/>}
                                                    </div>
                                                    <span className={`${t.type === 'priority' ? 'font-semibold text-blue-700' : 'text-slate-600'} ${t.critical ? 'text-red-600 font-semibold' : ''}`}>
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
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Estrategia
                                    </h4>
                                    <ul className="space-y-3">
                                        {period.transactions.filter(t => ['debt-capital', 'savings'].includes(t.type)).map(t => (
                                            <li key={t.id} className="flex justify-between items-center text-sm">
                                                 <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${t.type === 'debt-capital' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {t.type === 'debt-capital' ? <TrendingDown size={12}/> : <PiggyBank size={12}/>}
                                                    </div>
                                                    <span className={`${t.type === 'debt-capital' ? 'font-semibold text-purple-700' : 'text-emerald-700 font-semibold'}`}>
                                                        {t.name}
                                                    </span>
                                                </div>
                                                <span className="text-slate-900 font-mono font-medium">
                                                    {t.type === 'savings' ? '' : '-'}{formatCOP(t.amount)}
                                                </span>
                                            </li>
                                        ))}
                                        {period.transactions.filter(t => ['debt-capital', 'savings'].includes(t.type)).length === 0 && (
                                            <li className="text-xs text-slate-400 italic py-2 px-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                Sin excedentes estratégicos en este periodo.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Milestones */}
                            {(period.month === 1 && period.day === 5 && period.goalsStatus.uni <= 0) && (
                                <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-t border-blue-100 flex items-center gap-3 text-sm text-blue-800">
                                    <div className="bg-blue-500 text-white p-1 rounded-full"><CheckCircle2 size={14} /></div>
                                    <span className="font-semibold">¡Hito Desbloqueado!</span> Universidad pagada al 100%.
                                </div>
                            )}
                             {(period.debtStatus.amex + period.debtStatus.nu + period.debtStatus.bogota === 0 && 
                               (idx > 0 && simulation[idx-1].debtStatus.amex + simulation[idx-1].debtStatus.nu + simulation[idx-1].debtStatus.bogota > 0)) && (
                                <div className="bg-gradient-to-r from-emerald-100 to-teal-50 px-6 py-4 border-t border-emerald-200 flex items-center gap-3 text-emerald-900 animate-pulse">
                                    <div className="bg-emerald-500 text-white p-1.5 rounded-full"><PiggyBank size={18} /></div>
                                    <span className="font-bold text-lg">¡LIBERTAD FINANCIERA ALCANZADA!</span>
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Transaction Table Explorer */}
        <section className="mt-20">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Search className="text-teal-600" size={24}/>
                Explorador de Transacciones
            </h2>
            <TransactionTable simulation={simulation} />
        </section>

        <footer className="mt-20 mb-8 text-center text-slate-400 text-xs print:hidden">
            <p className="font-medium">Planificación financiera personal • 2026</p>
            <p className="opacity-70 mt-1">Los cálculos son proyecciones. Revisa tus extractos oficiales.</p>
        </footer>

      </main>
    </div>
  );
}
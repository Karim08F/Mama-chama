import { useState, useEffect } from 'react';
import { generateCreditAdvice } from './services/gemini';
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  PiggyBank, 
  Lightbulb, 
  ChevronRight,
  Loader2,
  Lock,
  HeartHandshake,
  LogIn,
  LogOut,
  BarChart2,
  ArrowRight,
  Smartphone,
  Home,
  Activity
} from 'lucide-react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import ChatWidget from './components/ChatWidget';
import { motion, AnimatePresence } from 'motion/react';

interface Advice {
  trustImpactTitle: string;
  trustImpactExplanation: string;
  nextBestAction: string;
  affirmation: string;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [dashboardView, setDashboardView] = useState<'home' | 'actions'>('home');
  
  const [amount, setAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('Weekly');
  const [loading, setLoading] = useState<boolean>(false);
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [split, setSplit] = useState<{flexible: number, fixed: number, emergency: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'advice' | 'analytics'>('advice');

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setView('dashboard');
      } else {
        if (view === 'dashboard') setView('landing');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [view]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Failed to log in.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdvice(null);
      setSplit(null);
      setAmount('');
      setView('landing');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    
    // Calculate split
    setSplit({
      flexible: numAmount * 0.5,
      fixed: numAmount * 0.3,
      emergency: numAmount * 0.2
    });

    try {
      const result = await generateCreditAdvice(numAmount, frequency);
      setAdvice(result);
      setActiveTab('advice');
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting to the AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#008C44]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans overflow-x-hidden relative">
      <AnimatePresence mode="wait">
        
        {/* ================= LANDING PAGE ================= */}
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col justify-between bg-white"
          >
            {/* Top Pattern */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-emerald-50 to-transparent -z-10" />
            
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
              <div className="text-center space-y-4 max-w-sm mt-12">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-emerald-100 text-[#008C44] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
                >
                  <HeartHandshake className="w-10 h-10" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                  Welcome to <br/><span className="text-[#008C44]">Chama Yangu App</span>
                </h1>
                <p className="text-neutral-500 leading-relaxed text-[15px]">
                  Turn your daily savings into a powerful Trust Profile. Get loans, expand your business, and secure your future.
                </p>
              </div>

              {/* Abstract Hero Composition (Mama Saving) */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative w-64 h-64 border-4 border-emerald-50 rounded-full flex items-center justify-center before:content-[''] before:absolute before:inset-4 before:bg-emerald-100 before:rounded-full before:-z-10"
              >
                <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_30s_linear_infinite]" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Smartphone className="w-24 h-24 text-[#008C44]" strokeWidth={1.5} />
                </motion.div>
                
                {/* Floating Coins */}
                <motion.div 
                  animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-8 right-6 bg-white p-2 rounded-full shadow-md text-yellow-500"
                >
                  <PiggyBank className="w-5 h-5" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-10 left-4 bg-white p-2 rounded-full shadow-md text-emerald-500"
                >
                  <ShieldCheck className="w-5 h-5" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-2 right-12 bg-white p-2 rounded-full shadow-md text-blue-500"
                >
                  <TrendingUp className="w-5 h-5" />
                </motion.div>
              </motion.div>
            </div>

            <div className="p-6 w-full max-w-md mx-auto mb-6">
              <button
                onClick={() => setView('login')}
                className="w-full bg-[#008C44] hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 text-lg group active:scale-[0.98]"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= LOGIN PAGE ================= */}
        {view === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 relative"
          >
            <button 
              onClick={() => setView('landing')}
              className="absolute top-6 left-4 sm:top-8 sm:left-8 text-neutral-500 hover:text-neutral-800 flex items-center text-sm font-medium transition-colors p-2"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Back
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 max-w-sm w-full text-center space-y-8 relative overflow-hidden">
              {/* Decorative gradient blob */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-60" />
              
              <div className="flex justify-center relative">
                <div className="w-20 h-20 bg-emerald-50 text-[#008C44] rounded-2xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform">
                  <LogIn className="h-10 w-10" />
                </div>
              </div>
              
              <div className="relative">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Step into your future</h2>
                <p className="text-neutral-500 mt-2 text-[15px] leading-relaxed">
                  Sign in with your Google account to secure your data and start tracking your Chama profile.
                </p>
              </div>

              <div className="relative pt-4">
                <button
                  onClick={handleLogin}
                  className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-semibold py-3.5 px-4 rounded-xl border-2 border-neutral-200 transition-all flex items-center justify-center space-x-3 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= DASHBOARD PAGE ================= */}
        {view === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <header className="bg-[#008C44] text-white py-6 px-4 shadow-md sticky top-0 z-10">
              <div className="max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HeartHandshake className="h-8 w-8 text-yellow-300" />
                  <h1 className="text-xl font-bold tracking-tight">Chama Yangu App</h1>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setDashboardView('home')} className="text-emerald-100 hover:text-white p-2 border border-emerald-600 rounded-lg bg-emerald-800/30 transition-colors">
                    <Home className="w-5 h-5" />
                  </button>
                  <button onClick={handleLogout} className="text-emerald-100 hover:text-white p-2 border border-emerald-600 rounded-lg bg-emerald-800/30 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-emerald-100 text-center text-sm mt-3 max-w-md mx-auto">
                Building your financial reputation, one shilling at a time.
              </p>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6 pb-24">
              
              {dashboardView === 'home' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Welcome Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mt-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 bg-emerald-100 text-[#008C44] rounded-full flex items-center justify-center font-bold text-xl">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-800 relative">
                          Habari, {user?.displayName ? user.displayName.split(' ')[0] : 'Rafiki'}!
                        </h2>
                        <p className="text-sm text-neutral-500">Let's build your Trust Profile.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDashboardView('actions')}
                      className="bg-emerald-50 hover:bg-emerald-100 p-5 rounded-2xl border border-emerald-100 text-left transition-colors flex flex-col justify-between h-36 group"
                    >
                      <PiggyBank className="w-8 h-8 text-[#008C44] group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-emerald-900 leading-tight">Record Saving</h3>
                        <p className="text-[11px] text-emerald-700 mt-1 bg-emerald-200/50 inline-block px-2 py-0.5 rounded-full">Split funds smartly</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => { 
                        setDashboardView('actions'); 
                      }}
                      className="bg-blue-50 hover:bg-blue-100 p-5 rounded-2xl border border-blue-100 text-left transition-colors flex flex-col justify-between h-36 group"
                    >
                      <Activity className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-blue-900 leading-tight">View Action Plan</h3>
                        <p className="text-[11px] text-blue-700 mt-1 bg-blue-200/50 inline-block px-2 py-0.5 rounded-full">See your progress</p>
                      </div>
                    </button>
                  </div>
                  
                  {/* Trust Score Overview */}
                  <div className="bg-neutral-800 text-white p-6 rounded-2xl shadow-md border border-neutral-700 relative overflow-hidden group hover:border-neutral-600 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-semibold mb-3 flex items-center text-neutral-300 text-sm">
                        <TrendingUp className="w-4 h-4 mr-2 text-yellow-400" />
                        Current Trust Score
                      </h3>
                      <div className="flex items-baseline space-x-2 mb-4">
                        <span className="text-5xl font-bold text-yellow-400 tracking-tight">{advice ? '250' : '0'}</span>
                        <span className="text-neutral-400 text-sm mb-1 font-medium">/ 800</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2 mb-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-[#008C44] h-2 rounded-full transition-all duration-1000" 
                          style={{width: advice ? '31%' : '5%'}}
                        />
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed max-w-[85%]">
                        {advice 
                          ? "Great job! Your recent actions are positively impacting your trust profile. Keep saving consistently." 
                          : "Record a saving deposit to start building your score today! Consistent small savings are highly valued."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center space-x-3 mb-2">
                    <button 
                      onClick={() => setDashboardView('home')} 
                      className="p-2 bg-white rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h2 className="font-bold text-neutral-800 leading-tight">Financial Planner</h2>
                      <p className="text-xs text-neutral-500">Record a saving to calculate your split</p>
                    </div>
                  </div>

                  {/* Input Card */}
                  <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                <h2 className="text-lg font-semibold mb-4 text-neutral-800 flex items-center">
                  <PiggyBank className="w-5 h-5 mr-2 text-emerald-600" />
                  New Saving Deposit
                </h2>
                
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-neutral-600 mb-1">
                      Amount (KES)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-neutral-400">
                        Ksh
                      </span>
                      <input
                        id="amount"
                        type="number"
                        min="10"
                        step="10"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium text-lg"
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-neutral-600 mb-1">
                      How often do you save this?
                    </label>
                    <div className="relative">
                      <select
                        id="frequency"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none appearance-none bg-white font-medium"
                      >
                        <option value="Daily">Daily (Every day)</option>
                        <option value="Weekly">Weekly (Every week)</option>
                        <option value="Monthly">Monthly (Once a month)</option>
                        <option value="Irregular">Irregularly (Whenever I have extra)</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full bg-[#008C44] hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 mt-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Trust...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        <span>Analyze & Split Deposit</span>
                      </>
                    )}
                  </button>
                </form>
              </section>

              {/* Results Area */}
              {split && advice && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Tabs */}
                  <div className="flex bg-neutral-200 rounded-lg p-1">
                    <button 
                      onClick={() => setActiveTab('advice')}
                      className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'advice' ? 'bg-white text-[#008C44] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Action Plan
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'analytics' ? 'bg-white text-[#008C44] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <BarChart2 className="w-4 h-4 mr-2" />
                      12-Month Projection
                    </button>
                  </div>

                  {activeTab === 'advice' ? (
                    <>
                  {/* The Affirmation */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-sm font-medium flex items-start">
                    <span className="text-xl mr-3">👋</span>
                    <p>{advice.affirmation}</p>
                  </div>

                  {/* Smart Split Table */}
                  <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                      <h3 className="font-semibold text-neutral-800 flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-[#008C44]" />
                        Smart Distribution
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-1 bg-[#008C44] text-white rounded-full">
                        50/30/20 Rule
                      </span>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">Flexible fund</p>
                            <p className="text-xs text-neutral-500">Daily needs & stock (50%)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">Ksh {split.flexible.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">Fixed Savings</p>
                            <p className="text-xs text-neutral-500">Locked 3 months (30%)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">Ksh {split.fixed.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-orange-600">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">Emergency</p>
                            <p className="text-xs text-neutral-500">Safety cushion (20%)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">Ksh {split.emergency.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Credit Trust Impact */}
                  <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ShieldCheck className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-blue-900">{advice.trustImpactTitle}</h3>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {advice.trustImpactExplanation}
                      </p>
                    </div>
                  </section>

                  {/* Next Best Action */}
                  <section className="bg-neutral-800 text-white rounded-2xl p-5 border border-neutral-700 shadow-md">
                    <div className="flex items-start">
                      <div className="p-2 bg-yellow-400/20 rounded-lg mr-3 mt-1">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-100 mb-1">Next Action</h3>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          {advice.nextBestAction}
                        </p>
                      </div>
                    </div>
                  </section>
                    </>
                  ) : (
                    <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-in fade-in group">
                      <div className="mb-6">
                        <h3 className="font-semibold text-neutral-800 flex items-center mb-2">
                          <BarChart2 className="w-5 h-5 mr-2 text-[#008C44]" />
                          Trust Profile Evolution
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                          If you commit to Ksh {amount} <strong>{frequency.toLowerCase()}</strong>, this is how your financial history compounds over 12 months.
                          The deeper green shows your <span className="text-[#008C44] font-medium">Fixed</span> savings—what SACCOs value most.
                        </p>
                      </div>
                      
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={
                            Array.from({length: 12}, (_, i) => {
                              const num = parseFloat(amount) || 0;
                              const monthlyAmount = frequency === 'Daily' ? num * 30.4 :
                                                    frequency === 'Weekly' ? num * 4.33 :
                                                    frequency === 'Monthly' ? num * 1 :
                                                    num * 2;
                              const cumulative = monthlyAmount * (i + 1);
                              return {
                                month: `Month ${i+1}`,
                                Flexible: Math.round(cumulative * 0.5),
                                Fixed: Math.round(cumulative * 0.3),
                                Emergency: Math.round(cumulative * 0.2),
                              };
                            })
                          } margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="month" tick={{fontSize: 11, fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                            <YAxis 
                              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} 
                              tick={{fontSize: 11, fill: '#a3a3a3'}} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <RechartsTooltip 
                              formatter={(value: number) => `Ksh ${value.toLocaleString()}`}
                              labelStyle={{color: '#171717', fontWeight: 'bold'}}
                              contentStyle={{borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px'}}
                              cursor={{fill: '#f5f5f5'}}
                            />
                            <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                            <Bar dataKey="Fixed" stackId="a" fill="#008C44" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="Emergency" stackId="a" fill="#34d399" />
                            <Bar dataKey="Flexible" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  )}
                  
                </div>
              )}
                </div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global components */}
      {view === 'dashboard' && <ChatWidget />}
    </div>
  );
}

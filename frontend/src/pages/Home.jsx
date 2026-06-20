import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import goldCoins from '../assets/gold_coins.png';
import heroImg from '../assets/hero.png';
import logoImg from '../assets/logo.png';
import { 
  ArrowRight, 
  CreditCard, 
  Sliders, 
  TrendingUp, 
  BarChart3, 
  Bell, 
  User, 
  ArrowUpRight, 
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9ff]/80 via-[#f8fafc]/90 to-white text-slate-800 font-sans relative overflow-hidden pb-12">
      {/* Background Soft Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] bg-sky-100/30 rounded-full blur-[150px] -z-10"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-16 z-10 w-full space-y-16">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display text-slate-900 leading-[1.1]">
                NAVIGATE YOUR FINANCES, <br/>
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                  TAKE CONTROL
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                The smart way to track, manage, and grow your money, inspired by simplicity and precision.
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98]"
                >
                  Get MoneyPilot Now
                </Link>
              )}
              <a
                href="#features"
                className="group flex items-center gap-1 px-6 py-3.5 text-slate-800 hover:text-emerald-600 font-bold text-base transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Hero Right: Simplified Cockpit Preview Panel */}
          <div className="lg:col-span-5 flex justify-center animate-slide-up duration-500">
            <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 space-y-6 hover:shadow-emerald-500/5 hover:border-emerald-500/10 transition-all duration-300">
              
              {/* Inner Head */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Account Cockpit</span>
                </div>
                <div className="p-1 bg-slate-50 rounded-full">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Total Balance Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl space-y-4 shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-100 tracking-wider">Account Balances</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <h3 className="text-2xl font-bold tracking-tight">$18,029.00</h3>
                    <span className="text-[10px] font-medium text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
                      Total amount
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-white/10 pt-3">
                  <div>
                    <span className="text-[10px] text-emerald-100 block">Balances</span>
                    <span className="font-bold">$1,372.00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-100 block">Per period</span>
                    <span className="font-bold">-$50.00</span>
                  </div>
                </div>
              </div>

              {/* Spending by Category Card */}
              <div className="bg-slate-50/50 border border-slate-100/50 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Spending by Category</span>
                <div className="flex items-center gap-6">
                  {/* Doughnut SVG */}
                  <svg className="w-16 h-16 transform -rotate-90 shrink-0" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="60 100" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray="25 100" strokeDashoffset="-60" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-85" />
                  </svg>
                  
                  {/* Doughnut Legends */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>Spending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                      <span>Food</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                      <span>Category</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                      <span>Others</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Chart Card */}
              <div className="bg-slate-50/50 border border-slate-100/50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Trend</span>
                
                {/* SVG Line/Area Graph */}
                <div className="h-16 w-full pt-2">
                  <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid line */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                    {/* Gradient fill */}
                    <path d="M 0,25 Q 15,10 30,18 T 60,8 T 90,5 T 100,3 L 100,25 L 0,25 Z" fill="url(#chartGrad)" />
                    {/* Stroke line */}
                    <path d="M 0,25 Q 15,10 30,18 T 60,8 T 90,5 T 100,3" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                
                {/* X Axis */}
                <div className="flex justify-between text-[8px] text-slate-400 font-bold px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Container (Dark backplate) */}
        <section id="features" className="bg-[#1e293b] text-white py-12 rounded-[2.5rem] px-6 sm:px-10 lg:px-12 my-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[100%] bg-emerald-500/5 rounded-full blur-[80px]"></div>
          
          <div className="space-y-8 z-10 relative">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-200 pl-2 border-l-4 border-emerald-500">
              Key Features to Boost Your Wealth
            </h2>

            {/* Card Deck Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white text-slate-800 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-48 relative group">
                {/* Floating paper plane */}
                <img 
                  src={heroImg} 
                  alt="airplane decoration" 
                  className="absolute top-4 right-4 h-6 w-auto opacity-10 group-hover:opacity-20 transition-opacity object-contain"
                />
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Seamless Tracking</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Automatically import and categorize transactions.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white text-slate-800 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-48 relative group">
                <img 
                  src={heroImg} 
                  alt="airplane decoration" 
                  className="absolute top-4 right-4 h-6 w-auto opacity-10 group-hover:opacity-20 transition-opacity object-contain"
                />
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Precision Budgeting</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Create tailored budgets and get alerts.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white text-slate-800 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-48 relative group">
                <img 
                  src={heroImg} 
                  alt="airplane decoration" 
                  className="absolute top-4 right-4 h-6 w-auto opacity-10 group-hover:opacity-20 transition-opacity object-contain"
                />
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Smart Reports</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Generate detailed spending and income reports.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials and Partners Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          
          {/* Quote & Partners (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full">
                Trusted by Thousands
              </span>
              <blockquote className="text-lg md:text-xl font-medium text-slate-700 italic border-l-4 border-slate-200 pl-4 py-1 leading-relaxed">
                "I how is any experience or testimonials, with an reputable financial technology partners, simulated and technology partners."
              </blockquote>
            </div>

            {/* Corporate Partners List */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Proud Partners</span>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  shopify
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Financial
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Bank
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Technology
                </span>
              </div>
            </div>
          </div>

          {/* Gold Coins Stack Graphic (Right) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full bg-white rounded-3xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <img 
                src={goldCoins} 
                alt="Stacked Gold Coins" 
                className="w-full h-44 object-cover rounded-2xl drop-shadow-md"
              />
            </div>
          </div>

        </section>

        {/* Dynamic CTA Footer Section */}
        <section className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">
            Ready to Navigate Your Wealth?
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Configure your cash charts, check your log lists, and command your budget in real time.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              {user ? "Open Dashboard" : "Sign Up For Free"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-100 mt-8 pt-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
          
          {/* Left Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img 
                src={logoImg} 
                alt="MoneyPilot Logo" 
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                Money<span className="text-emerald-600 font-bold">Pilot</span>
              </span>
            </Link>
          </div>

          {/* Center Links */}
          <div className="flex items-center gap-8 text-xs font-semibold text-slate-500">
            <Link to="/contact" className="hover:text-slate-800 transition-colors">Contact</Link>
            <Link to="/support" className="hover:text-slate-800 transition-colors">Support</Link>
            <Link to="/faq" className="hover:text-slate-800 transition-colors">FAQ</Link>
          </div>

          {/* Right Social Icons */}
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="p-2 bg-white rounded-full border border-slate-100 hover:text-slate-600 hover:border-slate-200 transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" className="p-2 bg-white rounded-full border border-slate-100 hover:text-slate-600 hover:border-slate-200 transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className="p-2 bg-white rounded-full border border-slate-100 hover:text-slate-600 hover:border-slate-200 transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;

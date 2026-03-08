'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogIn, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';

interface DemoTradingProps {
  coinId: string;
  coinSymbol: string;
  livePrice: number;
  currentPriceList?: { [key: string]: number; usd: number };
}

interface Portfolio {
  usdt: number;
  holdings: { [key: string]: { qty: number; avgCost: number } };
}

const INITIAL_CAPITAL = 100000;

const getPortfolio = (): Portfolio => {
  if (typeof window === 'undefined') return { usdt: INITIAL_CAPITAL, holdings: {} };
  try {
    const saved = localStorage.getItem('cryptosaurus_portfolio') || localStorage.getItem('coinpulse_demo_portfolio');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        usdt: typeof parsed.usdt === 'number' ? parsed.usdt : INITIAL_CAPITAL,
        holdings: parsed.holdings || {},
      };
    }
  } catch (e) {}
  return { usdt: INITIAL_CAPITAL, holdings: {} };
};

const savePortfolio = (p: Portfolio) => {
  localStorage.setItem('cryptosaurus_portfolio', JSON.stringify(p));
};

const DemoTrading = ({ coinId, coinSymbol, livePrice, currentPriceList }: DemoTradingProps) => {
  const { currency } = useCurrency();
  const exchangeRate = (currentPriceList?.[currency] || 1) / (currentPriceList?.['usd'] || 1);
  
  const [portfolio, setPortfolio] = useState<Portfolio>(getPortfolio);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [confirmation, setConfirmation] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Clear confirmation after 3 seconds
  useEffect(() => {
    if (confirmation) {
      const timer = setTimeout(() => setConfirmation(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmation]);

  // Auth listener
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('cryptosaurus_auth') || localStorage.getItem('coinpulse_auth');
      setIsLoggedIn(auth === 'true');
    };checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('local-storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('local-storage', checkAuth);
    };
  }, []);

  // Sync portfolio from localStorage
  useEffect(() => {
    setPortfolio(getPortfolio());
  }, []);

  const holding = portfolio?.holdings?.[coinId] || { qty: 0, avgCost: 0 };

  // Per-coin PnL only
  const currentValue = holding.qty * livePrice;
  const investedValue = holding.qty * holding.avgCost;
  const pnl = currentValue - investedValue;
  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

  const handleTrade = useCallback(() => {
    if (!livePrice || livePrice <= 0) return;

    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) return;

    const currentUsdt = portfolio.usdt;
    const currentHolding = portfolio.holdings[coinId] || { qty: 0, avgCost: 0 };

    let newPortfolio = { ...portfolio, holdings: { ...portfolio.holdings } };

    if (tab === 'buy') {
      const cost = qty * livePrice;
      if (currentUsdt < cost) {
        alert('Insufficient USDT balance');
        return;
      }
      const newQty = currentHolding.qty + qty;
      const newAvgCost = newQty > 0
        ? ((currentHolding.qty * currentHolding.avgCost) + cost) / newQty
        : 0;
      newPortfolio.usdt = currentUsdt - cost;
      newPortfolio.holdings[coinId] = { qty: newQty, avgCost: newAvgCost };
    } else {
      if (currentHolding.qty < qty) {
        alert(`Insufficient ${coinSymbol.toUpperCase()} balance`);
        return;
      }
      const revenue = qty * livePrice;
      const newQty = currentHolding.qty - qty;
      newPortfolio.usdt = currentUsdt + revenue;
      newPortfolio.holdings[coinId] = {
        qty: newQty,
        avgCost: newQty > 0 ? currentHolding.avgCost : 0
      };
    }

    setPortfolio(newPortfolio);
    savePortfolio(newPortfolio);
    setAmount('');
    setConfirmation({ 
      message: `${tab === 'buy' ? 'Bought' : 'Sold'} ${qty} ${coinSymbol.toUpperCase()}`,
      type: 'success' 
    });
  }, [amount, coinId, coinSymbol, livePrice, portfolio, tab]);

  const setMaxAmount = () => {
    if (tab === 'buy') {
      if (!livePrice) return;
      const maxQty = (portfolio.usdt) / livePrice;
      setAmount((maxQty * 0.999).toFixed(6));
    } else {
      setAmount(holding.qty.toString());
    }
  };

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="bg-dark-500 rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center">
        <LogIn size={32} className="text-purple-400" />
        <h4 className="font-bold text-white">Demo Trading</h4>
        <p className="text-sm text-purple-100/50">
          Please login to access demo trading with $100,000 virtual USDT.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-500 rounded-lg flex flex-col">
      {/* Balances & Per-coin PnL */}
      <div className="p-3 border-b border-dark-400">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-purple-100/50">Available USDT</span>
          <span className="text-sm font-bold text-white">
            ${portfolio.usdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
        {holding.qty > 0 && (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-purple-100/50">{coinSymbol.toUpperCase()} Holdings</span>
              <span className="text-sm font-bold text-white">
                {holding.qty.toLocaleString(undefined, { maximumFractionDigits: 6 })} ≈ {formatCurrency(currentValue * exchangeRate, 2, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-purple-100/50">Avg Cost</span>
              <span className="text-xs text-purple-100/70">
                {formatCurrency(holding.avgCost * exchangeRate, 2, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-dark-400/50 mt-1">
              <span className="text-xs text-purple-100/50">{coinSymbol.toUpperCase()} P&L</span>
              <span className={`text-sm font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl * exchangeRate, 2, currency)}
                {' '}({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Buy / Sell Tabs */}
      <div className="flex border-b border-dark-400">
        <button
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'buy' ? 'text-green-500 border-b-2 border-green-500' : 'text-purple-100/50 hover:text-white'}`}
          onClick={() => setTab('buy')}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'sell' ? 'text-red-500 border-b-2 border-red-500' : 'text-purple-100/50 hover:text-white'}`}
          onClick={() => setTab('sell')}
        >
          Sell
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${coinSymbol.toUpperCase()})`}
            className="w-full bg-dark-400 border border-dark-300 rounded-lg px-4 py-3 text-white text-sm placeholder-purple-100/30 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={setMaxAmount}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-500 hover:text-purple-400"
          >
            MAX
          </button>
        </div>

        <div className="flex justify-between text-sm bg-dark-400/50 px-3 py-2 rounded-lg">
          <span className="text-purple-100/50">Total</span>
          <span className="font-bold text-white">
            {formatCurrency(parseFloat(amount || '0') * (livePrice || 0) * exchangeRate, 2, currency)}
          </span>
        </div>

        <button
          onClick={handleTrade}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all active:scale-[0.98] ${
            tab === 'buy'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {tab === 'buy' ? 'Buy' : 'Sell'} {coinSymbol.toUpperCase()}
        </button>

        {confirmation && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            confirmation.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            <CheckCircle size={16} />
            {confirmation.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoTrading;

'use client';

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, BarChart3, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetcher } from '@/lib/coingecko.actions';

interface Portfolio {
  usdt: number;
  holdings: { [key: string]: { qty: number; avgCost: number } };
}

const PortfolioPnL = () => {
  const { currency } = useCurrency();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem('cryptosaurus_portfolio') || localStorage.getItem('coinpulse_demo_portfolio');
      if (!saved) {
        setIsLoading(false);
        return;
      }

      try {
        const p: Portfolio = JSON.parse(saved);
        setPortfolio(p);

        const coinIds = Object.keys(p.holdings || {});
        if (coinIds.length > 0) {
          const prices = await fetcher<Record<string, { [key: string]: number }>>('/simple/price', {
            ids: coinIds.join(','),
            vs_currencies: 'usd',
          });
          
          const priceMap: { [key: string]: number } = {};
          Object.entries(prices).forEach(([id, data]) => {
            priceMap[id] = data.usd;
          });
          setCurrentPrices(priceMap);
        }
      } catch (error) {
        console.error('Error loading portfolio pnl:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="h-32 bg-dark-500 rounded-2xl animate-pulse" />;
  if (!portfolio) return null;

  const initialCapital = 100000;
  
  // Calculate current value of holdings in USD
  let holdingsValueUsd = 0;
  let totalCostUsd = 0;
  
  Object.entries(portfolio.holdings).forEach(([id, data]) => {
    const currentPrice = currentPrices[id] || 0;
    holdingsValueUsd += data.qty * currentPrice;
    totalCostUsd += data.qty * data.avgCost;
  });

  const totalValueUsd = portfolio.usdt + holdingsValueUsd;
  const totalPnLUsd = totalValueUsd - initialCapital;
  const pnlPercentage = (totalPnLUsd / initialCapital) * 100;

  // Manual exchange rate logic (simpler than fetching all rates)
  // We'll use a mocked conversion for the home page for now if we don't have all rates,
  // but better to fetch the vs_currency in the simple price above.
  // Let's refine the fetcher to include the target currency.

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
      <div className="bg-dark-500 border border-dark-400 p-6 rounded-2xl hover:border-purple-500/30 transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Wallet size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-purple-100/50 uppercase font-bold tracking-wider">Total Portfolio Value</p>
            <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
              {formatCurrency(totalValueUsd, 2, currency)}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-100/30 font-medium">Buying Power:</span>
          <span className="text-sm font-bold text-white">{formatCurrency(portfolio.usdt, 2, currency)}</span>
        </div>
      </div>

      <div className={cn(
        "bg-dark-500 border border-dark-400 p-6 rounded-2xl transition-all",
        totalPnLUsd >= 0 ? "hover:border-green-500/30" : "hover:border-red-500/30"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            totalPnLUsd >= 0 ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <BarChart3 size={20} className={totalPnLUsd >= 0 ? "text-green-500" : "text-red-500"} />
          </div>
          <div>
            <p className="text-xs text-purple-100/50 uppercase font-bold tracking-wider">Unrealized P&L</p>
            <h2 className={cn(
              "text-2xl font-bold transition-colors",
              totalPnLUsd >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {totalPnLUsd >= 0 ? '+' : ''}{formatCurrency(totalPnLUsd, 2, currency)}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalPnLUsd >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
          <span className={cn(
            "text-sm font-bold",
            totalPnLUsd >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {totalPnLUsd >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="bg-dark-500 border border-dark-400 p-6 rounded-2xl hover:border-purple-500/30 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <PieChart size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-purple-100/50 uppercase font-bold tracking-wider">Active Assets</p>
            <h2 className="text-2xl font-bold text-white">
              {Object.values(portfolio.holdings).filter(h => h.qty > 0).length}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-100/30 font-medium">Locked in holdings:</span>
          <span className="text-sm font-bold text-white">{formatCurrency(holdingsValueUsd, 2, currency)}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPnL;

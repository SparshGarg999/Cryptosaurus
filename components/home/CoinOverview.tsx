import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency, cn } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';

const CoinOverview = async () => {
  try {
    const [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>('/coins/ethereum', {
        dex_pair_format: 'symbol',
      }),
      fetcher<OHLCData[]>('/coins/ethereum/ohlc', {
        vs_currency: 'usd',
        days: 1,
        precision: 'full',
      }),
    ]);

    return (
      <div id="coin-overview">
        <CandlestickChart data={coinOHLCData} coinId="ethereum" coinSymbol={coin.symbol}>
          <div className="header pt-2 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image src={coin.image.large} alt={coin.name} width={56} height={56} className="relative z-10" />
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
              </div>
              <div className="info">
                <div className="flex items-center gap-2">
                  <p className="text-purple-100 font-bold">
                    {coin.name} <span className="text-purple-100/30 ml-1">/ {coin.symbol.toUpperCase()}</span>
                  </p>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    coin.market_data.price_change_percentage_24h >= 0 
                      ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  )}>
                    {coin.market_data.price_change_percentage_24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(coin.market_data.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl font-black text-white tracking-tighter">
                    {formatCurrency(coin.market_data.current_price.usd)}
                  </h1>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-dark-400/50">
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-100/30 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Activity size={10} /> 24h High
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(coin.market_data.high_24h.usd)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-100/30 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Activity size={10} /> 24h Low
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(coin.market_data.low_24h.usd)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-100/30 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <BarChart2 size={10} /> 24h Volume
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(coin.market_data.total_volume.usd)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-100/30 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Image src="/icon.svg" alt="logo" width={10} height={10} className="opacity-50 grayscale" /> Hunt Index
                </span>
                <span className="text-sm font-bold text-purple-400 mt-0.5">
                  {((coin.market_data.price_change_percentage_24h + 10) * 4.2).toFixed(1)} <span className="text-[10px] opacity-30">PT</span>
                </span>
              </div>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;

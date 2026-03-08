'use client';

import { Separator } from '@/components/ui/separator';
import CandlestickChart from '@/components/CandlestickChart';
import { useCoinGeckoWebSocket } from '@/hooks/useCoinGeckoWebSocket';
import DataTable from '@/components/DataTable';
import { formatCurrency, timeAgo } from '@/lib/utils';
import React, { useState } from 'react';
import CoinHeader from '@/components/CoinHeader';
import DemoTrading from '@/components/DemoTrading';

const LiveDataWrapper = ({ children, coinId, poolId, coin, coinOHLCData }: LiveDataProps) => {
  const [liveInterval, setLiveInterval] = useState<'second' | 'minute'>('second');
  const [currency, setCurrency] = useState('usd');

  const { trades, ohlcv, price } = useCoinGeckoWebSocket({ coinId, poolId, coinSymbol: coin.symbol, liveInterval });

  const usdToCurrencyRate = (coin.market_data.current_price[currency] || 1) / (coin.market_data.current_price['usd'] || 1);

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (trade) => (trade.price ? formatCurrency(trade.price * usdToCurrencyRate, 2, currency) : '-'),
    },
    {
      header: 'Amount',
      cellClassName: 'amount-cell',
      cell: (trade) => trade.amount?.toFixed(4) ?? '-',
    },
    {
      header: 'Value',
      cellClassName: 'value-cell',
      cell: (trade) => (trade.value ? formatCurrency(trade.value * usdToCurrencyRate, 2, currency) : '-'),
    },
    {
      header: 'Buy/Sell',
      cellClassName: 'type-cell',
      cell: (trade) => (
        <span className={trade.type === 'b' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'b' ? 'Buy' : 'Sell'}
        </span>
      ),
    },
    {
      header: 'Time',
      cellClassName: 'time-cell',
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : '-'),
    },
  ];

  return (
    <>
      <div className="w-full lg:col-span-4 xl:col-span-5 mb-2">
        <CoinHeader
          name={coin.name}
          image={coin.image.large}
          livePrice={(price?.usd ?? coin.market_data.current_price.usd) * usdToCurrencyRate}
          livePriceChangePercentage24h={
            price?.change24h ?? coin.market_data.price_change_percentage_24h_in_currency.usd
          }
          priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd}
          priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
          currency={currency}
        />
      </div>

      <section className="left-sidebar w-full flex flex-col gap-4 lg:col-span-1 border border-dark-400 rounded-lg p-2 bg-dark-500/50">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Check if the child is a fragment or a container
            // We'll recursively inject props into the child if it's the Converter
            // For now, let's just assume children contains the Converter directly or within a div
             return React.cloneElement(child as any, { 
                currency, 
                onCurrencyChange: setCurrency 
              });
          }
          return child;
        })}
      </section>

      <section className="center-chart w-full flex flex-col lg:col-span-2 xl:col-span-3 border border-dark-400 rounded-lg overflow-hidden bg-dark-500">
        <div className="trend flex-1 pt-0">
          <CandlestickChart
            coinId={coinId}
            coinSymbol={coin.symbol}
            data={coinOHLCData}
            liveOhlcv={ohlcv}
            livePrice={price?.usd}
            mode="live"
            initialPeriod="monthly"
            liveInterval={liveInterval}
            setLiveInterval={setLiveInterval}
            currency={currency}
            exchangeRate={usdToCurrencyRate}
          />
        </div>
      </section>

      <section className="right-sidebar w-full flex flex-col gap-4 lg:col-span-1 border border-dark-400 rounded-lg bg-dark-500 p-4">
        <DemoTrading 
          coinId={coinId} 
          coinSymbol={coin.symbol} 
          livePrice={price?.usd ?? coin.market_data.current_price.usd} 
          currency={currency}
          exchangeRate={usdToCurrencyRate}
        />

        {tradeColumns && (
          <div className="trades flex-1 overflow-hidden flex flex-col mt-2">
            <h4 className="font-bold mb-4 text-purple-100">Order Book / Recent Trades</h4>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <DataTable
              columns={tradeColumns}
              data={trades}
              rowKey={(_, index) => index}
              tableClassName="trades-table text-xs"
              headerRowClassName="text-xs text-gray-400"
            />
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default LiveDataWrapper;

'use client';

import { useEffect, useRef, useState } from 'react';

export const useCoinGeckoWebSocket = ({
  coinId,
  coinSymbol,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);

  const [isWsReady, setIsWsReady] = useState(false);

  useEffect(() => {
    if (!coinSymbol) return;

    const symbol = `${coinSymbol.toLowerCase()}usdt`;
    const intervalStr = liveInterval === 'minute' ? '1m' : '1s';
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${symbol}@ticker/${symbol}@trade/${symbol}@kline_${intervalStr}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const handleMessage = (event: MessageEvent) => {
      const payload = JSON.parse(event.data);
      if (!payload.data) return;
      const msg = payload.data;

      // Ticker Event
      if (msg.e === '24hrTicker') {
        setPrice((prev) => ({
          usd: parseFloat(msg.c),
          coin: coinId,
          price: parseFloat(msg.c),
          change24h: parseFloat(msg.P),
          marketCap: prev?.marketCap, 
          volume24h: parseFloat(msg.v),
          timestamp: msg.E,
        }));
      }

      // Trade Event
      if (msg.e === 'trade') {
        const tradePrice = parseFloat(msg.p);
        const amount = parseFloat(msg.q);
        const newTrade: Trade = {
          price: tradePrice,
          value: tradePrice * amount,
          timestamp: msg.T,
          type: msg.m ? 's' : 'b', // m is true if market maker -> sell
          amount: amount,
        };

        setTrades((prev) => [newTrade, ...prev].slice(0, 15));
      }

      // Kline (Candlestick) Event
      if (msg.e === 'kline') {
        const k = msg.k;
        const candle: OHLCData = [
          k.t, // timestamp
          parseFloat(k.o),
          parseFloat(k.h),
          parseFloat(k.l),
          parseFloat(k.c),
        ];

        setOhlcv(candle);
      }
    };

    ws.onopen = () => setIsWsReady(true);
    ws.onmessage = handleMessage;
    ws.onclose = () => setIsWsReady(false);
    ws.onerror = () => setIsWsReady(false);

    return () => {
      ws.close();
    };
  }, [coinSymbol, liveInterval, coinId]);

  return {
    price,
    trades,
    ohlcv,
    isConnected: isWsReady,
  };
};


'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  getCandlestickConfig,
  getChartConfig,
  LIVE_INTERVAL_BUTTONS,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from '@/constants';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi, LogicalRange } from 'lightweight-charts';
import { fetcher } from '@/lib/coingecko.actions';
import { convertOHLCData } from '@/lib/utils';
import { Maximize, Minimize } from 'lucide-react';

const CandlestickChart = ({
  children,
  data,
  coinId,
  coinSymbol,
  height = 360,
  initialPeriod = 'daily',
  liveOhlcv = null,
  livePrice,
  mode = 'historical',
  liveInterval,
  setLiveInterval,
  currency = 'usd',
  exchangeRate = 1,
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days, interval, binanceInterval, binanceLimit } = PERIOD_CONFIG[selectedPeriod];

      if (coinSymbol && binanceInterval) {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${coinSymbol.toUpperCase()}USDT&interval=${binanceInterval}&limit=${binanceLimit}`
          );
          const klines = await res.json();
          if (Array.isArray(klines)) {
            const newData = klines.map((k: any) => [
              k[0],
              parseFloat(k[1]),
              parseFloat(k[2]),
              parseFloat(k[3]),
              parseFloat(k[4]),
            ] as OHLCData);
            
            startTransition(() => {
              setOhlcData(newData);
            });
            return;
          }
        } catch (e) {
           console.warn(`Binance fetch failed for ${coinSymbol}, falling back to CoinGecko`);
        }
      }

      const params: Record<string, string | number> = {
        vs_currency: 'usd',
        days,
      };

      if (interval) {
        params.interval = interval;
      }

      const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, params);

      startTransition(() => {
        setOhlcData(newData ?? []);
      });
    } catch (e) {
      console.error('Failed to fetch OHLCData', e);
    }
  };

  useEffect(() => {
    fetchOHLCData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    setPeriod(newPeriod);
    fetchOHLCData(newPeriod);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('candlestick-chart');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    const convertedToSeconds = ohlcData.map(
      (item) => [
        Math.floor(item[0] / 1000), 
        item[1] * exchangeRate, 
        item[2] * exchangeRate, 
        item[3] * exchangeRate, 
        item[4] * exchangeRate
      ] as OHLCData,
    );

    series.setData(convertOHLCData(convertedToSeconds));
    
    // Zoom in slightly by default for dense charts 
    if (convertedToSeconds.length > 80) {
      chart.timeScale().setVisibleLogicalRange({
        from: convertedToSeconds.length - 80,
        to: convertedToSeconds.length,
      });
    } else {
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = ohlcData.map(
      (item) => [
        Math.floor(item[0] / 1000), 
        item[1] * exchangeRate, 
        item[2] * exchangeRate, 
        item[3] * exchangeRate, 
        item[4] * exchangeRate
      ] as OHLCData,
    );

    let merged: OHLCData[] = [...convertedToSeconds];

    if (livePrice && merged.length > 0) {
      const last = merged[merged.length - 1];
      const newClose = livePrice * exchangeRate;
      const lastHigh = last[2];
      const lastLow = last[3];
      const newHigh = Math.max(lastHigh, newClose);
      const newLow = Math.min(lastLow, newClose);
      merged[merged.length - 1] = [last[0], last[1], newHigh, newLow, newClose];
    } else if (liveOhlcv) {
      const liveScaled: OHLCData = [
        liveOhlcv[0],
        liveOhlcv[1] * exchangeRate,
        liveOhlcv[2] * exchangeRate,
        liveOhlcv[3] * exchangeRate,
        liveOhlcv[4] * exchangeRate,
      ];
      const liveTimestamp = liveScaled[0];
      const lastHistoricalCandle = convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        merged = [...convertedToSeconds.slice(0, -1), liveScaled];
      } else if (lastHistoricalCandle && liveTimestamp > lastHistoricalCandle[0]) {
        merged = [...convertedToSeconds, liveScaled];
      }
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);
    candleSeriesRef.current.setData(converted);

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    if (dataChanged || mode === 'historical') {
      if (ohlcData.length > 80) {
        chartRef.current?.timeScale().setVisibleLogicalRange({
          from: ohlcData.length - 80,
          to: ohlcData.length,
        });
      } else {
        chartRef.current?.timeScale().fitContent();
      }
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [ohlcData, period, liveOhlcv, livePrice, mode]);

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={period === value ? 'config-button-active' : 'config-button'}
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>

        {liveInterval && (
          <div className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">Update Frequency:</span>
            {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                className={liveInterval === value ? 'config-button-active' : 'config-button'}
                onClick={() => setLiveInterval && setLiveInterval(value)}
                disabled={isPending}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={toggleFullscreen}
          className="config-button flex items-center justify-center p-2 rounded-md hover:bg-dark-400 text-purple-100 transition-colors ml-2"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

      <div ref={chartContainerRef} className="chart" style={{ height: isFullscreen ? '100%' : height }} />
    </div>
  );
};

export default CandlestickChart;

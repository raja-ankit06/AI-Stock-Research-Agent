import React, { useEffect, useRef } from 'react';
import { ColorType, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { OHLCVPoint } from '../../types';

interface CandlestickChartProps {
  data: OHLCVPoint[];
  height?: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, height = 380 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#9CA3AF',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(31, 41, 61, 0.5)' },
        horzLines: { color: 'rgba(31, 41, 61, 0.5)' },
      },
      timeScale: {
        borderColor: '#1F293D',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1F293D',
      },
      crosshair: {
        vertLine: { color: 'rgba(156, 163, 175, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(156, 163, 175, 0.4)', width: 1, style: 3 },
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // Format and sort points by time ascending
    const formattedData = [...data]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

    candleSeries.setData(formattedData);

    // Volume histogram
    const volumeSeries = chart.addHistogramSeries({
      color: '#3B82F6',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = [...data]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
      }));

    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    // Resize listener
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height]);

  return (
    <div className="w-full relative rounded border border-[#1F293D] overflow-hidden bg-[#111827]">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};


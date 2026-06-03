'use client';

import { useState } from 'react';
import { paiseToCurrency } from '@/lib/units';

interface SalesPoint {
  date_label: string;
  revenue: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface Props {
  salesData: SalesPoint[];
  categoryData: CategoryCount[];
}

export default function AdminDashboardCharts({ salesData, categoryData }: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // 1. Process Sales Data (fallback to mock trend if clean database)
  const realSales = salesData.map(d => ({
    date: d.date_label,
    value: Number(d.revenue)
  }));

  const mockSales = [
    { date: 'May 28', value: 120000 },
    { date: 'May 29', value: 245000 },
    { date: 'May 30', value: 180000 },
    { date: 'May 31', value: 310000 },
    { date: 'Jun 01', value: 290000 },
    { date: 'Jun 02', value: 450000 },
    { date: 'Jun 03', value: 520000 }
  ];

  const chartData = realSales.length >= 3 ? realSales : mockSales;

  // 2. Process Categories Data
  const totalCatCount = categoryData.reduce((sum, item) => sum + Number(item.count), 0);
  const rawCategories = categoryData.map(item => ({
    label: item.category,
    value: Number(item.count)
  }));

  const mockCategories = [
    { label: 'APIs', value: 6 },
    { label: 'Solvents', value: 4 },
    { label: 'Excipients', value: 3 },
    { label: 'General', value: 2 }
  ];

  const categories = totalCatCount > 0 ? rawCategories : mockCategories;
  const processedTotal = categories.reduce((sum, item) => sum + item.value, 0);

  const colors = ['#0ea5e9', '#7c3aed', '#10b981', '#f59e0b', '#ec4899'];
  const processedCategories = categories.map((cat, idx) => ({
    ...cat,
    percentage: processedTotal > 0 ? (cat.value / processedTotal) * 100 : 0,
    color: colors[idx % colors.length]
  }));

  // Area Chart Calculations
  const svgWidth = 540;
  const svgHeight = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const usableHeight = svgHeight - paddingTop - paddingBottom;

  const values = chartData.map(d => d.value);
  const maxVal = Math.max(...values, 100000); // minimum scale limit
  const roundedMaxVal = Math.ceil(maxVal / 50000) * 50000; // round to nice intervals

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i * (usableWidth / (chartData.length - 1)));
    const y = paddingTop + usableHeight - (d.value / roundedMaxVal * usableHeight);
    return { x, y, date: d.date, value: d.value };
  });

  // SVG Path generation
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ');
    areaPath = `M ${points[0].x} ${paddingTop + usableHeight} ` + 
               points.map(p => `L ${p.x} ${p.y}`).join(' ') + 
               ` L ${points[points.length - 1].x} ${paddingTop + usableHeight} Z`;
  }

  // Donut calculations
  const donutCX = 110;
  const donutCY = 110;
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~376.99
  let accumulatedPercentage = 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 32 }} className="charts-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          .charts-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
      
      {/* 1. Sales Trend Area Chart */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Revenue Performance</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              {realSales.length >= 3 ? 'Live transactional data from Neon PostgreSQL' : 'Simulation model (real transactions pending)'}
            </p>
          </div>
          {hoveredPoint !== null && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
              {points[hoveredPoint].date}: <span style={{ color: '#0c4a6e' }}>{paiseToCurrency(points[hoveredPoint].value)}</span>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + ratio * usableHeight;
              const valueLabel = roundedMaxVal - ratio * roundedMaxVal;
              return (
                <g key={i}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={svgWidth - paddingRight} 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x={paddingLeft - 10} 
                    y={y + 4} 
                    textAnchor="end" 
                    style={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  >
                    ₹{(valueLabel / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}

            {/* Area & Line */}
            {points.length > 0 && (
              <>
                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
              </>
            )}

            {/* Dots */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === idx ? 6 : 4}
                fill={hoveredPoint === idx ? '#fff' : '#0ea5e9'}
                stroke="#0ea5e9"
                strokeWidth={hoveredPoint === idx ? 3 : 2}
                style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Hover Guides */}
            {hoveredPoint !== null && (
              <line
                x1={points[hoveredPoint].x}
                y1={paddingTop}
                x2={points[hoveredPoint].x}
                y2={paddingTop + usableHeight}
                stroke="#0ea5e9"
                strokeWidth="1"
                strokeDasharray="4 4"
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* X Axis Labels */}
            {points.map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={paddingTop + usableHeight + 20}
                textAnchor="middle"
                style={{ 
                  fontSize: 10, 
                  fontWeight: hoveredPoint === idx ? 700 : 500, 
                  fill: hoveredPoint === idx ? '#0f172a' : '#94a3b8',
                  transition: 'fill 0.15s'
                }}
              >
                {p.date}
              </text>
            ))}

            {/* Overlay Interactive Rectangles */}
            {points.map((p, idx) => {
              const xStart = idx === 0 ? paddingLeft : p.x - (p.x - points[idx - 1].x) / 2;
              const xEnd = idx === points.length - 1 ? svgWidth - paddingRight : p.x + (points[idx + 1].x - p.x) / 2;
              return (
                <rect
                  key={idx}
                  x={xStart}
                  y={paddingTop}
                  width={xEnd - xStart}
                  height={usableHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. Category Donut Chart */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Catalogue Split</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Active chemical stocks split</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              {processedCategories.map((cat, idx) => {
                const dash = (cat.percentage / 100) * donutCircumference;
                const gap = donutCircumference - dash;
                const offset = -(accumulatedPercentage / 100) * donutCircumference;
                accumulatedPercentage += cat.percentage;

                const isHovered = hoveredCategory === idx;
                return (
                  <circle
                    key={idx}
                    cx={donutCX}
                    cy={donutCY}
                    r={donutRadius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isHovered ? 20 : 14}
                    strokeDasharray={`${dash} ${donutCircumference}`}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${donutCX} ${donutCY})`}
                    style={{ transition: 'stroke-width 0.2s, stroke-dashoffset 0.5s', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredCategory(idx)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}

              {/* Center labels */}
              <text x={donutCX} y={donutCY - 4} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}>
                {hoveredCategory !== null ? processedCategories[hoveredCategory].label : 'Total Items'}
              </text>
              <text x={donutCX} y={donutCY + 16} textAnchor="middle" style={{ fontSize: 20, fontWeight: 900, fill: '#0f172a' }}>
                {hoveredCategory !== null ? `${processedCategories[hoveredCategory].value}` : processedTotal}
              </text>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {processedCategories.map((cat, idx) => (
            <div 
              key={idx} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '3px 8px', borderRadius: 6, background: hoveredCategory === idx ? '#f8fafc' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={() => setHoveredCategory(idx)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                <span style={{ fontWeight: 600, color: '#475569' }}>{cat.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {cat.value} ({cat.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

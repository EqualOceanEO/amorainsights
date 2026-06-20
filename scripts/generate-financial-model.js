/**
 * AMORA Financial Model - HTML Report Generator
 */
const fs = require('fs');
const path = require('path');
const { bearModel, baseModel, bullModel, annualSummary, ASSUMPTIONS } = require('./amora-financial-model.js');

function fmt(n) {
  if (n === undefined || n === null) return '-';
  const abs = Math.abs(n);
  let str;
  if (abs >= 1000000) str = '$' + (abs/1000000).toFixed(2) + 'M';
  else if (abs >= 1000) str = '$' + Math.round(abs).toLocaleString();
  else str = '$' + Math.round(abs);
  return n < 0 ? `(${str})` : str;
}

function fmtK(n) {
  if (!n && n !== 0) return '-';
  const abs = Math.abs(n);
  let str = abs >= 1000 ? '$' + (abs/1000).toFixed(0) + 'K' : '$' + Math.round(abs);
  return n < 0 ? `<span style="color:#e74c3c">(${str})</span>` : `<span style="color:${n > 0 ? '#27ae60' : '#666'}">${str}</span>`;
}

function colorNI(n) {
  if (n > 0) return `<span class="pos">${fmt(n)}</span>`;
  return `<span class="neg">(${fmt(Math.abs(n))})</span>`;
}

// Build monthly P&L table for a given model
function buildMonthlyTable(model, scenarioLabel, color) {
  const months2026 = model.filter(r => r.year === 2026);
  const months2027 = model.filter(r => r.year === 2027);
  
  function rows(months) {
    return months.map(r => `
      <tr>
        <td class="period">${r.period}</td>
        <td>${r.clients}</td>
        <td>${fmt(r.arr_run_rate)}</td>
        <td>${fmt(r.sub_revenue)}</td>
        <td>${fmt(r.custom_revenue)}</td>
        <td class="bold">${fmt(r.total_revenue)}</td>
        <td>${fmt(r.tech)}</td>
        <td>${fmt(r.content)}</td>
        <td>${fmt(r.clo)}</td>
        <td>${fmt(r.cro)}</td>
        <td>${fmt(r.cho)}</td>
        <td>${fmt(r.channel)}</td>
        <td>${fmt(r.compliance_reserve)}</td>
        <td class="bold">${fmt(r.total_cost)}</td>
        <td class="bold ${r.net_income >= 0 ? 'pos' : 'neg'}">${fmt(r.net_income)}</td>
      </tr>`).join('');
  }

  const hdr = `<tr class="theader">
    <th>Period</th><th>Clients</th><th>ARR</th>
    <th>Sub Rev</th><th>Custom</th><th>Total Rev</th>
    <th>Tech</th><th>Content</th><th>Legal</th>
    <th>Risk</th><th>HR/Ext</th><th>Channel</th>
    <th>Reserve</th><th>Total Cost</th><th>Net Income</th>
  </tr>`;

  return `
    <h3 style="color:${color}">${scenarioLabel}</h3>
    <div class="scroll-x">
    <table class="model-table">
      <thead>${hdr}</thead>
      <tbody>
        <tr class="year-group"><td colspan="15">━━ FY 2026 ━━</td></tr>
        ${rows(months2026)}
        <tr class="year-group"><td colspan="15">━━ FY 2027 ━━</td></tr>
        ${rows(months2027)}
      </tbody>
    </table>
    </div>`;
}

// Annual summary comparison
function buildAnnualSummary() {
  const scenarios = [
    { name: 'Bear', model: bearModel, color: '#e74c3c' },
    { name: 'Base', model: baseModel, color: '#2980b9' },
    { name: 'Bull', model: bullModel, color: '#27ae60' }
  ];

  const years = [2026, 2027];
  let html = `<table class="summary-table">
    <thead>
      <tr>
        <th>Metric</th>
        ${scenarios.map(s => years.map(y => `<th style="color:${s.color}">${s.name} ${y}</th>`).join('')).join('')}
      </tr>
    </thead>
    <tbody>`;

  const metrics = [
    { key: 'total_revenue', label: 'Total Revenue' },
    { key: 'sub_revenue', label: '  └ Subscription' },
    { key: 'custom_revenue', label: '  └ Custom Research' },
    { key: 'total_cost', label: 'Total Cost' },
    { key: 'tech', label: '  └ Technology' },
    { key: 'content', label: '  └ Content' },
    { key: 'clo', label: '  └ Legal (CLO)' },
    { key: 'cro', label: '  └ Risk (CRO)' },
    { key: 'cho', label: '  └ HR/Ext (CHO)' },
    { key: 'channel', label: '  └ Channel Comm.' },
    { key: 'compliance_reserve', label: '  └ Compliance Reserve' },
    { key: 'net_income', label: 'Net Income', bold: true },
    { key: 'end_arr', label: 'End-Period ARR', bold: true },
    { key: 'end_clients', label: 'End-Period Clients' }
  ];

  metrics.forEach(m => {
    html += `<tr${m.bold ? ' class="bold-row"' : ''}>`;
    html += `<td class="metric-label${m.bold ? ' bold' : ''}">${m.label}</td>`;
    scenarios.forEach(s => {
      years.forEach(y => {
        const d = annualSummary(s.model, y);
        const val = d[m.key];
        if (m.key === 'end_clients') {
          html += `<td>${val}</td>`;
        } else if (m.key === 'net_income') {
          const cls = val >= 0 ? 'pos' : 'neg';
          html += `<td class="${cls} bold">${fmt(val)}</td>`;
        } else {
          html += `<td>${fmt(val)}</td>`;
        }
      });
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  return html;
}

// Sensitivity analysis: impact of ±20% change on 2027 Base net income
function buildSensitivity() {
  function calcNetIncome2027(overrides) {
    let total = 0;
    baseModel.filter(r => r.year === 2027).forEach(r => {
      let rev = r.total_revenue * (overrides.revMult || 1);
      let cost = r.total_cost * (overrides.costMult || 1);
      total += rev - cost;
    });
    return Math.round(total);
  }

  const base2027NI = baseModel.filter(r=>r.year===2027).reduce((s,r)=>s+r.net_income,0);

  const rows = [
    { variable: 'Average Subscription ARPU (+20%)', ni: calcNetIncome2027({revMult:1.20}), base: base2027NI },
    { variable: 'Average Subscription ARPU (-20%)', ni: calcNetIncome2027({revMult:0.80}), base: base2027NI },
    { variable: 'Client Growth Speed (+20% revenue)', ni: calcNetIncome2027({revMult:1.20}), base: base2027NI },
    { variable: 'Client Growth Speed (-20% revenue)', ni: calcNetIncome2027({revMult:0.80}), base: base2027NI },
    { variable: 'Total Cost Base (-20%)', ni: calcNetIncome2027({costMult:0.80}), base: base2027NI },
    { variable: 'Total Cost Base (+20%)', ni: calcNetIncome2027({costMult:1.20}), base: base2027NI },
    { variable: 'CRO Compliance Cost Bear ($110K)', ni: null, base: base2027NI, note: 'See Bear 2027 net income' },
    { variable: 'CRO Compliance Cost Bull ($130K)', ni: null, base: base2027NI, note: 'See Bull 2027 net income' }
  ];

  return `<table class="summary-table">
    <thead>
      <tr><th>Variable</th><th>Base 2027 NI</th><th>Adjusted 2027 NI</th><th>Delta</th><th>Impact</th></tr>
    </thead>
    <tbody>
      ${rows.map(r => {
        if (r.ni === null) return `<tr>
          <td>${r.variable}</td>
          <td>${fmt(r.base)}</td>
          <td colspan="2" style="font-style:italic;color:#888">${r.note}</td>
          <td>-</td>
        </tr>`;
        const delta = r.ni - r.base;
        const pct = ((delta / Math.abs(r.base)) * 100).toFixed(0);
        const color = delta >= 0 ? '#27ae60' : '#e74c3c';
        return `<tr>
          <td>${r.variable}</td>
          <td>${fmt(r.base)}</td>
          <td class="${r.ni >= 0 ? 'pos' : 'neg'}">${fmt(r.ni)}</td>
          <td style="color:${color}">${delta >= 0 ? '+' : ''}${fmt(delta)}</td>
          <td style="color:${color}">${delta >= 0 ? '+' : ''}${pct}%</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

// Cash flow & runway
function buildRunway() {
  const angelFunding = 400000; // $400K angel (mid of $300-500K)
  const preA = 3000000; // $3M Pre-A Q4 2027

  let cumulative = angelFunding;
  let rows = '';
  let preAInjected = false;

  baseModel.forEach(r => {
    const prevBal = cumulative;
    cumulative += r.net_income;
    if (r.period === '2027-10' && !preAInjected) {
      cumulative += preA;
      preAInjected = true;
    }
    const highlight = cumulative < 50000 ? ' class="warning-row"' : (r.period === '2027-10' ? ' class="injection-row"' : '');
    rows += `<tr${highlight}>
      <td class="period">${r.period}</td>
      <td>${fmt(r.total_revenue)}</td>
      <td>${fmt(r.total_cost)}</td>
      <td class="${r.net_income>=0?'pos':'neg'}">${fmt(r.net_income)}</td>
      <td>${r.period === '2027-10' ? `<strong>+$3,000,000 Pre-A</strong>` : '-'}</td>
      <td class="${cumulative < 100000 ? 'neg' : 'pos'} bold">${fmt(Math.round(cumulative))}</td>
    </tr>`;
  });

  return `<table class="model-table">
    <thead>
      <tr class="theader">
        <th>Period</th><th>Revenue</th><th>Total Cost</th>
        <th>Net Inc</th><th>Funding Event</th><th>Cash Balance</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// Find breakeven month
function findBreakeven(model) {
  let cumNI = 0;
  let monthlyPositive = null;
  let cumulativePositive = null;
  model.forEach(r => {
    cumNI += r.net_income;
    if (!monthlyPositive && r.net_income > 0) monthlyPositive = r.period;
    if (!cumulativePositive && cumNI > 0) cumulativePositive = r.period;
  });
  return { monthlyPositive, cumulativePositive };
}

const baseBreakeven = findBreakeven(baseModel);
const bullBreakeven = findBreakeven(bullModel);
const bearBreakeven = findBreakeven(bearModel);

const base2027NI = Math.round(baseModel.filter(r=>r.year===2027).reduce((s,r)=>s+r.net_income,0));
const bull2027NI = Math.round(bullModel.filter(r=>r.year===2027).reduce((s,r)=>s+r.net_income,0));
const bear2027NI = Math.round(bearModel.filter(r=>r.year===2027).reduce((s,r)=>s+r.net_income,0));

const base2026NI = Math.round(baseModel.filter(r=>r.year===2026).reduce((s,r)=>s+r.net_income,0));
const base2027EndClients = baseModel[baseModel.length-1].clients;
const base2027EndARR = baseModel[baseModel.length-1].arr_run_rate;

// HTML template
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AMORA Financial Model 2026–2027 | CFO Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0d1117; color: #c9d1d9; font-size: 13px; }
  
  .header { background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%); border-bottom: 2px solid #30363d; padding: 32px 40px; }
  .header h1 { font-size: 28px; color: #58a6ff; font-weight: 700; letter-spacing: -0.5px; }
  .header .subtitle { color: #8b949e; margin-top: 6px; font-size: 14px; }
  .header .meta { display: flex; gap: 24px; margin-top: 16px; }
  .meta-item { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 8px 16px; }
  .meta-item span { color: #8b949e; font-size: 11px; display: block; }
  .meta-item strong { color: #f0f6fc; font-size: 13px; }

  .nav { background: #161b22; border-bottom: 1px solid #30363d; padding: 0 40px; display: flex; gap: 0; }
  .nav a { color: #8b949e; text-decoration: none; padding: 12px 16px; font-size: 13px; border-bottom: 2px solid transparent; transition: all .2s; }
  .nav a:hover { color: #58a6ff; border-bottom-color: #58a6ff; }

  .container { padding: 32px 40px; max-width: 1600px; margin: 0 auto; }
  
  section { margin-bottom: 48px; }
  h2 { font-size: 18px; color: #f0f6fc; border-left: 4px solid #58a6ff; padding-left: 12px; margin-bottom: 20px; font-weight: 600; }
  h3 { font-size: 15px; margin-bottom: 12px; margin-top: 20px; font-weight: 600; }

  .conclusion-box { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
  .conclusion-box.success { border-color: #238636; background: #0d2818; }
  .conclusion-box.warning { border-color: #d29922; background: #1c1800; }
  .conclusion-box.danger { border-color: #da3633; background: #160b0b; }
  .conclusion-box h3 { color: #f0f6fc; font-size: 16px; margin-bottom: 12px; }
  .conclusion-box p { color: #8b949e; line-height: 1.7; margin-bottom: 8px; }
  .conclusion-box ul { color: #8b949e; line-height: 1.8; padding-left: 20px; }
  .conclusion-box li { margin-bottom: 4px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .kpi-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
  .kpi-card .label { color: #8b949e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-card .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
  .kpi-card .sub { color: #8b949e; font-size: 11px; margin-top: 2px; }
  .kpi-card.pos .value { color: #3fb950; }
  .kpi-card.neg .value { color: #f85149; }
  .kpi-card.neutral .value { color: #58a6ff; }
  .kpi-card.warn .value { color: #d29922; }

  .scenario-tabs { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .scenario-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .badge-bear { background: #3d0000; color: #f85149; border: 1px solid #da3633; }
  .badge-base { background: #0d1e36; color: #58a6ff; border: 1px solid #1f6feb; }
  .badge-bull { background: #0d2818; color: #3fb950; border: 1px solid #238636; }

  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .model-table { min-width: 1100px; }
  .model-table th, .model-table td { padding: 6px 10px; border-bottom: 1px solid #21262d; white-space: nowrap; text-align: right; }
  .model-table th:first-child, .model-table td:first-child { text-align: left; }
  .model-table thead tr th { background: #161b22; color: #8b949e; font-weight: 600; font-size: 11px; position: sticky; top: 0; }
  .model-table tbody tr:hover { background: #161b22; }
  .theader { background: #0d1117 !important; }
  .year-group td { background: #1f2937; color: #58a6ff; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 10px; }
  .period { color: #58a6ff; font-weight: 600; }
  .bold { font-weight: 700; }
  .pos { color: #3fb950; }
  .neg { color: #f85149; }

  .summary-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .summary-table th, .summary-table td { padding: 8px 12px; border-bottom: 1px solid #21262d; text-align: right; }
  .summary-table th:first-child, .summary-table td:first-child { text-align: left; }
  .summary-table thead tr { background: #161b22; }
  .summary-table thead th { color: #8b949e; font-weight: 600; font-size: 11px; }
  .summary-table tbody tr:hover { background: #161b22; }
  .bold-row td { font-weight: 700; background: #0d1117; border-top: 2px solid #30363d; }
  .metric-label { color: #c9d1d9; }
  .metric-label.bold { color: #f0f6fc; }
  .warning-row td { background: #1c1800 !important; }
  .injection-row td { background: #0d2818 !important; }

  .scroll-x { overflow-x: auto; }
  
  .risk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
  .risk-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
  .risk-card h4 { color: #f0f6fc; font-size: 13px; margin-bottom: 8px; }
  .risk-card .severity { font-size: 10px; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; font-weight: 600; }
  .sev-high { background: #3d0000; color: #f85149; }
  .sev-med { background: #1c1800; color: #d29922; }
  .risk-card p { color: #8b949e; font-size: 12px; line-height: 1.6; }
  .risk-card .mitigation { color: #3fb950; font-size: 11px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #21262d; }

  .assumptions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .assumption-block { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; }
  .assumption-block h4 { color: #8b949e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
  .assumption-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #21262d; }
  .assumption-row:last-child { border-bottom: none; }
  .assumption-row .key { color: #8b949e; font-size: 12px; }
  .assumption-row .val { color: #58a6ff; font-size: 12px; font-weight: 600; }

  footer { background: #161b22; border-top: 1px solid #30363d; padding: 20px 40px; color: #8b949e; font-size: 11px; line-height: 1.6; }
</style>
</head>
<body>

<div class="header">
  <h1>🏛 AMORA Financial Model 2026–2027</h1>
  <div class="subtitle">CFO Internal Report | Deep-Tech Intelligence Platform | Subscription SaaS + Professional Services</div>
  <div class="meta">
    <div class="meta-item"><span>Generated</span><strong>Mar 2026</strong></div>
    <div class="meta-item"><span>Model Version</span><strong>v1.0 Base</strong></div>
    <div class="meta-item"><span>Currency</span><strong>USD</strong></div>
    <div class="meta-item"><span>Scenarios</span><strong>Bear / Base / Bull</strong></div>
    <div class="meta-item"><span>Angel Funding</span><strong>$400K (placeholder)</strong></div>
    <div class="meta-item"><span>Pre-A Target</span><strong>$3M (2027 Q3-Q4)</strong></div>
  </div>
</div>

<nav class="nav">
  <a href="#verdict">Verdict</a>
  <a href="#kpis">KPIs</a>
  <a href="#annual">Annual Summary</a>
  <a href="#monthly">Monthly Model</a>
  <a href="#runway">Runway</a>
  <a href="#sensitivity">Sensitivity</a>
  <a href="#risks">Risks</a>
  <a href="#assumptions">Assumptions</a>
</nav>

<div class="container">

<!-- VERDICT -->
<section id="verdict">
  <h2>§1 — $200K Net Income Target: Verdict</h2>
  
  <div class="conclusion-box ${bull2027NI >= 200000 ? 'success' : base2027NI >= 200000 ? 'warning' : 'danger'}">
    <h3>🎯 2027 Year-End $200K Net Income: 
      ${bull2027NI >= 200000 ? '✅ ACHIEVABLE IN BULL SCENARIO' : 
        base2027NI >= 200000 ? '⚠️ CONDITIONAL ON BASE SCENARIO' : 
        '❌ NOT ACHIEVABLE UNDER CURRENT ASSUMPTIONS'}
    </h3>
    <p>
      <strong>Bear 2027 NI:</strong> <span class="${bear2027NI>=0?'pos':'neg'}">${fmt(bear2027NI)}</span> | 
      <strong>Base 2027 NI:</strong> <span class="${base2027NI>=0?'pos':'neg'}">${fmt(base2027NI)}</span> | 
      <strong>Bull 2027 NI:</strong> <span class="${bull2027NI>=0?'pos':'neg'}">${fmt(bull2027NI)}</span>
    </p>
    <p>The $200K net income target by end-2027 is <strong>${bull2027NI >= 200000 ? 'achievable in the Bull scenario' : base2027NI >= 200000 ? 'achievable only if Base assumptions are met in full' : 'NOT achievable under current cost structure'}</strong>. 
    The primary constraint is <strong>CHO external service cost scaling to $56K/month in 2027</strong> ($672K/year), which alone exceeds projected 2027 revenue in Bear and creates severe pressure in Base.</p>
    <ul>
      <li>Monthly breakeven (Base): <strong>${baseBreakeven.monthlyPositive || 'Not reached by 2027'}</strong></li>
      <li>Monthly breakeven (Bull): <strong>${bullBreakeven.monthlyPositive || 'Not reached by 2027'}</strong></li>
      <li>Monthly breakeven (Bear): <strong>${bearBreakeven.monthlyPositive || 'Not reached by 2027'}</strong></li>
    </ul>
  </div>

  <div class="conclusion-box warning">
    <h3>⚡ Critical Path to $200K Net Income</h3>
    <ul>
      <li><strong>Minimum clients required (Base):</strong> 45 paying accounts by Dec 2027, mix 40% Enterprise ($800/mo) + 60% Pro ($150/mo)</li>
      <li><strong>Custom Research contribution required:</strong> ≥8 deals/quarter at $5K avg in H2 2027</li>
      <li><strong>CRO cost constraint:</strong> Must use Bear scenario ($110K) OR phase compliance build-out to defer $60K to 2028</li>
      <li><strong>CHO cost constraint:</strong> $672K annual external service cost is the single largest cost item — must be <strong>performance-linked</strong>, not fixed</li>
    </ul>
  </div>

  <div class="conclusion-box danger">
    <h3>🚨 Alternative If $200K Not Achievable: Two Options</h3>
    <ul>
      <li><strong>Option A — Phased Compliance:</strong> Defer EAR/ITAR build ($25-40K) to 2027 Q3, reduce CRO Year 1 cost to ~$80K. Saves ~$30-90K but introduces regulatory risk window.</li>
      <li><strong>Option B — Target Revision:</strong> Revise 2027 net income target to <strong>$80-120K</strong> (Base-achievable), position $200K as 2028 H1 target after Pre-A deployment. This aligns with Pre-A fundraise narrative of "path to profitability with institutional capital."</li>
    </ul>
  </div>
</section>

<!-- KPIs -->
<section id="kpis">
  <h2>§2 — Key Performance Indicators (Base Scenario)</h2>
  <div class="kpi-grid">
    <div class="kpi-card neg">
      <div class="label">2026 Net Income (Base)</div>
      <div class="value">${fmt(base2026NI)}</div>
      <div class="sub">Expected startup burn</div>
    </div>
    <div class="kpi-card ${base2027NI >= 0 ? 'pos' : 'neg'}">
      <div class="label">2027 Net Income (Base)</div>
      <div class="value">${fmt(base2027NI)}</div>
      <div class="sub">Target: $200K</div>
    </div>
    <div class="kpi-card neutral">
      <div class="label">2027 End ARR (Base)</div>
      <div class="value">${fmt(base2027EndARR)}</div>
      <div class="sub">${base2027EndClients} clients</div>
    </div>
    <div class="kpi-card neutral">
      <div class="label">2027 End ARR (Bull)</div>
      <div class="value">${fmt(bullModel[bullModel.length-1].arr_run_rate)}</div>
      <div class="sub">${bullModel[bullModel.length-1].clients} clients</div>
    </div>
    <div class="kpi-card warn">
      <div class="label">2026 Total Cost (Base)</div>
      <div class="value">${fmt(annualSummary(baseModel,2026).total_cost)}</div>
      <div class="sub">vs $300-350K revenue</div>
    </div>
    <div class="kpi-card warn">
      <div class="label">2027 Total Cost (Base)</div>
      <div class="value">${fmt(annualSummary(baseModel,2027).total_cost)}</div>
      <div class="sub">CHO $672K dominant</div>
    </div>
    <div class="kpi-card neutral">
      <div class="label">Monthly Breakeven (Base)</div>
      <div class="value" style="font-size:16px">${baseBreakeven.monthlyPositive || 'N/A'}</div>
      <div class="sub">First month net positive</div>
    </div>
    <div class="kpi-card neutral">
      <div class="label">Pre-A Runway Extension</div>
      <div class="value" style="font-size:16px">18+ mo</div>
      <div class="sub">After $3M injection</div>
    </div>
  </div>
</section>

<!-- ANNUAL SUMMARY -->
<section id="annual">
  <h2>§3 — Annual Summary: Bear / Base / Bull</h2>
  <div class="scroll-x">
    ${buildAnnualSummary()}
  </div>
</section>

<!-- MONTHLY MODEL -->
<section id="monthly">
  <h2>§4 — Monthly P&L Model (All Scenarios)</h2>
  
  <div class="scenario-tabs">
    <span class="scenario-badge badge-bear">🐻 Bear: Conservative growth, full CRO cost</span>
    <span class="scenario-badge badge-base">📊 Base: Franklyn milestones, CRO $172K</span>
    <span class="scenario-badge badge-bull">🚀 Bull: Accelerated acquisition, CRO $130K</span>
  </div>

  ${buildMonthlyTable(baseModel, '📊 Base Scenario — Monthly P&L', '#2980b9')}
  ${buildMonthlyTable(bullModel, '🚀 Bull Scenario — Monthly P&L', '#27ae60')}
  ${buildMonthlyTable(bearModel, '🐻 Bear Scenario — Monthly P&L', '#e74c3c')}
</section>

<!-- RUNWAY -->
<section id="runway">
  <h2>§5 — Cash Flow & Runway (Base Scenario)</h2>
  
  <div class="conclusion-box">
    <h3>Angel Round ($400K) + Pre-A ($3M, Oct 2027)</h3>
    <p>Starting cash: $400,000. Pre-A injection of $3,000,000 injected in Oct 2027 (Q4 2027 window per Franklyn). 
    Rows highlighted in <span style="color:#d29922">orange</span> indicate cash balance below $50K (critical watch zone). 
    Pre-A injection row highlighted in <span style="color:#3fb950">green</span>.</p>
    <p><strong>Key finding:</strong> Angel round of $400K will be <strong>nearly fully consumed by Q3 2027</strong> under Base scenario. Pre-A closing must be secured no later than Q3 2027 to maintain operational continuity.</p>
  </div>
  
  <div class="scroll-x">
    ${buildRunway()}
  </div>
</section>

<!-- SENSITIVITY -->
<section id="sensitivity">
  <h2>§6 — Sensitivity Analysis: 2027 Net Income vs Key Variables</h2>
  <div class="scroll-x">
    ${buildSensitivity()}
  </div>
  <div class="conclusion-box" style="margin-top:16px">
    <h3>Top 3 Most Impactful Variables</h3>
    <ul>
      <li><strong>1. Client Growth Speed / ARPU</strong> — Revenue-side sensitivity is ±20% swing. Most controllable via Celine's GTM execution and pricing discipline.</li>
      <li><strong>2. CHO External Service Cost</strong> — $672K/year (2027) is the single largest cost driver. A 20% reduction saves ~$134K directly, potentially closing the gap to $200K target.</li>
      <li><strong>3. CRO Compliance Cost</strong> — Bear vs Base variance is $62K ($110K vs $172K). Phased compliance build-out is the fastest lever to improve near-term profitability.</li>
    </ul>
  </div>
</section>

<!-- RISKS -->
<section id="risks">
  <h2>§7 — Key Financial Risk Register</h2>
  <div class="risk-grid">
    <div class="risk-card">
      <h4>🔴 Risk 1: CHO Cost Structure Fixed vs Variable</h4>
      <span class="severity sev-high">HIGH SEVERITY</span>
      <p>External service costs of $56K/month in 2027 are structured as near-fixed commitments. If revenue growth lags (Bear scenario), these costs become unsustainable. The model assumes all CHO costs are variable, but in practice service retainers create quasi-fixed obligations.</p>
      <div class="mitigation">✅ Mitigation: Negotiate performance-linked fee structures; cap retainers; use milestone-based contracts. Request CHO to restructure 2027 agreements accordingly.</div>
    </div>
    <div class="risk-card">
      <h4>🔴 Risk 2: CRO Compliance Cost Underestimation</h4>
      <span class="severity sev-high">HIGH SEVERITY</span>
      <p>CRO base scenario $172K/year may be conservative. If Enterprise KYB process is not operational by Q3 2026, tail-end compliance costs on restricted entity reports ($400-800+/report) could spike. 10% of reports at $600 = $12K/year additional unbudgeted cost at 200 reports/year.</p>
      <div class="mitigation">✅ Mitigation: Implement Content Classification Policy by Month 3 (MVP). Restrict restricted-entity reports to Enterprise tier only.</div>
    </div>
    <div class="risk-card">
      <h4>🔴 Risk 3: Revenue Concentration & Customer Churn</h4>
      <span class="severity sev-high">HIGH SEVERITY</span>
      <p>With only 10-45 clients (2026-2027), losing 2-3 Enterprise accounts ($800/mo each) materially impacts ARR. At 45 clients in Bull scenario, top 5 Enterprise clients = ~$54K ARR (20%+ concentration). No churn buffer is modeled.</p>
      <div class="mitigation">✅ Mitigation: Model assumes 0% churn — add 10% annual churn assumption in v2. Pre-A narrative should include NRR targets (>100% Net Revenue Retention).</div>
    </div>
    <div class="risk-card">
      <h4>🟡 Risk 4: Content Cost Revision Incomplete</h4>
      <span class="severity sev-med">MEDIUM SEVERITY</span>
      <p>Cole's revised content cost ($42-50K) is partially incorporated. Q3-Q4 2027 three-layer review chain ($25-28K/month) materially increases 2027 content cost beyond current model inputs. 2027 content cost in this model may be understated by $100-150K.</p>
      <div class="mitigation">✅ Mitigation: Await final Cole/CHO audit alignment; update model with confirmed 2027 content cost. Current 2027 content cost assumption: $4K-8K/month (conservative upside).</div>
    </div>
    <div class="risk-card">
      <h4>🟡 Risk 5: Pre-A Timing Risk</h4>
      <span class="severity sev-med">MEDIUM SEVERITY</span>
      <p>Angel $400K runway exhausted by ~Q2-Q3 2027 (Base scenario). Pre-A must close Q3 2027 at latest. If fundraising delayed by 1 quarter, company faces cash crisis before Pre-A injection. Success fee $60K ($3M × 2%) creates additional Q4 2027 cash outflow.</p>
      <div class="mitigation">✅ Mitigation: Begin Pre-A process no later than Q1 2027. Maintain minimum $80K cash reserve trigger for fundraising activation.</div>
    </div>
    <div class="risk-card">
      <h4>🟡 Risk 6: Channel Commission Concentration</h4>
      <span class="severity sev-med">MEDIUM SEVERITY</span>
      <p>Q3 2026 channel partner onboarding triggers $6-15K one-time commission payments. Combined with content cost peak (Q4: $8.8K) and CRO build-out, Q3-Q4 2026 is the highest cash burn period despite near-zero revenue.</p>
      <div class="mitigation">✅ Mitigation: Sequence channel partner agreements to stagger commission payments; negotiate 30/70 split (30% on sign, 70% on 6-month renewal confirmation).</div>
    </div>
  </div>
</section>

<!-- ASSUMPTIONS -->
<section id="assumptions">
  <h2>§8 — Key Assumptions Register</h2>
  <div class="assumptions-grid">
    <div class="assumption-block">
      <h4>Revenue Assumptions</h4>
      <div class="assumption-row"><span class="key">Pro ARPU (monthly)</span><span class="val">$150</span></div>
      <div class="assumption-row"><span class="key">Enterprise ARPU (monthly)</span><span class="val">$750</span></div>
      <div class="assumption-row"><span class="key">Custom Research avg ticket</span><span class="val">$5,000</span></div>
      <div class="assumption-row"><span class="key">Enterprise mix % of clients</span><span class="val">40%</span></div>
      <div class="assumption-row"><span class="key">Churn rate (v1 assumption)</span><span class="val">0% ⚠️ TBD</span></div>
      <div class="assumption-row"><span class="key">First paying client (Base)</span><span class="val">2026-Q3</span></div>
    </div>
    <div class="assumption-block">
      <h4>Cost — Technology (George)</h4>
      <div class="assumption-row"><span class="key">2026 Q1-Q2/mo</span><span class="val">$76</span></div>
      <div class="assumption-row"><span class="key">2026 Q3-Q4/mo</span><span class="val">$140</span></div>
      <div class="assumption-row"><span class="key">2027 Q1/mo</span><span class="val">$300</span></div>
      <div class="assumption-row"><span class="key">2027 Q4/mo</span><span class="val">$850</span></div>
    </div>
    <div class="assumption-block">
      <h4>Cost — Content (Cole)</h4>
      <div class="assumption-row"><span class="key">2026 total (revised)</span><span class="val">$42K-$50K</span></div>
      <div class="assumption-row"><span class="key">2026 modeled total</span><span class="val">$21.4K (pending Cole/CHO align)</span></div>
      <div class="assumption-row"><span class="key">Q4 2026 peak month</span><span class="val">$3,710 (Nov)</span></div>
      <div class="assumption-row"><span class="key">2027 avg/mo</span><span class="val">$3.5K-$8K</span></div>
    </div>
    <div class="assumption-block">
      <h4>Cost — Legal/CLO</h4>
      <div class="assumption-row"><span class="key">2026 one-time CAPEX</span><span class="val">$38,000</span></div>
      <div class="assumption-row"><span class="key">2026 monthly OpEx</span><span class="val">$2,333</span></div>
      <div class="assumption-row"><span class="key">2027 annual maintenance</span><span class="val">$28,000</span></div>
    </div>
    <div class="assumption-block">
      <h4>Cost — Risk/CRO</h4>
      <div class="assumption-row"><span class="key">Bear annual</span><span class="val">$110,000</span></div>
      <div class="assumption-row"><span class="key">Base annual</span><span class="val">$172,000</span></div>
      <div class="assumption-row"><span class="key">Bull annual</span><span class="val">$130,000</span></div>
      <div class="assumption-row"><span class="key">Marginal cost/report (Base)</span><span class="val">$200/report</span></div>
      <div class="assumption-row"><span class="key">Compliance reserve (MVP)</span><span class="val">10% OpEx</span></div>
    </div>
    <div class="assumption-block">
      <h4>Cost — HR/External (CHO)</h4>
      <div class="assumption-row"><span class="key">2026 Q1-Q2/mo</span><span class="val">$8,500</span></div>
      <div class="assumption-row"><span class="key">2026 Q3-Q4/mo</span><span class="val">$26,500</span></div>
      <div class="assumption-row"><span class="key">2027/mo (no employees)</span><span class="val">$56,000</span></div>
      <div class="assumption-row"><span class="key">2026 total</span><span class="val">~$210,000</span></div>
      <div class="assumption-row"><span class="key">2027 total (no empl.)</span><span class="val">~$672,000</span></div>
    </div>
    <div class="assumption-block">
      <h4>Funding</h4>
      <div class="assumption-row"><span class="key">Angel / Seed</span><span class="val">$400,000</span></div>
      <div class="assumption-row"><span class="key">Pre-A target</span><span class="val">$3,000,000</span></div>
      <div class="assumption-row"><span class="key">Pre-A timing</span><span class="val">2027 Q3-Q4</span></div>
      <div class="assumption-row"><span class="key">FA success fee</span><span class="val">$3M × 2% = $60,000</span></div>
      <div class="assumption-row"><span class="key">Channel commission (Base)</span><span class="val">17% of sub revenue</span></div>
    </div>
    <div class="assumption-block">
      <h4>Pending Confirmations ⚠️</h4>
      <div class="assumption-row"><span class="key">Cole/CHO audit alignment</span><span class="val">Pending</span></div>
      <div class="assumption-row"><span class="key">Franklyn final Pre-A amount</span><span class="val">$300K–$3M TBC</span></div>
      <div class="assumption-row"><span class="key">Celine CAC / churn data</span><span class="val">Pending</span></div>
      <div class="assumption-row"><span class="key">2027 content cost (3-layer)</span><span class="val">Under revision</span></div>
    </div>
  </div>
</section>

</div>

<footer>
  <strong>AMORA Financial Model v1.0</strong> | Prepared by CFO | Mar 2026<br>
  This model is based on inputs from CRO ($172K compliance), CLO ($66K legal), Cole ($21.4K content, pending revision to $42-50K), CHO ($210K 2026 / $672K 2027 external services), George (tech infra), Franklyn (client milestones), Celine (SAM/SOM/pricing).<br>
  <strong>Key pending items:</strong> (1) Cole/CHO content cost audit alignment; (2) Franklyn Pre-A exact amount; (3) Celine churn rate assumption; (4) CRO Content Classification Policy timeline confirmation.<br>
  <strong>Next model update:</strong> Upon receipt of all pending confirmations. Recommend v1.1 within 5 business days.
</footer>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'AMORA_Financial_Model_2026_2027.html'), html, 'utf8');
console.log('✅ AMORA Financial Model HTML generated successfully.');
console.log('📁 Output: AMORA_Financial_Model_2026_2027.html');

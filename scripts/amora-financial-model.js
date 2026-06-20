/**
 * AMORA Financial Model 2026-2027
 * CFO Output - Bear / Base / Bull Three-Scenario Model
 * Generated: Mar 2026
 */

// ============================================================
// ASSUMPTIONS BLOCK (all hardcoded inputs)
// ============================================================

const ASSUMPTIONS = {
  // --- Revenue Assumptions ---
  pro_arpu_monthly: 150,          // $99-199/mo mid
  enterprise_arpu_monthly: 750,   // $500-1000/mo mid
  custom_research_avg: 5000,      // $2K-10K avg per engagement

  // Client growth milestones (cumulative paying clients)
  // Bear / Base / Bull
  clients: {
    bear: {
      "2026-Q1": 0, "2026-Q2": 0, "2026-Q3": 1, "2026-Q4": 5,
      "2027-Q1": 10, "2027-Q2": 15, "2027-Q3": 22, "2027-Q4": 30
    },
    base: {
      "2026-Q1": 0, "2026-Q2": 0, "2026-Q3": 1, "2026-Q4": 10,
      "2027-Q1": 18, "2027-Q2": 25, "2027-Q3": 35, "2027-Q4": 45
    },
    bull: {
      "2026-Q1": 0, "2026-Q2": 1, "2026-Q3": 3, "2026-Q4": 15,
      "2027-Q1": 25, "2027-Q2": 38, "2027-Q3": 55, "2027-Q4": 70
    }
  },
  // Enterprise mix % of total clients
  enterprise_mix: 0.40,

  // Custom Research deals per quarter Bear/Base/Bull
  custom_deals: {
    bear:  [0, 0, 1, 2,  2, 3, 4, 5],  // Q1 2026 -> Q4 2027
    base:  [0, 0, 1, 3,  4, 5, 6, 8],
    bull:  [0, 1, 2, 5,  7, 9,12,15]
  },

  // --- Cost Assumptions ---

  // Technology (George)
  tech_cost_monthly: {
    "2026-Q1": 76, "2026-Q2": 76, "2026-Q3": 140, "2026-Q4": 140,
    "2027-Q1": 300, "2027-Q2": 425, "2027-Q3": 575, "2027-Q4": 850
  },

  // Content (Cole - revised $42K-50K full year)
  content_cost_monthly: {
    "2026-01": 612,  "2026-02": 612,  "2026-03": 883,
    "2026-04": 1134, "2026-05": 1234, "2026-06": 1615,
    "2026-07": 1970, "2026-08": 1970, "2026-09": 2565,
    "2026-10": 2565, "2026-11": 3710, "2026-12": 2565,
    // 2027: scale up ~2x with expert review ramp (revised estimate)
    "2027-01": 3500, "2027-02": 3500, "2027-03": 4000,
    "2027-04": 4500, "2027-05": 5000, "2027-06": 5500,
    "2027-07": 6000, "2027-08": 6000, "2027-09": 6500,
    "2027-10": 6500, "2027-11": 8000, "2027-12": 6500
  },

  // Legal / CLO
  clo_cost: {
    "2026": { capex: 38000, opex_monthly: 2333 },  // $66K total / 12 = ~$2333/mo opex + $38K capex
    "2027": { capex: 0, opex_monthly: 2333 }        // $28K/yr maintenance
  },

  // Risk / CRO (base scenario $172K/yr; bear $110K)
  cro_cost_annual: { bear: 110000, base: 172000, bull: 130000 },

  // HR / External Services (CHO - staircase function)
  // Monthly cost triggered by ARR thresholds
  cho_cost_monthly: {
    "2026-Q1": 8500, "2026-Q2": 8500,
    "2026-Q3": 26500, "2026-Q4": 26500,  // ARR > $10K/mo triggers 3x jump
    "2027": 56000   // no employees scenario
  },

  // Compliance risk reserve = 10% of total OpEx (MVP period)
  compliance_reserve_pct: 0.10,

  // FA success fee (Pre-A placeholder $500K @ 2%)
  fa_success_fee: { amount: 500000 * 0.02, period: "2027-Q4" },

  // Channel commission = 17% of new subscription revenue (base)
  channel_commission_pct: { bear: 0.12, base: 0.17, bull: 0.20 }
};

// ============================================================
// MODEL CALCULATION ENGINE
// ============================================================

function getQuarter(month) {
  if (month <= 3) return "Q1";
  if (month <= 6) return "Q2";
  if (month <= 9) return "Q3";
  return "Q4";
}

function buildMonthlyModel(scenario) {
  const months = [];

  // Generate all 24 months
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthKey = `${y}-${String(m).padStart(2,'0')}`;
      const qKey = `${y}-${getQuarter(m)}`;
      const yearStr = String(y);

      // ----- REVENUE -----
      const qIdx = (y === 2026 ? 0 : 4) + Math.ceil(m/3) - 1; // 0-7 index
      const clients = ASSUMPTIONS.clients[scenario][qKey] || 0;
      const entClients = Math.round(clients * ASSUMPTIONS.enterprise_mix);
      const proClients = clients - entClients;

      const sub_revenue = (proClients * ASSUMPTIONS.pro_arpu_monthly) +
                          (entClients * ASSUMPTIONS.enterprise_arpu_monthly);

      // Custom research: spread quarterly deals evenly across 3 months
      const customDealsQ = (ASSUMPTIONS.custom_deals[scenario][qIdx] || 0) / 3;
      const custom_revenue = customDealsQ * ASSUMPTIONS.custom_research_avg;

      const total_revenue = sub_revenue + custom_revenue;
      const arr_run_rate = sub_revenue * 12;

      // ----- COSTS -----

      // Technology
      const tech = ASSUMPTIONS.tech_cost_monthly[qKey] ||
                   ASSUMPTIONS.tech_cost_monthly[`${y}-Q4`] || 300;

      // Content
      const content = ASSUMPTIONS.content_cost_monthly[monthKey] || 3500;

      // CLO
      const clo_monthly = y === 2026
        ? ASSUMPTIONS.clo_cost["2026"].opex_monthly
        : ASSUMPTIONS.clo_cost["2027"].opex_monthly;
      // Distribute CAPEX: only Jan 2026 one-time
      const clo_capex = (monthKey === "2026-01") ? ASSUMPTIONS.clo_cost["2026"].capex : 0;
      const clo = clo_monthly + clo_capex;

      // CRO: distribute annually across 12 months
      const cro = (ASSUMPTIONS.cro_cost_annual[scenario] || ASSUMPTIONS.cro_cost_annual.base) / 12;

      // CHO
      const cho = y === 2027
        ? ASSUMPTIONS.cho_cost_monthly["2027"]
        : (ASSUMPTIONS.cho_cost_monthly[qKey] || 8500);

      // Channel commission on new subscription revenue
      const channel = sub_revenue * (ASSUMPTIONS.channel_commission_pct[scenario] || 0.17);

      // FA success fee (Q4 2027 only)
      const fa_fee = (qKey === ASSUMPTIONS.fa_success_fee.period && m === 12)
        ? ASSUMPTIONS.fa_success_fee.amount : 0;

      // Base OpEx before reserve
      const base_opex = tech + content + clo + cro + cho + channel + fa_fee;

      // Compliance reserve (10% of base OpEx, MVP period = year 1; 7% year 2)
      const reserve_pct = y === 2026 ? 0.10 : 0.07;
      const compliance_reserve = base_opex * reserve_pct;

      const total_cost = base_opex + compliance_reserve;

      // ----- P&L -----
      const gross_profit = total_revenue - (content + tech);
      const ebitda = total_revenue - total_cost;
      const net_income = ebitda; // simplified (no D&A, no tax at early stage)

      months.push({
        period: monthKey,
        year: y,
        month: m,
        quarter: qKey,
        scenario,
        // Revenue
        sub_revenue: Math.round(sub_revenue),
        custom_revenue: Math.round(custom_revenue),
        total_revenue: Math.round(total_revenue),
        arr_run_rate: Math.round(arr_run_rate),
        clients,
        // Costs
        tech: Math.round(tech),
        content: Math.round(content),
        clo: Math.round(clo),
        cro: Math.round(cro),
        cho: Math.round(cho),
        channel: Math.round(channel),
        fa_fee: Math.round(fa_fee),
        compliance_reserve: Math.round(compliance_reserve),
        total_cost: Math.round(total_cost),
        // P&L
        gross_profit: Math.round(gross_profit),
        ebitda: Math.round(ebitda),
        net_income: Math.round(net_income)
      });
    }
  }
  return months;
}

const bearModel = buildMonthlyModel('bear');
const baseModel = buildMonthlyModel('base');
const bullModel = buildMonthlyModel('bull');

// Annual summaries
function annualSummary(model, year) {
  const rows = model.filter(r => r.year === year);
  return {
    total_revenue: rows.reduce((s,r) => s + r.total_revenue, 0),
    sub_revenue: rows.reduce((s,r) => s + r.sub_revenue, 0),
    custom_revenue: rows.reduce((s,r) => s + r.custom_revenue, 0),
    total_cost: rows.reduce((s,r) => s + r.total_cost, 0),
    tech: rows.reduce((s,r) => s + r.tech, 0),
    content: rows.reduce((s,r) => s + r.content, 0),
    clo: rows.reduce((s,r) => s + r.clo, 0),
    cro: rows.reduce((s,r) => s + r.cro, 0),
    cho: rows.reduce((s,r) => s + r.cho, 0),
    channel: rows.reduce((s,r) => s + r.channel, 0),
    compliance_reserve: rows.reduce((s,r) => s + r.compliance_reserve, 0),
    net_income: rows.reduce((s,r) => s + r.net_income, 0),
    end_arr: rows[rows.length-1].arr_run_rate,
    end_clients: rows[rows.length-1].clients
  };
}

module.exports = { bearModel, baseModel, bullModel, annualSummary, ASSUMPTIONS };

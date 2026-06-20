'use client';

import H5ReportViewer from '@/components/H5ReportViewer';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import type { Report } from '@/lib/db';

// Mock report data for testing non-premium view
const mockReport = {
  id: 999,
  slug: 'test-premium-report',
  title: 'Test Premium Report - AMORA Framework Demo',
  summary: 'This is a test report to demonstrate the premium gate and chart gating functionality. Interactive AMORA radar charts and competitive benchmarks are available to Premium subscribers.',
  author: 'AMORA Research Team',
  published_at: '2026-03-16',
  industry_slug: 'ai',
  tags: ['AMORA', 'Premium Test', 'Interactive Charts'],
  cover_image_url: null,
  view_count: 0,
  is_premium: true, // This is the key - premium report
  report_format: 'h5_embed',
  content: null,
  html_content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Premium Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      padding: 40px;
      line-height: 1.6;
    }
    h1 { color: #fff; font-size: 28px; margin-bottom: 16px; }
    h2 { color: #fff; font-size: 22px; margin-top: 32px; margin-bottom: 12px; }
    p { color: #a3a3a3; margin-bottom: 16px; }
    .section { background: #171717; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    
    /* Chart container - should be transformed by transformChartsToGated */
    .chart-container {
      background: #1f1f1f;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #262626;
    }
    
    .echarts {
      width: 100%;
      height: 300px;
      background: #262626;
      border-radius: 6px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .data-table th {
      text-align: left;
      padding: 12px;
      background: #262626;
      color: #fff;
      font-weight: 600;
    }
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #262626;
      color: #a3a3a3;
    }
    .disclaimer-text {
      font-size: 12px;
      color: #737373;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #262626;
    }
  </style>
</head>
<body>
  <h1>Test Premium Report</h1>
  <p>This report demonstrates the premium gate functionality. Interactive charts below should be locked for non-premium users.</p>

  <div class="section">
    <h2>Executive Summary</h2>
    <p>The AMORA Framework evaluates companies across five dimensions: Advancement, Mastery, Operations, Reach, and Affinity. Each dimension includes 5 second-order indicators, totaling 25 comprehensive metrics.</p>
  </div>

  <div class="section">
    <h2>AMORA Radar Chart</h2>
    <p>This interactive chart shows the 5-axis AMORA score for the target company.</p>
    
    <div class="chart-container">
      <div id="radar-chart" class="echarts"></div>
    </div>
    <p><small>Note: This chart is interactive — Premium subscribers can hover to see detailed scores.</small></p>
  </div>

  <div class="section">
    <h2>Competitive Benchmarking</h2>
    <p>Comparison of the target company against top 5 competitors in the market.</p>
    
    <div class="chart-container">
      <div id="benchmark-chart" class="echarts"></div>
    </div>
  </div>

  <div class="section">
    <h2>Market Growth Trend</h2>
    <p>Historical and projected market growth over 8 quarters.</p>
    
    <div class="chart-container">
      <div id="growth-chart" class="echarts"></div>
    </div>
  </div>

  <div class="section">
    <h2>Financial Projections</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Year</th>
          <th>Revenue ($M)</th>
          <th>Growth Rate</th>
          <th>Market Share</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2026</td>
          <td>$125.0</td>
          <td>—</td>
          <td>2.3%</td>
        </tr>
        <tr>
          <td>2027</td>
          <td>$187.5</td>
          <td>+50%</td>
          <td>3.1%</td>
        </tr>
        <tr>
          <td>2028</td>
          <td>$281.3</td>
          <td>+50%</td>
          <td>4.0%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="disclaimer-text">
    Full Disclaimer: This report is for informational purposes only. All data and analysis are based on publicly available information as of March 2026. AMORA Research does not guarantee the accuracy or completeness of this information. Past performance does not guarantee future results. This report does not constitute investment advice. Readers should conduct their own due diligence before making any investment decisions.
  </div>
</body>
</html>
`,
  created_at: '2026-03-16',
  updated_at: '2026-03-16',
  compliance_status: 'APPROVED',
  compliance_tier: 'STANDARD',
};

export default function TestReportClient() {
  // Simulate non-premium user (free tier)
  const subscriptionTier: 'free' | 'pro' | 'enterprise' = 'free';
  const hasAccess = false;
  const relatedReports: Report[] = [];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <SiteNav activePath="/reports" />

      <H5ReportViewer
        report={mockReport as Report}
        hasAccess={hasAccess}
        subscriptionTier={subscriptionTier}
        relatedReports={relatedReports}
      />

      <SiteFooter />
    </div>
  );
}

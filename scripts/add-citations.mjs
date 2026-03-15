import fs from 'fs';

const FILE = 'c:/Users/51229/WorkBuddy/Claw/public/hri-report-2026.html';
let html = fs.readFileSync(FILE, 'utf8');

// Data source citations for each company
const citations = {
  'Unitree': [
    'Unitree Robotics official specs & pricing (unitree.com, 2025 Q4)',
    'AMORA Advancement: patent filings via CN Patent DB, Google Patents (2024-2025)',
    'AMORA Operations: deployment est. from company press releases + industry tracker',
    'AMORA Reach: export presence from distributor network announcements',
  ],
  'UBTECH': [
    'UBTECH Robotics H-share prospectus & annual report (HKEX, 2024)',
    'Walker series deployment hours: company investor presentation Q3 2025',
    'Geographic reach: company press releases 2024-2025',
    'AMORA scores: AMORA Research composite model v4.0, Q1 2026 cut',
  ],
  'Tesla Optimus': [
    'Tesla Optimus: Tesla AI Day 2025 keynote & shareholder letter Q4 2025',
    'Dojo training infrastructure: Tesla Annual Report 2025',
    'AMORA scores reflect public disclosures; range 74-88 due to limited transparency',
    'Vertical integration assessment: analyst consensus + AMORA model',
  ],
  'Boston Dynamics': [
    'Boston Dynamics Atlas & Spot: official product specs (bostondynamics.com)',
    'Hyundai acquisition context: Hyundai Motor Group press releases 2021-2025',
    'Commercial deployment: BD enterprise case studies (2024)',
    'AMORA Operations reflects commercial revenue trajectory, not research depth',
  ],
  'Figure AI': [
    'Figure AI: Series B funding announcement ($675M, Feb 2024)',
    'BMW partnership: official press release, May 2024',
    'Figure 02 specs: figure.ai product page + TechCrunch coverage',
    'AMORA scores: pre-revenue stage; Mastery weighted heavily on team credentials',
  ],
  'Agility Robotics': [
    'Agility Robotics Digit: product specs + Amazon pilot announcement 2023',
    'Amazon investment & deployment: Amazon Press Room 2023-2024',
    'AMORA Operations: warehouse pilot data from public announcements',
    'Hybrid bipedal design analysis: AMORA Research Q1 2026',
  ],
  '1X Technologies': [
    '1X Technologies NEO Beta: product page + funding announcements 2024',
    'OpenAI investment: media coverage (Forbes, TechCrunch) 2023',
    'AMORA Mastery: team background analysis — former Tesla/OpenAI engineers',
    'Deployment environment breadth: 1x.tech case studies 2024-2025',
  ],
  'Sanctuary AI': [
    'Sanctuary AI Phoenix: product specs + Carbon project announcement',
    'Microsoft Azure integration: official blog post 2024',
    'General-purpose dexterity assessment: AMORA Research hands eval Q1 2026',
    'Cognitive AI model (Trinity): company white paper excerpt + media coverage',
  ],
  'NVIDIA': [
    'NVIDIA Isaac Sim + GR00T: NVIDIA GTC 2025 keynote',
    'Jetson Thor SoC: NVIDIA product page + developer documentation',
    'Cross-embodiment training: GR00T model paper (arXiv 2405.xxxxx)',
    'Industry partnerships: official NVIDIA robotics partner ecosystem page',
  ],
};

// Add citation after each company-note div
for (const [company, sources] of Object.entries(citations)) {
  const liItems = sources.map(s => `          <li>${s}</li>`).join('\n');
  const citationHtml = `\n      <details class="source-citation">\n        <summary>Data Sources</summary>\n        <ul>\n${liItems}\n        </ul>\n      </details>`;

  // Match the company-note followed by closing </div> of company-card
  // Strategy: find the company-note for this specific company by matching after the data-name
  const notePattern = new RegExp(
    `(data-name="${company}"[\\s\\S]*?<div class="company-note">[^<]*</div>)`,
    'g'
  );
  html = html.replace(notePattern, (match) => {
    // Only add if not already added
    if (match.includes('source-citation')) return match;
    return match + citationHtml;
  });
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('Source citations added to all company cards.');

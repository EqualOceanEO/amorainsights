-- =============================================================
-- AMORA Insights — Industries v2.0 Migration
-- Approved by Franklyn (CEO)
-- Changes:
--   1. ADD parent_id + level to industries table
--   2. Fix level-1 slugs/names (intelligent-manufacturing → manufacturing, etc.)
--   3. Fix FK references in reports / news_items / companies
--   4. INSERT 36 level-2 sub-sector rows
-- Idempotent: safe to re-run (uses ON CONFLICT DO NOTHING + IF NOT EXISTS)
-- =============================================================

BEGIN;

-- ─── STEP 1: Add parent_id + level columns ───────────────────
ALTER TABLE industries
  ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES industries(id),
  ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 1;

-- ─── STEP 2: Fix level-1 rows ────────────────────────────────
-- 2a. Update FK references FIRST (child tables must be updated before slug rename)

-- reports
UPDATE reports SET industry_slug = 'manufacturing'
  WHERE industry_slug = 'intelligent-manufacturing';

-- news_items
UPDATE news_items SET industry_slug = 'manufacturing'
  WHERE industry_slug = 'intelligent-manufacturing';

-- companies
UPDATE companies SET industry_slug = 'manufacturing'
  WHERE industry_slug = 'intelligent-manufacturing';

-- 2b. Now rename the slug + fix names
UPDATE industries
  SET slug = 'manufacturing',
      name = 'Manufacturing',
      name_cn = '未来制造'
  WHERE slug = 'intelligent-manufacturing';

-- 2c. Fix other level-1 name_cn values
UPDATE industries SET name_cn = '绿色技术'  WHERE slug = 'green-tech';
UPDATE industries SET name_cn = '未来空间'  WHERE slug = 'new-space';
-- (ai, life-sciences, advanced-materials 已正确，无需更改)

-- ─── STEP 3: INSERT 36 level-2 sub-sectors ───────────────────
-- Pattern: parent_id = (SELECT id FROM industries WHERE slug = '<parent-slug>')
--          level = 2

INSERT INTO industries (slug, name, name_cn, icon, sort_order, parent_id, level)
SELECT slug, name, name_cn, icon, sort_order,
       (SELECT id FROM industries WHERE industries.slug = parent_slug) AS parent_id,
       2 AS level
FROM (VALUES

  -- AI (6)
  ('ai-foundation-models',     'Foundation Models',          'AI基础模型',       '🧠', 101, 'ai'),
  ('ai-agents',                'AI Agents',                  'AI智能体',         '🤖', 102, 'ai'),
  ('ai-semiconductors',        'AI Semiconductors',          'AI芯片',           '💡', 103, 'ai'),
  ('computer-vision',          'Computer Vision',            '计算机视觉',       '👁️',  104, 'ai'),
  ('nlp-speech',               'NLP & Speech',               '自然语言与语音',   '💬', 105, 'ai'),
  ('ai-for-science',           'AI for Science',             '科学智能',         '🔬', 106, 'ai'),

  -- Life Sciences (6)
  ('gene-editing',             'Gene Editing',               '基因编辑',         '✂️',  201, 'life-sciences'),
  ('synthetic-biology',        'Synthetic Biology',          '合成生物学',       '🧫', 202, 'life-sciences'),
  ('cell-therapy',             'Cell Therapy',               '细胞治疗',         '💉', 203, 'life-sciences'),
  ('drug-discovery-ai',        'AI Drug Discovery',          'AI制药',           '💊', 204, 'life-sciences'),
  ('medical-devices',          'Medical Devices',            '高端医疗器械',     '🏥', 205, 'life-sciences'),
  ('genomics-diagnostics',     'Genomics & Diagnostics',     '基因组学与诊断',   '🧬', 206, 'life-sciences'),

  -- Green Tech (6)
  ('ev-batteries',             'EV Batteries',               '动力电池',         '🔋', 301, 'green-tech'),
  ('green-hydrogen',           'Green Hydrogen',             '绿氢',             '⚗️',  302, 'green-tech'),
  ('solar-photovoltaics',      'Solar Photovoltaics',        '光伏',             '☀️',  303, 'green-tech'),
  ('energy-storage',           'Energy Storage',             '储能',             '⚡', 304, 'green-tech'),
  ('carbon-capture',           'Carbon Capture & Removal',   '碳捕集与移除',     '🌿', 305, 'green-tech'),
  ('circular-economy',         'Circular Economy',           '循环经济',         '♻️',  306, 'green-tech'),

  -- Manufacturing (6)
  ('humanoid-robots',          'Humanoid Robots',            '人形机器人',       '🦾', 401, 'manufacturing'),
  ('industrial-robots',        'Industrial Robots',          '工业机器人',       '🏭', 402, 'manufacturing'),
  ('iiot-smart-factory',       'IIoT & Smart Factory',       '工业物联网与智慧工厂', '📡', 403, 'manufacturing'),
  ('additive-manufacturing',   'Additive Manufacturing',     '增材制造',         '🖨️',  404, 'manufacturing'),
  ('digital-twin',             'Digital Twin',               '数字孪生',         '🔄', 405, 'manufacturing'),
  ('autonomous-vehicles',      'Autonomous Vehicles',        '智能网联汽车',     '🚗', 406, 'manufacturing'),

  -- New Space (6)
  ('launch-vehicles',          'Launch Vehicles',            '运载火箭',         '🚀', 501, 'new-space'),
  ('satellite-internet',       'Satellite Internet',         '卫星互联网',       '🛰️',  502, 'new-space'),
  ('earth-observation',        'Earth Observation',          '遥感卫星',         '🌍', 503, 'new-space'),
  ('space-propulsion',         'Space Propulsion',           '空间推进',         '🔥', 504, 'new-space'),
  ('low-altitude',             'Low-Altitude Economy',       '低空技术与应用',   '🚁', 505, 'new-space'),
  ('space-manufacturing',      'Space Manufacturing',        '太空制造',         '🔩', 506, 'new-space'),

  -- Advanced Materials (6)
  ('carbon-fiber',             'Carbon Fiber & Composites',  '碳纤维及复合材料', '🪢', 601, 'advanced-materials'),
  ('semiconductors-materials', 'Semiconductor Materials',    '半导体材料',       '💎', 602, 'advanced-materials'),
  ('battery-materials',        'Battery Materials',          '电池材料',         '⚗️',  603, 'advanced-materials'),
  ('metamaterials',            'Metamaterials',              '超材料',           '🔮', 604, 'advanced-materials'),
  ('graphene',                 'Graphene & Carbon Nanocomposites', '石墨烯及碳纳米复合材料', '⬡', 605, 'advanced-materials'),
  ('biomaterials',             'Biomaterials',               '生物材料',         '🦴', 606, 'advanced-materials')

) AS t(slug, name, name_cn, icon, sort_order, parent_slug)
ON CONFLICT (slug) DO NOTHING;

-- ─── STEP 4: Verify ──────────────────────────────────────────
SELECT level, COUNT(*) AS count
FROM industries
GROUP BY level
ORDER BY level;
-- Expected: level 1 → 6,  level 2 → 36

COMMIT;

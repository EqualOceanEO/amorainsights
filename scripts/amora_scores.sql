-- Step 1: 确保 AMORA 评分列存在（已在 db.ts 中定义，但确认表结构）
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS amora_total_score         DECIMAL(3,1)   CHECK (amora_total_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS amora_advancement_score   DECIMAL(3,1)   CHECK (amora_advancement_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS amora_mastery_score       DECIMAL(3,1)   CHECK (amora_mastery_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS amora_operations_score    DECIMAL(3,1)   CHECK (amora_operations_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS amora_reach_score         DECIMAL(3,1)   CHECK (amora_reach_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS amora_affinity_score      DECIMAL(3,1)   CHECK (amora_affinity_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS amora_score_updated_at    TIMESTAMPTZ    DEFAULT NOW();

-- Step 2: 批量更新 AMORA 评分
-- A=Advancement(技术壁垒25%), M=Mastery(人才优势20%), O=Operations(商业落地25%),
-- R=Reach(全球化15%), A=Affinity(可持续能力15%)

UPDATE companies SET
  amora_total_score         = 8.04,
  amora_advancement_score  = 8.2,
  amora_mastery_score      = 7.5,
  amora_operations_score   = 9.5,
  amora_reach_score        = 8.0,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name IN ('Unitree', 'Unitree Robotics');

UPDATE companies SET
  amora_total_score         = 7.06,
  amora_advancement_score  = 7.5,
  amora_mastery_score      = 7.0,
  amora_operations_score   = 8.0,
  amora_reach_score        = 6.0,
  amora_affinity_score    = 6.8,
  amora_score_updated_at   = NOW()
WHERE name IN ('UBTECH', 'UBTECH Robotics');

UPDATE companies SET
  amora_total_score         = 7.30,
  amora_advancement_score  = 8.0,
  amora_mastery_score      = 8.5,
  amora_operations_score   = 7.5,
  amora_reach_score        = 5.5,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name IN ('AgiBot', '智元机器人', 'Agibot');

UPDATE companies SET
  amora_total_score         = 6.96,
  amora_advancement_score  = 7.8,
  amora_mastery_score      = 7.5,
  amora_operations_score   = 6.5,
  amora_reach_score        = 6.0,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name = 'Fourier Intelligence';

UPDATE companies SET
  amora_total_score         = 6.80,
  amora_advancement_score  = 7.0,
  amora_mastery_score      = 7.5,
  amora_operations_score   = 7.0,
  amora_reach_score        = 5.5,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name = 'Leju Robotics';

UPDATE companies SET
  amora_total_score         = 6.50,
  amora_advancement_score  = 7.0,
  amora_mastery_score      = 7.0,
  amora_operations_score   = 6.5,
  amora_reach_score        = 6.0,
  amora_affinity_score    = 6.0,
  amora_score_updated_at   = NOW()
WHERE name = '达闼科技';

UPDATE companies SET
  amora_total_score         = 6.20,
  amora_advancement_score  = 7.0,
  amora_mastery_score      = 7.0,
  amora_operations_score   = 4.0,
  amora_reach_score        = 8.5,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name = 'Tesla Optimus';

UPDATE companies SET
  amora_total_score         = 7.10,
  amora_advancement_score  = 8.5,
  amora_mastery_score      = 9.5,
  amora_operations_score   = 4.5,
  amora_reach_score        = 7.0,
  amora_affinity_score    = 6.0,
  amora_score_updated_at   = NOW()
WHERE name = 'Figure AI';

UPDATE companies SET
  amora_total_score         = 8.52,
  amora_advancement_score  = 8.8,
  amora_mastery_score      = 9.0,
  amora_operations_score   = 7.0,
  amora_reach_score        = 9.0,
  amora_affinity_score    = 8.8,
  amora_score_updated_at   = NOW()
WHERE name = 'Boston Dynamics';

UPDATE companies SET
  amora_total_score         = 7.86,
  amora_advancement_score  = 7.8,
  amora_mastery_score      = 8.0,
  amora_operations_score   = 7.5,
  amora_reach_score        = 8.5,
  amora_affinity_score    = 7.5,
  amora_score_updated_at   = NOW()
WHERE name = 'Agility Robotics';

UPDATE companies SET
  amora_total_score         = 7.14,
  amora_advancement_score  = 8.0,
  amora_mastery_score      = 9.2,
  amora_operations_score   = 4.0,
  amora_reach_score        = 7.5,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name = '1X Technologies';

UPDATE companies SET
  amora_total_score         = 6.90,
  amora_advancement_score  = 7.5,
  amora_mastery_score      = 8.0,
  amora_operations_score   = 5.5,
  amora_reach_score        = 6.0,
  amora_affinity_score    = 7.5,
  amora_score_updated_at   = NOW()
WHERE name = 'Apptronik';

UPDATE companies SET
  amora_total_score         = 6.50,
  amora_advancement_score  = 7.5,
  amora_mastery_score      = 7.5,
  amora_operations_score   = 4.5,
  amora_reach_score        = 7.0,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name = 'Sanctuary AI';

UPDATE companies SET
  amora_total_score         = 6.30,
  amora_advancement_score  = 6.5,
  amora_mastery_score      = 7.0,
  amora_operations_score   = 6.5,
  amora_reach_score        = 6.0,
  amora_affinity_score    = 5.5,
  amora_score_updated_at   = NOW()
WHERE name = 'Robotera';

UPDATE companies SET
  amora_total_score         = 6.20,
  amora_advancement_score  = 7.0,
  amora_mastery_score      = 8.0,
  amora_operations_score   = 4.0,
  amora_reach_score        = 5.5,
  amora_affinity_score    = 7.0,
  amora_score_updated_at   = NOW()
WHERE name = 'LimX Dynamics';

UPDATE companies SET
  amora_total_score         = 5.80,
  amora_advancement_score  = 6.5,
  amora_mastery_score      = 7.5,
  amora_operations_score   = 3.5,
  amora_reach_score        = 6.0,
  amora_affinity_score    = 6.0,
  amora_score_updated_at   = NOW()
WHERE name = 'GalaxyBot';

UPDATE companies SET
  amora_total_score         = 6.20,
  amora_advancement_score  = 7.0,
  amora_mastery_score      = 7.0,
  amora_operations_score   = 4.5,
  amora_reach_score        = 7.0,
  amora_affinity_score    = 6.5,
  amora_score_updated_at   = NOW()
WHERE name = 'Zhipu AI';

-- Step 3: 验证更新结果
SELECT name, amora_total_score, amora_advancement_score, amora_mastery_score,
       amora_operations_score, amora_reach_score, amora_affinity_score
FROM companies
WHERE sub_sector = 'Humanoid Robots'
  AND amora_total_score IS NOT NULL
ORDER BY amora_total_score DESC NULLS LAST;

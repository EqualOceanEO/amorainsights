-- 修复人形机器人企业数据
-- 1. 删除重复条目（保留新的，删除旧的）
DELETE FROM companies WHERE id = 185; -- 旧 Unitree Robotics（保留 id=361 宇树科技）
DELETE FROM companies WHERE id = 186; -- 旧 UBTECH Robotics（保留 id=362 优必选）

-- 2a. 修正宇树科技评分（招股书披露后已调整至8.9）
UPDATE companies SET
  amora_total_score       = 8.9,
  amora_advancement_score = 8.8,
  amora_mastery_score     = 7.8,
  amora_operations_score  = 9.5,
  amora_reach_score       = 8.5,
  amora_affinity_score    = 8.2
WHERE id = 361; -- Unitree 宇树科技

-- 2b. 修正 Tesla Optimus 评分（6.2 过低，技术壁垒高但商业落地严重拖分）
UPDATE companies SET
  amora_total_score      = 7.8,
  amora_advancement_score = 9.2,
  amora_mastery_score    = 8.8,
  amora_operations_score = 4.5,
  amora_reach_score      = 8.5,
  amora_affinity_score   = 8.0
WHERE id = 182; -- Tesla Optimus

-- 3. 补充 Sanctuary AI（第一梯队12家中缺失的1家）
INSERT INTO companies (
  name, name_cn, country, industry_slug, sub_sector,
  description,
  founded_year, employee_count, is_public, is_tracked,
  amora_total_score, amora_advancement_score, amora_mastery_score,
  amora_operations_score, amora_reach_score, amora_affinity_score,
  slug
) VALUES (
  'Sanctuary AI', 'Sanctuary AI', 'CA', 'manufacturing', 'Humanoid Robots',
  'Canadian humanoid robot company developing Phoenix, a general-purpose humanoid robot with advanced cognitive AI capabilities.',
  2018, 200, false, true,
  6.8, 8.0, 8.5, 4.0, 5.5, 6.0,
  'sanctuary-ai'
) ON CONFLICT (slug) DO UPDATE SET
  amora_total_score       = EXCLUDED.amora_total_score,
  amora_advancement_score = EXCLUDED.amora_advancement_score,
  amora_mastery_score     = EXCLUDED.amora_mastery_score,
  amora_operations_score  = EXCLUDED.amora_operations_score,
  amora_reach_score       = EXCLUDED.amora_reach_score,
  amora_affinity_score    = EXCLUDED.amora_affinity_score;

-- 验证
SELECT id, name, name_cn, country,
       amora_total_score      AS total,
       amora_advancement_score AS adv,
       amora_mastery_score    AS mas,
       amora_operations_score AS ops,
       amora_reach_score      AS reach,
       amora_affinity_score   AS aff
FROM companies
WHERE sub_sector = 'Humanoid Robots'
ORDER BY amora_total_score DESC NULLS LAST;

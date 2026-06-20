UPDATE industries SET slug='manufacturing', name='Manufacturing', name_cn='未来制造' WHERE slug='intelligent-manufacturing';
UPDATE reports SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';
UPDATE news_items SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';
UPDATE companies SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';
SELECT slug, name, name_cn FROM industries WHERE slug IN ('manufacturing','intelligent-manufacturing');

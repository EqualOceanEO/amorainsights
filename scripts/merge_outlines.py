#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
合并所有 HRI-2026 各章节文件为一个完整的整合版文件
AMORA 报告框架（报告模板）：
  A = Advancement（技术先进性）
  M = Mapping（产业链生态位）
  O = Operations（商业化运营）
  R = Reach（市场容量）
  A = Assets（资本价值）
注意：此框架与企业评分框架 AMORA Score（Advancement/Mastery/Operations/Reach/Affinity）不同
"""
import os

BASE = r"c:\Users\51229\WorkBuddy\Claw"
OUTPUT = os.path.join(BASE, "HRI-2026-Outline-COMPLETE.md")

# 按顺序定义要合并的文件和各部分的分隔标题
PARTS = [
    ("header", None),  # 特殊：手写 header
    ("part0", "HRI-2026-Outline-v3.0.md", "PART 0 — 报告总纲 v3.0"),
    ("partA", "HRI-2026-Outline-Advancement.md", "PART A — Advancement: 技术先进性与世界模型"),
    ("partM", "HRI-2026-Report-Mapping-Chinese-v1.0.md", "PART M — Mapping: 产业链生态位与供应链图谱"),
    ("partO", "HRI-2026-Outline-Operations.md", "PART O — Operations: 商业化运营与落地进程"),
    ("partR", "HRI-2026-Outline-Reach.md", "PART R — Reach: 市场容量与全球化拓展"),
    ("partA2", "HRI-2026-Outline-Assets.md", "PART A2 — Assets: 资本价值与企业评价"),
]

HEADER = """# The Humanoid Robot Index 2026
## 完整章节合集 — AMORA五维报告框架完整版（含全部细节内容）

**报告定位：** 全球人形机器人行业深度对标研究（旗舰报告）
**覆盖范围：** 25家公司（第一梯队12家 + 第二梯队8家 + 平台层5家）
**核心框架：** AMORA Report — Advancement / Mapping / Operations / Reach / Assets
**数据截止：** Q1 2026
**文档版本：** v3.0 完整整合版（2026年4月3日）
**说明：** 本文件为所有报告章节原始文件的完整合并，保留全部细节内容

---

## 框架说明

> **重要区分：** 本报告使用的是 **AMORA Report 框架**（行业研究模板），
> 与企业评分框架 **AMORA Score**（Advancement/Mastery/Operations/Reach/Affinity）不同。

| 字母 | 报告框架（AMORA Report） | 企业评分（AMORA Score） |
|:---:|----------------------|----------------------|
| A | Advancement（技术先进性） | Advancement（技术壁垒） |
| M | **Mapping（产业链生态位）** | Mastery（人才优势） |
| O | Operations（商业化运营） | Operations（商业落地） |
| R | **Reach（市场容量）** | Reach（全球化能力） |
| A | **Assets（资本价值）** | Affinity（可持续能力） |

---

## 全局目录

- **Part 0：报告总纲 v3.0** — 报告结构、评分卡框架、中美对比逻辑
- **Part A：Advancement** — 技术先进性、世界模型、端到端控制、灵巧手、中美技术竞争
- **Part M：Mapping** — 产业链全景图、中美生态位对比、供应链脆弱性、卡脖子清单
- **Part O：Operations** — 商业模式、四大应用场景、客户结构、ROI、产业化路径
- **Part R：Reach** — 市场规模预测、三情景、细分市场、全球化拓展
- **Part A2：Assets** — 主要玩家财务对比、估值排名、资本效率、融资动态、投资建议

---

"""

SEP_TEMPLATE = """

{equals}
# {title}
{equals}

"""

def make_sep(title):
    eq = "=" * 80
    return f"\n\n{eq}\n# {title}\n{eq}\n\n"

def main():
    lines = []
    
    # 1. 写入文件头
    lines.append(HEADER)
    
    # 2. 遍历每个 part
    for part_info in PARTS[1:]:  # 跳过 header
        tag, filename, title = part_info
        filepath = os.path.join(BASE, filename)
        
        if not os.path.exists(filepath):
            print(f"WARNING: {filename} not found, skipping")
            continue
        
        # 读取原始文件
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 追加分隔符和内容
        lines.append(make_sep(title))
        lines.append(content)
        
        print(f"OK {filename}: {len(content.splitlines())} lines")
    
    # 3. 追加结尾
    footer = "\n\n---\n\n**整合完成日期：** 2026年4月3日  \n**文档版本：** v2.0 COMPLETE  \n**研究机构：** AMORA Insights  \n\n*本文件为《The Humanoid Robot Index 2026》完整大纲合集，包含总纲v3.0 + AMORA五维框架全部内容。*\n"
    lines.append(footer)
    
    # 4. 写入输出文件
    full_content = "".join(lines)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(full_content)
    
    total_lines = len(full_content.splitlines())
    file_size = len(full_content.encode("utf-8"))
    print("DONE: merge complete")
    print(f"Output: {OUTPUT}")
    print(f"Lines: {total_lines}")
    print(f"Size: {file_size / 1024:.1f} KB")

if __name__ == "__main__":
    main()

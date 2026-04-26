# AMORA 智能体团队 — 总览

> **维护人：** George（首席内容官 / 首席技术官）
> **版本：** v1.0 | **日期：** 2026-04-12
> **定位：** 为 AMORA 报告工业化生产设计的 5 章节智能体 + 1 总指挥体系

---

## 一、团队架构

```
Orchestrator（总指挥）
    ├── M-Agent   → Part M：Mapping（产业链生态位）
    ├── A-Agent   → Part A：Advancement（技术先进性）
    ├── O-Agent   → Part O：Operations（商业化运营）
    ├── R-Agent   → Part R：Reach（市场容量）
    └── A2-Agent  → Part A2：Assets（资本价值 + AMORA Score 评分）
```

**协作原则：**
- 5 个章节智能体并行运作，互不阻塞
- Orchestrator 负责选题、分发、合并、终审
- 每个 Agent 独立作战，可同时处理多份报告的不同章节
- 输出文件统一格式，统一入库 Supabase

---

## 二、AMORA Report 框架（必须牢记）

| 字母 | 章节名 | 内容 | 付费墙 |
|:---:|--------|------|:------:|
| **M** | Mapping | 产业链全景图、生态位分布、供应链分析 | 免费 |
| **A** | Advancement | 技术趋势、核心壁垒、中美技术差距 | Pro |
| **O** | Operations | 商业模式、客户结构、ROI、应用场景 | Pro |
| **R** | Reach | 市场规模、地域分布、全球化、渗透率 | Pro |
| **A2** | Assets | 资本效率、估值排名、融资动态、AMORA Score | Pro |

> ⚠️ **与 AMORA Score 评分框架的区别：**
> - AMORA **Report** = 行业研究报告章节（Advancement/Mapping/Operations/Reach/Assets）
> - AMORA **Score** = 企业评分维度（Advancement/Mastery/Operations/Reach/Affinity）
> - 字母相同，含义不同，严禁混淆

---

## 三、文件命名规范

```
HRI-{年度}-{行业缩写}-Part{M|A|O|R|A2}-{语言}.md
示例：
  HRI-2026-HR-PartM-CN.md   → 2026年人形机器人 Part M 中文版
  HRI-2026-HR-PartA-EN.md   → 2026年人形机器人 Part A 英文版
```

---

## 四、质量红线

| # | 红线 | 触发条件 |
|---|------|---------|
| 1 | **数据必须可溯源** | 所有数字须附来源，含 SEC EDGAR / 财报 / 行业协会 |
| 2 | **缺数据不硬评** | 无数据支撑的评分项标注"数据待补充"，不得捏造 |
| 3 | **中英文彻底隔离** | 中文章节 0 英文字符（CSS 属性值除外）；英文章节 0 中文字符 |
| 4 | **付费墙位置** | Part M 末尾设钩子；A/O/R/A2 默认 Pro 专属 |
| 5 | **禁止引用未授权商业数据** | Gartner / Forrester / McKinsey / PitchBook / CB Insights 不可直接引用 |

---

## 五、文档目录

| 文档 | 说明 |
|------|------|
| `ORCHESTRATOR.md` | 总指挥智能体 — 选题、分发、质量、终审 |
| `M-AGENT.md` | 产业链 Mapping 智能体 |
| `A-AGENT.md` | 技术 Advancement 智能体 |
| `O-AGENT.md` | 商业 Operations 智能体 |
| `R-AGENT.md` | 市场 Reach 智能体 |
| `A2-AGENT.md` | 资本 Assets + AMORA Score 智能体 |
| `HANDOVER.md` | 新智能体交接协议 |
| `PROMPT-TEMPLATES.md` | 各章节标准提示词模板 |

---

*文档版本：v1.0 | 创建：2026-04-12 | 首席内容官 George*

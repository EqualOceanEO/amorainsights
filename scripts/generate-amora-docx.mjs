const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, BorderStyle, WidthType, ShadingType, AlignmentType,
        Header, Footer, PageNumber, LevelFormat } = require('docx');
const fs = require('fs');

// 定义边框样式
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// 创建表格单元格的辅助函数
function createCell(text, width, isHeader = false) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: isHeader ? { fill: "2E75B6", type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ 
        text, 
        bold: isHeader,
        color: isHeader ? "FFFFFF" : "000000",
        size: 22
      })]
    })]
  });
}

// 创建五维框架表格
const frameworkTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1200, 1800, 1800, 2400, 2160],
  rows: [
    new TableRow({
      children: [
        createCell("字母", 1200, true),
        createCell("维度", 1800, true),
        createCell("英文", 1800, true),
        createCell("核心问题", 2400, true),
        createCell("关键输出", 2160, true),
      ]
    }),
    new TableRow({ children: [
      createCell("A", 1200), createCell("技术先进性", 1800), createCell("Advancement", 1800),
      createCell("技术壁垒多高？谁在领跑？卡脖子在哪？", 2400),
      createCell("技术路线判断、零部件分析、专利对比", 2160)
    ]}),
    new TableRow({ children: [
      createCell("M", 1200), createCell("产业链生态位", 1800), createCell("Mapping", 1800),
      createCell("上下游玩家分布？中美各自在哪占优？", 2400),
      createCell("产业链图谱、生态位对比、空白机会", 2160)
    ]}),
    new TableRow({ children: [
      createCell("O", 1200), createCell("商业化运营", 1800), createCell("Operations", 1800),
      createCell("应用有多深？场景成熟度？ROI？", 2400),
      createCell("客户结构、落地案例、回报周期", 2160)
    ]}),
    new TableRow({ children: [
      createCell("R", 1200), createCell("市场容量", 1800), createCell("Reach", 1800),
      createCell("市场多大？增速多快？天花板在哪？", 2400),
      createCell("规模预测、细分拆分、增长驱动", 2160)
    ]}),
    new TableRow({ children: [
      createCell("A", 1200), createCell("资本价值", 1800), createCell("Assets", 1800),
      createCell("谁更赚钱？谁更值钱？资本效率？", 2400),
      createCell("财务对比、估值排名、投资建议", 2160)
    ]}),
  ]
});

// 创建文档
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        children: [new TextRun({ text: "AMORA Report Template v1.0", size: 20, color: "666666" })],
        alignment: AlignmentType.RIGHT
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        children: [
          new TextRun({ text: "第 ", size: 20 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 20 }),
          new TextRun({ text: " 页", size: 20 })
        ],
        alignment: AlignmentType.CENTER
      })] })
    },
    children: [
      // 标题
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("AMORA Report Template v1.0")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "行业研究报告标准化模板", bold: true, size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "适用于 AMORA 研究团队全行业报告产出", italics: true, size: 22, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      // 一、模板定位
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("一、模板定位")] }),
      new Paragraph({
        children: [new TextRun("AMORA Report Template 是 AMORA 研究团队的")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "行业研究报告标准化框架", bold: true })]
      }),
      new Paragraph({
        children: [new TextRun("，与企业评估框架 AMORA Score 并行使用：")],
        spacing: { after: 200 }
      }),

      // 框架对比表格
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 3000, 3960],
        rows: [
          new TableRow({ children: [
            createCell("框架", 2400, true), createCell("用途", 3000, true), createCell("对象", 3960, true)
          ]}),
          new TableRow({ children: [
            createCell("AMORA Score", 2400), createCell("企业五维评分", 3000), createCell("单个公司", 3960)
          ]}),
          new TableRow({ children: [
            createCell("AMORA Report", 2400), createCell("行业研究模板", 3000), createCell("整个行业", 3960)
          ]}),
        ]
      }),
      new Paragraph({ spacing: { after: 300 } }),

      // 二、五维框架定义
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("二、五维框架定义")] }),
      frameworkTable,
      new Paragraph({ spacing: { after: 300 } }),

      // 三、报告结构规范
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("三、报告结构规范")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("3.1 必含章节")] }),
      
      new Paragraph({ children: [new TextRun({ text: "封面", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("报告标题")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("AMORA 五维雷达图（可视化品牌识别）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("核心数据亮点（3-4个关键数字）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("发布日期/研究团队")] }),

      new Paragraph({ children: [new TextRun({ text: "Executive Summary 执行摘要（2页）", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("核心发现（3-5条，一句话一条）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("关键数据（市场规模/增速/主要玩家）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("中美对比结论（谁在哪占优）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("战略建议（给谁看？建议做什么？）")] }),

      new Paragraph({ children: [new TextRun({ text: "A. Advancement 技术先进性", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.1 核心发现（1段话总结本章结论）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.2 技术成熟度与路线分歧")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.3 核心零部件分析（中美玩家+替代难度评分）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.4 专利与研发投入对比")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.5 技术趋势判断（未来3年突破点）")] }),

      new Paragraph({ children: [new TextRun({ text: "M. Mapping 产业链生态位", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("M.1 核心发现")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("M.2 产业链全景图（上游→中游→下游）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("M.3 中美玩家生态位对比（四象限或分层）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("M.4 供应链脆弱性评估（卡脖子清单）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("M.5 生态位空白机会（哪里还有进入空间）")] }),

      new Paragraph({ children: [new TextRun({ text: "O. Operations 商业化运营", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("O.1 核心发现")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("O.2 应用场景成熟度矩阵（量化评分）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("O.3 客户结构深度分析")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("O.4 ROI计算与回报周期")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("O.5 落地案例对比（谁在哪真正跑通）")] }),

      new Paragraph({ children: [new TextRun({ text: "R. Reach 市场容量", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("R.1 核心发现（含预测方法论说明）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("R.2 市场规模预测方法论")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("R.3 三情景预测（保守/中性/乐观）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("R.4 细分市场拆分")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("R.5 渗透率曲线与规模化时间线")] }),

      new Paragraph({ children: [new TextRun({ text: "A. Assets 资本价值", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.1 核心发现")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.2 主要玩家财务对比")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.3 估值与资本效率排名")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.4 融资动态与估值趋势")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("A.5 盈利能力预测与投资建议")] }),

      new Paragraph({ children: [new TextRun({ text: "Risk & Outlook 风险与展望", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("关键风险因素（技术/政策/市场/竞争）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("三情景展望（乐观/中性/悲观）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("时间线预测（未来1-3-5年关键节点）")] }),

      new Paragraph({ children: [new TextRun({ text: "Appendix 附录", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("完整公司列表")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("数据来源说明")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("术语表")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("参考资料")] }),
      new Paragraph({ spacing: { after: 300 } }),

      // 3.2 每章必备元素
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("3.2 每章必备元素")] }),
      new Paragraph({ children: [new TextRun("每章（A/M/O/R/A）必须包含：")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "核心发现（Key Finding）", bold: true }), new TextRun("：1段话总结本章结论，放在章首")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "对比判断", bold: true }), new TextRun("：不是并列陈述，是A vs B谁赢、差多少")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "数据支撑", bold: true }), new TextRun("：每个结论必须有数字支撑")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "So What", bold: true }), new TextRun("：对读者意味着什么")] }),
      new Paragraph({ spacing: { after: 300 } }),

      // 四、写作规范
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("四、写作规范")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1 核心发现写法")] }),
      new Paragraph({ children: [new TextRun({ text: "模板：", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: '"[行业]处于[阶段]，核心瓶颈在[环节]而非[环节]。[国家A]在[维度]占优，[国家B]在[维度]占优。关键数据：[数字] vs [数字]，差距[X倍]。"', italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),
      new Paragraph({ children: [new TextRun({ text: "示例（人形机器人）：", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: '"人形机器人处于\'0.5→1.0\'过渡期，核心瓶颈在触觉传感器和电池续航而非AI算法。美国在上游AI芯片/传感器占优，中国在中游制造/量产占优。关键数据：Figure融资$1.5B出货<150台，宇树融资$150M出货5500+台，资本效率差37倍。"', italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),
      new Paragraph({ spacing: { after: 200 } }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.2 对比判断写法")] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({ children: [
            createCell("错误（描述性）", 4680, true), createCell("正确（判断性）", 4680, true)
          ]}),
          new TableRow({ children: [
            createCell("美国有Figure AI、Tesla、Boston Dynamics", 4680),
            createCell("美国第一梯队3家，中国5家，但美国单家公司估值是中国的10倍+", 4680)
          ]}),
          new TableRow({ children: [
            createCell("触觉传感器价格$300-500", 4680),
            createCell("触觉传感器是中国产业链最大短板，2-3年内无替代可能", 4680)
          ]}),
          new TableRow({ children: [
            createCell("市场规模预测$30B-$380B", 4680),
            createCell("预测差600倍的根因是口径混乱，我们以整机出货量×均价为基准", 4680)
          ]}),
        ]
      }),
      new Paragraph({ spacing: { after: 200 } }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.3 数据呈现规范")] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({ children: [
            createCell("数据类型", 2340, true), createCell("呈现方式", 3510, true), createCell("示例", 3510, true)
          ]}),
          new TableRow({ children: [
            createCell("市场规模", 2340), createCell("三情景表格", 3510), createCell("保守/中性/乐观 + 数字 + 关键假设", 3510)
          ]}),
          new TableRow({ children: [
            createCell("公司对比", 2340), createCell("矩阵图或表格", 3510), createCell("横轴能力，纵轴规模，气泡大小=估值", 3510)
          ]}),
          new TableRow({ children: [
            createCell("时间线", 2340), createCell("甘特图或阶段图", 3510), createCell("2025/2026/2027关键节点", 3510)
          ]}),
          new TableRow({ children: [
            createCell("产业链", 2340), createCell("分层图", 3510), createCell("上游→中游→下游，中美玩家分色标注", 3510)
          ]}),
        ]
      }),
      new Paragraph({ spacing: { after: 300 } }),

      // 五、可视化规范
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("五、可视化规范")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("5.1 必含图表（每份报告至少3个）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "AMORA五维雷达图", bold: true }), new TextRun("：放在封面，直观展示行业在各维度的成熟度")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "产业链生态位图", bold: true }), new TextRun("：M章核心，分层展示中美玩家分布")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "资本效率对比图", bold: true }), new TextRun("：A章核心，融资额 vs 出货量/收入散点图")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("5.2 可选图表")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("技术成熟度曲线（Hype Cycle风格）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("市场规模预测三情景图")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("应用场景矩阵（横轴成熟度，纵轴市场规模）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("中美对比四象限图")] }),
      new Paragraph({ spacing: { after: 300 } }),

      // 六、灵活调整原则
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("六、灵活调整原则")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.1 固化的（必须遵守）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("五维字母顺序：A-M-O-R-A")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("每章必须有'核心发现'段")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("必须有中美对比结论")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("封面必须有AMORA雷达图")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.2 灵活的（根据行业调整）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("子章节数量：2-5节，根据信息量调整")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("数据呈现形式：表格/图表/文字，根据数据特点选择")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("章节侧重：早期技术行业A章重，成熟行业R/A章重")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("案例深度：复杂行业详细拆，简单行业简化")] }),
      new Paragraph({ spacing: { after: 300 } }),

      // 七、质量检查清单
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("七、质量检查清单")] }),
      new Paragraph({ children: [new TextRun("提交前检查：")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("封面有AMORA雷达图")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Executive Summary在2页以内")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("每章有'核心发现'段")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("有明确的中美对比结论（不是并列）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("每个结论有数据支撑")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("有'So What'（对读者意味着什么）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("方法论说明（数据来源、预测口径）")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("风险与展望章节")] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("附录含数据来源和术语表")] }),
      new Paragraph({ spacing: { after: 300 } }),

      // 八、示例
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("八、示例：人形机器人报告核心发现")] }),
      
      new Paragraph({ children: [new TextRun({ text: "A章核心发现", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: "人形机器人处于"0.5→1.0"过渡期，当前瓶颈不是AI算法，而是触觉传感器和电池续航。中国在上游电机/减速器已突破，但在AI芯片和触觉传感器仍有2-3年代差。", italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),

      new Paragraph({ children: [new TextRun({ text: "M章核心发现", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: "美国占上游AI/传感器，中国占中游制造/量产。供应链脆弱性评估：若中美脱钩，中国在高端AI芯片和触觉传感器环节将断供，美国在量产制造环节将受阻。", italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),

      new Paragraph({ children: [new TextRun({ text: "O章核心发现", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: "商业化率<5%，客户结构揭示"伪商业化"真相：宇树73.6%客户是科研教育，Figure在汽车工厂试点但规模极小。真正工业替代客户极少，ROI尚不可算。", italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),

      new Paragraph({ children: [new TextRun({ text: "R章核心发现", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: "预测差600倍的根因是口径混乱（整机市场vs全产业链vs全社会价值）。我们以整机出货量×均价为基准，给出三情景预测：保守$XXB/中性$XXB/乐观$XXB。", italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),

      new Paragraph({ children: [new TextRun({ text: "A章核心发现", bold: true })] }),
      new Paragraph({
        children: [new TextRun({ text: "Figure融资$1.5B估值$39B出货<150台，宇树融资$150M出货5500+台，资本效率差异巨大。中国公司资本效率显著更高，但美国公司估值溢价反映AI技术预期。", italics: true })],
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }
      }),
      new Paragraph({ spacing: { after: 300 } }),

      // 九、版本记录
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("九、版本记录")] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 2400, 5760],
        rows: [
          new TableRow({ children: [
            createCell("版本", 1200, true), createCell("日期", 2400, true), createCell("更新内容", 5760, true)
          ]}),
          new TableRow({ children: [
            createCell("v1.0", 1200), createCell("2026-03-28", 2400), createCell("初始版本，建立五维框架和结构规范", 5760)
          ]}),
        ]
      }),
      new Paragraph({ spacing: { after: 400 } }),

      // 结尾
      new Paragraph({
        children: [new TextRun({ text: "AMORA Research Team", italics: true, color: "666666" })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "标准化研究，差异化洞察", italics: true, color: "666666" })],
        alignment: AlignmentType.CENTER
      }),
    ]
  }]
});

// 生成文件
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("AMORA-Report-Template-v1.0.docx", buffer);
  console.log("Word文档已生成: AMORA-Report-Template-v1.0.docx");
});

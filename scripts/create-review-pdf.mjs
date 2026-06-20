import PDFDocument from 'pdfkit';
import fs from 'fs';

const outputPath = 'c:/Users/51229/WorkBuddy/Claw/储能报告数据检查.pdf';
const doc = new PDFDocument({ margin: 50 });

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors
const RED = '#DC2626';
const AMBER = '#D97706';
const GREEN = '#059669';
const DARK_BLUE = '#1E3A5F';
const LIGHT_GRAY = '#F3F4F6';
const BORDER_GRAY = '#D1D5DB';

// Title
doc.fillColor(DARK_BLUE).fontSize(20).text('中国储能企业出海中东研究报告 2025', { align: 'center' });
doc.moveDown(0.3);
doc.fillColor('#6B7280').fontSize(12).text('数据与逻辑错误检查报告', { align: 'center' });
doc.moveDown(1);

// Summary table
const summaryData = [
    ['报告名称', '中国储能企业出海中东研究报告 2025'],
    ['检查时间', '2026年3月23日'],
    ['严重错误', '6项（需立即修正）'],
    ['数据不一致', '7项（需核实）'],
    ['逻辑错误', '5项'],
    ['数据验证正确', '7项'],
];

drawTable(doc, summaryData, [{ key: '严重错误', color: RED }, { key: '数据不一致', color: AMBER }]);
doc.moveDown(1);

// Section 1: Severe Errors
doc.fillColor(RED).fontSize(14).text('一、严重错误（需立即修正）');
doc.moveDown(0.5);

const severeErrors = [
    ['位置', '错误描述', '原文内容', '问题分析'],
    ['P01/P03\n核心结论', '中东份额数字\n自相矛盾', '"宁德时代+比亚迪占中东约60%份额"（P14）；"阳光电源中东储能集成系统市占率高达70%"（P16）', '宁德+比亚迪60%是电芯/电池企业口径，阳光70%是系统集成商口径。两者都声称是"中东市场份额"，概念混淆。60%+70%>100%，说明统计口径完全不同'],
    ['P03', '93%市占率\n定义模糊', '"中国企业2024年全球储能电池市占率超93%"', '"储能电池"与"储能系统"是不同市场。"储能电池"定义不清——是电芯出货量？电池包？系统？93%可能是电芯产能而非出货量'],
    ['P05', '利润数据\n计算矛盾', '"阳光电源沙特7.8GWh项目报价约1-1.5元/Wh，总金额超78亿元，净利率10-15%对应净利润8-12亿元"', '验证：7.8GWh x 1.25元/Wh（中值）= 97.5亿元，不等于78亿元。若按78亿倒推：78亿÷78亿Wh=1元/Wh（低端）。净利8-12亿需确认基数'],
    ['P03', '同比增速\n分母不清', '"2025年1-8月中东以38.75GWh居全球区域首位" 同比+183%', '38.75÷(1+1.83)= 13.7GWh（2024年同期），但P12称"全年海外总订单同比+246%"，中东增速183%低于整体246%，与"中东成为第一大目的地"的叙事存在逻辑张力'],
    ['P07', '本地化数据\n分散不统一', '"沙特2030年可再生能源项目75%组件本地化"（P07）与"沙特要求35%本地内容（2025），75%（2030）"（P21）', '宁德×PIF合资30GWh工厂在P07和P22重复出现，表述位置分散，缺乏交叉引用，同一信息分散在多处容易让读者误解为不同事项'],
    ['P03', 'NEOM需求\n过于乐观', '"NEOM新城规划配储200GWh+"', 'NEOM项目已多次推迟，200GWh是基于完整规划而非已确认项目，以此作为"全球最大单一储能需求来源"的依据不够稳健'],
];

drawColoredTable(doc, severeErrors, RED);
doc.moveDown(0.5);

// Section 2: Data Inconsistencies
doc.addPage();
doc.fillColor(RED).fontSize(14).text('二、数据不一致（需核实）');
doc.moveDown(0.5);

const inconsistencies = [
    ['位置', '错误描述', '原文内容', '问题分析'],
    ['P15 vs P17', '宁德vs比亚迪\n成本策略打架', '宁德"以成本优势参与竞标，部分项目低于阳光电源5-10%"；比亚迪"垂直集成降本20%+"；阳光"报价高于竞争对手5-10%"', '三家企业各自表述成本最低，但数据相互矛盾。阳光报价高于谁？比亚迪降本20%是相对于谁？实际价格排序不清晰'],
    ['P17', '价格比较\n横跨不同项目', '"2021红海项目20美分/Wh → 2025年RTC 7.5美分/Wh，4年降幅超62%"', '红海项目（华为，1.3GWh，离网）vs RTC项目（宁德，19GWh，并网）是不同企业、规模、类型，直接比较价格降幅意义有限'],
    ['P08', 'RTC投资额\n前后差异', '"总投资60亿美元/约438亿元人民币"', '60亿美元按8.27汇率=496亿人民币，与"约438亿元"不一致（差异58亿）。438亿这个数字来源不明'],
    ['P08 vs P11', '阿联酋数据\n核心表格缺失', 'P08多处出现"6GWh"（2030），P11各国预测表格中阿联酋数据标注为"—"', '关键市场阿联酋2030年预测数据在核心表格中完全缺失，仅在文字提到"超6GWh"，影响市场规模完整判断'],
    ['P19', '海辰电芯\n容量存疑', '"全球首个GWh级长时储能案例——1175Ah沙漠之鹰系统"', '1175Ah电芯远超行业主流300-600Ah。需核实是单体还是并联方式，以及是否真实量产而非实验室数据'],
    ['P07表格\nvs P14', '海辰项目\n两种表述', 'P07：塔布克1GW/4GWh，海辰储能；P14：海辰4GWh沙特', '同一公司两种表述，容易让读者以为是两个不同项目，实为同一项目在不同页面的重复描述'],
];

drawColoredTable(doc, inconsistencies, AMBER);
doc.moveDown(0.5);

// Section 3: Logic Errors
doc.fillColor(RED).fontSize(14).text('三、逻辑错误');
doc.moveDown(0.5);

const logicErrors = [
    ['位置', '错误描述', '原文内容', '问题分析'],
    ['P03', '复制粘贴错误\n完全不相关', '"全球主要经济体均将以人形机器人为代表的新能源上升为国家战略"', 'P03为中东能源转型政策图谱，但突然插入"人形机器人"这一毫不相关内容。这是复制粘贴错误，应删除或修改为"全球主要经济体均将储能/可再生能源上升为国家战略"'],
    ['P05', '评分体系\n主观性过强', '"产能过剩压力（规划超1TWh）：极高 92分"；"中东项目利润溢价：极高 90分"', '92分、88分、75分这些具体分数如何得出？没有说明评分方法论。数字给读者精确度的错觉，实际是定性判断的量化包装'],
    ['P10 vs P11', '伊拉克数据\n文字与表格矛盾', 'P10："2025-2028年伊拉克分布式储能累计需求约5-8GWh"；P11表格：伊拉克2025E/2027E/2030E均为"—"', '文字说有5-8GWh市场，表格却完全缺失伊拉克数据，说明数据来源不统一或统计口径混乱'],
    ['P06', '装机vs订单\n概念混用', '"GGII预测2025年全球新增装机超250GWh，中东将成为全球第四大储能装机区域"', '"装机区域"（installed capacity）与"订单"（orders）是不同概念。报告混用了"订单规模38.75GWh"和"装机区域"指标，读者可能误以为中东已实际成为第四大装机区域'],
    ['P24 vs P25', '认证壁垒\n窗口期矛盾', "P24：中国企业目前依赖UL9540/IEC62619曲线救国；P25：SASO 2026E强制，ESMA 2025E推行", '若2025-2026年本地认证将成强制门槛，曲线救国窗口期即将关闭，但报告未分析时间窗口关闭后的影响'],
];

drawColoredTable(doc, logicErrors, AMBER);
doc.moveDown(0.5);

// Section 4: Verified Correct Data
doc.fillColor(GREEN).fontSize(14).text('四、数据计算验证（正确的）');
doc.moveDown(0.5);

const verifiedData = [
    ['项目', '数值', '验证结果'],
    ['38.75GWh中东订单，同比+183%', '2024年同期 ≈ 13.7GWh', '✅ 计算正确'],
    ['沙特日照8.9小时/天', '符合沙特实际条件', '✅ 合理'],
    ['RTC项目5.2GW光伏+19GWh储能', '储光比约3.65h，符合调峰需求', '✅ 合理'],
    ['4年降价62%：20美分→7.5美分', '(20-7.5)/20=62.5%', '✅ 正确'],
    ['宁德×PIF合资30GWh工厂', '与公开报道一致', '✅ 正确'],
    ['阳光7.8GWh项目超78亿元', '7.8GWh × 1元/Wh = 78亿元（低端估算）', '✅ 低端估算合理'],
    ['海辰IP66防护 vs 行业IP55', 'IP66确实比IP55高一级', '✅ 正确'],
];

drawColoredTable(doc, verifiedData, GREEN);
doc.moveDown(0.5);

// Section 5: Summary
doc.fillColor(DARK_BLUE).fontSize(14).text('五、总结与修正建议');
doc.moveDown(0.5);

const summaryItems = [
    'P03 "人形机器人"句子是明显的复制粘贴错误，应修改为"全球主要经济体均将储能/可再生能源上升为国家战略"',
    '阳光电源70% vs 宁德+比亚迪60%的口径冲突——需明确说明前者是"系统集成市场"，后者是"电芯市场"，避免读者混淆',
    'P05 利润计算78亿元与实际不完全匹配——建议修正计算基数（1元/Wh低端）或明确说明报价范围',
    '伊拉克数据：文字有5-8GWh，表格却缺失——建议补充完整或删除文字部分',
    '宁德vs比亚迪vs阳光三家的成本策略相互矛盾——建议在竞争力分析章节统一使用同一数据来源',
    'RTC投资额：60亿美元=496亿人民币 vs 报告称438亿——需核实正确数字并修正',
];

doc.fontSize(10).fillColor('#374151');
summaryItems.forEach((item, i) => {
    doc.text(`${i + 1}. ${item}`, { indent: 20 });
    doc.moveDown(0.4);
});

doc.moveDown(1);
doc.fillColor('#9CA3AF').fontSize(9).text('— 报告完成 —', { align: 'center' });

doc.end();

stream.on('finish', () => {
    console.log('PDF created:', outputPath);
});

function drawTable(doc, data, highlightRows = []) {
    const startX = 50;
    let startY = doc.y;
    const colWidths = [100, 450];
    const rowHeight = 25;

    data.forEach((row, i) => {
        const isHighlight = highlightRows.some(h => row[0].includes(h.key));
        const bgColor = isHighlight ? highlightRows.find(h => row[0].includes(h.key)).color : (i % 2 === 0 ? '#FFFFFF' : LIGHT_GRAY);

        doc.fillColor(bgColor).rect(startX, startY, colWidths[0] + colWidths[1], rowHeight, 'F');

        if (i === 0) {
            doc.fillColor('#FFFFFF').fontSize(10);
        } else {
            doc.fillColor('#374151').fontSize(9);
        }

        doc.text(row[0], startX + 5, startY + 8, { width: colWidths[0] - 10 });
        doc.text(row[1], startX + colWidths[0] + 5, startY + 8, { width: colWidths[1] - 10 });

        startY += rowHeight;
    });

    doc.strokeColor(BORDER_GRAY).lineWidth(0.5);
    doc.rect(startX, doc.y - data.length * rowHeight + rowHeight, colWidths[0] + colWidths[1], data.length * rowHeight, 'S');

    doc.y = startY + 10;
}

function drawColoredTable(doc, data, headerColor) {
    const startX = 50;
    let startY = doc.y;
    const pageWidth = doc.page.width - 100;
    const colWidths = [70, 80, 200, 200]; // 4 columns
    const rowHeight = 50;

    // Draw header
    doc.fillColor(headerColor);
    doc.rect(startX, startY, pageWidth, 25, 'F');

    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    let xPos = startX + 5;
    data[0].forEach((cell, i) => {
        doc.text(cell, xPos, startY + 8, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
    });
    startY += 25;

    // Draw rows
    data.slice(1).forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? '#FFFFFF' : LIGHT_GRAY;
        doc.fillColor(bgColor).rect(startX, startY, pageWidth, rowHeight, 'F');

        doc.fillColor('#374151').fontSize(8);
        xPos = startX + 5;
        row.forEach((cell, i) => {
            doc.text(cell || '', xPos, startY + 5, { width: colWidths[i] - 10, height: rowHeight - 10, ellipsis: true });
            xPos += colWidths[i];
        });

        startY += rowHeight;
    });

    // Border
    doc.strokeColor(BORDER_GRAY).lineWidth(0.5);
    doc.rect(startX, doc.y - data.length * rowHeight + 25, pageWidth, (data.length - 1) * rowHeight + 25, 'S');

    doc.y = startY + 10;
}

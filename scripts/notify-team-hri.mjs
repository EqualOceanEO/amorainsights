import fs from 'fs';

const BASE = 'c:/Users/51229/WorkBuddy/Claw/.workbuddy/teams/amora/inboxes';

const messages = {
  Franklyn: `Franklyn，请从 CEO 战略视角，对 AmoraInsights 最新发布的《The Humanoid Robot Index 2026》H5 研究报告做出评价。

具体请回答：
1. 这份报告的战略价值——是否符合 AMORA 作为"深科技研究工作台"的品牌定位？
2. 报告内容是否能支撑 AMORA 对机构客户和个人订阅用户的双轨获客策略？
3. 作为 CEO，你认为这份旗舰报告在对外展示时的最大亮点和最大短板是什么？
4. 请给 Cole（CCO）3条具体的内容改进建议。`,

  George: `George，请从 CTO 技术视角，对《The Humanoid Robot Index 2026》H5 研究报告做出技术评估。

具体请回答：
1. 报告的技术内容（AMORA 五维框架、各公司技术评分）是否准确、有深度？
2. 新增的交互式雷达图（Canvas 实现）在技术呈现上有哪些优点和需要改进的地方？
3. H5 报告的前端实现质量如何？有哪些技术债务或可优化点？
4. 请给 Cole（CCO）关于技术内容深度和数据可视化的具体改进建议。`,

  Celine: `Celine，请从 CMO 市场营销视角，对《The Humanoid Robot Index 2026》H5 研究报告做出市场评估。

具体请回答：
1. 这份报告作为 AMORA 的旗舰内容营销素材，其传播潜力如何？能驱动机构客户和个人订阅用户转化吗？
2. 报告的品牌调性、视觉设计是否与 AMORA 的目标用户（创投 GP、深科技研究者）的审美和信任感匹配？
3. 报告是否有足够的"欲望缺口"设计，让读者愿意为完整版付费？
4. 请给 Cole（CCO）3条从市场/用户角度的具体内容改进建议。`,

  Cole: `Cole，这是一次团队内部的建设性反馈环节。

《The Humanoid Robot Index 2026》H5 报告已向全团队开放评阅，Franklyn、George、Celine、CFO、CLO、CRO、CHO 都会从各自角度给出评价和改进意见。

请你先做一次自我评估：
1. 这份报告你最满意的 3 个地方是什么？
2. 你认为最需要改进的 3 个地方是什么？
3. 如果下一版（HRI 2027）要提升一个档次，你会做哪些结构性改变？

收到团队反馈后，请整理成《Cole CCO 内容改进计划》，列出具体行动项和时间节点。`,

  CFO: `CFO，请从财务和商业变现视角，对《The Humanoid Robot Index 2026》H5 研究报告做出评估。

具体请回答：
1. 这份报告的商业变现潜力——作为付费墙内容或 Custom Research 样本，客单价和转化潜力如何评估？
2. 报告中的数据引用（公司估值、融资额、市场规模）是否有足够的财务严谨性？
3. 报告是否能有效支撑 AMORA 的 Pre-A 路演材料需求（证明产品能力和内容深度）？
4. 请给 Cole（CCO）从财务/变现角度的具体改进建议。`,

  CLO: `CLO，请从法律合规视角，对《The Humanoid Robot Index 2026》H5 研究报告做出合规审查。

具体请回答：
1. 报告中涉及的企业评分、投资建议类表述，是否存在法律风险（如被认定为投资建议、名誉损害等）？
2. 报告引用的公司数据、市场数据，版权和数据来源合规性如何？
3. 报告底部的免责声明是否充分？
4. 请给 Cole（CCO）具体的合规改进建议，特别是哪些表述需要修改或加强免责。`,

  CRO: `CRO，请从风险管控视角，对《The Humanoid Robot Index 2026》H5 研究报告做出风险评估。

具体请回答：
1. 报告涉及中美两国人形机器人企业，其中哪些内容存在地缘政治敏感性风险（EAR/ITAR、出口管制相关）？
2. 报告对某些企业的负面评价（如"最大风险"、低分评级）是否存在声誉风险或法律风险？
3. 这类报告在 AMORA 合规分级体系中应归入哪个类别（A/B/C级，STANDARD/SENSITIVE_TECH）？
4. 请给 Cole（CCO）具体的风险控制改进建议。`,

  CHO: `CHO，请从人才和组织发展视角，对《The Humanoid Robot Index 2026》H5 研究报告做出评估。

具体请回答：
1. 报告所体现的研究深度和专业水准，是否达到了 AMORA 旗舰 A 级内容的标准？从人才管理角度，报告是否能帮助吸引顶尖研究顾问加入 AMORA 顾问网络？
2. 报告制作涉及的工作量（研究、写作、设计、技术实现）合理吗？Cole 及其团队的工作效率如何评估？
3. 这份报告能否作为对外招聘高端研究人才时的"作品集"展示？
4. 请给 Cole（CCO）从人才吸引和团队建设角度的建议。`
};

let ts = Date.now();
for (const [name, content] of Object.entries(messages)) {
  const filePath = `${BASE}/${name}.json`;
  let inbox = [];
  try {
    inbox = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch(e) {
    inbox = [];
  }
  const msg = {
    id: `msg-${ts++}-hri-review`,
    from: 'team-lead',
    to: name,
    type: 'message',
    content,
    timestamp: new Date().toISOString(),
    read: false
  };
  inbox.push(msg);
  fs.writeFileSync(filePath, JSON.stringify(inbox, null, 2), 'utf8');
  console.log(`Sent to ${name}`);
}
console.log('All notifications sent.');

const promptFiles = {
  brief: "prompts/product-brief.md",
  title: "prompts/title-skill.md",
  bullets: "prompts/bullet-skill.md",
  faq: "prompts/faq-skill.md",
  detail: "prompts/detail-page-skill.md",
  qc: "prompts/qa-check-skill.md",
  final: "prompts/final-output-skill.md",
};

const exampleFiles = [
  "examples/water-bottle.json",
  "examples/phone-case.json",
  "examples/packaging-box.json",
  "examples/machinery-part.json",
  "examples/custom-gift.json",
];

const form = document.querySelector("#productForm");
const promptStatus = document.querySelector("#promptStatus");
const copyAllButton = document.querySelector("#copyAll");
const clearFormButton = document.querySelector("#clearForm");
const exampleSelect = document.querySelector("#exampleSelect");
const loadExampleButton = document.querySelector("#loadExample");
const testExamplesButton = document.querySelector("#testExamples");
const exampleStatus = document.querySelector("#exampleStatus");
const skillInput = document.querySelector("#skillInput");
const saveSkillSettingsButton = document.querySelector("#saveSkillSettings");
const addFolderButton = document.querySelector("#addFolder");
const folderPicker = document.querySelector("#folderPicker");
const folderStatus = document.querySelector("#folderStatus");
const folderList = document.querySelector("#folderList");
const workflowSearch = document.querySelector("#workflowSearch");
const workflowGallery = document.querySelector("#workflowGallery");
const filterChips = document.querySelectorAll(".filter-chip");
const questionInput = document.querySelector("#questionInput");
const askKnowledgeButton = document.querySelector("#askKnowledge");
const answerOutput = document.querySelector("#answerOutput");

let prompts = {};
let examples = [];
let activeWorkflowFilter = "all";
let skillSettings = {
  activeWorkflow: "商品发布总工作流",
  skillText: "",
  folders: [],
  knowledgeFiles: [],
};

/**
 * ProductBrief
 * fields: raw form values keyed by field id.
 * normalized: conservative fallbacks used by each workflow module.
 * missingFields: required field ids that need operator follow-up.
 */
const labels = {
  productName: "产品名称",
  productCore: "产品中心词",
  coreKeyword: "核心关键词",
  brandMarketing: "品牌/营销词",
  attributeWords: "属性词",
  keywordVariants: "关键词变体",
  scenarios: "应用场景",
  material: "材质",
  specs: "规格",
  functions: "功能",
  customization: "定制能力",
  moq: "MOQ",
  sample: "样品",
  leadTime: "交期",
  packaging: "包装",
  certifications: "认证",
  targetCountries: "目标国家",
  targetBuyers: "目标买家",
  notes: "补充说明",
};

const requiredFields = [
  "productName",
  "productCore",
  "coreKeyword",
  "attributeWords",
  "scenarios",
  "material",
  "specs",
  "functions",
  "customization",
  "moq",
  "sample",
  "leadTime",
  "packaging",
  "certifications",
  "targetCountries",
  "targetBuyers",
];

/**
 * WorkflowResult
 * brief: ProductBrief.
 * modules: product brief, title, bullets, FAQ, detail page, QA, final output.
 * meta: generation metadata and prompt file map.
 */

async function loadPrompts() {
  const entries = await Promise.all(
    Object.entries(promptFiles).map(async ([key, path]) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${path} 加载失败`);
      return [key, await response.text()];
    })
  );

  prompts = Object.fromEntries(entries);
  promptStatus.textContent = "提示词已加载";
}

async function loadExamples() {
  const loadedExamples = await Promise.all(
    exampleFiles.map(async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${path} 加载失败`);
      return response.json();
    })
  );

  examples = loadedExamples;
  examples.forEach((example) => {
    const option = document.createElement("option");
    option.value = example.id;
    option.textContent = example.name;
    exampleSelect.appendChild(option);
  });
  exampleStatus.textContent = `已加载 ${examples.length} 个案例`;
}

function loadSkillSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("alibabaSkillSettings") || "null");
    if (saved) skillSettings = saved;
  } catch (error) {
    skillSettings = { activeWorkflow: "商品发布总工作流", skillText: "", folders: [], knowledgeFiles: [] };
  }

  skillInput.value = skillSettings.skillText || "";
  renderFolderList();
}

function saveSkillSettings() {
  skillSettings.skillText = skillInput.value.trim();
  localStorage.setItem("alibabaSkillSettings", JSON.stringify(skillSettings));
  showToast("Skill 设置已保存");
}

function renderFolderList() {
  folderList.innerHTML = "";
  folderStatus.textContent = skillSettings.folders.length
    ? `已添加 ${skillSettings.folders.length} 个文件夹`
    : "未添加文件夹";

  skillSettings.folders.forEach((folder, index) => {
    const item = document.createElement("div");
    item.className = "folder-item";

    const label = document.createElement("span");
    label.textContent = `${folder.name} · ${folder.fileCount} 个文件 · ${folder.workflow || "通用"}`;

    const remove = document.createElement("button");
    remove.className = "copy-button";
    remove.type = "button";
    remove.textContent = "移除";
    remove.addEventListener("click", () => {
      skillSettings.folders.splice(index, 1);
      saveSkillSettings();
      renderFolderList();
    });

    item.append(label, remove);
    folderList.appendChild(item);
  });
}

function canReadKnowledgeFile(file) {
  return /\.(txt|md|json|csv|tsv|html|htm)$/i.test(file.name) && file.size <= 220000;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function addSelectedFolder(files) {
  const fileList = Array.from(files);
  if (!fileList.length) return;

  const firstPath = fileList[0].webkitRelativePath || fileList[0].name;
  const folderName = firstPath.split("/")[0] || "Selected Folder";
  const existingIndex = skillSettings.folders.findIndex((folder) => folder.name === folderName);
  const folderInfo = {
    name: folderName,
    fileCount: fileList.length,
    readableCount: fileList.filter(canReadKnowledgeFile).length,
    workflow: skillSettings.activeWorkflow || "通用工作流",
    addedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    skillSettings.folders[existingIndex] = folderInfo;
  } else {
    skillSettings.folders.push(folderInfo);
  }

  const readableFiles = fileList.filter(canReadKnowledgeFile).slice(0, 40);
  const knowledgeFiles = await Promise.all(
    readableFiles.map(async (file) => ({
      folder: folderName,
      workflow: folderInfo.workflow,
      name: file.name,
      path: file.webkitRelativePath || file.name,
      content: (await readFileAsText(file)).slice(0, 24000),
    }))
  );

  skillSettings.knowledgeFiles = [
    ...skillSettings.knowledgeFiles.filter((file) => file.folder !== folderName),
    ...knowledgeFiles,
  ].slice(-120);

  saveSkillSettings();
  renderFolderList();
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/)
    .filter((token) => token.length >= 2);
}

function scoreKnowledge(content, questionTokens) {
  const lower = content.toLowerCase();
  return questionTokens.reduce((score, token) => score + (lower.includes(token) ? 1 : 0), 0);
}

function extractRelevantLines(content, questionTokens) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const matched = lines
    .map((line) => ({ line, score: scoreKnowledge(line, questionTokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.line);

  if (matched.length) return matched;
  return lines.slice(0, 4);
}

function answerFromKnowledge() {
  const question = questionInput.value.trim();
  if (!question) {
    showToast("请先输入问题");
    return;
  }

  const brief = getBrief();
  const questionTokens = tokenize(`${question} ${brief.fields.productName} ${brief.fields.coreKeyword} ${brief.fields.targetBuyers}`);
  const scoredFiles = skillSettings.knowledgeFiles
    .map((file) => ({
      file,
      score: scoreKnowledge(`${file.workflow} ${file.name} ${file.path} ${file.content}`, questionTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const sourceBlock = scoredFiles.length
    ? scoredFiles
        .map(({ file }) => {
          const lines = extractRelevantLines(file.content, questionTokens).map((line) => `  - ${line}`).join("\n");
          return `- ${file.path}\n${lines}`;
        })
        .join("\n")
    : "- 未命中文件内容。请添加行业资料文件夹，或在 Skill 输入里补充规则。";

  const b2bHints = [
    brief.fields.moq ? `MOQ: ${brief.fields.moq}` : "MOQ 未填写，回答时用待确认表达",
    brief.fields.sample ? `样品: ${brief.fields.sample}` : "样品信息未填写，回答时用可沟通表达",
    brief.fields.leadTime ? `交期: ${brief.fields.leadTime}` : "交期未填写，回答时不要编造具体天数",
    brief.fields.customization ? `定制: ${brief.fields.customization}` : "定制能力未填写，建议先补充",
  ].join("\n- ");

  const answer = `基于当前工作流和文件夹资料的回答：

当前工作流：
${skillSettings.activeWorkflow || "未选择"}

你的问题：
${question}

建议回答：
1. 先围绕当前产品定位回答：${brief.normalized.productName} / ${brief.normalized.coreKeyword}。
2. 如果涉及采购决策，优先覆盖 MOQ、样品、交期、包装、定制能力和认证。
3. 如果文件夹资料没有提供具体数据，不要编造；使用“可确认 / 待沟通 / 根据规格确认”的表达。
4. 如果要生成发布内容，继续点击“生成商品内容”，再参考质检结果修正。

B2B 上下文：
- ${b2bHints}

命中的文件夹资料：
${sourceBlock}`;

  answerOutput.textContent = answer;
  answerOutput.classList.remove("empty");
}

function filterWorkflowCards() {
  const query = workflowSearch.value.trim().toLowerCase();
  const cards = workflowGallery.querySelectorAll(".workflow-card");

  cards.forEach((card) => {
    const categoryMatch = activeWorkflowFilter === "all" || card.dataset.category === activeWorkflowFilter;
    const keywords = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
    const queryMatch = !query || keywords.includes(query);
    card.hidden = !(categoryMatch && queryMatch);
  });
}

function applyWorkflowSkill(button) {
  const card = button.closest(".workflow-card");
  document.querySelectorAll(".workflow-card").forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");

  skillSettings.activeWorkflow = card.querySelector("h3").textContent;
  skillInput.value = button.dataset.skill || "";
  saveSkillSettings();
  document.querySelector(".skill-settings").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getBrief() {
  const data = new FormData(form);
  const fields = Object.fromEntries(
    Object.keys(labels).map((key) => [key, String(data.get(key) || "").trim()])
  );

  return createProductBrief(fields);
}

function createProductBrief(fields) {
  const missingFields = requiredFields.filter((key) => !fields[key]);
  const keywordVariants = splitItems(fields.keywordVariants);
  const attributeWords = splitItems(fields.attributeWords);
  const scenarios = splitItems(fields.scenarios);
  const targetCountries = splitItems(fields.targetCountries);
  const targetBuyers = splitItems(fields.targetBuyers);

  return {
    fields,
    normalized: {
      productName: fields.productName || "未命名产品",
      productCore: fields.productCore || fields.productName || fields.coreKeyword || "product",
      coreKeyword: fields.coreKeyword || fields.productCore || fields.productName || "product",
      brandMarketing: fields.brandMarketing || "Custom",
      primaryVariant: keywordVariants[0] || fields.coreKeyword || fields.productCore || "custom product",
      primaryScenario: scenarios[0] || "commercial sourcing",
      primaryCountry: targetCountries[0] || "global markets",
      primaryBuyer: targetBuyers[0] || "B2B buyers",
      attributeWords,
      keywordVariants,
      scenarios,
      targetCountries,
      targetBuyers,
    },
    missingFields,
    isComplete: missingFields.length === 0,
  };
}

function listValue(value, fallback = "可根据项目需求确认") {
  return value || fallback;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countPhrase(text, phrase) {
  if (!text || !phrase) return 0;
  const matches = text.toLowerCase().match(new RegExp(escapeRegExp(phrase.toLowerCase()), "g"));
  return matches ? matches.length : 0;
}

function uniqueWords(value) {
  return Array.from(new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 1)));
}

function compactVariant(variant, productCore, coreKeyword) {
  const cleaned = variant
    .replace(new RegExp(escapeRegExp(productCore), "ig"), "")
    .replace(new RegExp(escapeRegExp(coreKeyword), "ig"), "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "B2B sourcing";
}

function splitItems(value) {
  return value
    .split(/[,，;；、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function briefBlock(brief) {
  return Object.entries(labels)
    .map(([key, label]) => `${label}: ${brief.fields[key] || "未填写"}`)
    .join("\n");
}

function buildProductBriefOutput(brief) {
  return `产品定位: ${brief.normalized.productName}
产品中心词: ${brief.normalized.productCore}
核心关键词: ${brief.normalized.coreKeyword}
关键词变体: ${brief.normalized.keywordVariants.length ? brief.normalized.keywordVariants.join(", ") : "未填写，已使用保守默认值"}
品牌/营销词: ${brief.normalized.brandMarketing}
核心属性: ${brief.normalized.attributeWords.length ? brief.normalized.attributeWords.join(", ") : "未填写"}
应用场景: ${brief.normalized.scenarios.length ? brief.normalized.scenarios.join(", ") : brief.normalized.primaryScenario}
目标买家: ${brief.normalized.targetBuyers.length ? brief.normalized.targetBuyers.join(", ") : brief.normalized.primaryBuyer}
目标国家: ${brief.normalized.targetCountries.length ? brief.normalized.targetCountries.join(", ") : brief.normalized.primaryCountry}
采购信息: MOQ ${listValue(brief.fields.moq)}；样品 ${listValue(brief.fields.sample)}；交期 ${listValue(brief.fields.leadTime)}；包装 ${listValue(brief.fields.packaging)}
定制能力: ${listValue(brief.fields.customization)}
信任背书: ${listValue(brief.fields.certifications)}
缺失信息: ${brief.missingFields.length ? brief.missingFields.map((key) => labels[key]).join("、") : "无"}`;
}

function buildSkillContextOutput() {
  const folders = skillSettings.folders.length
    ? skillSettings.folders.map((folder) => `- ${folder.name}（${folder.fileCount} 个文件）`).join("\n")
    : "- 未添加";

  return `Skill 输入:
${skillSettings.skillText || "未填写"}

已添加文件夹:
${folders}`;
}

function applyPrompt(prompt, brief) {
  return prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => brief.fields[key] || "未填写");
}

function buildTitle(brief) {
  const attributes = brief.normalized.attributeWords.slice(0, 3).join(" ");
  const variant = compactVariant(
    brief.normalized.primaryVariant,
    brief.normalized.productCore,
    brief.normalized.coreKeyword
  );
  const title = [
    brief.normalized.brandMarketing,
    attributes,
    brief.normalized.productCore,
    variant,
    `for ${brief.normalized.primaryScenario}`,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return title;
}

function buildBullets(brief) {
  const fields = brief.fields;
  const bullets = [
    `1. Procurement Fit: built around ${listValue(fields.coreKeyword, brief.normalized.coreKeyword)} for ${listValue(fields.targetBuyers, brief.normalized.primaryBuyer)} sourcing in ${listValue(fields.scenarios, brief.normalized.primaryScenario)}.`,
    `2. Verified Product Value: uses ${listValue(fields.material)} with ${listValue(fields.specs)} specifications and ${listValue(fields.functions, "stable practical functions")} for clear comparison during supplier selection.`,
    `3. Customization Support: supports ${listValue(fields.customization, "OEM/ODM requirements to be confirmed")} so buyers can align logo, color, specification, or packaging with their market needs.`,
    `4. Order Execution: MOQ ${listValue(fields.moq, "to be confirmed")}, sample ${listValue(fields.sample, "available on request")}, lead time ${listValue(fields.leadTime)}, and packaging ${listValue(fields.packaging)} help buyers evaluate order feasibility.`,
    `5. Market Confidence: certification ${listValue(fields.certifications)} and target market fit for ${listValue(fields.targetCountries, brief.normalized.primaryCountry)} can be confirmed before bulk purchasing.`,
  ];

  return bullets.join("\n");
}

function buildFaq(brief) {
  const fields = brief.fields;
  const faq = [
    ["What is your MOQ?", `The MOQ is ${listValue(fields.moq, "to be confirmed according to specification and customization requirements")}. Trial order options can be discussed before bulk purchasing.`],
    ["Can I get a sample before bulk order?", `${listValue(fields.sample, "Sample availability can be confirmed before mass production")}. Sample cost, shipping method, and sample lead time can be checked after specifications are selected.`],
    ["Do you support customization?", `Yes. Customization support includes ${listValue(fields.customization, "logo, color, size, packaging, or OEM/ODM requirements to be confirmed")}.`],
    ["What is the production lead time?", `The estimated lead time is ${listValue(fields.leadTime)} after order details, sample approval, and payment terms are confirmed.`],
    ["What packaging options are available?", `Packaging can be arranged as ${listValue(fields.packaging, "standard export packaging or customized packaging after confirmation")}.`],
    ["Do you have certifications?", `${listValue(fields.certifications, "Available certifications or test reports should be confirmed according to target market requirements")}.`],
    ["What payment terms do you support?", "Payment terms can be discussed when the order quantity, customization scope, and delivery terms are confirmed."],
    ["What after-sales support is available?", "After-sales support scope can be confirmed according to the final order agreement, product requirements, and inspection standard."],
  ];

  return faq.map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n");
}

function buildDetail(brief) {
  const fields = brief.fields;
  const sections = [
    `1. 首屏模块\n- 目标: 让买家快速理解产品定位并发起询盘\n- 内容: ${brief.normalized.productName} / ${brief.normalized.coreKeyword} / ${listValue(fields.attributeWords, "核心属性待补充")}\n- 询盘引导: Send Inquiry / Get Sample`,
    `2. 产品核心卖点\n- 目标: 展示可验证的产品价值\n- 内容: 材质 ${listValue(fields.material)}；功能 ${listValue(fields.functions)}；规格 ${listValue(fields.specs)}`,
    `3. 应用场景与目标买家\n- 目标: 连接采购用途和买家角色\n- 内容: 场景 ${listValue(fields.scenarios)}；目标买家 ${listValue(fields.targetBuyers)}；目标国家 ${listValue(fields.targetCountries)}`,
    `4. 定制能力\n- 目标: 展示 OEM/ODM 或品牌采购适配能力\n- 内容: ${listValue(fields.customization)}`,
    `5. 采购执行信息\n- 目标: 降低询盘前的不确定性\n- 内容: MOQ ${listValue(fields.moq)}；样品 ${listValue(fields.sample)}；交期 ${listValue(fields.leadTime)}；包装 ${listValue(fields.packaging)}`,
    `6. 认证与信任背书\n- 目标: 支持合规和供应商筛选\n- 内容: 认证 ${listValue(fields.certifications)}；备注 ${listValue(fields.notes, "根据询盘补充更多证明材料")}`,
    `7. FAQ 与询盘收口\n- 目标: 回答 MOQ、样品、定制、交期、包装、认证、付款、售后问题\n- 内容: 引导买家提供规格、数量、目标市场和包装需求`,
  ];

  return sections.join("\n\n");
}

function buildQualityCheck(brief, outputs) {
  const fields = brief.fields;
  const allOutputText = [outputs.title, outputs.bullets, outputs.faq, outputs.detail].join(" ");
  const titleWords = uniqueWords(outputs.title);
  const titleWordCount = outputs.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).length;
  const duplicateTitleWords = titleWords.filter((word) => {
    const count = outputs.title.toLowerCase().split(/[^a-z0-9]+/).filter((item) => item === word).length;
    return count >= 3 && !["for", "and", "with"].includes(word);
  });
  const productCoreCount = countPhrase(outputs.title, fields.productCore || brief.normalized.productCore);
  const riskWords = ["best", "no.1", "no 1", "guaranteed", "100% perfect", "top seller"];
  const fabricatedClaimWords = ["million sold", "global leading", "ranked", "fortune 500", "apple supplier", "disney supplier"];
  const certifications = splitItems(fields.certifications).map((item) => item.toLowerCase());
  const faqText = outputs.faq.toLowerCase();
  const missing = Object.entries(labels)
    .filter(([key]) => requiredFields.includes(key) && !fields[key])
    .map(([, label]) => label);
  const missingB2B = ["moq", "sample", "leadTime", "packaging", "customization"]
    .filter((key) => !fields[key])
    .map((key) => labels[key]);
  const vagueBulletLines = outputs.bullets
    .split("\n")
    .filter((line) => line.trim())
    .filter((line) => {
      const lower = line.toLowerCase();
      const hasSpecificInput =
        [fields.material, fields.specs, fields.functions, fields.customization, fields.moq, fields.sample, fields.leadTime, fields.packaging, fields.certifications]
          .filter(Boolean)
          .some((value) => lower.includes(value.toLowerCase().split(/[，,;；、]/)[0].trim()));
      return !hasSpecificInput && line.length < 90;
    });
  const unknownCertMention = ["ce", "fda", "rohs", "iso", "lfgb", "bpa"]
    .filter((cert) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(cert)}([^a-z0-9]|$)`).test(faqText))
    .filter((cert) => !certifications.some((item) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(cert)}([^a-z0-9]|$)`).test(item)));
  const hasRiskWord = riskWords.filter((word) => allOutputText.toLowerCase().includes(word));
  const hasFabricatedClaim = fabricatedClaimWords.filter((word) => allOutputText.toLowerCase().includes(word));

  const passItems = [];
  const warningItems = [];
  const fixItems = [];

  function addCheck(pass, title, advice, severity = "warning") {
    if (pass) {
      passItems.push(`${title}: ${advice}`);
      return;
    }

    const item = `${title}: ${advice}`;
    if (severity === "fix") {
      fixItems.push(item);
    } else {
      warningItems.push(item);
    }
  }

  addCheck(
    duplicateTitleWords.length === 0 && titleWordCount <= 24,
    "标题堆词",
    duplicateTitleWords.length ? `重复词过多：${duplicateTitleWords.join(", ")}` : "标题长度和重复词风险可控"
  );
  addCheck(
    productCoreCount <= 1,
    "产品中心词数量",
    productCoreCount > 1 ? `标题中产品中心词出现 ${productCoreCount} 次，建议只保留一个中心词` : "标题中产品中心词控制为单一主线"
  );
  addCheck(
    hasFabricatedClaim.length === 0,
    "编造认证/销量/排名/客户案例",
    hasFabricatedClaim.length ? `发现疑似编造表达：${hasFabricatedClaim.join(", ")}` : "未发现销量、排名或客户案例类编造表达",
    "fix"
  );
  addCheck(
    hasRiskWord.length === 0,
    "风险词",
    hasRiskWord.length ? `发现风险词：${hasRiskWord.join(", ")}` : "未发现 Best、No.1、Guaranteed 等风险词",
    "fix"
  );
  addCheck(
    vagueBulletLines.length === 0,
    "五点卖点空泛",
    vagueBulletLines.length ? "部分卖点缺少参数、采购价值或应用场景支撑" : "五点卖点包含采购价值、规格或执行信息"
  );
  addCheck(
    unknownCertMention.length === 0,
    "FAQ 未提供信息",
    unknownCertMention.length ? `FAQ 提到了输入中未提供的认证：${unknownCertMention.join(", ")}` : "FAQ 未编造输入之外的认证信息",
    "fix"
  );
  addCheck(
    missingB2B.length === 0,
    "关键 B2B 信息",
    missingB2B.length ? `缺少：${missingB2B.join("、")}` : "MOQ、样品、交期、包装、定制能力已覆盖"
  );
  addCheck(
    Boolean(fields.targetBuyers && fields.scenarios && fields.customization && (fields.moq || fields.sample || fields.leadTime)),
    "B2B 采购逻辑",
    "建议同时覆盖目标买家、应用场景、定制能力和采购执行信息"
  );

  const status = fixItems.length ? "需修改" : warningItems.length ? "有警告" : "通过";

  return `质检总评: ${status}

通过项:
${passItems.length ? passItems.map((item) => `- ${item}`).join("\n") : "- 暂无"}

警告项:
${warningItems.length ? warningItems.map((item) => `- ${item}`).join("\n") : "- 无"}

需修改项:
${fixItems.length ? fixItems.map((item) => `- ${item}`).join("\n") : "- 无"}

资料完整度: ${Object.keys(labels).length - missing.length}/${Object.keys(labels).length}
待补充字段: ${missing.length ? missing.join("、") : "无"}

原始资料快照:
${briefBlock(brief)}`;
}

function buildFinalOutput(result) {
  return `# 阿里国际站商品发布内容

## 资料结构化
${result.modules.productBrief}

## Skill 设置
${result.modules.skillContext}

## 标题
${result.modules.title}

## 五点卖点
${result.modules.bullets}

## FAQ
${result.modules.faq}

## 详情页结构
${result.modules.detail}

## 质检结果
${result.modules.qc}

## 待补充信息
${result.brief.missingFields.length ? result.brief.missingFields.map((key) => `- ${labels[key]}`).join("\n") : "- 无"}`;
}

function setOutput(id, text) {
  const node = document.querySelector(`#${id}`);
  node.textContent = text;
  node.classList.remove("empty");
}

function generateListing(brief) {
  const productBrief = buildProductBriefOutput(brief);
  const title = buildTitle(brief);
  const bullets = buildBullets(brief);
  const faq = buildFaq(brief);
  const detail = buildDetail(brief);
  const qc = buildQualityCheck(brief, { title, bullets, faq, detail });
  const result = {
    brief,
    modules: {
      productBrief,
      skillContext: buildSkillContextOutput(),
      title,
      bullets,
      faq,
      detail,
      qc,
      final: "",
    },
    meta: {
      generatedAt: new Date().toISOString(),
      promptFiles,
      isConservative: !brief.isComplete,
    },
  };

  result.modules.final = buildFinalOutput(result);

  setOutput("briefOutput", result.modules.productBrief);
  setOutput("titleOutput", result.modules.title);
  setOutput("bulletsOutput", result.modules.bullets);
  setOutput("faqOutput", result.modules.faq);
  setOutput("detailOutput", result.modules.detail);
  setOutput("qcOutput", result.modules.qc);
  setOutput("finalOutput", result.modules.final);

  return result;
}

function fillForm(fields) {
  Object.entries(labels).forEach(([key]) => {
    const input = form.elements[key];
    if (input) input.value = fields[key] || "";
  });
}

function renderExampleOutputs(example) {
  if (!example.outputs) return;
  setOutput("briefOutput", example.outputs.productBrief || "案例未提供资料结构化输出");
  setOutput("titleOutput", example.outputs.title || "");
  setOutput("bulletsOutput", example.outputs.bullets || "");
  setOutput("faqOutput", example.outputs.faq || "");
  setOutput("detailOutput", example.outputs.detailPage || "");
  setOutput("qcOutput", example.outputs.qualityCheck || "");
  setOutput("finalOutput", example.outputs.finalOutput || "");
}

function loadSelectedExample() {
  const selected = examples.find((example) => example.id === exampleSelect.value);
  if (!selected) {
    showToast("请先选择案例");
    return;
  }

  fillForm(selected.input);
  renderExampleOutputs(selected);
  exampleStatus.textContent = `已加载案例：${selected.name}，可点击“生成商品内容”重新生成`;
  showToast("案例已加载");
}

function testExampleWorkflow() {
  if (!examples.length) {
    showToast("案例库尚未加载");
    return;
  }

  const results = examples.map((example) => {
    const brief = createProductBrief(Object.fromEntries(Object.keys(labels).map((key) => [key, example.input[key] || ""])));
    const title = buildTitle(brief);
    const bullets = buildBullets(brief);
    const faq = buildFaq(brief);
    const detail = buildDetail(brief);
    const qc = buildQualityCheck(brief, { title, bullets, faq, detail });
    const failures = [
      ["标题为空", !title],
      ["五点为空", !bullets],
      ["FAQ 为空", !faq],
      ["详情页为空", !detail],
      ["质检为空", !qc],
      ["质检需修改", qc.includes("质检总评: 需修改")],
    ].filter(([, failed]) => failed).map(([label]) => label);

    return {
      name: example.name,
      passed: failures.length === 0,
      failures,
    };
  });

  const failed = results.filter((result) => !result.passed);
  exampleStatus.textContent = failed.length
    ? `案例测试：${results.length - failed.length}/${results.length} 通过；失败：${failed.map((item) => item.name).join("、")}`
    : `案例测试：${results.length}/${results.length} 全部通过`;
  showToast("案例测试完成");
}

async function copyText(text, message) {
  if (!text.trim()) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(message);
}

function showToast(message) {
  const template = document.querySelector("#toastTemplate");
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateListing(getBrief());
  showToast("商品内容已生成");
});

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.copy}`);
    copyText(target.textContent, "已复制当前模块");
  });
});

copyAllButton.addEventListener("click", () => {
  const allText = Array.from(document.querySelectorAll(".result-module"))
    .map((module) => {
      const title = module.querySelector("h3").textContent;
      const content = module.querySelector(".output-content").textContent;
      return `【${title}】\n${content}`;
    })
    .join("\n\n");

  copyText(allText, "已复制全部结果");
});

clearFormButton.addEventListener("click", () => {
  form.reset();
  showToast("表单已清空");
});

loadExampleButton.addEventListener("click", loadSelectedExample);
testExamplesButton.addEventListener("click", testExampleWorkflow);
saveSkillSettingsButton.addEventListener("click", saveSkillSettings);
addFolderButton.addEventListener("click", () => folderPicker.click());
folderPicker.addEventListener("change", async () => {
  await addSelectedFolder(folderPicker.files);
  folderPicker.value = "";
});
askKnowledgeButton.addEventListener("click", answerFromKnowledge);
workflowSearch.addEventListener("input", filterWorkflowCards);
filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    activeWorkflowFilter = chip.dataset.filter;
    filterWorkflowCards();
  });
});
workflowGallery.querySelectorAll(".use-workflow").forEach((button) => {
  button.addEventListener("click", () => applyWorkflowSkill(button));
});

loadPrompts().catch((error) => {
  promptStatus.textContent = "提示词加载失败";
  console.error(error);
});

loadExamples().catch((error) => {
  exampleStatus.textContent = "案例库加载失败";
  console.error(error);
});

loadSkillSettings();

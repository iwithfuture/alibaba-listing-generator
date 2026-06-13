const promptFiles = {
  title: "prompts/title.txt",
  bullets: "prompts/bullets.txt",
  faq: "prompts/faq.txt",
  detail: "prompts/detail-page.txt",
  qc: "prompts/quality-check.txt",
};

const form = document.querySelector("#productForm");
const promptStatus = document.querySelector("#promptStatus");
const copyAllButton = document.querySelector("#copyAll");
const clearFormButton = document.querySelector("#clearForm");

let prompts = {};

const labels = {
  productName: "产品名称",
  coreKeyword: "核心关键词",
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
  notes: "补充说明",
};

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

function getBrief() {
  const data = new FormData(form);
  return Object.fromEntries(
    Object.keys(labels).map((key) => [key, String(data.get(key) || "").trim()])
  );
}

function listValue(value, fallback = "可根据项目需求确认") {
  return value || fallback;
}

function splitItems(value) {
  return value
    .split(/[,，;；、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function briefBlock(brief) {
  return Object.entries(labels)
    .map(([key, label]) => `${label}: ${brief[key] || "未填写"}`)
    .join("\n");
}

function applyPrompt(prompt, brief) {
  return prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => brief[key] || "未填写");
}

function buildTitle(brief) {
  const attributes = splitItems(brief.attributeWords).slice(0, 3).join(" ");
  const scenario = splitItems(brief.scenarios)[0] || "Commercial";
  const country = splitItems(brief.targetCountries)[0] || "Global";
  const customization = brief.customization ? "Customizable" : "OEM ODM";
  const title = [
    attributes,
    brief.coreKeyword || brief.productName,
    brief.specs,
    `for ${scenario}`,
    customization,
    `${country} Supplier`,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return title;
}

function buildBullets(brief) {
  const bullets = [
    `1. Search-ready positioning: combines ${listValue(brief.coreKeyword, "the core keyword")} with ${listValue(brief.attributeWords, "clear attribute words")} for accurate Alibaba product matching.`,
    `2. Buyer-focused use cases: suitable for ${listValue(brief.scenarios, "target purchasing scenarios")} with practical specs including ${listValue(brief.specs)}.`,
    `3. Material and performance: made with ${listValue(brief.material)} and designed for ${listValue(brief.functions, "stable daily or industrial use")}.`,
    `4. Flexible customization: supports ${listValue(brief.customization, "OEM/ODM requirements")} with MOQ ${listValue(brief.moq, "to be confirmed")}.`,
    `5. Sourcing confidence: sample ${listValue(brief.sample, "available on request")}, lead time ${listValue(brief.leadTime)}, packaging ${listValue(brief.packaging)}, certification ${listValue(brief.certifications)}.`,
  ];

  return bullets.join("\n");
}

function buildFaq(brief) {
  const faq = [
    ["What is your MOQ?", `Our regular MOQ is ${listValue(brief.moq, "based on product configuration")}. Trial orders can be discussed according to stock and customization requirements.`],
    ["Can I get a sample before bulk order?", `Yes. ${listValue(brief.sample, "Samples can be arranged before mass production")}. Sample cost and shipping method can be confirmed after specifications are selected.`],
    ["Do you support logo or packaging customization?", `Yes. We support ${listValue(brief.customization, "logo, color, size, and packaging customization")} for brand and project buyers.`],
    ["What is the production lead time?", `The usual lead time is ${listValue(brief.leadTime)} after order details and payment are confirmed.`],
    ["Which markets is this product suitable for?", `This product is suitable for ${listValue(brief.targetCountries, "global B2B markets")} and can be adjusted according to local compliance needs.`],
  ];

  return faq.map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n");
}

function buildDetail(brief) {
  const sections = [
    `1. 首屏模块\n- 主标题: ${brief.productName || brief.coreKeyword || "产品名称"}\n- 副标题: ${listValue(brief.attributeWords, "核心属性")} / ${listValue(brief.scenarios, "应用场景")}\n- CTA: Send Inquiry / Get Sample`,
    `2. 产品核心卖点\n- 材质: ${listValue(brief.material)}\n- 功能: ${listValue(brief.functions)}\n- 规格: ${listValue(brief.specs)}`,
    `3. 应用场景展示\n- 场景: ${listValue(brief.scenarios)}\n- 目标国家: ${listValue(brief.targetCountries)}`,
    `4. 定制与采购信息\n- 定制能力: ${listValue(brief.customization)}\n- MOQ: ${listValue(brief.moq)}\n- 样品: ${listValue(brief.sample)}\n- 交期: ${listValue(brief.leadTime)}`,
    `5. 包装、认证与信任背书\n- 包装: ${listValue(brief.packaging)}\n- 认证: ${listValue(brief.certifications)}\n- 备注: ${listValue(brief.notes, "根据询盘补充更多证明材料")}`,
  ];

  return sections.join("\n\n");
}

function buildQualityCheck(brief, outputs) {
  const checks = [
    ["核心关键词", Boolean(brief.coreKeyword), "标题和卖点应包含核心关键词"],
    ["属性覆盖", Boolean(brief.attributeWords), "建议补充 2-5 个属性词提升搜索匹配"],
    ["采购信息", Boolean(brief.moq && brief.leadTime), "MOQ 和交期会影响询盘转化"],
    ["定制能力", Boolean(brief.customization), "阿里国际站买家常关注 OEM/ODM 能力"],
    ["信任信息", Boolean(brief.certifications || brief.sample), "认证或样品信息可降低采购顾虑"],
    ["标题长度", outputs.title.split("\n")[0].length <= 180, "建议标题控制在 180 字符以内"],
  ];

  const summary = checks.map(([name, pass, advice]) => {
    const mark = pass ? "通过" : "待优化";
    return `${mark} - ${name}: ${advice}`;
  });

  const missing = Object.entries(labels)
    .filter(([key]) => !brief[key])
    .map(([, label]) => label);

  return `${summary.join("\n")}\n\n资料完整度: ${Object.keys(labels).length - missing.length}/${Object.keys(labels).length}\n待补充字段: ${missing.length ? missing.join("、") : "无"}\n\n原始资料快照:\n${briefBlock(brief)}`;
}

function setOutput(id, text) {
  const node = document.querySelector(`#${id}`);
  node.textContent = text;
  node.classList.remove("empty");
}

function generateListing(brief) {
  const title = buildTitle(brief);
  const bullets = buildBullets(brief);
  const faq = buildFaq(brief);
  const detail = buildDetail(brief);
  const qc = buildQualityCheck(brief, { title, bullets, faq, detail });

  setOutput("titleOutput", title);
  setOutput("bulletsOutput", bullets);
  setOutput("faqOutput", faq);
  setOutput("detailOutput", detail);
  setOutput("qcOutput", qc);
}

async function copyText(text, message) {
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text);
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

loadPrompts().catch((error) => {
  promptStatus.textContent = "提示词加载失败";
  console.error(error);
});

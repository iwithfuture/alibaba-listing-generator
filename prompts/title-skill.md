# Title Skill

## 适用场景
用于生成阿里国际站商品标题，目标是兼顾平台搜索匹配、买家可读性和 B2B 采购点击意图。

## 输入字段
- 产品名称：{{productName}}
- 产品中心词：{{productCore}}
- 核心关键词：{{coreKeyword}}
- 品牌/营销词：{{brandMarketing}}
- 属性词：{{attributeWords}}
- 关键词变体：{{keywordVariants}}
- 应用场景：{{scenarios}}
- 规格：{{specs}}
- 材质：{{material}}
- 目标国家：{{targetCountries}}
- 目标买家：{{targetBuyers}}
- 补充说明：{{notes}}

## 执行步骤
1. 从产品名称中识别产品中心词。
2. 从属性词中选择 2-4 个最能影响采购判断的词。
3. 从关键词变体中选择 1 个自然可读的变体，避免和核心关键词重复。
4. 选择最有商业采购价值的应用场景。
5. 严格按标题公式组织标题：
   品牌/营销词 + 属性词 + 产品中心词 + 核心关键词变体 + 应用场景
6. 如果没有品牌，品牌/营销词使用 B2B 采购常见表达，如 Custom、Wholesale、OEM、Factory Supply，但不得虚构品牌名。
7. 控制标题自然可读，优先英文输出。

## 输出格式
```text
标题：
```

## 禁止事项
- 禁止关键词堆砌，例如连续重复 water bottle / bottle / bottles。
- 禁止使用 Best、No.1、Guaranteed、100% Perfect 等无法证明的绝对化表达。
- 禁止虚构品牌、认证、材质、专利、适配国家或平台背书。
- 禁止输出多个标题，除非明确要求生成备选版本。

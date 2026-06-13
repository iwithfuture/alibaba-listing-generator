---
name: alibaba-title
description: Generate Alibaba.com B2B product listing titles. Use when creating or reviewing titles for international Alibaba product publishing, especially when title formula, keyword placement, product core term control, and anti-keyword-stuffing checks matter.
---

# Alibaba Title

## 适用场景
用于阿里国际站商品标题生成、标题重写、标题质检。适合 B2B 商品发布，不适合亚马逊式零售标题。

## 输入字段
- 产品名称
- 产品中心词
- 核心关键词
- 关键词变体
- 品牌/营销词
- 属性词
- 应用场景
- 目标国家
- 目标买家
- 补充说明

## 执行步骤
1. 确认产品中心词，只保留一个主线中心词。
2. 从属性词中选择 2-4 个影响采购判断的词。
3. 从关键词变体中选择 1 个自然表达，避免和产品中心词机械重复。
4. 选择最明确的应用场景。
5. 按公式生成标题：`品牌/营销词 + 属性词 + 产品中心词 + 核心关键词变体 + 应用场景`。
6. 检查标题是否堆词、重复中心词或包含风险词。

## 输出格式
```text
标题：
[英文标题]

质检：
- 产品中心词：
- 关键词变体：
- 堆词风险：
- 风险词：
```

## 禁止事项
- 禁止编造品牌、认证、专利、销量、排名、客户案例。
- 禁止使用 `Best`、`No.1`、`Guaranteed`、`100% Perfect`。
- 禁止重复堆叠同义关键词。
- 禁止输出多个标题，除非用户明确要求备选。

## 示例
输入：
```text
产品中心词：water bottle
核心关键词：stainless steel water bottle
关键词变体：thermal flask, insulated drinkware
品牌/营销词：Custom
属性词：double wall, vacuum insulated, leakproof
应用场景：outdoor
```

输出：
```text
标题：
Custom double wall vacuum insulated leakproof water bottle thermal flask for outdoor

质检：
- 产品中心词：water bottle，仅出现一次
- 关键词变体：thermal flask
- 堆词风险：低
- 风险词：无
```

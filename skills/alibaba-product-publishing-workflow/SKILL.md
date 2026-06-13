---
name: alibaba-product-publishing-workflow
description: Run the full Alibaba.com product publishing workflow. Use when turning product inputs into structured brief, title, B2B bullet points, FAQ, detail page structure, QA check, and final publish-ready listing content.
---

# Alibaba Product Publishing Workflow

## 适用场景
用于完整执行阿里国际站商品发布工作流：资料结构化 -> 标题 -> 五点卖点 -> FAQ -> 详情页结构 -> 质检 -> 最终发布版。

## 输入字段
- 产品名称
- 产品中心词
- 核心关键词
- 关键词变体
- 品牌/营销词
- 属性词
- 应用场景
- 材质
- 规格
- 功能
- 定制能力
- MOQ
- 样品
- 交期
- 包装
- 认证
- 目标国家
- 目标买家
- 补充说明

## 执行步骤
1. 创建 `ProductBrief`：保留原始输入，补充保守默认值，标记缺失字段。
2. 结构化资料：输出产品定位、关键词、属性、场景、买家、采购信息、定制能力、信任背书。
3. 生成标题：使用 `alibaba-title` 规则。
4. 生成五点卖点：使用 `alibaba-bullets` 规则。
5. 生成 FAQ：使用 `alibaba-faq` 规则。
6. 生成详情页结构：按首屏、核心卖点、场景买家、定制能力、采购信息、认证信任、FAQ 收口组织。
7. 执行质检：检查堆词、中心词数量、编造信息、风险词、卖点空泛、FAQ 编造、B2B 信息缺失、采购逻辑。
8. 生成最终发布版：保留模块边界，包含质检结果和待补充信息。

## 输出格式
```text
# 阿里国际站商品发布内容

## 资料结构化

## 标题

## 五点卖点

## FAQ

## 详情页结构

## 质检结果

## 待补充信息
```

## 禁止事项
- 禁止跳过质检。
- 禁止为填补空字段而编造认证、销量、排名、客户案例、付款、售后。
- 禁止把 prompt 正文混入最终发布版。
- 禁止删除警告项或需修改项。
- 禁止输出偏零售平台的话术，必须服务 B2B 采购逻辑。

## 示例
输入：
```text
产品名称：CNC Machined Aluminum Part
产品中心词：machined part
核心关键词：CNC machined aluminum part
品牌/营销词：Factory Supply
属性词：precision, anodized, custom tolerance
关键词变体：CNC component
应用场景：automation equipment
材质：6061 aluminum
定制能力：CNC machining, anodizing, laser marking
MOQ：100 pcs
样品：prototype available after drawing review
交期：7-15 days for prototype, 20-30 days for bulk order
包装：foam protection, anti-scratch bag, export carton
认证：ISO 9001 factory management available
目标买家：equipment manufacturers, engineering buyers
```

输出：
```text
## 标题
Factory Supply precision anodized custom tolerance machined part CNC component for automation equipment

## 五点卖点
1. Procurement Fit: suitable for engineering buyers sourcing drawing-based CNC components.
...

## 质检结果
质检总评: 通过
通过项:
- 标题堆词: 标题长度和重复词风险可控
- 产品中心词数量: 标题中产品中心词控制为单一主线
```

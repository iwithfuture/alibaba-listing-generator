---
name: alibaba-faq
description: Generate Alibaba.com B2B FAQ sections. Use when writing procurement FAQs for Alibaba listings, especially questions about MOQ, samples, customization, lead time, packaging, certification, payment, and after-sales support.
---

# Alibaba FAQ

## 适用场景
用于生成阿里国际站商品 FAQ，提前回答 B2B 买家询盘前的采购顾虑。

## 输入字段
- 产品名称
- 产品中心词
- 核心关键词
- MOQ
- 样品
- 定制能力
- 交期
- 包装
- 认证
- 目标国家
- 目标买家
- 补充说明

## 执行步骤
1. 生成 MOQ 问答。
2. 生成样品问答。
3. 生成定制能力问答。
4. 生成交期问答。
5. 生成包装问答。
6. 生成认证问答。
7. 生成付款问答；未提供付款条款时，只写可在订单确认时沟通。
8. 生成售后问答；未提供售后政策时，只写按订单协议和检验标准确认。
9. 检查 FAQ 是否编造输入中不存在的信息。

## 输出格式
```text
Q1: What is your MOQ?
A1: ...

Q2: Can I get a sample before bulk order?
A2: ...
```

## 禁止事项
- 禁止编造具体付款条款。
- 禁止编造质保年限、退款政策、售后承诺。
- 禁止编造认证编号、测试报告、目标市场合规结论。
- 禁止回避 MOQ、样品、定制、交期、包装、认证、付款、售后。

## 示例
输入：
```text
MOQ：1000 pcs
样品：stock sample available in 2-4 days
定制能力：logo printing, package design
交期：10-20 days
包装：retail box, custom blister packaging
认证：RoHS material declaration available
```

输出：
```text
Q1: What is your MOQ?
A1: The MOQ is 1000 pcs.

Q2: Can I get a sample before bulk order?
A2: Stock samples are available in 2-4 days.

Q3: Do you support customization?
A3: Logo printing and package design are available.

Q4: What payment terms do you support?
A4: Payment terms can be discussed after quantity, customization scope, and delivery terms are confirmed.
```

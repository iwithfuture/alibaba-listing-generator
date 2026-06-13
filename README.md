# 阿里国际站商品发布工作流

一个本地静态网页工具，用于根据产品资料生成阿里国际站商品标题、五点卖点、FAQ、详情页结构和质检结果。

## 本地预览

```bash
npx serve .
```

也可以用任意静态服务器托管当前目录。

## 提示词

每个生成模块都有独立提示词文件，位于 `prompts/`：

- `product-brief.md`
- `title-skill.md`
- `bullet-skill.md`
- `faq-skill.md`
- `detail-page-skill.md`
- `qa-check-skill.md`
- `final-output-skill.md`

## 案例库

案例位于 `examples/`，可在页面中一键加载并重新生成：

- `water-bottle.json`
- `phone-case.json`
- `packaging-box.json`
- `machinery-part.json`
- `custom-gift.json`

# 阿里国际站商品发布工作流

一个本地静态网页工具，用于根据产品资料生成阿里国际站商品标题、五点卖点、FAQ、详情页结构和质检结果。

## 本地预览

```bash
npx serve .
```

也可以用任意静态服务器托管当前目录。

## 提示词

每个生成模块都有独立提示词文件，位于 `prompts/`：

- `title.txt`
- `bullets.txt`
- `faq.txt`
- `detail-page.txt`
- `quality-check.txt`

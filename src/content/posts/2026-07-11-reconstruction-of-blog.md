---
title: 博客首页卡片重构记：从 Fluent Design 到设计语言的统一
tags: [css,web,blog,astro]
date: 2026-07-11
category: 教程
---

其实一直打算改一下自己博客首页的样式，跳动的Material Design大色块很有灵性，但我不是很喜欢。趁着短学期课程设计已经做完并且台风天不想干别的，整改一下。结果一路改下来，从卡片样式到设计语言到整体架构都动了不少。记录一下过程和思考。

## Astro markdown 配置迁移

[Astro](https://docs.astro.build/zh-cn/getting-started/) 是一个静态网站生成器，它内置了 markdown 处理能力。在 Astro 7 中，markdown 的插件配置方式发生了变化——原来直接写在 `markdown.remarkPlugins` 和 `markdown.rehypePlugins` 里的插件，现在需要通过 [unified](https://unified.js.org/) 函数来统一配置。

[unified](https://unified.js.org/) 是一个文本处理引擎，它把 markdown → AST（抽象语法树）→ HTML 的过程拆分成多个可插拔的步骤。其中 [remark](https://github.com/remarkjs/remark) 插件处理 markdown 语法层面的转换（比如数学公式、指令语法），[rehype](https://github.com/rehypejs/rehype) 插件处理 HTML 层面的转换（比如给代码块加高亮、给表格加滚动容器）。

原来的配置：

```js
markdown: {
  remarkPlugins: [remarkMath, remarkDirective, ...],
  rehypePlugins: [rehypeHeadingIds, rehypeKatex, ...],
  remarkRehype: { footnoteLabel: "参考" },
}
```

迁移后：

```js
import { unified } from "@astrojs/markdown-remark";

markdown: {
  processor: unified({
    gfm: true,
    remarkPlugins: [remarkMath, remarkDirective, ...],
    rehypePlugins: [rehypeHeadingIds, rehypeKatex, ...],
    remarkRehype: { footnoteLabel: "参考" },
  }),
}
```

过程中踩了一个坑：迁移时顺手把 `gfm` 设成了 `false`，结果发现文章里的表格全部变成了纯文本。GFM（GitHub Flavored Markdown）是 GitHub 扩展的 markdown 语法，包含了表格、删除线、任务列表等特性。Astro 默认开启 GFM，关掉之后 markdown 解析器就不认识 `|` 分隔的表格了。

这个项目的表格处理链是这样的：

1. [GFM 解析器](https://github.com/remarkjs/remark-gfm)把 markdown 表格语法转成 `<table>` HTML
2. `rehypeTableBlock` 插件遍历 AST，找到 `<table>` 节点，用 `<div class="table-wrapper">` 包裹它
3. CSS 中 `.table-wrapper` 设置 `overflow-x-auto`，让表格在小屏幕上可以水平滚动

```js
// src/plugins/rehypeTableBlock.js
// rehype 插件操作的是 HTML AST（称为 hast），每个节点代表一个 HTML 元素
import { h } from "hastscript";       // h() 函数用来创建 HTML 节点
import { visit } from "unist-util-visit"; // visit() 用来遍历 AST

export function rehypeTableBlock() {
  return function (tree) {
    visit(tree, "element", (node, index, parent) => {
      // 找到 <table> 节点，用 <div class="table-wrapper"> 包裹
      if (node.tagName === "table") {
        const wrapper = h("div", { class: "table-wrapper" }, [node]);
        parent.children[index] = wrapper;
      }
    });
  };
}
```

## 文章列表设计的选择

文章列表如何安排并没有一个统一的答案。个人用过很多RSS阅读器，不管是逐行列表，还是卡片，不管是纯文本信息还是带上封面图，各家都能交出不错的样式。

个人主要看了这些网站的文章列表设计：

- [Microsoft Developer Blogs](https://devblogs.microsoft.com/)

|List|Card|
|----|----|
|![list](https://i.ibb.co/wFJ9RnkB/msdev.png)|![Card](https://i.ibb.co/7tcfvwQr/msdev2.png)|


MS自己其实也没做到风格同一来着，Windows和VSCode开发团队都有自己的一套。~~建议三个开发团队打一架，谁赢到最后谁来负责UI~~

|[Windows Devloper](https://blogs.windows.com/windowsdeveloper/)|[Apple Developer News](https://developer.apple.com/news/)|
|----|----|
|![windows_Devlopment_Blog](https://i.ibb.co/Q3sr0J5f/windows.png)|![Apple_Dev_News](https://i.ibb.co/9mrn8MBT/apple.png)|

这么比真的好吗.jpg

|[Android Developer Blog](https://developer.android.google.cn/blog/latest?hl=zh-cn)|[MDN Blog](https://developer.mozilla.org/en-US/blog/)|
|----|----|
|![Andriod_Dev_Blog](https://i.ibb.co/8LFCWztm/google.png)|![MDN_BLog](https://i.ibb.co/Ldbdsqh5/mdn.png)|

依旧迷惑比较法

- [蓝点网](www.landian.news/)

|List|Card|
|----|----|
|![list](https://i.ibb.co/xtC65w98/landian.png)|![Card](https://i.ibb.co/1ty2f0kz/landian2.png)|


## 封面图

首页卡片之前是纯文字列表，标题 + 摘要 + 元信息平铺直叙。改的第一步是给卡片加上封面图支持。

[Astro content collections](https://docs.astro.build/zh-cn/guides/content-collections/) 允许你用 TypeScript schema 定义文章的 frontmatter 结构。卡片组件会优先使用 frontmatter 中的 `cover` 字段，如果没有就用正则从文章内容里提取第一张图片：

```astro
---
// entry.body 是文章的原始 markdown 文本
// 正则匹配 markdown 图片语法 ![alt](url) 中的 url 部分
let coverImage = entry.data.cover
if (!coverImage && entry.body) {
  const imgMatch = entry.body.match(/!\[.*?\]\(([^)]+)\)/)
  if (imgMatch) {
    coverImage = imgMatch[1]
  }
}
---
```

目前大部分文章都没有手动配置 cover，所以实际展示的是 4 张固定的占位图，按文章索引轮换，保证相邻卡片不会出现同一张图：

```astro
const displayImage = coverImage || placeholders[index % 4]
```

这里的 `%` 是[取模运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Remainder)，`index % 4` 会返回 0-3 之间的循环值，用来索引 4 张图片。

## 卡片布局

从单列列表改成了 2 列网格。这里用到了 [CSS Grid](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_grid_layout)，一种二维布局系统：

```astro
<ul class="grid grid-cols-1 md:grid-cols-2 gap-5">
```

- `grid`：启用 Grid 布局
- `grid-cols-1`：默认 1 列
- `md:grid-cols-2`：[响应式断点](https://tailwindcss.com/docs/responsive-design)，当视口宽度 ≥ 768px 时变为 2 列
- `gap-5`：网格项之间的间距（`gap` 是 [CSS gap](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gap) 的简写）

卡片高度通过 `h-full` 统一（让每个卡片填满所在网格单元格的高度），摘要用 `flex-1` 填充剩余空间。`flex-1` 对应 [CSS flex: 1](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)，意思是"在 flex 容器中尽可能多地占据剩余空间"。

信息层级也做了调整——日期/字数/阅读时间 → 标题 → 摘要 → 分类标签，每一层之间间距明确。"继续阅读"按钮删掉了，大家应该都知道可以点进来。

## 设计语言的混乱

改着改着发现一个问题：当前的 `fluent-card` 样式其实是 [Fluent Design](https://fluent2.microsoft.design/) 和 [Material Design](https://m3.material.io/) 的混搭。整体感大致如下：

| 维度 | Fluent Design | Material Design |
|------|--------------|-----------------|
| 材质感 | 毛玻璃、丙烯酸 | 纸片叠加 |
| 阴影 | 微妙内阴影 | 明确外阴影 |
| 圆角 | 小圆角（4-6px） | 大圆角（8-16px） |
| 颜色 | 低饱和、半透明 | 高饱和、明确主色 |

当前的卡片用了 Fluent 风格的半透明边框，但阴影是 Material 风格的多层外阴影，accent 色又是高饱和的亮蓝。两种语言并存导致视觉上不统一。两种设计没有绝对的好坏之分，更多还是看个人习惯以及需求的场景。显然，我的博客在一个比较居中的位置：有一些技术性的内容分享，也有一些个人反思之类的。所以我觉得自己的博客不太适合完全放弃来自材质的隐喻和感受构建。

微软自己的 MS Learn 文档站其实已经放弃了这两种隐喻，回到了纯粹的排版设计。而 [Microsoft Developer Blogs](https://devblogs.microsoft.com/)的首页卡片走的是干净的现代风格——白底、细边框、柔和双层阴影，没有任何材质装饰。

## 阴影系统

最终参考 [Microsoft Developer Blogs](https://devblogs.microsoft.com/) 的阴影公式重新设计。微软用的是双层叠加：

```css
/* 亮色模式 - 默认 */
--clr-box-shadow:
  0px 4px 8px 0px rgba(0, 0, 0, 0.14),   /* 远距离主阴影 */
  0px 0px 2px 0px rgba(0, 0, 0, 0.12);   /* 近距离收紧轮廓 */

/* 亮色模式 - hover */
--clr-box-hover-shadow:
  0px 14px 28px 0px rgba(0, 0, 0, 0.24),  /* 远距离加深 */
  0px 0px 8px 0px rgba(0, 0, 0, 0.2);     /* 近距离也加深 */

/* 暗色模式 - alpha 值翻倍 */
--clr-box-shadow:
  0px 4px 8px 0px rgba(0, 0, 0, 0.28),
  0px 0px 2px 0px rgba(0, 0, 0, 0.24);
```

[box-shadow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-shadow) 的语法是：`offset-x offset-y blur-radius spread-radius color`。

- `offset-x` / `offset-y`：阴影相对于元素的偏移量
- `blur-radius`：模糊半径，值越大阴影越柔和
- `spread-radius`：扩展半径，正值会让阴影比元素更大，负值更小（这里都是 0）
- `color` 中的第四个值是 [alpha 通道](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_colors/Relative_colors)，控制透明度

精髓是近距离紧贴的小阴影（`0 0 2px`）提供清晰的边缘定义，远距离大模糊的主阴影（`0 4px 8px`）制造深度感。两层叠加后，卡片既有明确的边界，又有自然的悬浮感。

应用到自己的博客时做了一点调整——阴影 alpha 值降低以配合纯色卡片背景：

```css
.fluent-card {
  box-shadow:
    0 4px 8px rgb(0 0 0 / 0.08),    /* 主阴影 - 降低 alpha */
    0 0 2px rgb(0 0 0 / 0.06);      /* 收紧轮廓 */
}

.fluent-card:hover {
  box-shadow:
    0 14px 28px rgb(0 0 0 / 0.36),  /* hover 时加深 */
    0 0 8px rgb(0 0 0 / 0.12);
}
```

这里用到了 [CSS 自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)（也叫 CSS 变量），以 `--` 开头定义，通过 `var(--name)` 使用。自定义属性的一个强大之处是可以在不同选择器中重新定义，实现主题切换：

```css
:root {
  --color-accent: 3 150 255;  /* 亮色主题的蓝色 */
}

[data-theme="dark"] {
  --color-accent: 171 220 255; /* 暗色主题的浅蓝色 */
}
```

## 卡片结构

参考 [Microsoft Developer Blogs](https://devblogs.microsoft.com/) 的信息分层，重新设计了卡片结构：

- 缩略图区域加了 `p-3`（[padding](https://developer.mozilla.org/zh-CN/docs/Web/CSS/padding)）内边距和 `rounded-lg`（[border-radius](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-radius)）圆角，不再顶到卡片边缘
- 信息层级：日期行 → 标题 → 摘要 → 分类（底部用分隔线隔开）
- 去掉了渐变背景和毛玻璃效果，改为纯色背景

[Tailwind CSS](https://tailwindcss.com/) 的工具类命名规则：`p-3` = padding: 0.75rem（12px），`rounded-lg` = border-radius: 0.5rem（8px），`h-40` = height: 10rem（160px）。这类工具类让你不需要写自定义 CSS 就能快速调整样式。

## 主题色精简

原来配置了 5 组 accent 颜色，每次加载随机选一组：

```js
// AccentColorInjector.astro - 原来的逻辑
function pickRandomAccent() {
  const seed = (Math.random() * themeColor.accent.length) | 0
  return themeColor.accent[seed]
}
```

对于个人博客来说这个功能没什么必要，反而增加了视觉的不可控性。删掉了随机选色逻辑，`config.json` 里的 `color.accent` 从数组改成了单个对象：

```json
"accent": { "light": "#0396FF", "dark": "#ABDCFF" }
```

深色模式切换从 footer 移到了 header，和搜索按钮并排放在右上角。同时去掉了 "system" 跟随系统模式，只保留 light/dark 手动切换。理由是：既然做了手动切换，system 模式的优先级就变得模糊，不如让用户自己决定。

## 其他

- 修复了 Hero 区域在中间视口宽度下内容不居中的问题——给内容 div 加了 `mx-auto lg:mx-0`（`mx-auto` 是 [margin-inline: auto](https://developer.mozilla.org/zh-CN/docs/Web/CSS/margin) 的简写，用于水平居中块级元素）

---

总体来说这次改动让博客的设计语言从混搭变成了统一的 Fluent 风格——保留了材质感和阴影层次，但去掉了过度装饰。卡片的结构也从信息堆砌变成了有层次的展示。后面有空的话可以继续打磨文章页的排版，目前文章页和首页卡片之间还是有一定风格跳跃的。

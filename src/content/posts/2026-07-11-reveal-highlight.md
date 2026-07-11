---
title: 给博客卡片加一个 Reveal Highlight 光效
tags: [css,js,web,blog]
date: 2026-07-11
category: 教程
---

上一篇重构了首页卡片的结构，这次来加一个视觉效果：鼠标靠近卡片时，卡片边缘会亮起一圈白色的光，鼠标在卡片上移动时还会有一个跟随的 spotlight。这个效果叫 Reveal Highlight，Windows 10 的日历面板上有类似的交互。

先说一下为什么是白色光而不是用主题色。主题色是品牌标识，它应该出现在强调文字、按钮等「有意义」的地方。光效是一种交互反馈，它告诉用户「我检测到了你的鼠标」，这个反馈应该是中性的，用白色不会和主题色打架。

## 效果拆解

整个 Reveal Highlight 由三层组成：

1. **基础层**（`reveal-base`）：鼠标靠近时整张卡片边缘微微发亮，给出一个整体的「被激活」反馈
2. **Spotlight 层**（`reveal-spot`）：一个跟随鼠标的圆形渐变光斑，强化「光从鼠标位置发散」的感觉
3. **边框 + 阴影**：卡片边框从暗变亮，阴影加深，和前两层配合形成立体感

三层叠加在卡片上，用 [z-index](https://developer.mozilla.org/zh-CN/docs/Web/CSS/z-index) 分层：基础层 z-index: 1，spotlight 层 z-index: 2，文字内容 z-index: 10，保证文字始终在最上层。

## 为什么不能只用 CSS :hover

最直觉的做法是用 CSS 的 `:hover` 伪类：

```css
.fluent-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 14px 28px rgb(0 0 0 / 0.4);
}
```

这在卡片本身上没问题。但这个博客的首页用了两列网格布局，卡片之间有 20px 的间隙（[gap](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gap)）。当鼠标在间隙中时，`:hover` 不会触发——因为鼠标不在任何卡片上。这意味着光效在间隙中会突然消失，体验很割裂。

更合理的做法是：当鼠标靠近卡片时就激活，不管鼠标是否真的在卡片上。这需要 JavaScript 来检测鼠标位置和卡片边缘的距离。

## 核心实现：范围扩展检测

思路是这样的：每张卡片的实际区域不变，但在检测鼠标位置时，把它当作一个「扩大了一圈」的区域。鼠标进入这个扩展区域，就视为「靠近了这张卡片」。

```
┌─────────────────┐  ← 实际卡片边界
│  ┌───────────┐  │
│  │           │  │  ← 扩展区（12px）
│  │  卡片内容  │  │
│  │           │  │
│  └───────────┘  │
└─────────────────┘
```

实现上，把鼠标监听绑定到网格容器上（事件委托），而不是每张卡片各自监听：

```js
const container = document.querySelector('[data-reveal-bound]')
const cards = container.querySelectorAll('[data-card]')

container.addEventListener('mousemove', (e) => {
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect()
    const extend = 12  // 每个方向扩展 12px

    if (
      e.clientX >= rect.left - extend &&
      e.clientX <= rect.right + extend &&
      e.clientY >= rect.top - extend &&
      e.clientY <= rect.bottom + extend
    ) {
      card.classList.add('is-active')
    } else {
      card.classList.remove('is-active')
    }
  })
})
```

`getBoundingClientRect()` 返回元素相对于视口的坐标（[MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect)）。我们把 left/right 各减/加 12px，top/bottom 各减/加 12px，就得到了一个比实际卡片大一圈的检测区域。

为什么是 12px？因为卡片间隙是 20px，鼠标在间隙正中间时，离两边卡片各 10px。12px > 10px，所以间隙中任意位置都能同时激活两边的卡片。

鼠标离开网格区域时，清除所有 `is-active`：

```js
container.addEventListener('mouseleave', () => {
  cards.forEach((card) => card.classList.remove('is-active'))
})
```

## CSS 分层

HTML 结构中，`.reveal-base` 和 `.reveal-spot` 是卡片的前两个子元素，用 `position: absolute` 覆盖整张卡片（[inset: 0](https://developer.mozilla.org/zh-CN/docs/Web/CSS/inset) 是 top/right/bottom/left: 0 的简写）：

```html
<a class="fluent-card" data-card>
  <div class="reveal-base"></div>
  <div class="reveal-spot"></div>
  <!-- 文字内容 -->
  <div class="relative z-10">...</div>
</a>
```

基础层平时 `opacity: 0`，获得 `is-active` 时变为 `opacity: 1`：

```css
.reveal-base {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;  /* 不阻挡鼠标事件 */
  z-index: 1;
  box-shadow: inset 0 0 25px rgba(255, 255, 255, 0.05);
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.02) 0%,
    transparent 70%
  );
}

[data-card].is-active .reveal-base {
  opacity: 1;
}
```

`pointer-events: none` 很关键——这两个层是纯视觉的，必须让鼠标事件穿透它们，否则 `mousemove` 就监听不到真正的目标了。

Spotlight 层的大小通过 CSS 变量控制，由 JS 在 `mousemove` 中动态设置：

```js
card.style.setProperty('--x', `${e.clientX - rect.left}px`)
card.style.setProperty('--y', `${e.clientY - rect.top}px`)
```

```css
.reveal-spot {
  background: radial-gradient(
    circle 250px at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.08),
    transparent
  );
}
```

`radial-gradient` 的第二个参数 `250px` 是光斑半径（[MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient)）。CSS 变量 `--x` 和 `--y` 决定了光斑中心的位置，鼠标移动时 JS 不断更新这两个变量，光斑就跟着动了。

## 暗色模式适配

光效只在暗色模式下生效。实现方式是在 CSS 选择器前加 `[data-theme="dark"]`：

```css
[data-theme="dark"] [data-card].is-active {
  border-color: rgba(255, 255, 255, 0.2);
}
```

`data-theme="dark"` 是通过 JavaScript 在 `<html>` 元素上设置的属性，用于标识当前主题。这个选择器的意思是：只有当页面处于暗色模式时，`is-active` 的样式才生效。

亮色模式下白色光效看不出来（背景本来就亮），所以没有必要加。如果以后想在亮色模式下用主题色光效，只需要在 `[data-theme="light"]` 下定义另一套颜色就行。

## 踩过的坑

**空 `<script>` 标签报错**：删代码时留了一个空的 `<script></script>`，Astro/Vite 构建时报 `No script at index 0`。原因是 Vite 处理 script 标签时期望有内容。解决：直接删掉空标签。

**z-index 覆盖**：`.reveal-base` 和 `.reveal-spot` 用了 `position: absolute`，如果不给文字内容加 `relative z-10`，光效层会盖住文字。这是 CSS 定位上下文的经典问题——`absolute` 元素相对于最近的 `position` 不为 `static` 的祖先定位，同时也会覆盖没有 z-index 的普通流元素。

**暗色模式选择器冗余**：一开始同时写了 `[data-theme="dark"] .fluent-card:hover` 和 `[data-card].is-active`，两套规则设置了相同的属性。由于 JS 已经接管了 hover 检测（包括间隙场景），CSS `:hover` 在暗色模式下是多余的，删掉了。

---

整个效果的代码量不大，但涉及的知识点不少：事件委托、`getBoundingClientRect`、CSS 渐变、z-index 层叠、pointer-events、暗色模式适配。对于一个 CSS 新手来说，这是一个很好的练手项目——需求明确、效果直观、可以逐步迭代。

# AGENTS.md

This file provides guidance to the AI agent when working with code in this repository.

## 工作语言

本仓库的工作语言为简体中文。代码注释、commit message、与用户的交流均使用简体中文。

## 构建与开发

- `pnpm dev` — 启动本地开发服务器（localhost:4321）
- `pnpm build` — 依次执行 `astro check`（类型检查）、`astro build`（构建）、`pagefind --site dist`（生成搜索索引）
- `pnpm lint` — 运行 ESLint 检查代码问题
- `pnpm new-post` / `pnpm new-friend` / `pnpm new-project` — 交互式脚手架，创建新的文章/友链/项目

## 分支与部署

- 日常开发在 `dev` 分支上进行
- 合并 `dev` 到 `main` 后，GitHub Actions 自动部署到 GitHub Pages
- 不要直接向 `main` 分支推送

## Commit 风格

使用中文自由格式，简短描述变更内容。例如：`更新友链`、`fix 补充annotation的样式`、`准备一波更新`。

## 提交前检查

修改代码后，启动 `pnpm dev` 并在浏览器中验证页面效果，确认无误后再提交。

## 内容约定

- 文章文件命名格式：`YYYY-MM-DD-slug.md`（位于 `src/content/posts/`）
- Frontmatter 中 `draft: true` 的文章在开发环境可见，生产构建时隐藏
- 友链（`src/content/friends/`）和项目（`src/content/projects/`）使用 YAML 格式

## 架构要点

- Astro 静态站点 + React 交互组件（使用 `client:only="react"`）
- 状态管理使用 Jotai，atoms 定义在 `src/store/`
- 主题系统通过 `data-theme` 属性 + CSS 自定义属性实现，支持 light/dark/system
- 10 个自定义 remark/rehype 插件在 `src/plugins/`，用于处理代码块、数学公式、链接、图片、标题、表格、嵌入、剧透、 admonition、阅读时间等
- 路径别名：`@/*` 映射到 `src/*`
- 包管理器：pnpm

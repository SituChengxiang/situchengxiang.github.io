---
title: Hyprland 配置从 hyprlang 迁移到 Lua 小记
tags: [hyprland, linux]
date: 2026-08-07
category: 教程
---

:::note
本篇仍在AI稿版本，人工修正稿后续再补充。本人配置仅供参考，以及还有些小bug没修，尤其是和waybar连用的。所以顺势理论上来说dotfiles仓库也得更新。
:::

:::important
适用于 Hyprland ≥ 0.55（本文基于 0.56.1）
:::

## 背景

Hyprland 从 0.55 起提示将要废弃自有的 hyprlang 配置格式，改用 Lua 作为配置语言。如果你和我一样不会 Lua，不用担心——配置文件用到的 Lua 语法非常有限，本文会把每个知识点讲清楚。

配置文件从 `~/.config/hypr/hyprland.conf` 变为 `~/.config/hypr/hyprland.lua`。

## 写在前面：如何查阅文档

改配置时我走了不少弯路。最终发现有三个权威信息源，按实用性排序：

### 1. 本地 API 类型定义（最推荐）

```bash
cat /usr/share/hypr/stubs/hl.meta.lua
```

这是 Hyprland 自动生成的 Lua API stubs，1771 行，相当于官方 API 文档。所有函数签名、参数类型、返回值都在这里。AI爬这个会比较精准一点。

### 2. 本地示例配置

```bash
cat /usr/share/hypr/hyprland.lua
```

Hyprland 自带的示例配置，356 行，覆盖了监视器、配置、键绑定、窗口规则等常见场景。相当于官方 quickstart。

### 3. 官网 Wiki

```
https://wiki.hypr.land/Configuring/Start/
```

有整体说明和文字描述，但页面是 SPA 渲染的 HTML，用工具抓取时噪声很大。适合通读了解概念，不适合查 API。

### 4. 查看 reload 后的报错

```bash
hyprctl reload              # 返回 "ok"，不显示错误详情
hyprctl configerrors        # 列出所有配置解析错误
hyprctl rollinglog -f       # 实时跟踪日志（开一个新终端运行，再在另一个终端 reload）
```

`hyprctl reload` 只返回 `ok`，**不会在终端显示错误信息**。必须用 `configerrors` 或 `rollinglog` 才能看到报错。

---

## Lua 基础知识（配置文件用到的部分）

### 变量

```lua
local terminal = "konsole"        -- 局部变量，字符串
local mainMod  = "SUPER"          -- 可用于拼接键名
local count    = 5                -- 数字
local flag     = true             -- 布尔值
```

`local` 表示局部变量，只在当前文件内有效。配置文件里基本都用 `local`。

### 字符串拼接

Lua 用 `..` 拼接字符串（不是 `+`）：

```lua
hl.bind(mainMod .. " + E", hl.dsp.exec_cmd("dolphin"))
-- 等价于: hl.bind("SUPER + E", ...)
```

### 表（Table）

Lua 的表 `{}` 同时充当数组和字典，是配置的核心结构：

```lua
-- 类似 JSON 对象
{
    gaps_in  = 5,
    gaps_out = 10,
    layout   = "dwindle",
}

-- 类似 JSON 数组
{ 0.23, 1, 0.32, 1 }

-- 嵌套
{
    general = {
        col = {
            active_border = "rgba(cceeffbb)",
        },
    },
}
```

### 函数

```lua
-- 匿名函数（lambda）
function() hl.exec_cmd("waybar") end

-- 带参数的函数
function(name) print("hello " .. name) end
```

### for 循环

```lua
for i = 1, 9 do
    -- i 从 1 遍历到 9
    print(i)
end
```

Lua 的 for 是闭区间，`1, 9` 包含 1 和 9。

### 注释

```lua
-- 单行注释
--[[
    多行注释
]]
```

---

## 逐项迁移对照

### 1. 变量 → Lua 变量

```conf
# hyprlang
$terminal = konsole
$fileManager = dolphin
```

```lua
-- Lua
local terminal    = "konsole"
local fileManager = "dolphin"
```

### 2. 监视器

```conf
# hyprlang
monitor=eDP-1,2560x1600@120,auto,1.33333
```

```lua
-- Lua
hl.monitor({
    output   = "eDP-1",           -- 旧: name
    mode     = "2560x1600@120",   -- 旧: resolution
    position = "auto",
    scale    = 1.33333,
})
```

注意：`name` → `output`，`resolution` → `mode`。

### 3. 环境变量

```conf
# hyprlang
env = GDK_SCALE,1.5
```

```lua
-- Lua
hl.env("GDK_SCALE", "1.5")
```

### 4. 自动启动（exec-once）

```conf
# hyprlang
exec-once = waybar
exec-once = hyprpaper
```

```lua
-- Lua: 用 hl.on 监听启动事件，内部调用 hl.exec_cmd
hl.on("hyprland.start", function()
    hl.exec_cmd("waybar")
    hl.exec_cmd("hyprpaper")
end)
```

**注意**：旧的 `hl.exec_once()` 在新 API 中已不存在。官方推荐用 `hl.on("hyprland.start", fn)` 模式。如果进程已经在运行，重复 reload 不会重复启动（Hyprland 内部有去重机制）。

### 5. 全局配置（general, decoration, input 等）

```conf
# hyprlang
general {
    gaps_in = 5
    col.active_border = rgba(cceeffbb)
}
```

```lua
-- Lua: 所有配置节都放在一个 hl.config() 调用里
hl.config({
    general = {
        gaps_in = 5,
        col = {                              -- 嵌套形式
            active_border = "rgba(cceeffbb)",
        },
    },
    decoration = { ... },
    input = { ... },
    misc = { ... },
    dwindle = {},
    master = { new_status = "master" },
})
```

**颜色配置**要用嵌套的 `col = { active_border = ... }`，不能用扁平的 `col_active_border`。

### 6. 动画

```conf
# hyprlang
animations {
    enabled = yes
    bezier = easeOutQuint,0.23,1,0.32,1
    animation = windows, 1, 4.79, easeOutQuint
}
```

```lua
-- Lua: 分成三步
-- (1) 开关
hl.config({ animations = { enabled = true } })

-- (2) 定义贝塞尔曲线
hl.curve("easeOutQuint", {
    type   = "bezier",
    points = { {0.23, 1}, {0.32, 1} },
})

-- (3) 定义动画
hl.animation({
    leaf   = "windows",       -- 旧: animation 名称
    enabled = true,
    speed  = 4.79,            -- 旧: speed
    bezier = "easeOutQuint",  -- 旧: style（引用曲线名）
})
```

**关键变化**：
- `bezier` 和 `animation` 从 `animations {}` 块中独立出来
- 曲线用 `hl.curve()`，动画用 `hl.animation()`
- 动画的 `name` → `leaf`，`style` → `bezier`（引用曲线名）

### 7. 键绑定

```conf
# hyprlang
bind = SUPER, E, exec, dolphin
```

```lua
-- Lua
hl.bind("SUPER + E", hl.dsp.exec_cmd("dolphin"))
```

**语法**：`hl.bind(按键字符串, dispatcher, 可选选项)`

### 8. Dispatcher 命名空间

这是改动最大的部分。旧的 `hyprctl dispatch` 命令名和 Lua 的 `hl.dsp.*` 不是一一对应的：

| hyprlang | Lua |
|----------|-----|
| `exec, cmd` | `hl.dsp.exec_cmd("cmd")` |
| `killactive` | `hl.dsp.window.close()` |
| `fullscreen` | `hl.dsp.window.fullscreen()` |
| `togglefloating` | `hl.dsp.window.float({ action = "toggle" })` |
| `pseudo` | `hl.dsp.window.pseudo()` |
| `movefocus, l` | `hl.dsp.focus({ direction = "left" })` |
| `workspace, 1` | `hl.dsp.focus({ workspace = 1 })` |
| `movetoworkspace, 1` | `hl.dsp.window.move({ workspace = 1 })` |
| `togglespecialworkspace, magic` | `hl.dsp.workspace.toggle_special("magic")` |
| `movewindow` (bindm) | `hl.dsp.window.drag()` + `{ mouse = true }` |
| `resizewindow` (bindm) | `hl.dsp.window.resize()` + `{ mouse = true }` |
| `exit` | `hl.dsp.exit()` |
| `submap, name` | `hl.dsp.submap("name")` |
| `cyclenext` | `hl.dsp.window.cycle_next()` |
| `bringactivetotop` | `hl.dsp.window.bring_to_top()` |

**规律**：
- 窗口操作 → `hl.dsp.window.*`
- 工作区操作 → `hl.dsp.workspace.*`
- 焦点/通用 → `hl.dsp.focus()`, `hl.dsp.exit()`, `hl.dsp.exec_cmd()`
- 鼠标拖拽绑定需要加 `{ mouse = true }` 选项

### 9. 多媒体键标志

```conf
# hyprlang
bindel = ,XF86AudioRaiseVolume, exec, wpctl set-volume ...
bindl  = , XF86AudioNext, exec, playerctl next
```

```lua
-- Lua: 统一用 hl.bind() + opts 表
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume ..."), {
    locked     = true,      -- 锁屏时仍可用（对应旧 bindel/bindl）
    repeating  = true,      -- 长按重复触发（对应旧 bindel 的 e）
})

hl.bind("XF86AudioNext", hl.dsp.exec_cmd("playerctl next"), {
    locked = true,          -- 对应旧 bindl
})
```

**旧标志对应**：
- `bindel` = `{ locked = true, repeating = true }`（locked + enable + long）
- `bindl` = `{ locked = true }`
- `binde` = `{ repeating = true }`
- `bindm` = 鼠标绑定，加 `{ mouse = true }`

### 10. 子映射（Submap）

```conf
# hyprlang
bind=SUPER SHIFT, R, submap, resize
submap=resize
    binde=,h,resizeactive,-10 0
    bind=SUPER , Escape,submap,reset
submap=reset
```

```lua
-- Lua
hl.bind("SUPER + SHIFT + R", hl.dsp.submap("resize"))

hl.define_submap("resize", function()
    hl.bind("H",              hl.dsp.window.resize({ x = -10, y = 0, relative = true }))
    hl.bind("L",              hl.dsp.window.resize({ x = 10,  y = 0, relative = true }))
    hl.bind("K",              hl.dsp.window.resize({ x = 0,  y = -10, relative = true }))
    hl.bind("J",              hl.dsp.window.resize({ x = 0,  y = 10,  relative = true }))
    hl.bind("SUPER + ESCAPE", hl.dsp.submap("reset"))
end)
```

**注意**：`resizeactive` 的两个数字参数变为 `hl.dsp.window.resize({ x, y, relative = true })` 表。

### 11. 窗口规则

```conf
# hyprlang
windowrulev2 = float, class:^(wofi)$
```

```lua
-- Lua
hl.window_rule({
    name  = "float-wofi",           -- 规则名称（用于 hyprctl 查询/启用/禁用）
    match = { class = "^wofi$" },   -- 匹配条件
    float = true,                    -- 规则属性
})
```

**关键变化**：
- `hl.windowrule()` → `hl.window_rule()`（多了下划线）
- 参数从 `(规则字符串, 匹配表)` 变为单个 spec 表
- 匹配条件放在 `match = {}` 里
- 规则属性直接写在 spec 表中（`float = true`, `no_focus = true` 等）

### 12. 图层规则

```conf
# hyprlang
layerrule = blur on, match:namespace wofi
layerrule = ignore_alpha 0.2, match:namespace wofi
```

```lua
-- Lua
hl.layer_rule({
    name  = "blur-wofi",
    match = { namespace = "wofi" },
    blur  = true,
})

hl.layer_rule({
    name         = "ignore-alpha-wofi",
    match        = { namespace = "wofi" },
    ignore_alpha = 0.2,
})
```

### 13. 手势

```conf
# hyprlang
gestures {
    gesture = 3, horizontal, workspace
    workspace_swipe_create_new = false
}
```

```lua
-- Lua: 手势用 hl.gesture()，滑动设置放在 hl.config() 里
hl.gesture({
    fingers   = 3,
    direction = "horizontal",
    action    = "workspace",
})

hl.config({
    gestures = {
        workspace_swipe_create_new = false,
    },
})
```

### 14. 鼠标滚轮键名

```conf
# hyprlang
bind = $mainMod, mouse_down, workspace, e+1
```

```lua
-- Lua: 注意是小写 mouse_down，不是 MOUSE_DOWN
hl.bind("SUPER + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
```

大写的 `MOUSE_DOWN` 会报 `Unknown keysym` 错误。

---

## 分文件管理

Lua 的 `require()` 可以拆分配置：

```lua
-- hyprland.lua 中
require("monitors")    -- 加载 monitors.lua
require("keybinds")    -- 加载 keybinds.lua
```

被 require 的文件不需要 `return`，直接写 `hl.monitor()` 等调用即可。但注意 `require()` 有缓存——同一个文件只会执行一次。如果需要每次 reload 都重新执行，可以用 `dofile()` 替代。

---

## 调试技巧

```bash
# 查看当前所有配置错误
hyprctl configerrors

# 实时跟踪日志（开新终端运行，再在另一个终端 reload）
hyprctl rollinglog -f

# 动态执行 Lua 代码测试
hyprctl eval 'print("hello from lua")'

# 交互式 Lua REPL
hyprctl repl

# 测试 reload 后是否有错误
hyprctl reload && hyprctl configerrors

# 查看当前键绑定数
hyprctl binds | grep -c "key:"

# 查看某个配置项的当前值
hyprctl getoption general:gaps_in
hyprctl getoption decoration:rounding
```

---

## 常见报错与解决

| 报错 | 原因 | 解决 |
|------|------|------|
| `Unknown keysym: "MOUSE_DOWN"` | 键名大小写错误 | 改为小写 `mouse_down` |
| `dispatcher must be a dispatcher` | dispatcher 调用语法错误 | 检查是否用了旧的扁平名称 |
| `resize: expected no args, a table {x,y}` | resize 参数格式错误 | 改为 `{ x=, y=, relative=true }` |
| `hl.exec_once is not a function` | 旧 API 已废弃 | 改用 `hl.on("hyprland.start", fn)` |

---

## 完整的 API 速查

```lua
-- 核心 API
hl.config(spec)              -- 设置全局配置
hl.monitor(spec)             -- 添加监视器
hl.env(name, value)          -- 设置环境变量
hl.bind(keys, dispatcher, opts?) -- 绑定按键
hl.curve(name, spec)         -- 定义动画曲线
hl.animation(spec)           -- 定义动画
hl.gesture(spec)             -- 定义手势
hl.device(spec)              -- 配置输入设备
hl.window_rule(spec)         -- 窗口规则
hl.layer_rule(spec)          -- 图层规则
hl.workspace_rule(spec)      -- 工作区规则
hl.define_submap(name, fn)   -- 定义子映射
hl.on(event, callback)       -- 事件监听
hl.exec_cmd(cmd)             -- 执行命令

-- Dispatcher 命名空间
hl.dsp.exec_cmd(cmd)         -- exec
hl.dsp.exit()                -- 退出 Hyprland
hl.dsp.submap(name)          -- 切换子映射
hl.dsp.focus(spec)           -- 切换焦点/工作区
hl.dsp.window.close()        -- 关闭窗口
hl.dsp.window.fullscreen()   -- 全屏
hl.dsp.window.float(spec)    -- 浮动
hl.dsp.window.pseudo()       -- 伪平铺
hl.dsp.window.move(spec)     -- 移动窗口到工作区
hl.dsp.window.drag()         -- 鼠标拖动
hl.dsp.window.resize(spec?)  -- 鼠标调整大小
hl.dsp.window.cycle_next(dir?) -- 切换下一个窗口
hl.dsp.window.bring_to_top() -- 窗口置顶
hl.dsp.workspace.toggle_special(name) -- 特殊工作区
```

---

*写于 2026-08-07，基于 Hyprland v0.56.1*

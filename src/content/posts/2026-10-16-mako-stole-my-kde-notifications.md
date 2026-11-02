---
title: 找回被 mako 夺舍的 KDE 原生通知
date: 2026-10-16
category: 备忘
tags: [linux, kde, hyprland, dbus]
summary: KDE 和 Hyprland 共用一个用户，但 org.freedesktop.Notifications 这个 D-Bus 名字只能有一个主人。记录一次通知服务争夺战的排查过程、最终修法，以及两个容易踩的坑。
draft: true
---

:::note
本篇仍在AI稿版本，人工修正稿后续再补充。开始懒了真就许愿式配置Linux来了。
:::

我的机器上是 KDE Plasma 和 Hyprland 双桌面：Hyprland 里用 mako 当通知程序，KDE 里本来该用 Plasma 自带的。结果 KDE 会话里通知长成了 mako 的样子——系统设置里逐应用的通知配置点了没反应，勿扰开关也失效。想把它请回去，就得先搞明白 mako 到底是怎么混进 KDE 的。

## 先确认这个名字现在归谁

D-Bus 会话总线上，`org.freedesktop.Notifications` 是通知的唯一入口。哪个进程注册了这个名字，所有程序的通知就都发给它，没有共存一说。

```bash
busctl --user list | grep -w org.freedesktop.Notifications
```

```
org.freedesktop.Notifications    1882  mako    kuan    :1.75    user@1000.service
```

pid 1882，进程名 mako。实锤了，就是它。

## 一个 disabled 的单元为什么会跑起来

奇怪的地方在这里：我 autostart 里没有 mako，`~/.config/autostart/` 里也没有，但 `systemctl --user status mako.service` 显示

```
Loaded: loaded (/usr/lib/systemd/user/mako.service; disabled; preset: enabled)
Active: active (running) since Tue 2026-10-13 19:01:42 CST
```

`disabled`，却在登录那一秒被拉起来了。既然不是自启，那就是**被按需激活**的。答案在包里的这份文件，`/usr/share/dbus-1/services/fr.emersion.mako.service`：

```ini
[D-BUS Service]
Name=org.freedesktop.Notifications
Exec=/usr/bin/mako
SystemdService=mako.service
```

这相当于在总线上贴了一张招聘广告：谁来找 `org.freedesktop.Notifications`，只要当时没人持有，dbus 就照着广告把 mako 拉起来，并且直接接管这个单元。所以"从 autostart 里删掉 mako"这种操作是一点用都没有的。

## 真正的原因：同一个名字有两张广告，dbus 只认第一张

KDE 自己也贴了一张，`/usr/share/dbus-1/services/org.kde.plasma.Notifications.service`：

```ini
[D-BUS Service]
Name=org.freedesktop.Notifications
Exec=/usr/bin/plasma_waitforname org.freedesktop.Notifications
```

这条是 Plasma 的守卫：它不注册名字，只是等真正的设计者（plasmashell）来注册，防止桌面还没起来时通知被提前处理。问题在于 **dbus-broker 对同一个服务名只承认扫描顺序里第一个遇到的激活文件**，第二个直接判为重复丢弃。翻 `journalctl --user` 能看到它本人说的话：

```
dbus-broker-launch: Ignoring duplicate name 'org.freedesktop.Notifications' in service file '/usr/share//dbus-1/services/org.kde.plasma.Notifications.service'
```

`fr.emersion` 排在 `org.kde` 前面，所以每次都是 mako 赢，Plasma 的守卫形同虚设。注意这跟文件内容没有任何关系，纯粹是名字撞车之后的先后问题。

## 修法：把 KDE 那张广告挪到优先级更高的目录

会话级服务文件的搜索顺序是 `~/.local/share/dbus-1/services` → `/usr/local/share/dbus-1/services` → `/usr/share/dbus-1/services`，用户目录最先。于是在用户目录放一份指向 Plasma 自己的广告，让它在扫描顺序上抢在 mako 前面：

```bash
mkdir -p ~/.local/share/dbus-1/services
cat > ~/.local/share/dbus-1/services/org.kde.plasma.Notifications.service <<'EOF'
[D-BUS Service]
Name=org.freedesktop.Notifications
Exec=/usr/bin/plasma_waitforname org.freedesktop.Notifications
EOF
```

dbus-broker 盯着这些目录，写完会自动 reload，不用重启什么。日志立刻翻过来了：

```
Ignoring duplicate name 'org.freedesktop.Notifications' in service file '/usr/share//dbus-1/services/fr.emersion.mako.service'
Ignoring duplicate name 'org.freedesktop.Notifications' in service file '/usr/share//dbus-1/services/org.kde.plasma.Notifications.service'
```

两条 `/usr/share` 里的都被忽略，赢的是用户目录这一份。再 `systemctl --user stop mako.service` 收尾就行——单元本身是 `disabled` 的，广告被摘掉之后它没有任何途径再被拉起来。发一条通知验证，不会再复活。

Hyprland 那边完全不受影响：那边 mako 是 `exec-once = ... mako ...` 直接 exec 的进程，压根不经过 D-Bus 激活。所以"KDE 用 Plasma 的、Hyprland 用 mako"这个需求本来就不冲突，只需要在 KDE 里把第三方通知服务**按需激活**这条路堵掉。不卸载包、不用 sudo、重装 mako 也不会复活，这是我更喜欢这种改法的原因。

:::note
别用 `Hidden=true`。我第一版就是写的这个——在用户目录放一份同名文件，内容只有 `[D-BUS Service]` 加 `Hidden=true`。它确实成功屏蔽了 mako，但 dbus-broker 的重复名判定发生在 Hidden 判定之前，于是这个名字变成"可激活、但没有实现者"的状态。结果更难看：

```
Failed to show notification: 为 org.freedesktop.Notifications 调用 StartServiceByName 时出错：已到超时限制
```

`busctl --user list` 里那一行会一直挂着 `(activatable)` 却没人持有。屏蔽同名服务广告这种事，得用"顶替"而不是"抹掉"。
:::

## 还有一个坑：Plasma 不会重试注册

改完停掉 mako，KDE 里并没有马上恢复通知，是一片死寂。因为 Plasma 的通知服务宿主在 plasmashell 里（`libnotificationmanager.so` 映射在 plasmashell 进程空间内，不是 kded），而它登录时注册这个名字失败一次就放弃了，不会等名字空出来再抢。验证是哪个进程也很简单：

```bash
grep -o libnotificationmanager /proc/$(pgrep -x plasmashell)/maps | sort -u
```

所以要么 `systemctl --user restart plasma-plasmashell.service`（面板和桌面会消失再回来，几秒钟，应用窗口不受影响），要么注销重登。配置改动本身是持久的，重登一定生效。

## 顺手捡到一个自己埋的 bug

排查过程中日志一直在抱怨另一份文件：

```
Missing 'D-Bus Service' section in service file '/home/kuan/.local/share/dbus-1/services/org.freedesktop.secrets.service'
```

打开一看，第一行手滑多打了个等号：`=[D-BUS Service]`，整个文件被 dbus 忽略，`org.freedesktop.secrets` 变成不可按需激活。但更关键的是这份文件里 `Exec=/usr/bin/kwalletd6` 的目标本身就是错的——kwalletd6 并不注册 `org.freedesktop.secrets`，它只注册 `org.kde.kwalletd6`，而且自己还是 Secret Service 的客户端（链接了 libsecret）。总线上看一眼就知道谁在提供：

```
org.freedesktop.secrets    1270  ksecretd
org.kde.kwalletd6          1734  kwalletd6
```

真正干活的是 kwallet 包里的 `ksecretd`。Exec 改成它，报错消失。

## 能带走的东西

第一，遇到"某个后台服务莫名其妙抢了本该属于桌面的功能"，先别去翻 autostart 和 systemd enable，直接看 `/usr/share/dbus-1/services/` 和 `~/.local/share/dbus-1/services/` 里有没有人给同一个名字贴了两张广告，`journalctl --user | grep 'Ignoring duplicate'` 一眼就能看出是谁赢了。这套办法对 portal、StatusNotifier、secrets 之类的公共服务名一样适用。

第二，`systemctl --user status` 里同时出现 `disabled` 和 `active (running)`，基本就是被 D-Bus 激活的：单元里有 `Type=dbus` + `BusName=`，服务广告里有 `SystemdService=`，两个文件一搭就成型。

第三，双桌面用户（KDE + Hyprland/i3/Sway）最省心的分工是让桌面各自的图形栈完全独立，只把公共的 D-Bus 会话服务用"用户目录顶替"这一招点名交给其中一个桌面，另一个桌面里的守护进程用 exec-once 直接拉起。

现在的状态是 KDE 用回自己的通知栏，Hyprland 还是 mako。下一步打算在 Hyprland 里试试 SwayNotificationCenter——它包里同样带 `org.erikreider.swaync.service` 这张广告，所以这套顶替办法顺手也把它管住了，正好验证一下是不是通用解法。

---
layout: post
title: Golang-QA项目插件开发小记4-又是一波改
tags: code
---

好不容易拿redis stream整完了消息列队。然后一跑告诉我
```plaintext
panic: runtime error: invalid memory address or nil pointer dereference
[signal 0xc0000005 code=0x0 addr=0x8 pc=0xc0dd30]

goroutine 16 [running]:
QA-System/internal/pkg/redis.ConsumeFromStream({0x11ae668, 0x19df740}, {0x1008f9e?, 0x0?})
        D:/Projects/Go/src/QA-System/internal/pkg/redis/redis.go:85 +0xf0
QA-System/plugins.(*EmailNotifier).startStreamConsumer(0xc000366780)
        D:/Projects/Go/src/QA-System/plugins/email_notifier.go:83 +0x4a
created by QA-System/plugins.init.0 in goroutine 1
        D:/Projects/Go/src/QA-System/plugins/email_notifier.go:44 +0x96
exit status 2
```
哦，最终还是redis client初始化顺序的问题，还是得放到加载的时候就搞定

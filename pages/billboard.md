---
layout: page
title: BillBoard
tagline: Biu~
permalink: /billboard.html
---
<div style="text-align:center">:Nothing Here Yet...</div>
<p>留言板正在建设中，如果有想法可以联系我哦</p>
<p> BillBoard is under loosening construction. Please feel free to contact me if there are any ideas.</p><br>

### 每日一句
<div name="daily-sentence">
<p id="content_span">英文句子:D获取中...</p>
<p id="note_span">中文句子:D获取中...</p>
<script>
  // 页面加载完成后调用每日一句函数
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof fetchDailySentence === 'function') {
      fetchDailySentence();
    } else {
      console.error('fetchDailySentence function not found');
    }
  });
</script>
</div>

<!-- 引入JS文件 -->
<script src="{{ site.baseurl }}/assets/js/xsb2409.js"></script>

[返回主页]({{ site.url }})
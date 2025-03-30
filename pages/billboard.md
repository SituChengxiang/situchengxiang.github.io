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
</div>

<!-- 引入JS文件 -->
<script src="{{ site.baseurl }}/projects/electron-classpage/js/api.js"></script>
<script>
  // 创建一个fetchDailySentence函数
  function fetchDailySentence() {
    var script = document.createElement('script');
    script.src = 'https://open.iciba.com/dsapi/?callback=handleData';
    document.body.appendChild(script);
  }
  
  // 页面加载完成后调用
  document.addEventListener('DOMContentLoaded', function() {
    // 延迟一点执行，确保api.js已加载
    setTimeout(function() {
      fetchDailySentence();
    }, 500);
  });
</script>

[返回主页]({{ site.url }})
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
<div class="pfCustomCode" style="font-size: 18pt">
<p id="content_span">英文句子:D获取中...</p>
<p id="note_span">中文句子:D获取中...</p>
<script>//友情提示这玩意需要加载jQuery，因为金山词霸返回的这玩意是跨域访问得到的，native需要jsonp或者fetchAPI顶级用法
            //2024年1月更新，已接近支持原生运行了，采用了一点浏览器特性 ，使用fetchAP搞定了
            (function () {
              var script = document.createElement('script');
              script.src = 'https://open.iciba.com/dsapi/?callback=handleData';
              document.body.appendChild(script);
            })();
            function handleData(data) {
              console.log(data);
              if (typeof data !== "undefined" && typeof data.content === "string") {
                document.getElementById("content_span").innerHTML = data.content;
              }
              if (typeof data !== "undefined" && typeof data.note === "string") {
                document.getElementById("note_span").innerHTML = data.note;
              }
            }
</script>
</div>

[返回主页]({{ site.url }})
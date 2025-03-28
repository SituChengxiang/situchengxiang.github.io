// 倒计时功能
function initCountdown() {
  // 获取元素
  var days = document.querySelector(".days");
  var hour = document.querySelector(".hour");
  var minute = document.querySelector(".minute");
  var second = document.querySelector(".second");
  var timertitle = document.querySelector(".timertitle");
  
  // 获取截止时间的时间戳（单位毫秒）
  var shoukao = +new Date("2024-1-6 00:00:00");
  var gaokao = +new Date("2024-6-7 00:00:00");

  // 首次调用，避免延迟
  countDown();
  
  // 定时器，每秒更新一次
  setInterval(countDown, 1000);
  
  function countDown() {
    // 获取当前时间戳
    var nowTime = +new Date();
    // 计算剩余时间（秒）
    var times = (shoukao - nowTime) / 1000;
    var timesg = (gaokao - nowTime) / 1000;
    
    if (times > 0) {
      // 计算首考倒计时
      var d = parseInt(times / 86400);
      days.innerHTML = d;
      
      var h = parseInt(times / 60 / 60 % 24);
      hour.innerHTML = h < 10 ? "0" + h : h;
      
      var m = parseInt(times / 60 % 60);
      minute.innerHTML = m < 10 ? "0" + m : m;
      
      var s = parseInt(times % 60);
      second.innerHTML = s < 10 ? "0" + s : s;
    } else if (times + 259200 >= 0) {
      // 首考时鼓励语
      timer.innerHTML = "乘风破浪，雄鹰展翅，首考加油！";
    } else {
      if (timesg > 0) {
        // 切换到高考倒计时
        timertitle.innerHTML = "距离 2024 年 6 月 7 日高考还有：";
        
        var d = parseInt(timesg / 86400);
        days.innerHTML = d;
        
        var h = parseInt(timesg / 60 / 60 % 24);
        hour.innerHTML = h < 10 ? "0" + h : h;
        
        var m = parseInt(timesg / 60 % 60);
        minute.innerHTML = m < 10 ? "0" + m : m;
        
        var s = parseInt(timesg % 60);
        second.innerHTML = s < 10 ? "0" + s : s;
      } else if (timesg + 345600 >= 0) {
        // 高考时鼓励语
        timer.innerHTML = "不负 12 载的光辉，不负 3 年的青春，同志们高考加油！";
      } else {
        // 高考后祝福语
        timer.innerHTML = "那份乘风破浪的过往，终将踏成前行路途熠熠之光。祝大家前路浩荡，青春不散场！";
      }
    }
  }
}

// Bing每日一图介绍获取
function fetchBingIntroduction() {
  fetch('https://fly.atlinker.cn/api/bing/cn.php?q=copyright')
    .then(response => response.text())
    .then(data => {
      const introduce = document.querySelector('#introduce');
      introduce.innerText = '今天的 Bing 每日一图：' + data;
    })
    .catch(console.error);
}

// 金山词霸每日一句
function fetchDailySentence() {
  (function() {
    var script = document.createElement('script');
    script.src = 'https://open.iciba.com/dsapi/?callback=handleData';
    document.body.appendChild(script);
  })();
}

// 处理金山词霸的回调数据
function handleData(data) {
  console.log(data);
  if (typeof data !== "undefined" && typeof data.content === "string") {
    document.getElementById("content_span").innerHTML = data.content;
  }
  if (typeof data !== "undefined" && typeof data.note === "string") {
    document.getElementById("note_span").innerHTML = data.note;
  }
}

// 生日检查功能
function checkBirthdays() {
  // 同学名单和生日
  var names = ['陈俊义', '陈星宇', '陈泽玮', '陈作亚', '单梓航', '丁意伦', '董晨烨', '傅天祈', '胡俊洋', '胡峻浩', '贾安迪', '姜仁杰', '蒋京', '李响', '林洁', '刘宇杰', '刘浙楠', '柳岷昊', '毛毅涛', '阮俊翔', '沈宽、徐睿', '时习之', '孙嘉玥', '王宇轩', '吴明锐', '徐浩', '徐翊博', '张顾宇晨', '朱怡帆'];
  var birthdays = ['09.25', '12.21', '10.14', '11.19', '08.20', '04.26', '06.09', '12.02', '03.02', '01.28', '12.22', '01.08', '01.23', '03.11', '05.28', '08.11', '04.29', '10.06', '05.18', '09.24', '01.17', '01.11', '06.10', '06.03', '07.17', '10.27', '11.09', '10.29', '10.01'];
  
  // 获取当前日期
  var results = "", flag = false;
  
  for (var i = 0; i < names.length; i++) {
    var dt = "";
    if (new Date().getMonth() > 8) dt = (new Date().getMonth() + 1) + ".";
    else dt = "0" + (new Date().getMonth() + 1) + ".";
    
    if (new Date().getDate() > 9) dt = dt + new Date().getDate();
    else dt = dt + "0" + new Date().getDate();
    
    if (birthdays[i] == dt) {
      results = results + names[i] + ",";
      flag = true;
    }
  }
  
  if (flag) {
    results = results.substring(0, results.length - 1) + " " + "生日快乐🎂🎂！！！";
  } else {
    results = "今天班里没人生日呐";
  }
  
  document.getElementById("birthday-div").innerHTML = (results);
}

// 天气API请求函数
function requestGet(url, callback, id, gen) {
  var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      callback(id, request.responseText, gen);
    }
  };
  request.open('GET', url);
  request.send();
}

function requestPost(url, callback, params, id) {
  var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      callback(request.responseText, id);
    }
  };
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  request.send(params);
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化倒计时
  initCountdown();
  
  // 获取Bing每日一图介绍
  fetchBingIntroduction();
  
  // 获取每日一句
  fetchDailySentence();
  
  // 检查生日
  checkBirthdays();
  
  // 初始化天气组件
  if (document.getElementById('ww_af398e243dd9a')) {
    updateWidget('ww_af398e243dd9a', 0);
  }
});

// 天气组件其他函数
function getDataFromApi(id, i, gen) {
  var v = document.getElementById(id).getAttribute("v");
  var a = document.getElementById(id).getAttribute("a");
  var l = document.getElementById(id).getAttribute("loc");
  var u = document.getElementById(id + '_u').getAttribute("href") + '|||' + document.getElementById(id + '_u').innerHTML;
  
  if (gen == 1) {
    var ub = '';
  } else {
    var ub = document.getElementById(id).innerHTML;
  }
  
  var params = 'v=' + v + '&a=' + a + '&l=' + l + '&u=' + u + '&ub=' + ub + '&i=' + i + '&g=' + gen + '&id=' + id;
  requestPost('https://app2.weatherwidget.org/data/', updateOnPage, params, id);
}

function collectData(id, gen) {
  if (document.getElementById(id).getAttribute("loc") === 'auto') {
    requestGet('https://ip.weatherwidget.org/', getDataFromApi, id, gen);
  } else {
    getDataFromApi(id, false, gen);
  }
}

function updateOnPage(data, id) {
  if (typeof JSON.parse === "undefined") {
    data = JSON.decode(data);
  } else {
    data = JSON.parse(data);
  }
  
  if (data.hasOwnProperty("a")) {
    if (data.a.hasOwnProperty("html")) {
      document.getElementById(id).innerHTML = data.a.html;
    }
    if (data.a.hasOwnProperty("style")) {
      document.getElementById(id).style.cssText = data.a.style;
    }
    if (data.a.hasOwnProperty("jsCode")) {
      var script = document.createElement('script');
      script.type = "text/javascript";
      script.async = false;
      script.text = data.a.jsCode;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
    if (data.a.hasOwnProperty("ub")) {
      document.getElementById(id + '_info_box_inner').innerHTML = data.a.ub;
      updateInfobox(id, data.a.ub);
      loadingToggle(id, 2);
    }
  } else if (data.hasOwnProperty("error_code")) {
    document.getElementById(id).innerHTML = '';
    console.log('weatherwidget.org / Error: ' + data.error_msg + ' (Error code ' + data.error_code + ')');
  }
}

function updateWidget(id, gen) {
  if (gen === 1) {
    loadingToggle(id, 1);
  }
  collectData(id, gen);
}

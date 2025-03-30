// 加载必应图片介绍
function loadBingIntroduce() {
  fetch('https://fly.atlinker.cn/api/bing/cn.php?q=copyright')
    .then(response => response.text())
    .then(data => {
      const introduce = document.querySelector('#introduce');
      introduce.innerText = '今天的 Bing 每日一图：' + data
    })
    .catch(console.error);
}

// 金山词霸每日一句
function handleData(data) {
  console.log(data);
  if (typeof data !== "undefined" && typeof data.content === "string") {
    document.getElementById("content_span").innerHTML = data.content;
  }
  if (typeof data !== "undefined" && typeof data.note === "string") {
    document.getElementById("note_span").innerHTML = data.note;
  }
}

// 生日列表
function loadBirthdays() {
  //声明数组储存同学们的生日和日期
  var names = ['Mike', 'Boppy', 'Carter', 'Bruce', 'Sam', 'Chris', 'Adam', 'Frank', 'Kevin', 'Lucifer', 'Andy', 'Justin', 'John', 'Lan', 'Colin', 'Gino', 'Sabber', 'Tim', 'Steve', 'Alan', 'Jeb, Ray', 'Max', 'Glock', 'Tom', 'Shaper', 'Hawk', 'Yage', 'Grant', 'Truman'];
  var birthdays = ['09.25', '12.21', '10.14', '11.19', '08.20', '04.26', '06.09', '12.02', '03.02', '01.28', '12.22', '01.08', '01.23', '03.11', '05.28', '08.11', '04.29', '10.06', '05.18', '09.24', '01.17', '01.11', '06.10', '06.03', '07.17', '10.27', '11.09', '10.29', '10.01']
  // 获取当前日期和月份
  var results = "",
      flag = false;
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

// 初始化页面
window.onload = function() {
  loadBingIntroduce();
  loadBirthdays();
  
  // 加载金山词霸API
  (function () {
    var script = document.createElement('script');
    script.src = 'https://open.iciba.com/dsapi/?callback=handleData';
    document.body.appendChild(script);
  })();
};

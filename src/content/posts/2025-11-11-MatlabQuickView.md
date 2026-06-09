---
title: 我校Matlab速通（语法部分）
tags: [Course, Numerical Methods]
category: 科学计算
date: 2026-02-10
summary: 一篇面向课程作业与数值计算入门的 Matlab 基础语法速查，从变量、矩阵到函数与绘图。
---

对于应用物理专业的同学，如果是杨y老师上课，大概不会考得很难。

## 1. 变量与基本类型

Matlab 默认数值类型是 `double`。

```matlab
a = 3;          % 标量
b = 2.5;
name = "Matlab"; % string（新语法）
ch = 'A';       % char
flag = true;    % logical
```

查看变量信息：

```matlab
whos
class(a)
size(a)
```

常用约定：

- 语句后加 `;` 可以抑制输出。
- `%` 是单行注释。
- 使用 `clear` 清空变量、`clc` （**cl**ean **c**ommand）清屏。

## 2. 向量、矩阵与索引（重中之重）

Matlab 是“矩阵优先”语言。

```matlab
v = [1, 2, 3, 4];        % 行向量
u = [1; 2; 3; 4];        % 列向量
A = [1 2 3; 4 5 6];      % 2x3 矩阵
```

### 2.1 索引规则

Matlab **从 1 开始索引**：

```matlab
A(1, 2)      % 第1行第2列
A(:, 1)      % 第1列全部
A(2, :)      % 第2行全部
A(end, end)  % 最后一个元素
```

### 2.2 切片与步长

```matlab
x = 1:10;        % 1 到 10，步长默认 1
y = 0:0.5:2;     % 0 到 2，步长 0.5
z = linspace(0, 1, 6); % [0, 0.2, ..., 1]
```

### 2.3 元素运算 vs 矩阵运算


```matlab
A = [1 2; 3 4];
B = [5 6; 7 8];

C1 = A * B;    % 矩阵乘法
C2 = A .* B;   % 对应元素乘法
C3 = A ^ 2;    % 矩阵幂
C4 = A .^ 2;   % 每个元素平方
```

**涉及“逐元素”，通常都要加点 `.`。**

## 3. 常用流程控制

### 3.1 条件语句

```matlab
score = 87;

if score >= 90
	level = "A";
elseif score >= 80
	level = "B";
else
	level = "C";
end
```

### 3.2 for / while

```matlab
sumVal = 0;
for i = 1:100
	sumVal = sumVal + i;
end

n = 1;
while n < 100
	n = n * 2;
end
```

## 4. 脚本与函数

### 4.1 脚本（.m文件）

脚本文件直接在工作区执行，共享基础变量，适合实验与流程串联。

```matlab
% 文件: run_demo.m
clear; clc;
x = 0:0.1:2*pi;
y = sin(x);
plot(x, y);
title('sin(x)');
```

### 4.2 函数（Function）

函数更适合复用与封装（经常鞋码的同学们都知道）。课程设计里头，尽量还是用函数。

```matlab
% 文件: add_and_mul.m
function [s, p] = add_and_mul(a, b)
	s = a + b;
	p = a * b;
end
```

调用：

```matlab
[s, p] = add_and_mul(3, 4);
```

## 5. 常用内置函数

```matlab
length(v)      % 向量长度
size(A)        % 矩阵维度
sum(v)         % 求和
mean(v)        % 均值
max(v)         % 最大值
min(v)         % 最小值
sort(v)        % 排序
```

随机与线代常用：

```matlab
r = rand(3, 3);    % 3x3 [0,1) 随机矩阵
I = eye(4);        % 4x4 单位矩阵
Z = zeros(2, 5);   % 全零矩阵
O = ones(2, 5);    % 全一矩阵
```

## 6. 绘图基础（作业展示很加分）

```matlab
x = linspace(0, 2*pi, 200);
y1 = sin(x);
y2 = cos(x);

plot(x, y1, 'b-', 'LineWidth', 1.5); hold on;
plot(x, y2, 'r--', 'LineWidth', 1.5);
grid on;
xlabel('x');
ylabel('y');
title('sin(x) 与 cos(x)');
legend('sin', 'cos');
hold off;
```

## 7. 文件读写

```matlab
M = magic(4);
writematrix(M, 'demo.csv');

N = readmatrix('demo.csv');
disp(N);
```

如果是旧版本 Matlab，没有 `readmatrix/writematrix` 时可用 `csvread/csvwrite`（已逐步不推荐）。

## 8. 新手高频踩坑

1. **把矩阵乘法写成逐元素乘法，或者反过来。**
2. **忘记索引从 1 开始。**
3. **向量维度不匹配（行向量/列向量混用）。**
4. **缺少分号导致命令行刷屏，程序变慢。**
5. **脚本里变量名覆盖了内置函数名**（比如把 `sum` 当变量名）。

## 9. 一个最小可用示例

```matlab
% 1) 构造数据
x = 0:0.01:2*pi;
y = sin(x) + 0.1*randn(size(x));

% 2) 简单处理
y_mean = mean(y);
y_std = std(y);
y_norm = (y - y_mean) / y_std;

% 3) 可视化
subplot(2,1,1);
plot(x, y); grid on; title('原始信号');

subplot(2,1,2);
plot(x, y_norm); grid on; title('标准化后信号');
```

祝大家考试顺利。
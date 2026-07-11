---
title: 一些基本的数值方法和实现方式
tags: [Course, Numerical Methods]
category: 科学计算
date: 2026-02-10
---

![数值计算](https://cdn.pixabay.com/photo/2015/11/15/07/47/geometry-1044090_1280.jpg)

## 1. 基本概念

### 误差分析

数值计算中误差来源主要有三类：

- **模型误差**：数学模型对物理现象的近似
- **截断误差**：算法截断无穷级数或迭代过程产生的误差（如 Taylor 展开取有限项）
- **舍入误差**：计算机有限字长表示实数产生的误差

**绝对误差**：$E_a = |x^* - x|$，其中 $x^*$ 为近似值，$x$ 为真值。

**相对误差**：$E_r = \frac{|x^* - x|}{|x|}$（$x \neq 0$）。

### 有效数字

若近似值 $x^*$ 的绝对误差不超过某一位的半个单位，则从该位到第一个非零数字共有 $n$ 位有效数字。

经验法则：**避免两个相近数相减**（会导致有效数字大量丢失），**避免绝对值很小的数作除数**。

### 算法复杂度

- **时间复杂度**：完成计算所需的基本运算次数，用大 $O$ 记号表示
- **空间复杂度**：所需的存储量

计算量是选择算法的核心考量——解 $n$ 阶线性方程组，直接法约 $O(n^3)$，迭代法通常每步 $O(n^2)$。

---

## 2. 非线性方程求根

### 迭代法的基本思想

将 $f(x) = 0$ 改写为等价形式 $x = \varphi(x)$，由初值 $x_0$ 出发按 $x_{k+1} = \varphi(x_k)$ 迭代。

**收敛条件**：若在根 $\alpha$ 的邻域内有 $|\varphi'(x)| \leq L < 1$，则迭代收敛。

**收敛阶**：设 $\lim_{k \to \infty} x_k = \alpha$，若存在 $p \geq 1$ 和常数 $C > 0$ 使得

$$
\lim_{k \to \infty} \frac{|x_{k+1} - \alpha|}{|x_k - \alpha|^p} = C
$$

则称序列具有 $p$ 阶收敛。$p = 1$ 为线性收敛，$p = 2$ 为二次收敛。

### 二分法

**原理**：若 $f(a)f(b) < 0$，则 $(a,b)$ 内必有根。每次对分区间，保留异号子区间。

```matlab
function [c, iter] = bisection(f, a, b, tol, max_iter)
    iter = 0;
    while (b - a) / 2 > tol && iter < max_iter
        c = (a + b) / 2;
        if f(c) == 0
            break;
        elseif f(a) * f(c) < 0
            b = c;
        else
            a = c;
        end
        iter = iter + 1;
    end
    c = (a + b) / 2;
end
```

**特点**：无条件收敛（只要函数连续且端点异号），线性收敛，每步精度提高一倍。

### 牛顿迭代法

**推导**：在 $x_k$ 处一阶 Taylor 展开 $f(x) \approx f(x_k) + f'(x_k)(x - x_k)$，令其为零得

$$
x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}
$$

**收敛阶**：一般情况下二阶收敛（$p = 2$）。重根时退化为一阶。

```matlab
function [x, iter] = newton(f, df, x0, tol, max_iter)
    x = x0;
    for iter = 1:max_iter
        fx = f(x);
        if abs(fx) < tol
            return;
        end
        x_new = x - fx / df(x);
        if abs(x_new - x) < tol
            x = x_new;
            return;
        end
        x = x_new;
    end
end
```

**初始值敏感性**：当初值远离根时可能发散。可通过先做几步二分法寻找合适的初值。

### 弦截法

**推导**：用差商替代导数，过 $(x_{k-1}, f(x_{k-1}))$ 和 $(x_k, f(x_k))$ 作割线：

$$
x_{k+1} = x_k - f(x_k) \frac{x_k - x_{k-1}}{f(x_k) - f(x_{k-1})}
$$

**收敛阶**：超线性收敛，$p = \frac{1+\sqrt{5}}{2} \approx 1.618$，无需计算导数。

```matlab
function [x, iter] = secant(f, x0, x1, tol, max_iter)
    for iter = 1:max_iter
        f0 = f(x0); f1 = f(x1);
        x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        if abs(x2 - x1) < tol
            x = x2;
            return;
        end
        x0 = x1; x1 = x2;
    end
    x = x2;
end
```

---

## 3. 线性方程组数值求解

### 直接法

#### 高斯消元法

将方程组 $Ax = b$ 通过初等行变换化为上三角形式 $Ux = \tilde{b}$，然后回代求解。

**列主元高斯消元**：每步消元前选取当前列绝对值最大元素作为主元，交换行以避免除以小主元造成的误差放大。

```matlab
function x = gauss_pivot(A, b)
    n = length(b);
    Aug = [A, b];
    for k = 1:n-1
        [~, p] = max(abs(Aug(k:n, k)));
        p = p + k - 1;
        if p ~= k
            Aug([k, p], :) = Aug([p, k], :);
        end
        for i = k+1:n
            m = Aug(i, k) / Aug(k, k);
            Aug(i, k:n+1) = Aug(i, k:n+1) - m * Aug(k, k:n+1);
        end
    end
    x = zeros(n, 1);
    x(n) = Aug(n, n+1) / Aug(n, n);
    for i = n-1:-1:1
        x(i) = (Aug(i, n+1) - Aug(i, i+1:n) * x(i+1:n)) / Aug(i, i);
    end
end
```

#### LU 分解

将 $A$ 分解为下三角矩阵 $L$ 和上三角矩阵 $U$，满足 $A = LU$。解方程分两步：

1. 前代：$Ly = b$
2. 回代：$Ux = y$

**Doolittle 分解**：$L$ 对角元为 1。对 $k = 1, \dots, n$：

```matlab
function [L, U] = lu_doolittle(A)
    n = size(A, 1);
    L = eye(n);
    U = zeros(n);
    for k = 1:n
        U(k, k:n) = A(k, k:n) - L(k, 1:k-1) * U(1:k-1, k:n);
        for i = k+1:n
            L(i, k) = (A(i, k) - L(i, 1:k-1) * U(1:k-1, k)) / U(k, k);
        end
    end
end
```

**计算量**：解 $n$ 阶方程组约需 $\frac{2}{3}n^3$ 次浮点运算。

### 迭代法

将 $Ax = b$ 分裂为 $A = D - L - U$（$D$ 为对角阵，$-L$ 为严格下三角，$-U$ 为严格上三角）。

#### Jacobi 迭代

$$
x^{(k+1)} = D^{-1}(L + U)x^{(k)} + D^{-1}b
$$

分量形式：$x_i^{(k+1)} = \frac{1}{a_{ii}}(b_i - \sum_{j \neq i} a_{ij} x_j^{(k)})$

```matlab
function [x, iter] = jacobi(A, b, x0, tol, max_iter)
    n = length(b);
    x = x0;
    for iter = 1:max_iter
        x_new = zeros(n, 1);
        for i = 1:n
            sigma = A(i, 1:i-1) * x(1:i-1) + A(i, i+1:n) * x(i+1:n);
            x_new(i) = (b(i) - sigma) / A(i, i);
        end
        if norm(x_new - x, Inf) < tol
            x = x_new;
            return;
        end
        x = x_new;
    end
end
```

#### Gauss-Seidel 迭代

**核心改进**：用最新计算值替代旧值：

$$
x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j < i} a_{ij} x_j^{(k+1)} - \sum_{j > i} a_{ij} x_j^{(k)}\right)
$$

矩阵形式：$x^{(k+1)} = (D - L)^{-1} U x^{(k)} + (D - L)^{-1} b$

比 Jacobi 法收敛更快（通常快一倍），且节约存储。

### 收敛条件

令迭代矩阵 $B = I - M^{-1}A$，迭代 $x^{(k+1)} = Bx^{(k)} + f$ 收敛的充要条件是：

- **谱半径** $\rho(B) < 1$
- 充分条件：$\|B\| < 1$（常用 $\|\cdot\|_\infty$、$\|\cdot\|_2$ 范数）

**保证收敛的情形**：
- $A$ 严格对角占优（$\forall i, |a_{ii}| > \sum_{j \neq i} |a_{ij}|$）⇒ Jacobi 和 GS 均收敛
- $A$ 对称正定 ⇒ Gauss-Seidel 收敛
- $A$ 为不可约弱对角占优 ⇒ Jacobi 和 GS 均收敛

### 两类方法的比较

| 特性 | 直接法 | 迭代法 |
|------|--------|--------|
| 计算量 | $O(n^3)$ | 每步 $O(n^2)$ |
| 适用规模 | 中小型 ($n \lesssim 10^4$) | 大型稀疏方程组 |
| 精度 | 高（受舍入误差影响） | 取决于迭代次数 |
| 存储 | 需存整个矩阵 | 可矩阵-向量乘 |

---

## 4. 函数逼近、插值与拟合

### 最小二乘曲线拟合

**问题**：给定数据点 $(x_i, y_i)_{i=1}^m$，求函数 $f(x) = \sum_{j=1}^n c_j \phi_j(x)$ 极小化残差平方和：

$$
\min_{c} \sum_{i=1}^m \left(y_i - \sum_{j=1}^n c_j \phi_j(x_i)\right)^2
$$

**正规方程**：令 $A_{ij} = \phi_j(x_i)$，则 $A^T A c = A^T y$。

**多项式最小二乘**：取 $\phi_j(x) = x^{j-1}$。

```matlab
function c = poly_lsq(x, y, deg)
    m = length(x);
    A = zeros(m, deg + 1);
    for j = 0:deg
        A(:, j+1) = x.^j;
    end
    c = (A' * A) \ (A' * y);
end
```

**Runge 现象**：高次多项式插值在等距节点下会在区间端点附近产生剧烈振荡。**解决方案**：
- 采用分段低次插值（样条）
- 使用 Chebyshev 节点而不使用等距节点

### 插值

#### Lagrange 插值

给定 $n+1$ 个互异节点 $(x_i, y_i)$，Lagrange 插值多项式：

$$
P_n(x) = \sum_{k=0}^n y_k L_k(x), \quad L_k(x) = \prod_{j \neq k} \frac{x - x_j}{x_k - x_j}
$$

**误差估计**：$f(x) - P_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}\prod_{k=0}^n (x - x_k)$，$\xi$ 在节点之间。

#### Newton 插值

**差商**递推定义：
- 零阶：$f[x_k] = f(x_k)$
- $k$ 阶：$f[x_i, \dots, x_{i+k}] = \frac{f[x_{i+1}, \dots, x_{i+k}] - f[x_i, \dots, x_{i+k-1}]}{x_{i+k} - x_i}$

Newton 插值多项式：
$$
N_n(x) = f[x_0] + f[x_0,x_1](x-x_0) + f[x_0,x_1,x_2](x-x_0)(x-x_1) + \cdots
$$

**优点**：新增节点时只需增加一项，无需全部重算。

```matlab
function c = newton_coeff(x, y)
    n = length(x);
    T = zeros(n, n);
    T(:, 1) = y(:);
    for j = 2:n
        for i = j:n
            T(i, j) = (T(i, j-1) - T(i-1, j-1)) / (x(i) - x(i-j+1));
        end
    end
    c = diag(T);
end
```

#### 三次样条插值

在每段 $[x_i, x_{i+1}]$ 上用三次多项式拼接，要求：
- 节点处函数值连续
- 一阶导数连续
- 二阶导数连续

自然边界条件 $S''(x_0) = S''(x_n) = 0$ 可唯一确定。

MATLAB 内置 `spline(x, y, xq)` 可直接调用。

---

## 5. 数值积分与数值微分

### 数值积分（Newton-Cotes 公式）

**代数精度**：若求积公式对所有次数 $\leq m$ 的多项式精确成立，而对 $m+1$ 次多项式不精确，则具有 $m$ 次代数精度。

#### 梯形公式

在 $[a,b]$ 上用一次 Lagrange 插值：

$$
\int_a^b f(x)\,dx \approx \frac{b-a}{2}[f(a) + f(b)]
$$

代数精度 1。误差：$-\frac{(b-a)^3}{12}f''(\xi)$。

#### Simpson 公式

用二次插值（三个等距节点）：

$$
\int_a^b f(x)\,dx \approx \frac{b-a}{6}\left[f(a) + 4f\!\left(\frac{a+b}{2}\right) + f(b)\right]
$$

代数精度 3。误差：$-\frac{(b-a)^5}{2880}f^{(4)}(\xi)$。

#### 复合公式

将 $[a,b]$ 等分为 $n$ 段（$h = \frac{b-a}{n}$）：

**复合梯形**：
$$
T_n = \frac{h}{2}\left[f(a) + f(b) + 2\sum_{i=1}^{n-1} f(x_i)\right]
$$
误差 $O(h^2)$。

**复合 Simpson**：
$$
S_n = \frac{h}{3}\left[f(a) + f(b) + 4\sum_{\text{奇数}} f(x_i) + 2\sum_{\text{偶数}} f(x_i)\right]
$$
误差 $O(h^4)$，需 $n$ 为偶数。

```matlab
function I = composite_simpson(f, a, b, n)
    if mod(n, 2) ~= 0
        n = n + 1;
    end
    h = (b - a) / n;
    x = a:h:b;
    y = f(x);
    I = h/3 * (y(1) + y(end) + ...
               4 * sum(y(2:2:end-1)) + ...
               2 * sum(y(3:2:end-2)));
end
```

### 数值微分

#### 有限差分公式

**两点公式**：
- 前向差分：$f'(x) \approx \frac{f(x+h) - f(x)}{h}$，截断误差 $O(h)$
- 后向差分：$f'(x) \approx \frac{f(x) - f(x-h)}{h}$，截断误差 $O(h)$
- 中点差分：$f'(x) \approx \frac{f(x+h) - f(x-h)}{2h}$，截断误差 $O(h^2)$

**三点公式**：
- 端点公式：$f'(x_0) \approx \frac{-3f(x_0) + 4f(x_1) - f(x_2)}{2h}$，$O(h^2)$
- 中点公式：$f'(x_1) \approx \frac{f(x_2) - f(x_0)}{2h}$，$O(h^2)$

**五点中点公式**（更高精度）：
$$
f'(x) \approx \frac{f(x-2h) - 8f(x-h) + 8f(x+h) - f(x+2h)}{12h},\quad O(h^4)
$$

#### 基于插值多项式的求导

对 Lagrange 或 Newton 插值多项式直接求导即得数值微分公式，误差源于插值余项的导数项。

---

## 6. 常微分方程初值问题

### 问题的提法

求初值问题 $\begin{cases} y' = f(t,y) \\ y(t_0) = y_0 \end{cases}$ 的数值解。

**显式单步法**的一般形式：$y_{n+1} = y_n + h \Phi(t_n, y_n, h)$。

### 欧拉法

向前欧拉（一阶显式）：

$$
y_{n+1} = y_n + h f(t_n, y_n)
$$

局部截断误差 $O(h^2)$，全局误差 $O(h)$。

```matlab
function [t, y] = euler(f, tspan, y0, h)
    t = tspan(1):h:tspan(2);
    y = zeros(length(t), length(y0));
    y(1, :) = y0(:)';
    for i = 1:length(t)-1
        y(i+1, :) = y(i, :) + h * f(t(i), y(i, :))';
    end
end
```

### 改进欧拉法（Heun 方法，二阶）

$$
\begin{aligned}
k_1 &= f(t_n, y_n) \\
k_2 &= f(t_n + h, y_n + h k_1) \\
y_{n+1} &= y_n + \frac{h}{2}(k_1 + k_2)
\end{aligned}
$$

局部截断误差 $O(h^3)$，全局误差 $O(h^2)$。

### 二阶 Runge-Kutta 方法

改进欧拉法是 RK2 的特例。一般形式：
$$
y_{n+1} = y_n + h\left[(1-\alpha) f_n + \alpha f(t_n + \tfrac{h}{2\alpha}, y_n + \tfrac{h}{2\alpha} f_n)\right]
$$

取 $\alpha = \frac{1}{2}$ 即改进欧拉法；取 $\alpha = 1$ 得中点法。

```matlab
function [t, y] = rk2(f, tspan, y0, h)
    t = tspan(1):h:tspan(2);
    n = length(t);
    y = zeros(n, length(y0));
    y(1, :) = y0(:)';
    for i = 1:n-1
        k1 = f(t(i), y(i, :))';
        k2 = f(t(i) + h, y(i, :) + h * k1)';
        y(i+1, :) = y(i, :) + h/2 * (k1 + k2);
    end
end
```

### 四阶 Runge-Kutta（经典 RK4）

$$
\begin{aligned}
k_1 &= f(t_n, y_n) \\
k_2 &= f(t_n + \tfrac{h}{2}, y_n + \tfrac{h}{2} k_1) \\
k_3 &= f(t_n + \tfrac{h}{2}, y_n + \tfrac{h}{2} k_2) \\
k_4 &= f(t_n + h, y_n + h k_3) \\
y_{n+1} &= y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)
\end{aligned}
$$

全局误差 $O(h^4)$，是最广泛使用的高精度显式方法。

### 隐式方法与显式方法的区别

- **显式方法**（如 Euler、RK4）：$y_{n+1}$ 可直接由已知值算出，计算简单，但稳定性受限于步长
- **隐式方法**（如向后 Euler）：$y_{n+1} = y_n + h f(t_{n+1}, y_{n+1})$，需每步解方程，但稳定性更好（A-稳定性）

### 高阶方程降阶

$m$ 阶方程 $y^{(m)} = f(t, y, y', \dots, y^{(m-1)})$ 可通过引入 $z_1 = y, z_2 = y', \dots$ 化为等价一阶方程组：

$$
\begin{pmatrix} z_1' \\ z_2' \\ \vdots \\ z_m' \end{pmatrix} =
\begin{pmatrix} z_2 \\ z_3 \\ \vdots \\ f(t, z_1, \dots, z_m) \end{pmatrix}
$$

### 稳定性

- **绝对稳定性**：考察试验方程 $y' = \lambda y$（$\lambda < 0$），若数值解随 $n$ 增大而衰减则方法绝对稳定
- **A-稳定性**：方法的绝对稳定域包含整个左半平面
- 显式方法通常有步长限制（如 Euler：$|1 + h\lambda| < 1$）；隐式方法无条件稳定

### 局部截断误差与全局误差

- **局部截断误差** $T_{n+1}$：假设之前各步精确，单步产生的误差
- **全局误差** $e_n = y(t_n) - y_n$：实际解与数值解的差异
- 对于 $p$ 阶方法：$T_{n+1} = O(h^{p+1})$，$e_n = O(h^p)$

---

## 参考

- Mark Newman, *Computational Physics*
- Richard L. Burden & J. Douglas Faires, *Numerical Analysis*
- 各节 MATLAB 代码参考了上述教材，做了适合课程作业的简化。

本文代码适合在数值方法课程作业中直接使用，建议在理解原理后进行适当修改以适配具体问题。

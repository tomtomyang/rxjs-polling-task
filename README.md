# 简单 RxJS 轮询任务管理器

基于 RxJS 响应式编程思想实现的轮询任务管理解决方案

## RxJS 响应式编程理念

### 什么是响应式编程？

响应式编程是一种**面向数据流和变化传播**的编程范式。在这种范式中，程序的执行是由**数据流的变化**来驱动的，而不是传统的命令式调用。

```typescript
// 传统的命令式编程
function pollTaskStatus(taskId) {
  let status = null;

  while (status !== "completed") {
    status = await queryAPI(taskId);
    if (status === "failed") throw new Error("Task failed");
    await sleep(1000);
  }

  return status;
}

// RxJS 响应式编程
const taskStatus$ = timer(0, 1000).pipe(
  concatMap(() => from(queryAPI(taskId))),
  takeWhile((status) => status !== "completed", true)
);
```

### RxJS 的核心思想：一切皆流

在 RxJS 中，**所有的异步操作都被抽象为 Observable 流**：

- 🌊 **HTTP 请求** → Observable 流
- ⏰ **定时器** → Observable 流
- 🎯 **用户事件** → Observable 流
- 📡 **轮询操作** → Observable 流

这种统一的抽象让我们可以用**相同的操作符**来处理不同类型的异步操作。

## 核心 RxJS 操作符

### 创建操作符

```typescript
from(promise); // 将 Promise 转为 Observable
timer(delay, period); // 创建定时器流
of(value); // 发射静态值
throwError(error); // 发射错误
```

### 转换操作符

```typescript
map(fn); // 转换每个发射的值
switchMap(fn); // 切换到新的 Observable，取消之前的
concatMap(fn); // 顺序连接，等前一个完成再执行下一个
mergeMap(fn); // 并发合并多个 Observable
```

### 过滤操作符

```typescript
takeWhile(predicate, inclusive); // 持续发射直到条件为false
takeUntil(notifier); // 直到另一个Observable发射时停止
filter(predicate); // 过滤满足条件的值
distinctUntilChanged(); // 去除连续的重复值
```

### 组合操作符

```typescript
merge(...observables); // 合并多个流的发射
race(...observables); // 竞争，最先发射的胜出
combineLatest(); // 组合最新值
zip(); // 配对发射
```

### 错误处理操作符

```typescript
catchError(handler); // 捕获并处理错误
retry(count); // 重试指定次数
retryWhen(notifier); // 根据条件重试
throwError(error); // 抛出错误
```

### 多播操作符

```typescript
share(); // 多个订阅者共享执行
shareReplay(buffer); // 共享并重放最近N个值
publish(); // 转为可连接的Observable
multicast(); // 多播到指定Subject
```

### 实用操作符

```typescript
tap(sideEffect); // 执行副作用（如日志）
finalize(callback); // 流结束时的清理工作
delay(time); // 延迟发射
timeout(time); // 超时控制
```

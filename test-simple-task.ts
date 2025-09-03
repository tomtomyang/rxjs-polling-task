import { SimpleTask } from "./src/simple-task";

// 任务 1
const task1 = new SimpleTask({
  id: "1",
  config: {
    pollingInterval: 1000,
    timeout: 30000,
  },
});

console.log("任务 1 开始");

const task1$ = task1.run({ type: "normal", params: {} });

const task1Sub1 = task1$.subscribe({
  next: (response) => {
    console.log(`订阅 1 任务 1 执行: ${JSON.stringify(response)}`);
  },
  error: (error) =>
    console.error("订阅 1 任务 1 错误:", `${JSON.stringify(error.message)}`),
  complete: () => console.log("订阅 1 任务 1 完成"),
});

const task1Sub2 = task1$.subscribe({
  next: (response) => {
    console.log(`订阅 2 任务 1 执行: ${JSON.stringify(response)}`);
  },
  error: (error) =>
    console.error("订阅 2 任务 1 错误:", `${JSON.stringify(error.message)}`),
  complete: () => console.log("订阅 2 任务 1 完成"),
});

setTimeout(() => {
  console.log("任务 1 取消");
  task1.cancel();
}, 1000);

setTimeout(() => {
  console.log("任务 1 重新开始");
  task1.run({ type: "normal", params: {} });
}, 2000);

setTimeout(() => {
  console.log("任务 1 订阅 1 取消");
  task1Sub1.unsubscribe();
}, 6000);

setTimeout(() => {
  console.log("任务 1 订阅 2 取消");
  task1Sub2.unsubscribe();
}, 7000);

// setTimeout(() => {
//   console.log("任务 1 取消");
//   task1.cancel();
// }, 6000);

// setTimeout(() => {
//   console.log("任务 1 重新开始");
//   task1
//     .run({
//       type: "data-processing",
//       params: { file: "normal.csv" },
//     })
//     .subscribe({
//       next: (response) => {
//         console.log(`任务 1 执行: ${JSON.stringify(response)}`);
//       },
//       error: (error) =>
//         console.error("任务 1 错误:", `${JSON.stringify(error.message)}`),
//       complete: () => console.log("任务 1 完成"),
//     });
// }, 3000);

// setTimeout(() => {
//   console.log("任务 1 取消");

//   task1.cancel();
// }, 5000);

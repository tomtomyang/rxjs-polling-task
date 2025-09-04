import { HttpDemoTask } from "./src/http-demo-task";

// 任务 1
const task1 = new HttpDemoTask({
  id: "1",
  config: {
    pollingInterval: 1000,
    timeout: 30000,
  },
});

const task1$ = task1.create({ startParams: { type: "normal" } });
console.log("任务 1 初始化");

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

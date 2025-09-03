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

task1
  .run({
    type: "slow",
    params: {},
  })
  .subscribe({
    next: (response) => {
      console.log(`任务 1 执行: ${JSON.stringify(response)}`);
    },
    error: (error) =>
      console.error("任务 1 错误:", `${JSON.stringify(error.message)}`),
    complete: () => console.log("任务 1 完成"),
  });

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

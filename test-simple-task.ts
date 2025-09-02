import { SimpleTask } from "./src/simple-task";

// 任务 1
console.log("任务 1 开始");
const normalRequest = {
  type: "data-processing",
  params: { file: "normal.csv" },
};

const task1 = new SimpleTask({
  id: "1",
  config: {
    pollingInterval: 1000,
    timeout: 30000,
  },
});

task1.run(normalRequest).subscribe({
  next: (response) => {
    console.log(
      `任务 1 状态: ${JSON.stringify(task1.status)} ${JSON.stringify(response)}`
    );
  },
  error: (error) =>
    console.error(
      "任务 1 错误:",
      `${JSON.stringify(task1.status)} ${JSON.stringify(error.message)}`
    ),
  complete: () => console.log("任务 1 完成", `${JSON.stringify(task1.status)}`),
});

// // 测试2: 超时任务
// setTimeout(() => {
//   console.log("📝 测试2: 超时任务 (5秒超时)");
//   const timeoutRequest = {
//     type: "long-running-task",
//     params: { duration: "very-long" },
//   };

//   taskManager.startTask(timeoutRequest, 1000, 5000).subscribe({
//     next: (response) => {
//       console.log(`⏱️ 超时测试状态: ${response.status}`);
//     },
//     error: (error) => {
//       console.error("⚠️ 预期的超时错误:", error.message);
//       console.log("✅ 超时功能正常工作!\n");
//     },
//     complete: () => console.log("✨ 超时测试流程结束\n"),
//   });
// }, 3000);

// // 测试3: 自定义超时时间
// setTimeout(() => {
//   console.log("📝 测试3: 自定义超时 (8秒超时)");
//   const customRequest = {
//     type: "custom-task",
//     params: { timeout: "custom" },
//   };

//   taskManager.startTask(customRequest, 1500, 8000).subscribe({
//     next: (response) => {
//       console.log(`🔧 自定义超时状态: ${response.status}`);
//       if (response.status === "completed") {
//         console.log("🎯 自定义任务完成:", response.result);
//       }
//     },
//     error: (error) => console.error("⚠️ 自定义任务错误:", error.message),
//     complete: () => console.log("✨ 自定义测试流程结束"),
//   });
// }, 6000);

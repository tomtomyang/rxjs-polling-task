const express = require('express');
const app = express();
const port = 3000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.use(express.json());

// 模拟任务存储
const tasks = new Map();

// 生成任务ID
function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 模拟任务处理
function simulateTask(taskId) {
  const task = tasks.get(taskId);
  if (!task) return;

  // 任务状态流程：pending -> running -> completed
  setTimeout(() => {
    task.status = 'running';
    task.progress = 0;
    console.log(`任务 ${taskId} 开始运行`);
  }, 1000);

  // 模拟进度更新
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 30; // 随机进度增长
    if (progress >= 100) {
      progress = 100;
      task.status = 'completed';
      task.progress = 100;
      task.result = {
        message: '任务处理完成',
        data: `处理了 N 条数据'}`,
        timestamp: new Date().toISOString()
      };
      console.log(`任务 ${taskId} 完成`);
      clearInterval(progressInterval);
    } else {
      task.progress = Math.floor(progress);
      console.log(`任务 ${taskId} 进度: ${task.progress}%`);
    }
  }, 2000); // 每2秒更新一次进度
}

// 启动任务接口
app.post('/api/tasks/start', async (req, res) => {
  const { type, params } = req.body;
  
  console.log(`收到启动任务请求: type=${type}`);

  // 1. start-500: 启动接口返回 500 状态码
  if (type && type.startsWith('start-500')) {
    console.log(`模拟启动接口错误: ${type}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: `模拟的启动接口错误: ${type}`
    });
  }

  // 2. start-code-1: 启动接口返回 code: 1
  if (type === 'start-code-1') {
    console.log(`模拟启动业务失败: ${type}`);
    return res.json({
      taskId: '',
      code: 1,
      message: '启动任务失败：业务逻辑错误'
    });
  }

  // 3. start-slow | slow: 启动接口慢响应
  if (type === 'start-slow' || type === 'slow') {
    const random = Math.random() * 10000;
    await sleep(random);
  }

  const taskId = generateTaskId();
  
  const task = {
    taskId,
    type,
    params,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  tasks.set(taskId, task);
  console.log(`创建新任务: ${taskId}, 类型: ${type}`);
  
  simulateTask(taskId);
  
  res.json({
    taskId,
    code: 0,
    message: '任务已创建...'
  });
});

// 查询任务状态接口
app.get('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);
  
  console.log(`收到查询任务请求: taskId=${taskId}`);

  if (!task) {
    return res.json({
      taskId,
      code: 1,
      message: '任务不存在',
    });
  }

  // 1. query-500: 查询接口返回 500 状态码
  if (task.type && task.type.startsWith('query-500')) {
    console.log(`模拟查询接口错误: ${task.type}`);
    return res.status(500).json({
      error: 'Bad Gateway',
      message: `模拟的查询接口错误: ${task.type}`
    });
  }

  // 2. query-code-1: 查询接口返回 code: 1
  if (task.type === 'query-code-1') {
    console.log(`模拟查询业务失败: ${task.type}`);
    return res.json({
      taskId: task.taskId,
      code: 1,
      message: '查询任务失败：业务逻辑错误'
    });
  }

  if (task.type === 'query-slow' || task.type === 'slow') {
    const random = Math.random() * 10000;
    await sleep(random);
  }
  
  // 正常任务的查询逻辑

  // 如果任务完成，包含结果
  if (task.status === 'completed') {
    return res.json({
      taskId: task.taskId,
      code: 0,
      message: '任务执行成功',
      data: task.result
    });
  }
  
  // 如果任务失败，包含错误信息
  if (task.status === 'failed') {
    return res.json({
      taskId: task.taskId,
      code: 1,
      message: '任务执行失败'
    });
  }
  
  res.json({
    taskId: task.taskId,
    code: 0,
    message: '任务执行中...',
    progress: task.progress || 0
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 Mock API 服务器启动成功！`);
  console.log(`📍 地址: http://localhost:${port}`);
  console.log(``);
  console.log(`📋 可用接口:`);
  console.log(`   POST /api/tasks/start  - 启动任务`);
  console.log(`   GET  /api/tasks/:id    - 查询任务状态`);
  console.log(``);
  console.log(`📝 测试场景:`);
  console.log(`   type: "normal"        - 正常流程`);
  console.log(`   type: "slow"          - 启动和查询接口慢响应`);
  console.log(`   type: "start-500"     - 启动接口500错误`);
  console.log(`   type: "start-code-1"  - 启动接口业务失败`);
  console.log(`   type: "start-slow"    - 启动接口慢响应`);
  console.log(`   type: "query-500"     - 查询接口500错误`);
  console.log(`   type: "query-code-1"  - 查询接口业务失败`);
  console.log(`   type: "query-slow"    - 查询接口慢响应`);
  console.log(`\n💡 使用 Ctrl+C 停止服务器\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  process.exit(0);
});
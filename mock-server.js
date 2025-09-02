const express = require('express');
const app = express();
const port = 3000;

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
        data: `处理了 ${task.params?.file || task.params?.data || '数据'}`,
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
app.post('/api/tasks/start', (req, res) => {
  const { type, params } = req.body;
  const taskId = generateTaskId();
  
  const task = {
    taskId,
    type,
    params,
    createdAt: new Date().toISOString()
  };
  
  tasks.set(taskId, task);
  console.log(`创建新任务: ${taskId}, 类型: ${type}`);
  
  // 开始模拟任务处理
  simulateTask(taskId);
  
  res.json({
    taskId,
    code: 0,
    message: '任务已创建...'
  });
});

// 查询任务状态接口
app.get('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);
  
  if (!task) {
    return res.json({
      taskId,
      code: 1,
      message: '任务不存在',
    });
  }
  
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
  });
});

// 获取所有任务列表（调试用）
app.get('/api/tasks', (req, res) => {
  const allTasks = Array.from(tasks.values());
  res.json(allTasks);
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    tasksCount: tasks.size
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Mock API 服务器启动成功！`);
  console.log(`地址: http://localhost:${port}`);
  console.log(`可用接口:`);
  console.log(`   POST /api/tasks/start  - 启动任务`);
  console.log(`   GET  /api/tasks/:id    - 查询任务状态`);
  console.log(`   GET  /api/tasks       - 获取所有任务`);
  console.log(`使用 Ctrl+C 停止服务器\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

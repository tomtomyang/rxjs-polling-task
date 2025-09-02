import axios from "axios";
import { from, Observable, throwError, timer } from "rxjs";
import { map, switchMap, takeUntil, takeWhile, tap } from "rxjs/operators";

export enum TaskStatus {
  IDLE = "idle", // 空闲状态
  PENDING = "pending", // 等待中
  RUNNING = "running", // 执行中
  COMPLETED = "completed", // 已完成
  FAILED = "failed", // 失败
  TIMEOUT = "timeout", // 超时
}

export interface TaskResponse {
  taskId: string;
  code: number;
  message: string;
  data?: any;
}

export interface StartTaskRequest {
  type: string;
  params?: any;
}

export class SimpleTask {
  id: string;
  status: TaskStatus = TaskStatus.IDLE;

  private _pollingInterval: number;
  private _timeout: number;

  constructor({
    id,
    config,
  }: {
    id: string;
    config: { pollingInterval?: number; timeout?: number };
  }) {
    this.id = id;

    this._pollingInterval = config.pollingInterval || 1000;
    this._timeout = config.timeout || 30000;
  }

  private _reset() {
    this.status = TaskStatus.IDLE;
  }

  private _callStart(request: StartTaskRequest) {
    return axios.post(`http://localhost:3000/api/tasks/start`, request);
  }

  private _callQuery(taskId: string) {
    return axios.get(`http://localhost:3000/api/tasks/${taskId}`);
  }

  run(request: StartTaskRequest): Observable<TaskResponse> {
    this._reset();

    this.status = TaskStatus.PENDING;

    // 启动任务
    const task$ = from(this._callStart(request)).pipe(
      map((response: any) => response.data),
      tap((initialResponse: TaskResponse) => {
        if (initialResponse.code === 1) {
          // 启动任务失败
          this.status = TaskStatus.FAILED;
        } else {
          this.status = TaskStatus.RUNNING;
        }
      }),
      // 轮询任务状态
      switchMap((initialResponse: TaskResponse) => {
        if (initialResponse.code === 1) {
          return [initialResponse];
        }

        // 开始轮询
        return timer(0, this._pollingInterval).pipe(
          switchMap(() =>
            from(this._callQuery(initialResponse.taskId)).pipe(
              map((res: any) => res.data)
            )
          ),
          tap((response: TaskResponse) => {
            if (response.code === 0 && response.data) {
              this.status = TaskStatus.COMPLETED;
            } else if (response.code === 1) {
              this.status = TaskStatus.FAILED;
            }
            // 如果还是 pending 或 running，SimpleTask 保持 RUNNING 状态
          }),
          takeWhile(
            (response: TaskResponse) => !response.data && response.code !== 1,
            true
          )
        );
      }),
      takeUntil(
        timer(this._timeout).pipe(
          tap(() => {
            this.status = TaskStatus.TIMEOUT;
          }),
          switchMap(() => throwError(() => new Error(`task execute timeout`)))
        )
      )
    );

    return task$;
  }
}

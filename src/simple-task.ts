import axios from "axios";
import { defer, from, Observable, throwError, timer } from "rxjs";
import {
  catchError,
  concatMap,
  map,
  switchMap,
  takeUntil,
  takeWhile,
} from "rxjs/operators";

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

  private _timeout: number;
  private _pollingInterval: number;

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

  private _callStart(request: StartTaskRequest) {
    console.log("callStart", request);
    return axios.post(`http://localhost:3000/api/tasks/start`, request);
  }

  private _callQuery(taskId: string) {
    return axios.get(`http://localhost:3000/api/tasks/${taskId}`);
  }

  create(request: StartTaskRequest): Observable<TaskResponse> {
    return defer(() => from(this._callStart(request))).pipe(
      map((response: any) => response.data),
      catchError((error: any) => {
        return throwError(
          () => new Error(`start task failed: ${error.message}`)
        );
      }),
      // 轮询任务状态
      switchMap((initialResponse: TaskResponse) => {
        // 判断任务是否启动失败
        if (initialResponse.code === 1) {
          return throwError(
            () => new Error(initialResponse.message || "start task failed")
          );
        }

        // 开始轮询
        return timer(0, this._pollingInterval).pipe(
          concatMap(() =>
            from(this._callQuery(initialResponse.taskId)).pipe(
              map((res: any) => res.data),
              catchError((error: any) => {
                return throwError(
                  () => new Error(`query task failed: ${error.message}`)
                );
              })
            )
          ),
          takeWhile((response: TaskResponse) => !response.data, true)
        );
      }),
      // 超时处理
      takeUntil(
        timer(this._timeout).pipe(
          switchMap(() => throwError(() => new Error(`task execute timeout`)))
        )
      )
    );
  }
}

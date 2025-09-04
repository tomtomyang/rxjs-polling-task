import { defer, from, Observable, of, throwError, timer } from "rxjs";
import {
  catchError,
  concatMap,
  switchMap,
  takeUntil,
  takeWhile,
} from "rxjs/operators";

export interface PollingTaskResponse {
  taskId?: string;
  code: number;
  message: string;
  data?: any;
}

export abstract class PollingTask<TStartParams = any, TQueryParams = any> {
  id: string;

  protected _timeout: number;
  protected _pollingInterval: number;

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

  protected abstract _callStart(
    params?: TStartParams
  ): Promise<PollingTaskResponse>;

  protected abstract _callQuery(
    id?: string,
    params?: TQueryParams
  ): Promise<PollingTaskResponse>;

  create({
    startParams,
    queryParams,
  }: {
    startParams?: TStartParams;
    queryParams?: TQueryParams;
  }): Observable<PollingTaskResponse> {
    return defer(() => from(this._callStart(startParams))).pipe(
      // map((response: any) => response.data),
      catchError((error: any) => {
        return of({
          code: 1,
          message: error.message,
        });
      }),
      // 轮询任务状态
      switchMap((initialResponse: PollingTaskResponse) => {
        // 判断任务是否启动失败
        if (initialResponse.code === 1 || !initialResponse.taskId) {
          return throwError(
            () =>
              new Error(
                `start task failed: ${
                  initialResponse.message || "unknown error"
                }`
              )
          );
        }

        // 开始轮询
        return timer(0, this._pollingInterval).pipe(
          concatMap(() =>
            from(this._callQuery(initialResponse.taskId, queryParams)).pipe(
              // map((res: any) => res.data),
              catchError((error: any) => {
                return of({
                  code: 1,
                  message: error.message,
                });
              })
            )
          ),
          takeWhile((response: PollingTaskResponse) => !response.data, true)
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

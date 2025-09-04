import axios from "axios";
import { PollingTask, PollingTaskResponse } from "./polling-task";

export interface HttpDemoTaskStartParams {
  type: string;
}

export class HttpDemoTask extends PollingTask<HttpDemoTaskStartParams> {
  constructor({
    id,
    config,
  }: {
    id: string;
    config: { pollingInterval?: number; timeout?: number };
  }) {
    super({ id, config });
  }

  protected async _callStart(
    params: HttpDemoTaskStartParams
  ): Promise<PollingTaskResponse> {
    return axios
      .post(`http://localhost:3000/api/tasks/start`, params)
      .then((res) => res.data);
  }

  protected async _callQuery(id?: string): Promise<PollingTaskResponse> {
    return axios
      .get(`http://localhost:3000/api/tasks/${id || ""}`)
      .then((res) => res.data);
  }
}

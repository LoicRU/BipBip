import { EventEmitter } from "node:events";
import httpMocks from "node-mocks-http";

export async function invokeApp(app, { method = "GET", url = "/", body, headers } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpMocks.createRequest({
      method,
      url,
      body,
      headers,
    });

    const res = httpMocks.createResponse({
      eventEmitter: EventEmitter,
    });

    let settled = false;

    const finish = () => {
      if (!settled) {
        settled = true;
        resolve(res);
      }
    };

    res.on("finish", finish);
    res.on("end", finish);

    app.handle(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }

      finish();
    });
  });
}

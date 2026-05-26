import { sendSuccess } from "../../utils/response.js";
import * as service from "./service.js";

export async function createReport(req, res) {
  const result = await service.createReport(req.validatedBody, req.user);
  return sendSuccess(res, 201, result);
}

export async function listReports(_req, res) {
  const result = await service.listReports();
  return sendSuccess(res, 200, result);
}

export async function resolveReport(req, res) {
  const result = await service.resolveReport(req.validatedParams.id);
  return sendSuccess(res, 200, result);
}

export async function deleteReport(req, res) {
  const result = await service.deleteReport(req.validatedParams.id);
  return sendSuccess(res, 200, result);
}

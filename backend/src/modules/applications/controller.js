import { sendSuccess } from "../../utils/response.js";
import * as service from "./service.js";

export async function createApplication(req, res) {
  const result = await service.createApplication(req.validatedBody, req.user, req.file);
  return sendSuccess(res, 201, result);
}

export async function listMyApplications(req, res) {
  const result = await service.listMyApplications(req.user);
  return sendSuccess(res, 200, result);
}

export async function removeMyApplication(req, res) {
  const result = await service.removeMyApplication(req.validatedParams.id, req.user);
  return sendSuccess(res, 200, result);
}

export async function listRecruiterApplications(req, res) {
  const result = await service.listRecruiterApplications(req.user);
  return sendSuccess(res, 200, result);
}

export async function updateApplicationStatus(req, res) {
  const result = await service.updateApplicationStatus(
    req.validatedParams.id,
    req.validatedBody.status,
    req.user
  );
  return sendSuccess(res, 200, result);
}

export async function downloadApplicationCv(req, res) {
  const result = await service.getApplicationCv(req.validatedParams.id, req.user);
  return res.download(result.path, result.filename);
}

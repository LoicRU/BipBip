import { sendSuccess } from "../../utils/response.js";
import * as adminService from "./service.js";

export async function getDashboard(_req, res) {
  return res.status(200).json({ message: "Admin only" });
}

export async function getSummary(_req, res) {
  const result = await adminService.getAdminDashboard();
  return sendSuccess(res, 200, result);
}

export async function getSourcePreview(_req, res) {
  const result = await adminService.getAdminSourcePreview();
  return sendSuccess(res, 200, result);
}

export async function getSourceStatus(_req, res) {
  const result = await adminService.getAdminSourceStatus();
  return sendSuccess(res, 200, result);
}

export async function listUsers(_req, res) {
  const result = await adminService.listUsers();
  return sendSuccess(res, 200, result);
}

export async function updateUserStatus(req, res) {
  const result = await adminService.updateUserStatus(
    req.validatedParams.id,
    req.validatedBody.status
  );
  return sendSuccess(res, 200, result);
}

import { sendSuccess } from "../../utils/response.js";
import * as service from "./service.js";

export async function createSupportTicket(req, res) {
  const result = await service.createSupportTicket(req.validatedBody, req.user);
  return sendSuccess(res, 201, result);
}

export async function listSupportTickets(_req, res) {
  const result = await service.listSupportTickets();
  return sendSuccess(res, 200, result);
}

export async function resolveSupportTicket(req, res) {
  const result = await service.resolveSupportTicket(req.validatedParams.id);
  return sendSuccess(res, 200, result);
}

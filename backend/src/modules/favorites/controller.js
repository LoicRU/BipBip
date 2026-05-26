import { sendSuccess } from "../../utils/response.js";
import * as service from "./service.js";

export async function listFavorites(req, res) {
  const result = await service.listFavorites(req.user);
  return sendSuccess(res, 200, result);
}

export async function addFavorite(req, res) {
  const result = await service.addFavorite(req.validatedParams.offerId, req.user);
  return sendSuccess(res, 201, result);
}

export async function removeFavorite(req, res) {
  const result = await service.removeFavorite(req.validatedParams.offerId, req.user);
  return sendSuccess(res, 200, result);
}

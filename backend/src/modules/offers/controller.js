import { sendSuccess } from "../../utils/response.js";
import * as offersService from "./service.js";

export async function listOffers(req, res) {
  const result = req.user
    ? await offersService.listOffers(req.validatedQuery, req.user)
    : await offersService.listOffers(req.validatedQuery);
  return sendSuccess(res, 200, result.data, result.meta);
}

export async function getOfferById(req, res) {
  const result = req.user
    ? await offersService.getOfferById(req.validatedParams.id, req.user)
    : await offersService.getOfferById(req.validatedParams.id);
  return sendSuccess(res, 200, result);
}

export async function createOffer(req, res) {
  const result = await offersService.createOffer(req.validatedBody, req.user);
  return sendSuccess(res, 201, result);
}

export async function updateOffer(req, res) {
  const result = await offersService.updateOffer(
    req.validatedParams.id,
    req.validatedBody,
    req.user
  );
  return sendSuccess(res, 200, result);
}

export async function deleteOffer(req, res) {
  const result = await offersService.deleteOffer(req.validatedParams.id, req.user);
  return sendSuccess(res, 200, result);
}

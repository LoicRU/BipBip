import * as authService from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.validatedBody || req.body);

    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.validatedBody || req.body);

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await authService.updateCurrentUser(req.user.userId, req.validatedBody);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await authService.deleteCurrentUser(req.user.userId, req.validatedBody.password);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

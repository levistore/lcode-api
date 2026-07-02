import * as apiKeyService from "../services/apiKey.service.js";
import { success, error } from "../utils/response.js";

export async function create(req, res) {
  try {
    const name = req.validated?.name || "Default";
    const apiKey = await apiKeyService.createApiKey(req.user.id, name);
    return success(res, apiKey, "API key created", 201);
  } catch (err) {
    return error(res, err.message || "Failed to create API key", err.status || 500);
  }
}

export async function list(req, res) {
  try {
    const apiKeys = await apiKeyService.listApiKeys(req.user.id);
    return success(res, apiKeys, "API keys retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to list API keys", err.status || 500);
  }
}

export async function update(req, res) {
  try {
    // Correct order: userId, keyId, name
    const apiKey = await apiKeyService.updateApiKey(req.user.id, req.params.id, req.validated.name);
    return success(res, apiKey, "API key updated");
  } catch (err) {
    return error(res, err.message || "Failed to update API key", err.status || 500);
  }
}

export async function regenerate(req, res) {
  try {
    // Correct order: userId, keyId
    const apiKey = await apiKeyService.regenerateApiKey(req.user.id, req.params.id);
    return success(res, apiKey, "API key regenerated");
  } catch (err) {
    return error(res, err.message || "Failed to regenerate API key", err.status || 500);
  }
}

export async function toggle(req, res) {
  try {
    // Correct order: userId, keyId
    const apiKey = await apiKeyService.toggleApiKey(req.user.id, req.params.id);
    return success(res, apiKey, `API key ${apiKey.status === "ACTIVE" ? "activated" : "deactivated"}`);
  } catch (err) {
    return error(res, err.message || "Failed to toggle API key", err.status || 500);
  }
}

export async function remove(req, res) {
  try {
    // Correct order: userId, keyId
    await apiKeyService.deleteApiKey(req.user.id, req.params.id);
    return success(res, null, "API key deleted");
  } catch (err) {
    return error(res, err.message || "Failed to delete API key", err.status || 500);
  }
}


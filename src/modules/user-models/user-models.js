import {GPT_MODEL} from "../../constants/gpt-model-info.const.js";

/**
 * Map({ userId: modelName })
 */
const mapUserModels = new Map();

export function initUserModels(userId) {
  setUserModel(userId, GPT_MODEL.GPT3);
}

export function isInitUserModels(userId) {
  return !!mapUserModels && mapUserModels.has(userId);
}

export function setUserModel(userId, modelName) {
  mapUserModels.set(userId, modelName);
}

export function getUserModel(userId) {
  if (mapUserModels.has(userId)) {
    return mapUserModels.get(userId);
  } else {
    return '';
  }
}

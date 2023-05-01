/**
 * Настройка контекста
 * @type {Map<number, boolean>}
 */
const _contextSetting = new Map();

export function setIsContextByUserId(clientId, isContext) {
  _contextSetting.set(clientId, isContext);
}

export function getIsContextByUserId(clientId) {
  if (!_contextSetting.has(clientId)) {
    _contextSetting.set(clientId, false);
  }

  return _contextSetting.get(clientId);
}


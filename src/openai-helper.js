export function getErrorMessage(e) {
  if (e?.status === 429) {
    return {
      errorMessage: 'Превышен лимит запросов в единицу времени'
    }
  } else {
    return {
      errorMessage: 'Непредвиденная ошибка'
    }
  }
}

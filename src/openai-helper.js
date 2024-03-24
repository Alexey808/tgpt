export function getErrorMessage(e) {
  if (e?.status === 429) {
    return {
      errorMessage: 'Превышен лимит запросов в единицу времени'
    }
  } else {
    console.log('Непредвиденная ошибка: ', e);
    return {
      errorMessage: 'Непредвиденная ошибка'
    }
  }
}

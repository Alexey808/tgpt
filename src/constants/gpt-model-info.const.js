export const GPT_MODEL = {
  GPT3: 'gpt-3.5-turbo-0125',
  GPT4: 'gpt-4o'
}

export const GPT3_MODEL_INFO = {
  inputPrice: 0.0007, // за 1000 токенов
  outputPrice: 0.0021, // за 1000 токенов
  inputLimit: 4096,
  outputLimit: 16385
}

export const GPT4_MODEL_INFO = {
  inputPrice: 0.007, // за 1000 токенов
  outputPrice: 0.021, // за 1000 токенов
  inputLimit: 128000,
  outputLimit: 0 // ???
}

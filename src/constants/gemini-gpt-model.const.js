
export const GEMINI_GPT_MODEL = {
  GEMINI_PRO: 'gemini-pro', // вроде тоже самое что и GEMINI_1_5_PRO просто указывает на флагмен модель
  GEMINI_1_5_PRO: 'gemini-pro',
  // GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash'
}

export const GEMINI_1_5_PRO_INFO = {
  inputPrice: 0.0007, // за 1000 токенов
  outputPrice: 0.0021, // за 1000 токенов
  inputLimit: 1048576,
  outputLimit: 8192,
  rateLimitRPD: 50, // для бесплатной версии
  rateLimitRPM: 2 // для бесплатной версии
}

export const GEMINI_1_5_FLASH_INFO = {
  inputPrice: 0.00035, // за 1000 токенов, после 128к токенов 0,0007
  outputPrice: 0.00105, // за 1000 токенов, после 128к токенов 0,0021
  inputLimit: 1048576,
  outputLimit: 8192,
  rateLimitRPD: 1500, // для бесплатной версии
  rateLimitRPM: 15, // для бесплатной версии
}

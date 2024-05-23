import fetch from "node-fetch";

const currencyMap = new Map();


const sec = 1000;
const min = sec * 60;
const hour = min * 60;

let time = null;
export function initTimeUsdRub() {
  loadUsdRub();

  time = setTimeout(() => {
    clearTimeout(time);
    initTimeUsdRub();
  }, hour * 12)
}

export function getUsdRub() {
  return currencyMap.has('usdrub') ? currencyMap.get('usdrub') : 0;
}

export async function loadUsdRub() {
  try {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const data = await response.json();
    const usdRub = data?.Valute?.USD?.Value;
    if (data && usdRub) {
      currencyMap.set('usdrub', usdRub);
    }
  } catch (error) {
    console.error(error);
  }
}

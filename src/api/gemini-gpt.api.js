import fetch from "node-fetch";
import config from "config";
import {getProxyAgentForFetch} from "../helpers/proxy.helper.js";


export class GeminiGptApi {
  apiKey = '';
  agent = getProxyAgentForFetch();

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async chat(texts, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` + this.apiKey;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: texts
          }
        ]
      }),
      agent: this.agent
    };
    // console.log('agent -> ', this.agent);
    // return await fetch('https://ident.me', options)
    //   .then(response => response.text())
    //   .then(data => {
    //     console.log('Bot is using proxy with IP:', data);
    //     // You can send this info to yourself or log it somewhere
    //     // ctx.reply(`Bot is using proxy with IP: ${data}`);
    //   })
    //   .catch(error => console.error('Error:', error));

    return fetch(url, options).then(res => res.json());
  }
}

export const geminiGptApi = new GeminiGptApi(config.get('GEMINI_API_KEY'));

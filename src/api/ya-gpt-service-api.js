import fetch from "node-fetch";
import config from "config";



export class YaGptApi {
  models = {
    pro: 'yandexgpt', // YandexGPT Pro
    lite: 'yandexgpt-lite', // YandexGPT Lite
    summarization: 'summarization' // Краткий пересказ
  }

  async chat(messages) {
    const requestMessages = (messages || []).map((message) => ({
      ...message,
      text: message.content
    }));
    const yaGptApiKey = config.get('YA_GPT_API_KEY');
    const yaGptFolderId = config.get('YA_GPT_FOLDER_ID');

    console.log('m ------------> ', requestMessages);
    return fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${yaGptApiKey}`,
          'x-folder-id': `${yaGptFolderId}`,
          },
        body: JSON.stringify({
          modelUri: `gpt://${yaGptFolderId}/${this.models.pro}/latest`,
          completionOptions: {
            stream: false,
            temperature: 0.3,
            maxTokens: 500
          },
          messages: requestMessages
        })
       })
       .then(response => response.json());
  }
}

export const yaGptApi = new YaGptApi();

import fetch from "node-fetch";
import config from "config";
import {YA_GPT_MODEL, YA_GPT_MODEL_INFO} from "../constants/ya-gpt-model.const.js";


export class YaGptApi {
  async chat(messages, isRcModel) {
    const requestMessages = (messages || []).map((message) => ({
      ...message,
      text: message.content
    }));
    const yaGptApiKey = config.get('YA_GPT_API_KEY');
    const yaGptFolderId = config.get('YA_GPT_FOLDER_ID');
    const modelVersion = isRcModel ? 'rc' : 'latest';
    const mode = 'completion'; // синхронный режим

    return fetch(`https://llm.api.cloud.yandex.net/foundationModels/v1/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${yaGptApiKey}`,
          'x-folder-id': `${yaGptFolderId}`,
          },
        body: JSON.stringify({
          modelUri: `gpt://${yaGptFolderId}/${YA_GPT_MODEL.PRO}/${modelVersion}`,
          completionOptions: {
            stream: false,
            temperature: 0.3,
            maxTokens: YA_GPT_MODEL_INFO.inputOutputLimit
          },
          messages: requestMessages
        })
       })
       .then(response => response.json());
  }
}

export const yaGptApi = new YaGptApi();

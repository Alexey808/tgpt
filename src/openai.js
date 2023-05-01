import { Configuration, OpenAIApi } from "openai";
import config from "config";
import { getErrorMessage } from "./openai-helper.js";

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  }

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      return await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages
      });
    } catch (data) {
      return getErrorMessage(data.response);
    }
  }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'));

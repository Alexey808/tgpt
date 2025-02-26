import {Configuration, OpenAIApi} from "openai";
import config from "config";
import {getProxyAgent} from "../helpers/proxy.helper.js";


class GptApi {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
      baseOptions: {
        httpsAgent: getProxyAgent()
      }
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages, model) {
    return await this.openai.createChatCompletion({
      model,
      messages
    });
  }
}

export const openai = new GptApi(config.get('OPENAI_API_KEY'));

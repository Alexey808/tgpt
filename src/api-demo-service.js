export class ApiDemoService {
  async chat(messages) {
    const lastMessage = (messages || []).slice().reverse()[0];

    return fetch("https://gpt4free.io/wp-json/mwai-ui/v1/chats/submit", {
      "headers": {
        "accept": "text/event-stream",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-wp-nonce": "7086eeede1"
      },
      "referrer": "https://gpt4free.io/reverse-proxy-api/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": JSON.stringify({
        botId: "default",
        customId: null,
        session: "N/A",
        chatId: "5hmklrszwx3",
        contextId: 1304,
        messages,
        newMessage: lastMessage ? lastMessage.content : '',
        newFileId: null,
        stream: false
      }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then((res) => res.json())
  }
}

export const demoGpt = new ApiDemoService();
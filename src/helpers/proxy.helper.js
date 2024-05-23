import { HttpsProxyAgent } from "https-proxy-agent";
import config from 'config';


export function getProxyAgent() {
  return new HttpsProxyAgent({
    hostname: config.get('PROXY_IP'),
    port: config.get('PROXY_PORT'),
    username: config.get('PROXY_LOGIN'),
    password: config.get('PROXY_PWD')
  })
}


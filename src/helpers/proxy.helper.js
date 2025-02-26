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

export function getProxyAgentForFetch() {
  const login = config.get('PROXY_LOGIN');
  const pwd = config.get('PROXY_PWD');
  const ip = config.get('PROXY_IP');
  const port = config.get('PROXY_PORT');
  return new HttpsProxyAgent(`http://${login}:${pwd}@${ip}:${port}`);
}


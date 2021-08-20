import { IConfig } from '../interfaces';
import { iScore } from '../interfaces/iScore';
import axios from 'axios';

export const createPostRequest = async (
  config: IConfig,
  requestBody: iScore,
): Promise<void> => {
  const route = `http://${config.transactionRoutingHostname}:${config.transactionRoutingPort}/${config.transactionRoutingPath}`;
  await axios.post(route, requestBody);
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
import axios, { AxiosResponse } from 'axios';
import { configuration, IConfig } from '../config';

export const createPostRequest = async (
  config: IConfig,
  data: any,
): Promise<AxiosResponse> => {
  const route = `http://${configuration.transactionRoutingHostname}:${config.transactionRoutingPort}/${config.transactionRoutingPath}`;
  return await axios.post(route, data);
};

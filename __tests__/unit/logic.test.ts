// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */
import { NetworkMap, Pacs002, RuleResult } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { TransactionConfiguration } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TransactionConfiguration';
import { TypologyResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import { databaseManager, dbInit, runServer, server } from '../../src/index';
import * as helpers from '../../src/services/helper.service';
import { handleChannels, handleTypologies } from '../../src/services/helper.service';
import { handleExecute } from '../../src/services/logic.service';

let cacheString: string | number | Buffer;
const requestBody = JSON.parse(
  '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"active": true,"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
);

describe('TADProc Service', () => {
  beforeAll(async () => {
    await dbInit();
    await runServer();
  });

  beforeEach(async () => {
    jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolve(
          Object.assign(
            new TransactionConfiguration(),
            JSON.parse(
              '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
            ),
          ),
        );
      });
    });

    jest.spyOn(databaseManager, 'insertTransaction').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolve('');
      });
    });

    jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
      return new Promise<Record<string, unknown>[]>((resolve, reject) => {
        resolve([]);
      });
    });

    jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((...args: unknown[]): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        resolve(1);
      });
    });

    jest.spyOn(databaseManager, 'setAdd').mockImplementation((key: string, value: any): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        cacheString = value;
        resolve();
      });
    });

    jest.spyOn(databaseManager, 'deleteKey').mockImplementation((...args: unknown[]): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        cacheString = '';
        resolve();
      });
    });

    jest.spyOn(server, 'handleResponse').mockImplementation((response: unknown, subject?: string[] | undefined) => {
      return Promise.resolve();
    });
  });

  const getMockTransaction = () => {
    const jquote = JSON.parse(
      '{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"30bea71c5a054978ad0da7f94b2a40e9789","CreDtTm":"${new Date().toISOString()}"},"TxInfAndSts":{"OrgnlInstrId":"5ab4fc7355de4ef8a75b78b00a681ed2255","OrgnlEndToEndId":"2c516801007642dfb89294dde","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":30.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2021-12-03T15:24:26.000Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}}',
    );
    const quote: Pacs002 = Object.assign({}, jquote);
    return quote;
  };

  const getMockNetworkMap = () => {
    const jNetworkMap = JSON.parse(
      '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
    );
    const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
    return networkMap;
  };

  const getMockNetworkMapNoMessages = () => {
    const jNetworkMap = JSON.parse(
      '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
    );
    const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
    return networkMap;
  };

  const getMockTypologyResult = (ruleResults: RuleResult[]): TypologyResult => {
    return { result: 50, id: '028@1.0', cfg: '028@1.0', threshold: 0, ruleResults };
  };

  const getMockNetworkMapWithMultipleChannels = () => {
    const jNetworkMap = JSON.parse(
      '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
    );
    const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
    return networkMap;
  };

  describe('Helper Service', () => {
    let getNetworkMapSpy: jest.SpyInstance;
    let responseSpy: jest.SpyInstance;

    beforeEach(async () => {
      jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve('');
        });
      });

      jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve(
            Object.assign(
              new TransactionConfiguration(),
              JSON.parse(
                '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
              ),
            ),
          );
        });
      });

      jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
        return new Promise<Record<string, unknown>[]>((resolve, reject) => resolve([]));
      });

      jest.spyOn(databaseManager, 'setAdd').mockImplementation((...args: unknown[]): Promise<void> => {
        return new Promise<void>((resolve, reject) => resolve());
      });

      jest.spyOn(databaseManager, 'deleteKey').mockImplementation((...args: unknown[]): Promise<void> => {
        return new Promise<void>((resolve, reject) => resolve());
      });
    });

    describe('Handle Channels', () => {
      it('should handle successful request', async () => {
        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, reject) =>
            resolve([
              JSON.parse(
                '{"channelResult":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((...args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, reject) => {
            resolve(2);
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
      });

      it('should handle successful request, all channels not found', async () => {
        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
      });

      it('should handle successful request, above threshold', async () => {
        let res: any = {};
        jest.spyOn(server, 'handleResponse').mockImplementationOnce((response: unknown, subject?: string[] | undefined) => {
          res = response;
          return Promise.resolve();
        });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementationOnce(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementationOnce(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve) =>
            resolve([
              JSON.parse(
                '{"channelResult":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((...args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, reject) => {
            resolve(2);
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
        if (result[0]?.status) expect(result[0].status).toBe('ALRT');
        else throw 'Test failed - expect response to be called';
      });

      it('should handle successful request, below threshold', async () => {
        let res: any = {};
        const handleResponseSpy = jest
          .spyOn(server, 'handleResponse')
          .mockImplementationOnce((response: unknown, subject?: string[] | undefined) => {
            res = response;
            return Promise.resolve();
          });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementationOnce(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":2000},{"id":"029@1.0","cfg":"1.0","threshold":2000}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":2000},{"id":"029@1.0","cfg":"1.0","threshold":2000}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementationOnce(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, reject) =>
            resolve([
              JSON.parse(
                '{"channelResult":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((...args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, reject) => {
            resolve(2);
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);
        const result = await handleChannels(message!, transaction, networkMap, channelResult);

        if (result[0]?.status) expect(result[0].status).toBe('NALT');
        else throw 'Test failed - expect response to be called';
      });

      it('should handle successful request, already processed', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, reject) =>
            resolve([
              JSON.parse(
                '{"channelResults" :{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
      });

      it('should throw error if no config', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(undefined);
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(server.handleResponse).toHaveBeenCalledTimes(0);
      });

      it('should handle error in handleChannels', async () => {
        jest.spyOn(databaseManager, 'getMemberValues').mockRejectedValue(() => {
          return new Promise((resolve, reject) => {
            resolve(new Error('Test'));
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const thrownFunction = await handleChannels(message!, transaction, networkMap, channelResult);
        try {
          expect(await thrownFunction).toThrow();
        } catch (err) {}
      });

      it('should handle error in handleChannels, wrong transaction type.', async () => {
        const tempRequestBody = JSON.parse(
          '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
        );

        const transaction = tempRequestBody.transaction;
        const networkMap = tempRequestBody.networkMap as NetworkMap;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);
        const channelResult = requestBody.channelResult;

        try {
          const result = await handleChannels(message!, transaction, networkMap, channelResult);
          expect(result).toBeNull();
        } catch (error) {
          expect(error).toStrictEqual(new TypeError(`Cannot read properties of undefined (reading 'id')`));
        }
        // await handleChannels(message!, transaction, networkMap, channelResult);
      });

      it('should handle error in networkmap', async () => {
        const errorRequestBody = JSON.parse(
          '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"active": true,"messages":[{"id":"","host":"http://openfaas:8080","cfg":"","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
        );

        const transaction = errorRequestBody.transaction;
        const networkMap = errorRequestBody.networkMap as NetworkMap;
        const channelResult = errorRequestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        await handleChannels(message!, transaction, networkMap, channelResult);
      });

      it('should handle error in networkmap, no configuration returned', async () => {
        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, reject) =>
            resolve([
              JSON.parse(
                '{"channelResults":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((...args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, reject) => {
            resolve(2);
          });
        });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve({});
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        try {
          const result = await handleChannels(message!, transaction, networkMap, channelResult);
          expect(result).toBeNull();
        } catch (error) {
          expect(error).toStrictEqual(new Error('Transaction Configuration could not be retrieved'));
        }
      });

      it('should handle successful request, channel not part of message', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, reject) =>
            resolve([
              JSON.parse(
                '{"channelResults":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = JSON.parse(
          '{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
        ) as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
      });
    });

    describe('Handle Typologies', () => {
      beforeEach(() => {
        responseSpy = jest.spyOn(helpers, 'handleChannels').mockImplementation(jest.fn());

        jest.spyOn(databaseManager, 'getJson').mockImplementation((...args: unknown[]): Promise<string> => {
          return Promise.resolve('[]');
        });

        jest.spyOn(databaseManager, 'setJson').mockImplementation((...args: unknown[]): Promise<void> => {
          return Promise.resolve();
        });

        jest.spyOn(databaseManager, 'deleteKey').mockImplementation((...args: unknown[]): Promise<void> => {
          return Promise.resolve();
        });

        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((...args: unknown[]): Promise<number> => {
          return Promise.resolve(1);
        });

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return Promise.resolve([{ typologyResult: { result: 50, id: '028@1.0', cfg: '028@1.0', threshold: 0, ruleResults } }]);
        });
      });

      it('should handle successful request, with an unmatched number', async () => {
        const expectedReq = getMockTransaction();

        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

        const networkMap = getMockNetworkMapWithMultipleChannels();
        const typologyResult: TypologyResult = { result: 50, id: '030@1.0', cfg: '030@1.0', threshold: 0, ruleResults };

        await helpers.handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(handleChannels).toHaveBeenCalledTimes(0);
      });

      it('should handle successful request, with a matched number', async () => {
        const expectedReq = getMockTransaction();

        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];
        const networkMap = getMockNetworkMap();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await helpers.handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);
        expect(responseSpy).toHaveBeenCalled();
      });

      it('should handle successful request, have existing typology results already', async () => {
        const expectedReq = getMockTransaction();

        jest.spyOn(databaseManager, 'getJson').mockImplementation((...args: unknown[]): Promise<string> => {
          return new Promise<string>((resolve, reject) =>
            resolve(
              '[{"id":"028@1.0","cfg":"028@1.0","result":50,"ruleResults":[{"result":true,"id":"","cfg":"","subRuleRef":"","reason":""}]}]',
            ),
          );
        });

        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];
        const networkMap = getMockNetworkMapWithMultipleChannels();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(responseSpy).toHaveBeenCalledTimes(0);
      });

      it('should handle successful request, cache error', async () => {
        jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((...args: unknown[]): Promise<Record<string, unknown>[]> => {
          return Promise.resolve([]);
        });
        const expectedReq = getMockTransaction();

        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];
        const networkMap = getMockNetworkMap();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(responseSpy).toHaveBeenCalledTimes(0);
      });

      it('should handle successful request, not all results yet', async () => {
        const expectedReq = getMockTransaction();
        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

        const networkMap = getMockNetworkMapWithMultipleChannels();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(responseSpy).toHaveBeenCalledTimes(0);
      });

      it('should respond with error if cache key deletion fails', async () => {
        const expectedReq = getMockTransaction();
        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

        const networkMap = getMockNetworkMapWithMultipleChannels();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(responseSpy).toHaveBeenCalledTimes(0);
      });

      it('should respond with error if nothing comes back from cache', async () => {
        const expectedReq = getMockTransaction();
        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

        jest.spyOn(databaseManager, 'deleteKey').mockRejectedValueOnce((key: string) => {
          return Promise.reject();
        });

        const networkMap = getMockNetworkMap();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(responseSpy).toHaveBeenCalledTimes(1);
      });

      it('should respond with error if NATS communication Error Occures', async () => {
        const expectedReq = getMockTransaction();
        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

        jest.spyOn(server, 'handleResponse').mockRejectedValueOnce((value: string) => {
          return Promise.reject();
        });

        const networkMap = getMockNetworkMap();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        await handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);

        expect(responseSpy).toHaveBeenCalledTimes(1);
      });

      it('should respond with error if message is missing from networkmap', async () => {
        const expectedReq = getMockTransaction();

        const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];
        const networkMap = getMockNetworkMapNoMessages();
        const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

        const result = await helpers.handleTypologies(expectedReq, networkMap.messages[0].channels[0], networkMap, typologyResult);
        expect(JSON.stringify(result)).toEqual('{"result":"Error"}');
        expect(responseSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Logic Service', () => {
    it('should handle a successful transaction, incomplete.', async () => {
      const expectedReq = getMockTransaction();

      const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMapWithMultipleChannels();
      const typologyResult: TypologyResult = { result: 50, id: '030@1.0', cfg: '030@1.0', threshold: 0, ruleResults };

      await handleExecute({ transaction: expectedReq, networkMap: networkMap, typologyResult: typologyResult });

      expect(server.handleResponse).toBeCalledTimes(0);
    });

    it('should handle a successful transaction, complete.', async () => {
      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = { result: 50, id: '028@1.0', cfg: '028@1.0', threshold: 0, ruleResults };

      const typologySpy = jest.spyOn(helpers, 'handleTypologies').mockImplementationOnce(() => {
        return Promise.resolve([
          {
            result: 0,
            id: '028@1.0',
            cfg: '028@1.0',
            typologyResult: [
              {
                id: '028@1.0',
                cfg: '1.0',
                result: 50,
                ruleResults: [
                  { id: '003@1.0', cfg: '1.0', result: true, reason: 'asdf', subRuleRef: '123' },
                  { id: '028@1.0', cfg: '1.0', result: true, subRuleRef: '04', reason: 'Thedebtoris50orolder' },
                ],
              },
            ],
          },
        ]);
      });

      const responseSpy = jest.spyOn(server, 'handleResponse').mockImplementation((response: unknown, subject?: string[] | undefined) => {
        return Promise.resolve();
      });

      await handleExecute({ transaction: expectedReq, networkMap: networkMap, typologyResult: typologyResult });

      expect(typologySpy).toBeCalledTimes(1);
      expect(responseSpy).toBeCalled();
    });

    it('should handle a successful transaction, with review.', async () => {
      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = { result: 50, id: '028@1.0', cfg: '028@1.0', threshold: 100, ruleResults };

      const typologySpy = jest.spyOn(helpers, 'handleTypologies').mockImplementationOnce(() => {
        return Promise.resolve([
          {
            result: 0,
            id: '028@1.0',
            cfg: '028@1.0',
            status: 'Review',
            typologyResult: [
              {
                id: '028@1.0',
                cfg: '1.0',
                result: 50,
                status: 'Review',
                ruleResults: [
                  { id: '003@1.0', cfg: '1.0', result: true, reason: 'asdf', subRuleRef: '123' },
                  { id: '028@1.0', cfg: '1.0', result: true, subRuleRef: '04', reason: 'Thedebtoris50orolder' },
                ],
              },
            ],
          },
        ]);
      });

      const responseSpy = jest.spyOn(server, 'handleResponse').mockImplementation((response: unknown, subject?: string[] | undefined) => {
        return Promise.resolve();
      });

      await handleExecute({ transaction: expectedReq, networkMap: networkMap, typologyResult: typologyResult });

      expect(typologySpy).toBeCalledTimes(1);
      expect(responseSpy).toBeCalled();
    });

    it('should handle a unsuccessful transaction, catch error.', async () => {
      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = { result: 50, id: '028@1.0', cfg: '028@1.0', threshold: 0, ruleResults };

      const typologySpy = jest.spyOn(helpers, 'handleTypologies').mockRejectedValueOnce(() => {
        return Promise.reject();
      });

      const responseSpy = jest
        .spyOn(server, 'handleResponse')
        .mockImplementationOnce((response: unknown, subject?: string[] | undefined) => {
          return Promise.resolve();
        });

      await handleExecute({ transaction: expectedReq, networkMap: networkMap, typologyResult: typologyResult });

      expect(typologySpy).toBeCalledTimes(1);
      expect(responseSpy).toBeCalledTimes(0);
    });
  });
});

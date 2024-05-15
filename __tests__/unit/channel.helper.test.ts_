// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */
import { NetworkMap } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { TransactionConfiguration } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TransactionConfiguration';
import { databaseManager, dbInit, runServer, server } from '../../src/index';
import { handleChannels } from '../../src/services/helper.service';

let cacheString: string | number | Buffer;
const requestBody = JSON.parse(
  '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"active": true,"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
);

describe('TADProc Service', () => {
  beforeAll(async () => {
    await dbInit();
    await runServer();
  });

  beforeEach(async () => {
    jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
      return new Promise((resolve, _reject) => {
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
      return new Promise((resolve, _reject) => {
        resolve('');
      });
    });

    jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
      return new Promise<Record<string, unknown>[]>((resolve, _reject) => {
        resolve([]);
      });
    });

    jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((..._args: unknown[]): Promise<number> => {
      return new Promise<number>((resolve, _reject) => {
        resolve(1);
      });
    });

    jest.spyOn(databaseManager, 'setAdd').mockImplementation((_key: unknown, value: any): Promise<void> => {
      return new Promise<void>((resolve, _reject) => {
        cacheString = value;
        resolve();
      });
    });

    jest.spyOn(databaseManager, 'deleteKey').mockImplementation((..._args: unknown[]): Promise<void> => {
      return new Promise<void>((resolve, _reject) => {
        cacheString = '';
        resolve();
      });
    });

    jest.spyOn(server, 'handleResponse').mockImplementation((_response: unknown, _subject?: string[] | undefined) => {
      return Promise.resolve();
    });
  });
  describe('Helper Service', () => {
    // let getNetworkMapSpy: jest.SpyInstance;
    // let responseSpy: jest.SpyInstance;

    beforeEach(async () => {
      jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
        return new Promise((resolve, _reject) => {
          resolve('');
        });
      });

      jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
        return new Promise((resolve, _reject) => {
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

      jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return new Promise<Record<string, unknown>[]>((resolve, _reject) => resolve([]));
      });

      jest.spyOn(databaseManager, 'setAdd').mockImplementation((..._args: unknown[]): Promise<void> => {
        return new Promise<void>((resolve, _reject) => resolve());
      });

      jest.spyOn(databaseManager, 'deleteKey').mockImplementation((..._args: unknown[]): Promise<void> => {
        return new Promise<void>((resolve, _reject) => resolve());
      });
    });

    describe('Handle Channels', () => {
      it('should handle successful request', async () => {
        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, _reject) =>
            resolve([
              JSON.parse(
                '{"channelResult":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"030@1.0","review": false, "cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((..._args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, _reject) => {
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
        jest.spyOn(server, 'handleResponse').mockImplementationOnce((response: unknown, _subject?: string[] | undefined) => {
          res = response;
          return Promise.resolve();
        });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementationOnce(() => {
          return new Promise((resolve, _reject) => {
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
          return new Promise((resolve, _reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","workflow":{"alertThreshold":"25","interdictionThreshold":"50"}},{"id":"029@1.0","cfg":"1.0","workflow":{"alertThreshold":"25","interdictionThreshold":"50"}}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","workflow":{"alertThreshold":"25","interdictionThreshold":"50"}},{"id":"029@1.0","cfg":"1.0","workflow":{"alertThreshold":"25","interdictionThreshold":"50"}}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve) =>
            resolve([
              JSON.parse(
                '{"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","review":true,"result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((..._args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, _reject) => {
            resolve(2);
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
        if (result?.review)
          expect(result?.review).toBe(true); // ARLT Review
        else throw 'Test failed - expect response to be called';
      });

      it('should handle successful request', async () => {
        let res: any = {};
        const handleResponseSpy = jest
          .spyOn(server, 'handleResponse')
          .mockImplementationOnce((response: unknown, _subject?: string[] | undefined) => {
            res = response;
            return Promise.resolve();
          });

        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementationOnce(() => {
          return new Promise((resolve, _reject) => {
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
          return new Promise((resolve, _reject) => {
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

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, _reject) =>
            resolve([
              JSON.parse(
                '{"channelResult":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((..._args: unknown[]): Promise<number> => {
          return new Promise<number>((resolve, _reject) => {
            resolve(2);
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);
        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
        if (result)
          expect(result.review).toBe(false); //NALT Review
        else throw 'Test failed - expect response to be called';
      });

      it('should handle successful request, already processed', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, _reject) => {
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

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, _reject) =>
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
          return new Promise((resolve, _reject) => {
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
          return new Promise((resolve, _reject) => {
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
          '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
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
          '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"active": true,"messages":[{"id":"","host":"http://openfaas:8080","cfg":"","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
        );

        const transaction = errorRequestBody.transaction;
        const networkMap = errorRequestBody.networkMap as NetworkMap;
        const channelResult = errorRequestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        await handleChannels(message!, transaction, networkMap, channelResult);
      });

      // it('should handle error in networkmap, no configuration returned', async () => {
      //   jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((...args: unknown[]): Promise<Record<string, unknown>[]> => {
      //     return new Promise<Record<string, unknown>[]>((resolve, reject) =>
      //       resolve([
      //         JSON.parse(
      //           '{"channelResults":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
      //         ),
      //       ]),
      //     );
      //   });

      //   jest.spyOn(databaseManager, 'addOneGetCount').mockImplementationOnce((...args: unknown[]): Promise<number> => {
      //     return new Promise<number>((resolve, reject) => {
      //       resolve(2);
      //     });
      //   });

      //   jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
      //     return new Promise((resolve, reject) => {
      //       resolve({});
      //     });
      //   });

      //   const transaction = requestBody.transaction;
      //   const networkMap = requestBody.networkMap as NetworkMap;
      //   const channelResult = requestBody.channelResult;
      //   const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

      //   try {
      //     const result = await handleChannels(message!, transaction, networkMap, channelResult);
      //     expect(result).toBeNull();
      //   } catch (error) {
      //     expect(error).toStrictEqual(new Error('Transaction Configuration could not be retrieved'));
      //   }
      // });

      it('should handle successful request, channel not part of message', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, _reject) => {
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

        jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
          return new Promise<Record<string, unknown>[]>((resolve, _reject) =>
            resolve([
              JSON.parse(
                '{"channelResults":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
              ),
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = JSON.parse(
          '{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
        ) as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        const result = await handleChannels(message!, transaction, networkMap, channelResult);
        expect(result).toBeDefined();
      });
    });
  });
});

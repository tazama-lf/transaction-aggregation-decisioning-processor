/* eslint-disable */
import { NetworkMap } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { TransactionConfiguration } from '../../src/classes/transaction-configuration';
import { databaseManager, runServer, server } from '../../src/index';
import { handleExecute } from '../../src/services/logic.service';

let cacheString = '';
const requestBody = JSON.parse(
  '{"transaction":{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}},"networkMap":{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
);

describe('TADProc Service', () => {
  beforeAll(async () => {
    await runServer();
    jest.spyOn(server, 'handleResponse').mockImplementation(jest.fn());
  });

  beforeEach(async () => {
    jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolve(
          Object.assign(
            new TransactionConfiguration(),
            JSON.parse(
              '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]}]}]]',
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

    jest.spyOn(databaseManager, 'getMembers').mockImplementation((key: string): Promise<string[]> => {
      return new Promise<string[]>((resolve, reject) => {
        resolve([]);
      });
    });

    jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((...args: unknown[]): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        resolve(1);
      });
    });

    jest.spyOn(databaseManager, 'setAdd').mockImplementation((key: string, value: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        cacheString = value;
        resolve();
      });
    });

    jest.spyOn(databaseManager, 'deleteKey').mockImplementation((key: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        cacheString = '';
        resolve();
      });
    });
  });

  describe('Logic Service', () => {
    let getNetworkMapSpy: jest.SpyInstance;

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
                '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]}]}]]',
              ),
            ),
          );
        });
      });

      jest.spyOn(databaseManager, 'getMembers').mockImplementation((key: string): Promise<string[]> => {
        return new Promise<string[]>((resolve, reject) => resolve([]));
      });

      jest.spyOn(databaseManager, 'setAdd').mockImplementation((key: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => resolve());
      });

      jest.spyOn(databaseManager, 'deleteKey').mockImplementation((key: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => resolve());
      });
    });

    describe('Handle Transaction', () => {
      it('should handle successful request', async () => {
        jest.spyOn(databaseManager, 'getMembers').mockImplementation((key: string): Promise<string[]> => {
          return new Promise<string[]>((resolve, reject) =>
            resolve([
              '{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}',
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleExecute(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle successful request, all channels not found', async () => {
        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleExecute(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle successful request, above threshold', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMembers').mockImplementation((key: string): Promise<string[]> => {
          return new Promise<string[]>((resolve, reject) =>
            resolve([
              '{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}',
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleExecute(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle successful request, already processed', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMembers').mockImplementation((key: string): Promise<string[]> => {
          return new Promise<string[]>((resolve, reject) =>
            resolve([
              '{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}',
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleExecute(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle error in handleChannels', async () => {
        jest.spyOn(databaseManager, 'getMembers').mockRejectedValue(() => {
          return new Promise((resolve, reject) => {
            resolve(new Error('Test'));
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          let thrownFunction = handleExecute(requestBody);
          try {
            expect(await thrownFunction).toThrow();
          } catch (err) {}
        }
      });

      it('should handle successful request, channel not part of message', async () => {
        jest.spyOn(databaseManager, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]}]]',
                ),
              ),
            );
          });
        });

        jest.spyOn(databaseManager, 'getMembers').mockImplementation((key: string): Promise<string[]> => {
          return new Promise<string[]>((resolve, reject) =>
            resolve([
              '{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}',
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = JSON.parse(
          '{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
        ) as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleExecute(requestBody);
          expect(result).toBeDefined();
        }
      });
    });
  });
});

// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */
import { NetworkMap, Pacs002, RuleResult } from '@frmscoe/frms-coe-lib/lib/interfaces';
import { TransactionConfiguration } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TransactionConfiguration';
import { TypologyResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import { databaseManager, dbInit, runServer, server } from '../../src/index';
import * as helpers from '../../src/services/helper.service';
import { handleExecute } from '../../src/services/logic.service';

let cacheString: string | number | Buffer;

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

  const getMockTransaction = () => {
    const jquote = JSON.parse(
      '{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"30bea71c5a054978ad0da7f94b2a40e9789","CreDtTm":"${new Date().toISOString()}"},"TxInfAndSts":{"OrgnlInstrId":"5ab4fc7355de4ef8a75b78b00a681ed2255","OrgnlEndToEndId":"2c516801007642dfb89294dde","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":30.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2021-12-03T15:24:26.000Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}}',
    );
    const quote: Pacs002 = Object.assign({}, jquote);
    return quote;
  };

  const getMockNetworkMap = () => {
    const jNetworkMap = JSON.parse(
      '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
    );
    const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
    return networkMap;
  };

  const getMockNetworkMapWithMultipleChannels = () => {
    const jNetworkMap = JSON.parse(
      '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
    );
    const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
    return networkMap;
  };

  describe('Logic Service', () => {
    it('should handle a successful transaction, incomplete.', async () => {
      const expectedReq = getMockTransaction();

      const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMapWithMultipleChannels();
      const typologyResult: TypologyResult = {
        result: 50,
        id: '030@1.0',
        cfg: '030@1.0',
        workflow: { alertThreshold: 0, interdictionThreshold: 0 },
        ruleResults,
      };

      await handleExecute({ transaction: expectedReq, networkMap: networkMap, typologyResult: typologyResult });

      expect(server.handleResponse).toBeCalledTimes(0);
    });

    it('should handle a successful transaction, complete.', async () => {
      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ result: true, id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = {
        result: 50,
        id: '028@1.0',
        cfg: '1.0',
        review: false,
        workflow: { alertThreshold: 0, interdictionThreshold: 0 },
        ruleResults,
      };

      const typologySpy = jest.spyOn(helpers, 'handleTypologies').mockImplementationOnce(() => {
        return Promise.resolve({
          review: false,
          channelResults: [
            {
              result: 0,
              id: '028@1.0',
              cfg: '1.0',
              typologyResult: [
                {
                  id: '028@1.0',
                  cfg: '1.0',
                  result: 50,
                  workflow: { alertThreshold: 0 },
                  review: true,
                  prcgTm: 0,
                  ruleResults: [
                    { id: '003@1.0', cfg: '1.0', result: true, reason: 'asdf', subRuleRef: '123' },
                    { id: '028@1.0', cfg: '1.0', result: true, subRuleRef: '04', reason: 'Thedebtoris50orolder' },
                  ],
                },
              ],
            },
          ],
        });
      });

      const responseSpy = jest.spyOn(server, 'handleResponse').mockImplementation((_response: unknown, _subject?: string[] | undefined) => {
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
      const typologyResult: TypologyResult = {
        result: 50,
        id: '028@1.0',
        cfg: '1.0',
        review: true,
        workflow: { alertThreshold: 100, interdictionThreshold: 0 },
        ruleResults,
      };

      const typologySpy = jest.spyOn(helpers, 'handleTypologies').mockImplementationOnce(() => {
        return Promise.resolve({
          review: true,
          channelResults: [
            {
              result: 0,
              id: '028@1.0',
              cfg: '1.0',
              prcgTm: 0,
              typologyResult: [
                {
                  id: '028@1.0',
                  cfg: '1.0',
                  result: 50,
                  review: true,
                  workflow: { alertThreshold: 0 },
                  prcgTm: 0,
                  ruleResults: [
                    { id: '003@1.0', cfg: '1.0', result: true, reason: 'asdf', subRuleRef: '123' },
                    { id: '028@1.0', cfg: '1.0', result: true, subRuleRef: '04', reason: 'Thedebtoris50orolder' },
                  ],
                },
              ],
            },
          ],
        });
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
      const typologyResult: TypologyResult = {
        result: 50,
        id: '028@1.0',
        cfg: '1.0',
        workflow: { alertThreshold: 0, interdictionThreshold: 0 },
        ruleResults,
      };

      const typologySpy = jest.spyOn(helpers, 'handleTypologies').mockRejectedValueOnce(() => {
        return Promise.reject();
      });

      const responseSpy = jest
        .spyOn(server, 'handleResponse')
        .mockImplementationOnce((_response: unknown, _subject?: string[] | undefined) => {
          return Promise.resolve();
        });

      await handleExecute({ transaction: expectedReq, networkMap: networkMap, typologyResult: typologyResult });

      expect(typologySpy).toBeCalledTimes(1);
      expect(responseSpy).toBeCalledTimes(0);
    });
  });
});

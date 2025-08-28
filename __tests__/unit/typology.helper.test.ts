// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */
import { NetworkMap, Pacs002, RuleResult } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import { TypologyResult } from '@tazama-lf/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';
import { databaseManager, dbInit, runServer, server } from '../../src/index';
import * as helpers from '../../src/services/helper.service';
import { handleTypologies } from '../../src/services/helper.service';

jest.mock('@tazama-lf/frms-coe-lib/lib/services/dbManager', () => ({
  CreateStorageManager: jest.fn().mockReturnValue({
    db: {
      insertTransaction: jest.fn(),
      addOneGetCount: jest.fn(),
      getJson: jest.fn(),
      setJson: jest.fn(),
      getMemberValues: jest.fn(),
      deleteKey: jest.fn(),
      isReadyCheck: jest.fn().mockReturnValue({ nodeEnv: 'test' }),
    },
  }),
}));

jest.mock('@tazama-lf/frms-coe-startup-lib/lib/interfaces/iStartupConfig', () => ({
  startupConfig: {
    startupType: 'nats',
    consumerStreamName: 'consumer',
    serverUrl: 'server',
    producerStreamName: 'producer',
    functionName: 'producer',
  },
}));

describe('TADProc Service', () => {
  let responseSpy: jest.SpyInstance;
  beforeAll(async () => {
    await dbInit();
    await runServer();
  });
  describe('Handle Typologies', () => {
    beforeEach(() => {
      jest.resetModules();

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];

      jest.spyOn(databaseManager, 'getJson').mockImplementation((..._args: unknown[]): Promise<string> => {
        return Promise.resolve('[]');
      });

      jest.spyOn(databaseManager, 'setJson').mockImplementation((..._args: unknown[]): Promise<void> => {
        return Promise.resolve();
      });

      jest.spyOn(databaseManager, 'deleteKey').mockImplementation((..._args: unknown[]): Promise<void> => {
        return Promise.resolve();
      });

      jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((..._args: unknown[]): Promise<number> => {
        return Promise.resolve(1);
      });

      // Default mock that can be overridden in individual tests
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([
          {
            typologyResult: {
              result: 50,
              id: '028@1.0',
              cfg: '1.0',
              workflow: { alertThreshold: '0', interdictionThreshold: '' },
              ruleResults,
              tenantId: 'test-tenant',
            },
          },
        ]);
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
        '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pacs.002.001.12","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}',
      );
      const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
      return networkMap;
    };

    const getMockNetworkMapNoMessages = () => {
      const jNetworkMap = JSON.parse(
        '{"_key":"26345403","_id":"networkConfiguration/26345403","_rev":"_cxc-1vO---","messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"1.0","rules":[{"id":"003@1.0","host":"http://openfaas:8080","cfg":"1.0"},{"id":"028@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}',
      );
      const networkMap: NetworkMap = Object.assign(new NetworkMap(), jNetworkMap);
      return networkMap;
    };

    const getMockTypologyResult = (ruleResults: RuleResult[]): TypologyResult => {
      return { result: 50, id: '028@1.0', cfg: '1.0', workflow: { alertThreshold: 50, interdictionThreshold: 0 }, ruleResults };
    };

    it('should handle successful request, with an unmatched number', async () => {
      const expectedReq = getMockTransaction();
      const networkMap = getMockNetworkMap();

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const typologyResult: TypologyResult = {
        result: 50,
        id: '030@1.0',
        cfg: '030@1.0',
        workflow: { alertThreshold: 0, interdictionThreshold: 0 },
        ruleResults,
      };

      const testValue = await helpers.handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');

      expect(testValue.review).toEqual(false);
    });

    it('should handle successful request, with a matched number', async () => {
      const expectedReq = getMockTransaction();

      // Mock getMemberValues to return results with tenantId
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([
          {
            typologyResult: {
              result: 50,
              id: '028@1.0',
              cfg: '1.0',
              workflow: { alertThreshold: '0', interdictionThreshold: '' },
              ruleResults: [{ id: '', cfg: '', subRuleRef: '', reason: '' }],
              tenantId: 'test-tenant',
            },
          },
        ]);
      });

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const testValue = await helpers.handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');

      expect(testValue.review).toEqual(false);
      expect(testValue.typologyResult[0].id).toContain('028@1.0');
      expect(testValue.typologyResult[0].result).toEqual(50);
    });

    it('should handle successful request, have existing typology results already', async () => {
      const expectedReq = getMockTransaction();

      jest.spyOn(databaseManager, 'getJson').mockImplementation((..._args: unknown[]): Promise<string> => {
        return new Promise<string>((resolve, _reject) =>
          resolve(
            '[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"","cfg":"","subRuleRef":"","reason":""}],"tenantId":"test-tenant"}]',
          ),
        );
      });

      // Mock getMemberValues to return results with tenantId
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([
          {
            typologyResult: {
              result: 50,
              id: '028@1.0',
              cfg: '1.0',
              workflow: { alertThreshold: '0', interdictionThreshold: '' },
              ruleResults: [{ id: '', cfg: '', subRuleRef: '', reason: '' }],
              tenantId: 'test-tenant',
            },
          },
        ]);
      });

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const testValue = await handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');

      expect(testValue.review).toEqual(false);
      expect(testValue.typologyResult[0].id).toContain('028@1.0');
      expect(testValue.typologyResult[0].result).toEqual(50);
    });

    it('should handle successful request, cache error', async () => {
      // Reset the addOneGetCount mock to return the full count so we get to getMemberValues
      jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((..._args: unknown[]): Promise<number> => {
        return Promise.resolve(1);
      });
      // Mock getMemberValues to return empty array to simulate cache error
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([]);
      });
      const expectedReq = getMockTransaction();

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const testValue = await handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');
      console.log(testValue);

      expect(testValue.review).toEqual(false);
      expect(testValue.typologyResult).toEqual([]);
    });

    it('should handle successful request, not all results yet', async () => {
      // Set up mock to return incomplete count (less than total typologies)
      jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((..._args: unknown[]): Promise<number> => {
        return Promise.resolve(0); // Incomplete - should return early with empty results
      });
      // Also mock getMemberValues just in case to ensure clean state
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementation((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([]);
      });

      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];

      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const testValue = await handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');

      expect(testValue.review).toEqual(false);
      expect(testValue.typologyResult).toEqual([]);
    });

    it('should respond with error if cache interaction fails', async () => {
      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];

      jest.spyOn(databaseManager, 'addOneGetCount').mockRejectedValueOnce(() => {
        return Promise.reject();
      });

      const getMemberSpy = jest.spyOn(databaseManager, 'getMemberValues');

      const networkMap = getMockNetworkMapNoMessages();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const value = await handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');

      expect(value.review).toEqual(false);
      expect(value.typologyResult).toHaveLength(0);
      expect(getMemberSpy).toHaveBeenCalledTimes(0);
    });

    it('should respond with error if NATS communication Error Occures', async () => {
      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];

      jest.spyOn(server, 'handleResponse').mockRejectedValueOnce((_value: string) => {
        return Promise.reject();
      });

      // Mock getMemberValues to return results with tenantId
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([
          {
            typologyResult: {
              result: 50,
              id: '028@1.0',
              cfg: '1.0',
              workflow: { alertThreshold: '0', interdictionThreshold: '' },
              ruleResults: [{ id: '', cfg: '', subRuleRef: '', reason: '' }],
              tenantId: 'test-tenant',
            },
          },
        ]);
      });

      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const testValue = await handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');

      expect(testValue.review).toEqual(false);
      expect(testValue.typologyResult[0].id).toContain('028@1.0');
      expect(testValue.typologyResult[0].result).toEqual(50);
    });

    it('should respond with error if message is missing from networkmap', async () => {
      const expectedReq = getMockTransaction();

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const networkMap = getMockNetworkMapNoMessages();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const result = await helpers.handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');
      expect(result).toEqual({ review: false, typologyResult: [] });
    });

    it('should repond with review false if typology result not match any typologies from networkmap', async () => {
      // Mock getMemberValues to return results with tenantId
      jest.spyOn(databaseManager, 'getMemberValues').mockImplementationOnce((..._args: unknown[]): Promise<Record<string, unknown>[]> => {
        return Promise.resolve([
          {
            typologyResult: {
              result: 50,
              id: '028@1.0',
              cfg: '1.0',
              workflow: { alertThreshold: '0', interdictionThreshold: '' },
              ruleResults: [{ id: '', cfg: '', subRuleRef: '', reason: '' }],
              tenantId: 'test-tenant',
            },
          },
        ]);
      });

      const expectedReq = getMockTransaction();
      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const networkMap = getMockNetworkMap();
      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);
      const result = await helpers.handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');
      expect(result).toEqual({
        review: false,
        typologyResult: [
          {
            result: 50,
            id: '028@1.0',
            cfg: '1.0',
            workflow: { alertThreshold: '0', interdictionThreshold: '' },
            ruleResults: [{ id: '', cfg: '', subRuleRef: '', reason: '' }],
            tenantId: 'test-tenant',
          },
        ],
      });
    });

    it('should respond with empty results if no typologies', async () => {
      jest.spyOn(databaseManager, 'addOneGetCount').mockImplementation((..._args: unknown[]): Promise<number> => {
        return Promise.resolve(-1);
      });
      const expectedReq = getMockTransaction();

      const ruleResults: RuleResult[] = [{ id: '', cfg: '', subRuleRef: '', reason: '' }];
      const networkMap = getMockNetworkMapNoMessages();
      const typology = { ...networkMap.messages[0].typologies[0] };
      typology.id = '998@1.0';
      networkMap.messages[0].typologies.push(typology);

      const typologyResult: TypologyResult = getMockTypologyResult(ruleResults);

      const result = await helpers.handleTypologies(expectedReq, networkMap, typologyResult, 'test-tenant');
      expect(result).toEqual({ review: false, typologyResult: [] });
    });
  });
});

/* eslint-disable */
import { NetworkMap } from '../../src/classes/network-map';
import { TransactionConfiguration } from '../../src/classes/transaction-configuration';
import { cacheClient, databaseClient } from '../../src/index';
import { handleChannels } from '../../src/services/logic.service';
import * as startUpLib from '@frmscoe/frms-coe-startup-lib';

let cacheString = '';
const requestBody = JSON.parse(
  '{"transaction":{"TxTp":"pain.001.001.11","CstmrCdtTrfInitn":{"GrpHdr":{"MsgId":"2669e349-500d-44ba-9e27-7767a16608a2","CreDtTm":"2021-10-07T09:25:31.000Z","NbOfTxs":1,"InitgPty":{"Nm":"IvanReeseRussel-Klein","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1967-11-23","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-783078685"}}},"PmtInf":{"PmtInfId":"b51ec534-ee48-4575-b6a9-ead2955b8069","PmtMtd":"TRA","ReqdAdvcTp":{"DbtAdvc":{"Cd":"ADWD","Prtry":"Advicewithtransactiondetails"}},"ReqdExctnDt":{"Dt":"2021-10-07","DtTm":"2021-10-07T09:25:31.000Z"},"Dbtr":{"Nm":"IvanReeseRussel-Klein","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1957-10-05","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-783078685"}},"DbtrAcct":{"Id":{"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"PASSPORT"}}},"Nm":"IvanRussel-Klein"},"DbtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"CdtTrfTxInf":{"PmtId":{"EndToEndId":"b51ec534-ee48-4575-b6a9-ead2955b8069"},"PmtTpInf":{"CtgyPurp":{"Prtry":"TRANSFER"}},"Amt":{"InstdAmt":{"Amt":{"Amt":"50431891779910900","Ccy":"USD"}},"EqvtAmt":{"Amt":{"Amt":"50431891779910900","Ccy":"USD"},"CcyOfTrf":"USD"}},"ChrgBr":"DEBT","CdtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}},"Cdtr":{"Nm":"AprilSamAdamson","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1923-04-26","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27782722305","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-782722305"}},"CdtrAcct":{"Id":{"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}},"Nm":"AprilAdamson"},"Purp":{"Cd":"MP2P"},"RgltryRptg":{"Dtls":{"Tp":"BALANCEOFPAYMENTS","Cd":"100"}},"RmtInf":{"Ustrd":"PaymentofUSD49932566118723700.89fromIvantoApril"},"SplmtryData":{"Envlp":{"Doc":{"Cdtr":{"FrstNm":"Ivan","MddlNm":"Reese","LastNm":"Russel-Klein","MrchntClssfctnCd":"BLANK"},"Dbtr":{"FrstNm":"April","MddlNm":"Sam","LastNm":"Adamson","MrchntClssfctnCd":"BLANK"},"DbtrFinSvcsPrvdrFees":{"Ccy":"USD","Amt":"499325661187237"},"Xprtn":"2021-10-07T09:30:31.000Z"}}}}},"SplmtryData":{"Envlp":{"Doc":{"InitgPty":{"InitrTp":"CONSUMER","Glctn":{"Lat":"-3.1291","Long":"39.0006"}}}}}}},"networkMap":{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
);

const requestBody2 = JSON.parse(
  '{"transaction":{"TxTp":"pain.001.001.11","CstmrCdtTrfInitn":{"GrpHdr":{"MsgId":"2669e349-500d-44ba-9e27-7767a16608a2","CreDtTm":"2021-10-07T09:25:31.000Z","NbOfTxs":1,"InitgPty":{"Nm":"IvanReeseRussel-Klein","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1967-11-23","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-783078685"}}},"PmtInf":{"PmtInfId":"b51ec534-ee48-4575-b6a9-ead2955b8069","PmtMtd":"TRA","ReqdAdvcTp":{"DbtAdvc":{"Cd":"ADWD","Prtry":"Advicewithtransactiondetails"}},"ReqdExctnDt":{"Dt":"2021-10-07","DtTm":"2021-10-07T09:25:31.000Z"},"Dbtr":{"Nm":"IvanReeseRussel-Klein","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1957-10-05","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-783078685"}},"DbtrAcct":{"Id":{"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"PASSPORT"}}},"Nm":"IvanRussel-Klein"},"DbtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"CdtTrfTxInf":{"PmtId":{"EndToEndId":"b51ec534-ee48-4575-b6a9-ead2955b8069"},"PmtTpInf":{"CtgyPurp":{"Prtry":"TRANSFER"}},"Amt":{"InstdAmt":{"Amt":{"Amt":"50431891779910900","Ccy":"USD"}},"EqvtAmt":{"Amt":{"Amt":"50431891779910900","Ccy":"USD"},"CcyOfTrf":"USD"}},"ChrgBr":"DEBT","CdtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}},"Cdtr":{"Nm":"AprilSamAdamson","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1923-04-26","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27782722305","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-782722305"}},"CdtrAcct":{"Id":{"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}},"Nm":"AprilAdamson"},"Purp":{"Cd":"MP2P"},"RgltryRptg":{"Dtls":{"Tp":"BALANCEOFPAYMENTS","Cd":"100"}},"RmtInf":{"Ustrd":"PaymentofUSD49932566118723700.89fromIvantoApril"},"SplmtryData":{"Envlp":{"Doc":{"Cdtr":{"FrstNm":"Ivan","MddlNm":"Reese","LastNm":"Russel-Klein","MrchntClssfctnCd":"BLANK"},"Dbtr":{"FrstNm":"April","MddlNm":"Sam","LastNm":"Adamson","MrchntClssfctnCd":"BLANK"},"DbtrFinSvcsPrvdrFees":{"Ccy":"USD","Amt":"499325661187237"},"Xprtn":"2021-10-07T09:30:31.000Z"}}}}},"SplmtryData":{"Envlp":{"Doc":{"InitgPty":{"InitrTp":"CONSUMER","Glctn":{"Lat":"-3.1291","Long":"39.0006"}}}}}}},"networkMap":{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"channelResult":{"result":0,"id":"002@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":100,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}}',
);

const invalidRequestBody = JSON.parse(
  '{"transaction":{"TxTp":"pain.001.005","CstmrCdtTrfInitn":{"GrpHdr":{"MsgId":"2669e349-500d-44ba-9e27-7767a16608a0","CreDtTm":"2021-10-07T09:25:31.000Z","NbOfTxs":1,"InitgPty":{"Nm":"IvanReeseRussel-Klein","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1967-11-23","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-783078685"}}},"PmtInf":{"PmtInfId":"b51ec534-ee48-4575-b6a9-ead2955b8069","PmtMtd":"TRA","ReqdAdvcTp":{"DbtAdvc":{"Cd":"ADWD","Prtry":"Advicewithtransactiondetails"}},"ReqdExctnDt":{"Dt":"2021-10-07","DtTm":"2021-10-07T09:25:31.000Z"},"Dbtr":{"Nm":"IvanReeseRussel-Klein","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1957-10-05","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-783078685"}},"DbtrAcct":{"Id":{"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"PASSPORT"}}},"Nm":"IvanRussel-Klein"},"DbtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"CdtTrfTxInf":{"PmtId":{"EndToEndId":"b51ec534-ee48-4575-b6a9-ead2955b8069"},"PmtTpInf":{"CtgyPurp":{"Prtry":"TRANSFER"}},"Amt":{"InstdAmt":{"Amt":{"Amt":"50431891779910900","Ccy":"USD"}},"EqvtAmt":{"Amt":{"Amt":"50431891779910900","Ccy":"USD"},"CcyOfTrf":"USD"}},"ChrgBr":"DEBT","CdtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}},"Cdtr":{"Nm":"AprilSamAdamson","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1923-04-26","CityOfBirth":"Unknown","CtryOfBirth":"ZZ"},"Othr":{"Id":"+27782722305","SchmeNm":{"Prtry":"MSISDN"}}}},"CtctDtls":{"MobNb":"+27-782722305"}},"CdtrAcct":{"Id":{"Othr":{"Id":"+27783078685","SchmeNm":{"Prtry":"MSISDN"}}},"Nm":"AprilAdamson"},"Purp":{"Cd":"MP2P"},"RgltryRptg":{"Dtls":{"Tp":"BALANCEOFPAYMENTS","Cd":"100"}},"RmtInf":{"Ustrd":"PaymentofUSD49932566118723700.89fromIvantoApril"},"SplmtryData":{"Envlp":{"Doc":{"Cdtr":{"FrstNm":"Ivan","MddlNm":"Reese","LastNm":"Russel-Klein","MrchntClssfctnCd":"BLANK"},"Dbtr":{"FrstNm":"April","MddlNm":"Sam","LastNm":"Adamson","MrchntClssfctnCd":"BLANK"},"DbtrFinSvcsPrvdrFees":{"Ccy":"USD","Amt":"499325661187237"},"Xprtn":"2021-10-07T09:30:31.000Z"}}}}},"SplmtryData":{"Envlp":{"Doc":{"InitgPty":{"InitrTp":"CONSUMER","Glctn":{"Lat":"-3.1291","Long":"39.0006"}}}}}}},"networkMap":{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"1.0","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]},"ruleResults":[{"rule":"003@1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"rule":"028@1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}],"typologyResult":{"typology":"028@1.0","result":50},"channelResult":{"result":0,"channel":"001@1.0"}}',
);

afterAll(() => {
  cacheClient.quit();
  databaseClient.client.close();
});

describe('TADProc Service', () => {
  let getTransactionConfigSpy: jest.SpyInstance;
  let insertTransactionHistorySpy: jest.SpyInstance;
  let getJsonSpy: jest.SpyInstance;
  let setJsonSpy: jest.SpyInstance;
  let deleteJsonSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;
  let responseSpy: jest.SpyInstance;

  beforeAll((done) => {
    cacheClient.client.once('connect', () => {
      done();
    });

    responseSpy = jest.spyOn(startUpLib, 'handleResponse').mockImplementation(jest.fn());
  });

  beforeEach(async () => {
    getTransactionConfigSpy = jest.spyOn(databaseClient, 'getTransactionConfig').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolve(
          Object.assign(
            new TransactionConfiguration(),
            JSON.parse(
              '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]}]}]]',
            ),
          ),
        );
      });
    });

    insertTransactionHistorySpy = jest.spyOn(databaseClient, 'insertTransactionHistory').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolve('');
      });
    });

    getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockImplementation((key: string): Promise<string[]> => {
      return new Promise<string[]>((resolve, reject) => {
        resolve([]);
      });
    });

    setJsonSpy = jest.spyOn(cacheClient, 'setJson').mockImplementation((key: string, value: string): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        cacheString = value;
        resolve('OK');
      });
    });

    deleteJsonSpy = jest.spyOn(cacheClient, 'deleteKey').mockImplementation((key: string): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        cacheString = '';
        resolve(1);
      });
    });
  });

  describe('Logic Service', () => {
    let getNetworkMapSpy: jest.SpyInstance;

    beforeEach(async () => {
      getNetworkMapSpy = jest.spyOn(databaseClient, 'getTransactionConfig').mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve('');
        });
      });

      getTransactionConfigSpy = jest.spyOn(databaseClient, 'getTransactionConfig').mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve(
            Object.assign(
              new TransactionConfiguration(),
              JSON.parse(
                '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":100},{"id":"029@1.0","cfg":"1.0","threshold":100}]}]}]}]]',
              ),
            ),
          );
        });
      });

      getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockImplementation((key: string): Promise<string[]> => {
        return new Promise<string[]>((resolve, reject) => resolve([]));
      });

      setJsonSpy = jest.spyOn(cacheClient, 'setJson').mockImplementation((key: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => resolve(''));
      });

      deleteJsonSpy = jest.spyOn(cacheClient, 'deleteKey').mockImplementation((key: string): Promise<number> => {
        return new Promise<number>((resolve, reject) => resolve(1));
      });
    });

    describe('Handle Transaction', () => {
      it('should handle successful request', async () => {
        getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockImplementation((key: string): Promise<string[]> => {
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
          const result = await handleChannels(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle successful request, all channels not found', async () => {
        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleChannels(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle successful request, above threshold', async () => {
        getTransactionConfigSpy = jest.spyOn(databaseClient, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]}]]',
                ),
              ),
            );
          });
        });

        getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockImplementation((key: string): Promise<string[]> => {
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
          const result = await handleChannels(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle successful request, already processed', async () => {
        getTransactionConfigSpy = jest.spyOn(databaseClient, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]}]]',
                ),
              ),
            );
          });
        });

        getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockImplementation((key: string): Promise<string[]> => {
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
          const result = await handleChannels(requestBody);
          expect(result).toBeDefined();
        }
      });

      it('should handle error in handleChannels', async () => {
        getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockRejectedValue(() => {
          return new Promise((resolve, reject) => {
            resolve(new Error('Test'));
          });
        });

        const transaction = requestBody.transaction;
        const networkMap = requestBody.networkMap as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          let thrownFunction = handleChannels(requestBody);
          try {
            expect(await thrownFunction).toThrow();
          } catch (err) {}
        }
      });

      it('should handle successful request, channel not part of message', async () => {
        getTransactionConfigSpy = jest.spyOn(databaseClient, 'getTransactionConfig').mockImplementation(() => {
          return new Promise((resolve, reject) => {
            resolve(
              Object.assign(
                new TransactionConfiguration(),
                JSON.parse(
                  '[[{"messages":[{"id":"001@1.0","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]},{"id":"002@1.0","cfg":"1.0","txTp":"pain.013.001.09","channels":[{"id":"001@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]},{"id":"002@1.0","cfg":"1.0","typologies":[{"id":"028@1.0","cfg":"1.0","threshold":20},{"id":"029@1.0","cfg":"1.0","threshold":20}]}]}]}]]',
                ),
              ),
            );
          });
        });

        getJsonSpy = jest.spyOn(cacheClient, 'getJson').mockImplementation((key: string): Promise<string[]> => {
          return new Promise<string[]>((resolve, reject) =>
            resolve([
              '{"result":0,"id":"001@1.0","cfg":"1.0","typologyResult":[{"id":"028@1.0","cfg":"1.0","result":50,"ruleResults":[{"id":"003@1.0","cfg":"1.0","result":true,"reason":"asdf","subRuleRef":"123"},{"id":"028@1.0","cfg":"1.0","result":true,"subRuleRef":"04","reason":"Thedebtoris50orolder"}]}]}',
            ]),
          );
        });

        const transaction = requestBody.transaction;
        const networkMap = JSON.parse(
          '{"messages":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"1.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"028@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"028@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-028","cfg":"1.0"}]},{"id":"029@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"029@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"005@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]},{"id":"002@1.0","host":"http://openfaas:8080","cfg":"wrong","typologies":[{"id":"030@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"030@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"006@1.0","host":"http://openfaas:8080","cfg":"1.0"}]},{"id":"031@1.0","host":"https://frmfaas.sybrin.com/function/off-typology-processor","cfg":"031@1.0","rules":[{"id":"003@1.0","host":"https://frmfaas.sybrin.com/function/off-rule-003","cfg":"1.0"},{"id":"007@1.0","host":"http://openfaas:8080","cfg":"1.0"}]}]}]}]}',
        ) as NetworkMap;
        const channelResult = requestBody.channelResult;
        const message = networkMap.messages.find((tran) => tran.txTp === transaction.TxTp);

        if (message) {
          const result = await handleChannels(requestBody);
          expect(result).toBeDefined();
        }
      });
    });
  });
});

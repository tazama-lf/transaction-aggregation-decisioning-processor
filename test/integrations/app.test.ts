import { app } from '../../src/index';
import request from 'supertest';

const supertest = request.agent(app.listen());

Date.now = jest.fn(() => new Date(Date.UTC(2022, 1, 1)).valueOf());

jest.mock('../../src/clients/arango.ts');

describe('TADProc Service', () => {
  const requestBody = {
    transaction: {
      GroupHeader: {
        InitiatingParty: {
          Identification: {
            ContactDetails: {
              MobileNumber: 'Hello',
            },
            Identification: 'c5249c18-3518-4975-82a2-5313bd6661f1',
            Other: {
              ContactDetails: {
                MobileNumber: 'Hello',
              },
              Identification: '2b04e485-bd4b-4c8c-8ec1-2d31ca07c848',
              PrivateIdentification: {
                DateAndPlaceOfBirth: {
                  Birthdate: 'Hello',
                },
              },
              SchemeName: {
                Proprietary: 'Hello',
              },
            },
            PrivateIdentification: {
              DateAndPlaceOfBirth: {
                Birthdate: 'Hello',
              },
            },
            SchemeName: {
              Proprietary: 'Hello',
            },
          },
          Name: 'ABD AL-MALIK2',
        },
      },
      PaymentInformation: {
        CreditTransferTransactionInformation: {
          Amount: {
            EquivalentAmount: {
              Amount: 1.1,
              CurrencyOfTransfer: 'Hello',
            },
            InstructedAmount: {},
          },
          Creditor: {
            Identification: {
              ContactDetails: {
                MobileNumber: 'Hello',
              },
              Identification: 'e838d001-5dd9-4e7d-a67f-285889ea9a09',
              Other: {
                ContactDetails: {
                  MobileNumber: 'Hello',
                },
                Identification: 'd8b2b3d0-e00b-4a92-8e45-60b4fdf0563b',
                PrivateIdentification: {
                  DateAndPlaceOfBirth: {
                    Birthdate: '1989-07-132',
                    CityOfBirth: 'Hello',
                    CountryOfBirth: '',
                    ProvinceOfBirth: 'Hello',
                  },
                },
                SchemeName: {
                  Proprietary: 'Hello',
                },
              },
              PrivateIdentification: {
                DateAndPlaceOfBirth: {
                  Birthdate: 'Hello',
                },
              },
              SchemeName: {
                Proprietary: 'Hello',
              },
            },
            Name: 'Hello',
          },
          CreditorAccount: {
            Identification: {
              ContactDetails: {},
              Identification: 'a58cc6c9-e0cf-41c6-bc67-e73c2240fa74',
              Other: {
                ContactDetails: {},
                Identification: 'aec18357-04ec-4fb3-aefc-33579e6068b4',
                PrivateIdentification: {},
                SchemeName: {},
              },
              PrivateIdentification: {},
              SchemeName: {},
            },
            Name: 'Hello',
            Proxy: 'Hello',
          },
          CreditorAgent: {
            FinancialInstitutionIdentification: {
              ClearingSystemMemberIdentification: {
                MemberIdentification: 'Hello',
              },
            },
          },
          PaymentIdentification: {
            EndToEndIdentification: 'aec18362-04ec-4fb3-aefc-33579e6068b',
          },
          PaymentTypeInformation: {
            CategoryPurpose: {
              Proprietary: 'Hello',
            },
          },
          RegulatoryReporting: {
            Details: {
              Code: 'Hello',
            },
          },
          RemittanceInformation: {
            Structured: {
              AdditionalRemittanceInformation: 'Hello',
            },
          },
          SupplementaryData: {
            fees_amount: 1.1,
            fees_currency: 'Hello',
          },
        },
        Debtor: {
          Identification: {
            ContactDetails: {},
            Identification: 'e274ddc4-cc8c-4e7d-8d46-02fdee14a5d5',
            Other: {
              ContactDetails: {},
              Identification: '66d46c16-bcd6-43f0-adac-2a5d289529ba',
              PrivateIdentification: {},
              SchemeName: {},
            },
            PrivateIdentification: {},
            SchemeName: {},
          },
          Name: 'Hello',
        },
        DebtorAccount: {
          Identification: {},
          Name: 'Hello',
          Proxy: 'Hello',
        },
        DebtorAgent: {
          FinancialInstitutionIdentification: {
            ClearingSystemMemberIdentification: {
              MemberIdentification: 'Hello',
            },
          },
        },
        PaymentInformationIdentification: 'Hello',
      },
      SupplementaryData: {
        geoCode_latitude: 'Hello',
        geoCode_longitude: 'Hello',
        payee_merchantClassificationCode: 'Hello',
        payer_merchantClassificationCode: 'Hello',
        transactionType_initiatorType: 'Hello',
      },
    },
    ruleResults: [
      {
        rule: 'Rule_05_1.0',
        result: true,
      },
      {
        rule: 'Rule_27_1.0',
        result: true,
      },
      {
        rule: 'Rule_15_1.4',
        result: true,
      },
    ],
    typologyResult: {
      typology: 'Typology_30.1.0',
      result: 500,
    },
    networkMap: {
      transactions: [
        {
          transaction_type: 'pain.001.001.12',
          transaction_name: 'CustomerCreditTransferInitiationV11',
          channels: [
            {
              channel_id: 'Fraud',
              channel_name: 'Fraud',
              typologies: [
                {
                  typology_id: 'Typology_29.1.0',
                  typology_name: 'Typology_29',
                  typology_version: '1.0',
                  rules: [
                    {
                      rule_id: 'UUIDv4',
                      rule_name: 'Rule_27_1.0',
                      rule_version: '1.0',
                    },
                    {
                      rule_id: 'UUIDv4',
                      rule_name: 'Rule_15_1.4',
                      rule_version: '1.0',
                    },
                    {
                      rule_id: 'UUIDv4',
                      rule_name: 'Rule_05_1.0',
                      rule_version: '1.0',
                    },
                  ],
                },
                {
                  typology_id: 'Typology_30.1.0',
                  typology_name: 'Typology_30',
                  typology_version: '1.0',
                  rules: [
                    {
                      rule_id: 'UUIDv4',
                      rule_name: 'Rule_27_1.0',
                      rule_version: '1.0',
                    },
                    {
                      rule_id: 'UUIDv4',
                      rule_name: 'Rule_15_1.4',
                      rule_version: '1.0',
                    },
                    {
                      rule_id: 'UUIDv4',
                      rule_name: 'Rule_05_1.0',
                      rule_version: '1.0',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    channelResult: {
      channel: 'Fraud',
      result: 2.0,
    },
  };

  const transactionId =
    requestBody.transaction.PaymentInformation.CreditTransferTransactionInformation.PaymentIdentification.EndToEndIdentification;

  const expectedResponse = {
    transactionId: transactionId,
    message: 'Successfully 1 channels completed',
    result: [
      {
        Channel: `${requestBody.channelResult.channel}`,
        Result: {
          transactionID: transactionId,
          message: 'The transaction evaluation result is saved.',
        },
      },
    ],
  };

  afterAll(() => {
    app.terminate();
  });

  describe('test each endpoint', () => {
    test('should /health response with status code 200', async () => {
      await supertest.get('/health').expect(200).expect({
        status: 'UP',
      });
    });
  });

  describe('test each endpoint', () => {
    test('should /execute response with status code 200', async () => {
      const res = await supertest.post('/execute').send(requestBody);

      expect(res.status).toBe(200);
    });

    test('should /execute response contains correct transactionId', async () => {
      const res = await supertest.post('/execute').send(requestBody);
      const data = res.body;

      expect(data?.transactionId).toBe(transactionId);
    });

    test('should /execute response contains channel completed message', async () => {
      const res = await supertest.post('/execute').send(requestBody);
      const data = res.body;

      expect(data?.message).toBe(expectedResponse.message);
    });
  });
});

# 5. Transaction Aggregation and Decisioning Processor (TADP)

This page should be a developers guide and include;

1. detail documentation of the service

    1. explain of the service functionality
  
    2. what information is being written to logs (system and transactional)
  
    3. deployment & installation guide
  
    4. sequence diagram focusing on this service
  
The below sequence diagram for the Transaction Aggregation and Decisioning Processor

![](images/Transaction_Aggregation_Decisioning_Processor.png)

### Code Activity Diagram

```mermaid
flowchart TD
    start([Start]) --> receivePayload[Receive payload from CADProc]
    receivePayload --> note1["Channel output payload includes: Rule results, Typology results, Channel trigger results, Network sub-map, Original transaction data"]
    note1 --> loop1{for each channel result received}
    loop1 -->|More channel results| determineTransaction[Determine transaction]
    determineTransaction --> determineChannels[Determine all channels]
    determineChannels --> readConfig[Read Transaction Configuration from database to determine review message]
    readConfig --> loop2{Channels results outstanding}
    loop2 -->|More channel results| writeCache[Write channel result to cache]
    writeCache --> loop2
    loop2 -->|Channels complete| checkReview{Review any typologies?}
    checkReview -->|ALRT| sendAlert[Send alert to CMS]
    checkReview -->|NALT| noAlert[Don't send alert to CMS]
    sendAlert --> clearCache[Clear cache]
    noAlert --> clearCache
    clearCache --> writeHistory[Write transactions to transaction history DB]
    writeHistory --> logReview[Log review message - Review or None]
    logReview --> loop1
    loop1 -->|No more channel results| sendResponse[Send 200 response back to CADProc]
    sendResponse --> note2["Response includes: Channel-ID, Channel Results"]
    note2 --> stop([Stop])
```

![](images/TADProc_activity_diagram.png)

### Sample JSON Request and Response

The requests and corresponding responses below can be simulated using the following Json file in postman.

#### Requests:

```json
{
    "transaction": {
        "TxTp": "pain.001.001.11",
        "CstmrCdtTrfInitn": {
            "GrpHdr": {
                "MsgId": "2669e349-500d-44ba-9e27-7767a16608a1",
                "CreDtTm": "2021-10-07T09:25:31.000Z",
                "NbOfTxs": 1,
                "InitgPty": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1967-11-23",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                }
            },
            "PmtInf": {
                "PmtInfId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
                "PmtMtd": "TRA",
                "ReqdAdvcTp": {
                    "DbtAdvc": {
                        "Cd": "ADWD",
                        "Prtry": "Advice with transaction details"
                    }
                },
                "ReqdExctnDt": {
                    "Dt": "2021-10-07",
                    "DtTm": "2021-10-07T09:25:31.000Z"
                },
                "Dbtr": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1957-10-05",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                },
                "DbtrAcct": {
                    "Id": {
                        "Othr": {
                            "Id": "+27783078685",
                            "SchmeNm": {
                                "Prtry": "PASSPORT"
                            }
                        }
                    },
                    "Nm": "Ivan Russel-Klein"
                },
                "DbtrAgt": {
                    "FinInstnId": {
                        "ClrSysMmbId": {
                            "MmbId": "dfsp001"
                        }
                    }
                },
                "CdtTrfTxInf": {
                    "PmtId": {
                        "EndToEndId": "b51ec534-ee48-4575-b6a9-ead2955b8069"
                    },
                    "PmtTpInf": {
                        "CtgyPurp": {
                            "Prtry": "TRANSFER"
                        }
                    },
                    "Amt": {
                        "InstdAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            }
                        },
                        "EqvtAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            },
                            "CcyOfTrf": "USD"
                        }
                    },
                    "ChrgBr": "DEBT",
                    "CdtrAgt": {
                        "FinInstnId": {
                            "ClrSysMmbId": {
                                "MmbId": "dfsp002"
                            }
                        }
                    },
                    "Cdtr": {
                        "Nm": "April Sam Adamson",
                        "Id": {
                            "PrvtId": {
                                "DtAndPlcOfBirth": {
                                    "BirthDt": "1923-04-26",
                                    "CityOfBirth": "Unknown",
                                    "CtryOfBirth": "ZZ"
                                },
                                "Othr": {
                                    "Id": "+27782722305",
                                    "SchmeNm": {
                                        "Prtry": "MSISDN"
                                    }
                                }
                            }
                        },
                        "CtctDtls": {
                            "MobNb": "+27-782722305"
                        }
                    },
                    "CdtrAcct": {
                        "Id": {
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        },
                        "Nm": "April Adamson"
                    },
                    "Purp": {
                        "Cd": "MP2P"
                    },
                    "RgltryRptg": {
                        "Dtls": {
                            "Tp": "BALANCE OF PAYMENTS",
                            "Cd": "100"
                        }
                    },
                    "RmtInf": {
                        "Ustrd": "Payment of USD 49932566118723700.89 from Ivan to April"
                    },
                    "SplmtryData": {
                        "Envlp": {
                            "Doc": {
                                "Cdtr": {
                                    "FrstNm": "Ivan",
                                    "MddlNm": "Reese",
                                    "LastNm": "Russel-Klein",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "Dbtr": {
                                    "FrstNm": "April",
                                    "MddlNm": "Sam",
                                    "LastNm": "Adamson",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "DbtrFinSvcsPrvdrFees": {
                                    "Ccy": "USD",
                                    "Amt": "499325661187237"
                                },
                                "Xprtn": "2021-10-07T09:30:31.000Z"
                            }
                        }
                    }
                }
            },
            "SplmtryData": {
                "Envlp": {
                    "Doc": {
                        "InitgPty": {
                            "InitrTp": "CONSUMER",
                            "Glctn": {
                                "Lat": "-3.1291",
                                "Long": "39.0006"
                            }
                        }
                    }
                }
            }
        }
    },
    "networkMap": {
        "messages": [
            {
                "id": "001@1.0",
                "host": "http://openfaas:8080",
                "cfg": "1.0",
                "txTp": "pain.001.001.11",
                "channels": [
                    {
                        "id": "001@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "028@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "028@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "028@1.0",
                                        "host": "{{url}}/function/off-rule-028",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "029@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "029@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "005@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": "002@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "030@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "030@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "006@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "031@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "031@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "007@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "channelResult": {
        "result": 0,
        "id": "002@1.0",
        "cfg": "1.0",
        "typologyResult": [
            {
                "id": "028@1.0",
                "cfg": "1.0",
                "result": 100,
                "ruleResults": [
                    {
                        "id": "003@1.0",
                        "cfg": "1.0",
                        "result": true,
                        "reason": "asdf",
                        "subRuleRef": "123"
                    },
                    {
                        "id": "028@1.0",
                        "cfg": "1.0",
                        "result": true,
                        "subRuleRef": "04",
                        "reason": "The debtor is 50 or older"
                    }
                ]
            }
        ]
    }
}
```

```json
{
    "transaction": {
        "TxTp": "pain.001.001.11",
        "CstmrCdtTrfInitn": {
            "GrpHdr": {
                "MsgId": "2669e349-500d-44ba-9e27-7767a16608a1",
                "CreDtTm": "2021-10-07T09:25:31.000Z",
                "NbOfTxs": 1,
                "InitgPty": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1967-11-23",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                }
            },
            "PmtInf": {
                "PmtInfId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
                "PmtMtd": "TRA",
                "ReqdAdvcTp": {
                    "DbtAdvc": {
                        "Cd": "ADWD",
                        "Prtry": "Advice with transaction details"
                    }
                },
                "ReqdExctnDt": {
                    "Dt": "2021-10-07",
                    "DtTm": "2021-10-07T09:25:31.000Z"
                },
                "Dbtr": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1957-10-05",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                },
                "DbtrAcct": {
                    "Id": {
                        "Othr": {
                            "Id": "+27783078685",
                            "SchmeNm": {
                                "Prtry": "PASSPORT"
                            }
                        }
                    },
                    "Nm": "Ivan Russel-Klein"
                },
                "DbtrAgt": {
                    "FinInstnId": {
                        "ClrSysMmbId": {
                            "MmbId": "dfsp001"
                        }
                    }
                },
                "CdtTrfTxInf": {
                    "PmtId": {
                        "EndToEndId": "b51ec534-ee48-4575-b6a9-ead2955b8069"
                    },
                    "PmtTpInf": {
                        "CtgyPurp": {
                            "Prtry": "TRANSFER"
                        }
                    },
                    "Amt": {
                        "InstdAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            }
                        },
                        "EqvtAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            },
                            "CcyOfTrf": "USD"
                        }
                    },
                    "ChrgBr": "DEBT",
                    "CdtrAgt": {
                        "FinInstnId": {
                            "ClrSysMmbId": {
                                "MmbId": "dfsp002"
                            }
                        }
                    },
                    "Cdtr": {
                        "Nm": "April Sam Adamson",
                        "Id": {
                            "PrvtId": {
                                "DtAndPlcOfBirth": {
                                    "BirthDt": "1923-04-26",
                                    "CityOfBirth": "Unknown",
                                    "CtryOfBirth": "ZZ"
                                },
                                "Othr": {
                                    "Id": "+27782722305",
                                    "SchmeNm": {
                                        "Prtry": "MSISDN"
                                    }
                                }
                            }
                        },
                        "CtctDtls": {
                            "MobNb": "+27-782722305"
                        }
                    },
                    "CdtrAcct": {
                        "Id": {
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        },
                        "Nm": "April Adamson"
                    },
                    "Purp": {
                        "Cd": "MP2P"
                    },
                    "RgltryRptg": {
                        "Dtls": {
                            "Tp": "BALANCE OF PAYMENTS",
                            "Cd": "100"
                        }
                    },
                    "RmtInf": {
                        "Ustrd": "Payment of USD 49932566118723700.89 from Ivan to April"
                    },
                    "SplmtryData": {
                        "Envlp": {
                            "Doc": {
                                "Cdtr": {
                                    "FrstNm": "Ivan",
                                    "MddlNm": "Reese",
                                    "LastNm": "Russel-Klein",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "Dbtr": {
                                    "FrstNm": "April",
                                    "MddlNm": "Sam",
                                    "LastNm": "Adamson",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "DbtrFinSvcsPrvdrFees": {
                                    "Ccy": "USD",
                                    "Amt": "499325661187237"
                                },
                                "Xprtn": "2021-10-07T09:30:31.000Z"
                            }
                        }
                    }
                }
            },
            "SplmtryData": {
                "Envlp": {
                    "Doc": {
                        "InitgPty": {
                            "InitrTp": "CONSUMER",
                            "Glctn": {
                                "Lat": "-3.1291",
                                "Long": "39.0006"
                            }
                        }
                    }
                }
            }
        }
    },
    "networkMap": {
        "messages": [
            {
                "id": "001@1.0",
                "host": "http://openfaas:8080",
                "cfg": "1.0",
                "txTp": "pain.001.001.11",
                "channels": [
                    {
                        "id": "001@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "028@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "028@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "028@1.0",
                                        "host": "{{url}}/function/off-rule-028",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "029@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "029@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "005@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": "002@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "030@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "030@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "006@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "031@1.0",
                                "host": "{{url}}/function/off-typology-processor",
                                "cfg": "031@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "{{url}}/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "007@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "channelResult": {
        "result": 0,
        "id": "001@1.0",
        "cfg": "1.0",
        "typologyResult": [
            {
                "id": "028@1.0",
                "cfg": "1.0",
                "result": 50,
                "ruleResults": [
                    {
                        "id": "003@1.0",
                        "cfg": "1.0",
                        "result": true,
                        "reason": "asdf",
                        "subRuleRef": "123"
                    },
                    {
                        "id": "028@1.0",
                        "cfg": "1.0",
                        "result": true,
                        "subRuleRef": "04",
                        "reason": "The debtor is 50 or older"
                    }
                ]
            }
        ]
    }
}
```
#### Expected Responses:

```json
{
    "message": "Successfully completed 2 channels",
    "alert": {
        "evaluationID": "064e5e2b-67ff-4609-bd33-ee31352f4129",
        "status": "ALRT",
        "timestamp": "2022-01-10T08:22:00.210Z",
        "tadpResult": {
            "id": "001@1.0",
            "cfg": "1.0",
            "channelResult": [
                {
                    "result": 0,
                    "id": "001@1.0",
                    "cfg": "1.0",
                    "typologyResult": [
                        {
                            "id": "028@1.0",
                            "cfg": "1.0",
                            "result": 50,
                            "ruleResults": [
                                {
                                    "id": "003@1.0",
                                    "cfg": "1.0",
                                    "result": true,
                                    "reason": "asdf",
                                    "subRuleRef": "123"
                                },
                                {
                                    "id": "028@1.0",
                                    "cfg": "1.0",
                                    "result": true,
                                    "subRuleRef": "04",
                                    "reason": "The debtor is 50 or older"
                                }
                            ],
                            "threshold": 100
                        }
                    ]
                },
                {
                    "result": 0,
                    "id": "002@1.0",
                    "cfg": "1.0",
                    "typologyResult": [
                        {
                            "id": "028@1.0",
                            "cfg": "1.0",
                            "result": 100,
                            "ruleResults": [
                                {
                                    "id": "003@1.0",
                                    "cfg": "1.0",
                                    "result": true,
                                    "reason": "asdf",
                                    "subRuleRef": "123"
                                },
                                {
                                    "id": "028@1.0",
                                    "cfg": "1.0",
                                    "result": true,
                                    "subRuleRef": "04",
                                    "reason": "The debtor is 50 or older"
                                }
                            ],
                            "review": true,
                            "threshold": 100
                        }
                    ],
                    "status": "Review"
                }
            ]
        }
    },
    "transaction": {
        "TxTp": "pain.001.001.11",
        "CstmrCdtTrfInitn": {
            "GrpHdr": {
                "MsgId": "2669e349-500d-44ba-9e27-7767a16608a1",
                "CreDtTm": "2021-10-07T09:25:31.000Z",
                "NbOfTxs": 1,
                "InitgPty": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1967-11-23",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                }
            },
            "PmtInf": {
                "PmtInfId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
                "PmtMtd": "TRA",
                "ReqdAdvcTp": {
                    "DbtAdvc": {
                        "Cd": "ADWD",
                        "Prtry": "Advice with transaction details"
                    }
                },
                "ReqdExctnDt": {
                    "Dt": "2021-10-07",
                    "DtTm": "2021-10-07T09:25:31.000Z"
                },
                "Dbtr": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1957-10-05",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                },
                "DbtrAcct": {
                    "Id": {
                        "Othr": {
                            "Id": "+27783078685",
                            "SchmeNm": {
                                "Prtry": "PASSPORT"
                            }
                        }
                    },
                    "Nm": "Ivan Russel-Klein"
                },
                "DbtrAgt": {
                    "FinInstnId": {
                        "ClrSysMmbId": {
                            "MmbId": "dfsp001"
                        }
                    }
                },
                "CdtTrfTxInf": {
                    "PmtId": {
                        "EndToEndId": "b51ec534-ee48-4575-b6a9-ead2955b8069"
                    },
                    "PmtTpInf": {
                        "CtgyPurp": {
                            "Prtry": "TRANSFER"
                        }
                    },
                    "Amt": {
                        "InstdAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            }
                        },
                        "EqvtAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            },
                            "CcyOfTrf": "USD"
                        }
                    },
                    "ChrgBr": "DEBT",
                    "CdtrAgt": {
                        "FinInstnId": {
                            "ClrSysMmbId": {
                                "MmbId": "dfsp002"
                            }
                        }
                    },
                    "Cdtr": {
                        "Nm": "April Sam Adamson",
                        "Id": {
                            "PrvtId": {
                                "DtAndPlcOfBirth": {
                                    "BirthDt": "1923-04-26",
                                    "CityOfBirth": "Unknown",
                                    "CtryOfBirth": "ZZ"
                                },
                                "Othr": {
                                    "Id": "+27782722305",
                                    "SchmeNm": {
                                        "Prtry": "MSISDN"
                                    }
                                }
                            }
                        },
                        "CtctDtls": {
                            "MobNb": "+27-782722305"
                        }
                    },
                    "CdtrAcct": {
                        "Id": {
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        },
                        "Nm": "April Adamson"
                    },
                    "Purp": {
                        "Cd": "MP2P"
                    },
                    "RgltryRptg": {
                        "Dtls": {
                            "Tp": "BALANCE OF PAYMENTS",
                            "Cd": "100"
                        }
                    },
                    "RmtInf": {
                        "Ustrd": "Payment of USD 49932566118723700.89 from Ivan to April"
                    },
                    "SplmtryData": {
                        "Envlp": {
                            "Doc": {
                                "Cdtr": {
                                    "FrstNm": "Ivan",
                                    "MddlNm": "Reese",
                                    "LastNm": "Russel-Klein",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "Dbtr": {
                                    "FrstNm": "April",
                                    "MddlNm": "Sam",
                                    "LastNm": "Adamson",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "DbtrFinSvcsPrvdrFees": {
                                    "Ccy": "USD",
                                    "Amt": "499325661187237"
                                },
                                "Xprtn": "2021-10-07T09:30:31.000Z"
                            }
                        }
                    }
                }
            },
            "SplmtryData": {
                "Envlp": {
                    "Doc": {
                        "InitgPty": {
                            "InitrTp": "CONSUMER",
                            "Glctn": {
                                "Lat": "-3.1291",
                                "Long": "39.0006"
                            }
                        }
                    }
                }
            }
        }
    },
    "networkMap": {
        "messages": [
            {
                "id": "001@1.0",
                "host": "http://openfaas:8080",
                "cfg": "1.0",
                "txTp": "pain.001.001.11",
                "channels": [
                    {
                        "id": "001@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "028@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "028@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "028@1.0",
                                        "host": "url/function/off-rule-028",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "029@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "029@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "005@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": "002@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "030@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "030@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "006@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "031@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "031@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "007@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

```json
{
    "message": "Successfully completed 0 channels",
    "alert": {
        "evaluationID": "d8cb0caa-018b-44c2-8e28-6ccdf0bd3a3a",
        "status": "NALT",
        "timestamp": "2022-01-10T08:21:25.864Z",
        "tadpResult": {
            "id": "001@1.0",
            "cfg": "1.0",
            "channelResult": []
        }
    },
    "transaction": {
        "TxTp": "pain.001.001.11",
        "CstmrCdtTrfInitn": {
            "GrpHdr": {
                "MsgId": "2669e349-500d-44ba-9e27-7767a16608a1",
                "CreDtTm": "2021-10-07T09:25:31.000Z",
                "NbOfTxs": 1,
                "InitgPty": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1967-11-23",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                }
            },
            "PmtInf": {
                "PmtInfId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
                "PmtMtd": "TRA",
                "ReqdAdvcTp": {
                    "DbtAdvc": {
                        "Cd": "ADWD",
                        "Prtry": "Advice with transaction details"
                    }
                },
                "ReqdExctnDt": {
                    "Dt": "2021-10-07",
                    "DtTm": "2021-10-07T09:25:31.000Z"
                },
                "Dbtr": {
                    "Nm": "Ivan Reese Russel-Klein",
                    "Id": {
                        "PrvtId": {
                            "DtAndPlcOfBirth": {
                                "BirthDt": "1957-10-05",
                                "CityOfBirth": "Unknown",
                                "CtryOfBirth": "ZZ"
                            },
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        }
                    },
                    "CtctDtls": {
                        "MobNb": "+27-783078685"
                    }
                },
                "DbtrAcct": {
                    "Id": {
                        "Othr": {
                            "Id": "+27783078685",
                            "SchmeNm": {
                                "Prtry": "PASSPORT"
                            }
                        }
                    },
                    "Nm": "Ivan Russel-Klein"
                },
                "DbtrAgt": {
                    "FinInstnId": {
                        "ClrSysMmbId": {
                            "MmbId": "dfsp001"
                        }
                    }
                },
                "CdtTrfTxInf": {
                    "PmtId": {
                        "EndToEndId": "b51ec534-ee48-4575-b6a9-ead2955b8069"
                    },
                    "PmtTpInf": {
                        "CtgyPurp": {
                            "Prtry": "TRANSFER"
                        }
                    },
                    "Amt": {
                        "InstdAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            }
                        },
                        "EqvtAmt": {
                            "Amt": {
                                "Amt": "50431891779910900",
                                "Ccy": "USD"
                            },
                            "CcyOfTrf": "USD"
                        }
                    },
                    "ChrgBr": "DEBT",
                    "CdtrAgt": {
                        "FinInstnId": {
                            "ClrSysMmbId": {
                                "MmbId": "dfsp002"
                            }
                        }
                    },
                    "Cdtr": {
                        "Nm": "April Sam Adamson",
                        "Id": {
                            "PrvtId": {
                                "DtAndPlcOfBirth": {
                                    "BirthDt": "1923-04-26",
                                    "CityOfBirth": "Unknown",
                                    "CtryOfBirth": "ZZ"
                                },
                                "Othr": {
                                    "Id": "+27782722305",
                                    "SchmeNm": {
                                        "Prtry": "MSISDN"
                                    }
                                }
                            }
                        },
                        "CtctDtls": {
                            "MobNb": "+27-782722305"
                        }
                    },
                    "CdtrAcct": {
                        "Id": {
                            "Othr": {
                                "Id": "+27783078685",
                                "SchmeNm": {
                                    "Prtry": "MSISDN"
                                }
                            }
                        },
                        "Nm": "April Adamson"
                    },
                    "Purp": {
                        "Cd": "MP2P"
                    },
                    "RgltryRptg": {
                        "Dtls": {
                            "Tp": "BALANCE OF PAYMENTS",
                            "Cd": "100"
                        }
                    },
                    "RmtInf": {
                        "Ustrd": "Payment of USD 49932566118723700.89 from Ivan to April"
                    },
                    "SplmtryData": {
                        "Envlp": {
                            "Doc": {
                                "Cdtr": {
                                    "FrstNm": "Ivan",
                                    "MddlNm": "Reese",
                                    "LastNm": "Russel-Klein",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "Dbtr": {
                                    "FrstNm": "April",
                                    "MddlNm": "Sam",
                                    "LastNm": "Adamson",
                                    "MrchntClssfctnCd": "BLANK"
                                },
                                "DbtrFinSvcsPrvdrFees": {
                                    "Ccy": "USD",
                                    "Amt": "499325661187237"
                                },
                                "Xprtn": "2021-10-07T09:30:31.000Z"
                            }
                        }
                    }
                }
            },
            "SplmtryData": {
                "Envlp": {
                    "Doc": {
                        "InitgPty": {
                            "InitrTp": "CONSUMER",
                            "Glctn": {
                                "Lat": "-3.1291",
                                "Long": "39.0006"
                            }
                        }
                    }
                }
            }
        }
    },
    "networkMap": {
        "messages": [
            {
                "id": "001@1.0",
                "host": "http://openfaas:8080",
                "cfg": "1.0",
                "txTp": "pain.001.001.11",
                "channels": [
                    {
                        "id": "001@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "028@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "028@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "028@1.0",
                                        "host": "url/function/off-rule-028",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "029@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "029@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "005@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": "002@1.0",
                        "host": "http://openfaas:8080",
                        "cfg": "1.0",
                        "typologies": [
                            {
                                "id": "030@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "030@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "006@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            },
                            {
                                "id": "031@1.0",
                                "host": "url/function/off-typology-processor",
                                "cfg": "031@1.0",
                                "rules": [
                                    {
                                        "id": "003@1.0",
                                        "host": "url/function/off-rule-003",
                                        "cfg": "1.0"
                                    },
                                    {
                                        "id": "007@1.0",
                                        "host": "http://openfaas:8080",
                                        "cfg": "1.0"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

## Transaction Configuration Sample

```json
{
  "messages": [
    {
      "id": "001@1.0",
      "cfg": "1.0",
      "txTp": "pain.001.001.11",
      "channels": [
        {
          "id": "001@1.0",
          "cfg": "1.0",
          "typologies": [
            {
              "id": "028@1.0",
              "cfg": "1.0",
              "threshold": 100
            },
            {
              "id": "029@1.0",
              "cfg": "1.0",
              "threshold": 100
            }
          ]
        },
        {
          "id": "002@1.0",
          "cfg": "1.0",
          "typologies": [
            {
              "id": "028@1.0",
              "cfg": "1.0",
              "threshold": 100
            },
            {
              "id": "029@1.0",
              "cfg": "1.0",
              "threshold": 100
            }
          ]
        }
      ]
    },
    {
      "id": "002@1.0",
      "cfg": "1.0",
      "txTp": "pain.013.001.09",
      "channels": [
        {
          "id": "001@1.0",
          "cfg": "1.0",
          "typologies": [
            {
              "id": "028@1.0",
              "cfg": "1.0",
              "threshold": 100
            },
            {
              "id": "029@1.0",
              "cfg": "1.0",
              "threshold": 100
            }
          ]
        },
        {
          "id": "002@1.0",
          "cfg": "1.0",
          "typologies": [
            {
              "id": "028@1.0",
              "cfg": "1.0",
              "threshold": 100
            },
            {
              "id": "029@1.0",
              "cfg": "1.0",
              "threshold": 100
            }
          ]
        }
      ]
    }
  ]
}

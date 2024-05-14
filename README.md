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

[TADP_request_2.json](./TADP_request_2.json)
[TADP_request_1.json](./TADP_request_1.json)

#### Expected Responses:

[TADP_response_2.json](./TADP_response_2.json)
[TADP_response_1.json](./TADP_response_1.json)

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

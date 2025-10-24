# Bot API Documentation

## Add BOT
**Endpoint : POST /api/bots**



Request Body :

```json
{
    "name":"CS Toko Online",
    "LLM":"chatgpt 4.0",
    "prompt":"Answer customer with expresive",
    "type":"Wa", 
}
```


| Field  | Example Value                        | Description                                  |
|--------|--------------------------------------|----------------------------------------------|
| type   | `Wa`, `Tele`, `Wrap`                 | The channel/platform type                     |
| name   | `Any`                                | Custom name (free text)                       |
| prompt | `prompt1`, `prompt2`, `prompt3`      | Data from model Prompt                        |
| llm    | `ChatGPT-4.0`, `LLaMA`, `Gemini`, `DeepSeek`, etc. | Large Language Model option                  |




Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,

```



Response Body : 

```json
// Success response
data:{
    "status":200,
    "message":"Bot created succesfully!!",
    "bot":{
        "name":"CS Toko Online",
        "LLM":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
        "type":"Wa", 
    },
}
```

```json
// Error response
data:{
    "status":400,
    "message":"Validation Error",
}
```

```json
// Error response
data:{
    "status":401,
    "error":"Unathorized",
}
```

---


## Get ALL BOT
**Endpoint : GET /api/bots**

Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "bot":[
        {
            "name":"CS Toko Online",
            "LLM":"chatgpt 4.0",
            "prompt":"Answer customer with expresive",
            "type":"Wa", 
        },
        {
            "name":"CS sekolahan",
            "LLM":"chatgpt 4.0",
            "prompt":"Answer customer with expresive",
            "type":"Tele", 
        },
    ],
    "pagination": {
            "page": 1,
            "pageSize": 2,
            "totalPages": 5,
            "totalItems": 10
    }
}
```

```json
// Error response
data:{
    "status":401,
    "error":"Unauthorized",
}
```

**Endpoint : GET /api/bots/bots:id**

Request Header : 

```http
api-key: SecretKey,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "bot":{
        "name":"CS Toko Online",
        "LLM":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
        "type":"WhatsaapBot", 
    }
}
```

```json
// Error response (Not Found)
data:{
    "status":404,
    "error":"Room Bot is Not found",
}
```


---


## Update BOT
**Endpoint : Patch /api/bots/bots:id**

Request Body :

```json
{
    "name":"CS Toko Online", //Optional
    "LLM":"chatgpt 4.0",  //Optional
    "prompt":"Answer customer with expresive",  //Optional
    "type":"Wa",   //Optional
}
```

Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "message":"Bot updated successufully!!",
    "bot":{
        "name":"CS Toko Online",
        "LLM":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
        "type":"Wa", 
    },
}
```
```json
// Error response
data:{
    "status":401,
    "error":"Unathorized",
}
```
```json
// Error response
data:{
    "status":400,
    "message":"Validation Error",
}
```


## Delete BOT
**Endpoint : DELETE /api/bots/bots:id**


Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "message":true,
}
```
```json
// Error response
data:{
    "status":401,
    "error":"Unathorized",
}
```
___

## Create Conversations
**Endpoint : POST /api/bots/{botId}/conversations**


Request Header : 

```http
api-key: SecretKey,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "conversation":{
        "conversationID":"unique",
        "room":"unique"
    },
}
```
```json
// Error response
data:{
    "status":400,
    "message":"Validation Error",
}
```
```json
// Error response
data:{
    "status":505,
    "error":"Internal Server Error",
}
```


---

## Get All Conversations by Bots
**Endpoint : GET /api/bots/{botId}/conversations**


Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "conversation":[
        {
            "conversationID":"unique",
            "room":"unique",
            "CreatedAt":"TimeStamp",
            "UpdatedAt":"TimeStamp",
        },
        {
            "conversationID":"unique",
            "room":"unique",
            "CreatedAt":"TimeStamp",
            "UpdatedAt":"TimeStamp"
        },
    ],
    "pagination": {
            "page": 1,
            "pageSize": 2,
            "totalPages": 5,
            "totalItems": 10
    }
    
}
```
```json
// Error response
data:{
    "status":401,
    "error":"Unathorized",
}
```

---

## Create Messages
**Endpoint : POST /api/bots/{botId}/conversations/{conversationId}/messages**


Request Body : 

```json
{
    "message":"Toko Ini Berjualan apa saja?",
    "type":"strangger"
}
```

Request Header : 

```http
api-key: SecretKey,
```

```json
// Error response
data:{
    "status":400,
    "message":"Validation Error",
}
```

```json
// Error response
data:{
    "status":505,
    "error":"Internal Server Error",
}
```


---

## Get All Messages by Conversation
**Endpoint : GET /api/bots/{botId}/conversations/{conversationId}/messages**

Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "messages":[
        {
            "message":"Toko Ini Berjualan apa saja?",
            "type":"strangger"
        },
        {
            "message":"Toko Ini Berjualan Baju dan Celana?",
            "type":"Bot"
        },
    ],
    "pagination": {
            "page": 1,
            "pageSize": 2,
            "totalPages": 5,
            "totalItems": 10
    }
    
    
}
```
```json
// Error response
data:{
    "status":401,
    "error":"Unathorized",
}
```
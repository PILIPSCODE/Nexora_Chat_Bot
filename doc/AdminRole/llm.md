# Prompt API Documentation

## Add LLM
**Endpoint : POST /api/llm**


Request Body :

```json
{
    "name":"GPT",
    "version":"4.0",
}
```


| Field  | Example Value                        | Description                                  |
|--------|--------------------------------------|----------------------------------------------|
| name   | `GPT`                                | Large Language Model Name
| version | `4.0`                                | Version of LLM




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
    "message":"LLM created succesfully!!",
    "LLMs":{
        "name":"GPT",
        "version":"4.0",
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


## Get ALL LLM
**Endpoint : GET /api/llms**

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
    "llms":[
        {
            "name":"LLama",
            "version":"3",
        },
        {
            "name":"GPT",
            "version":"4.0",
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


**Endpoint : GET /api/llms/llms:id**

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
    "prompt":{
        "name":"GPT",
        "version":"4.0",
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


## Update LLM
**Endpoint : Patch /api/llms/llms:id**

Request Body :

```json
{
    "name":"GPT", //Optional
    "version":"4.0",  //Optional
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
    "prompts":{
        "name":"GPT",
        "version":"4.0",
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


## Delete LLM
**Endpoint : DELETE /api/llms/llms:id**


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



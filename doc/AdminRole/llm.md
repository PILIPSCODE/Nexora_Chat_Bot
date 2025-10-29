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
{
    "status":200,
    "message":"LLM created succesfully!!",
    "data":{
        "name":"GPT",
        "version":"4.0",
    },
}
```

```json
// Error response
{
    "status":400,
    "error":"Validation Error",
}
```

```json
// Error response
{
    "status":401,
    "error":"Unathorized",
}
```

---


## Get ALL LLM
**Endpoint : GET /api/llm**

Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
{
    "status":200,
    "data":[
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
{
    "status":401,
    "error":"Unathorized",
}
```


**Endpoint : GET /api/llm/llm:id**

Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
{
    "status":200,
    "data":{
        "name":"GPT",
        "version":"4.0",
    }
}
```

```json
// Error response
{
    "status":401,
    "error":"Unathorized",
}
```
```json
// Error response
{
    "status":400,
    "error":"LLmId is Invalid",
}
```


---


## Update LLM
**Endpoint : Patch /api/llm/llm:id**

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
{
    "status":200,
    "message":"LLM updated successufully!!",
    "prompts":{
        "name":"GPT",
        "version":"4.0",
    },
}
```
```json
// Error response
{
    "status":401,
    "error":"Unathorized",
}
```
```json
// Error response
{
    "status":400,
    "error":"Validation Error",
}
```
```json
// Error response
{
    "status":400,
    "error":"LLmId is Invalid",
}
```


## Delete LLM
**Endpoint : DELETE /api/llm/llm:id**


Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```

Response Body : 

```json
// Success response
{
    "status":200,
    "message":"LLM deleted successfuly!!",
}
```
```json
// Error response
{
    "status":400,
    "error":"LLmId is Invalid",
}
```
```json
// Error response
{
    "status":401,
    "error":"Unathorized",
}
```



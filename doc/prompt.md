# Prompt API Documentation

## Add Prompt
**Endpoint : POST /api/prompts**


Request Body :

```json
{
    "name":"CS Toko prompt",
    "prompt":"Ai assitent expresivve",
    "LLM":"chatgpt 4.0",
}
```


| Field  | Example Value                        | Description                                  |
|--------|--------------------------------------|----------------------------------------------|
| name   | `Any`                                | Custom name (free text)                       |
| prompt | `Any`                                | Custom Prompt (free text)
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
    "message":"Prompt created succesfully!!",
    "prompts":{
        "name":"CS Toko Online",
        "LLM":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
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


## Get ALL Prompt
**Endpoint : GET /api/prompts**

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
    "prompts":[
        {
            "name":"CS Toko prompt",
            "LLM":"chatgpt 4.0",
            "prompt":"Answer customer with expresive",
        },
        {
            "name":"CS sekolahan prompt",
            "LLM":"chatgpt 4.0",
            "prompt":"Answer customer with expresive",
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


**Endpoint : GET /api/prompts/prompts:id**

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
        "name":"CS Toko prompt",
        "LLM":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
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


## Update Prompt
**Endpoint : Patch /api/prompts/prompts:id**

Request Body :

```json
{
    "name":"CS Toko Online", //Optional
    "LLM":"chatgpt 4.0",  //Optional
    "prompt":"Answer customer with expresive",  //Optional
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
        "name":"CS Toko Prompt",
        "LLM":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
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


## Delete Prompt
**Endpoint : DELETE /api/prompts/prompts:id**


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



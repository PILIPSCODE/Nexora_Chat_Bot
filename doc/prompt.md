# Prompt API Documentation

## Add Prompt
**Endpoint : POST /api/prompts**


Request Body :

```json
{
    "name":"CS Toko prompt",
    "prompt":"Ai assitent expresivve",
    "modelName":"chatgpt 4.0",
    "userId":"awkokwokw",
}
```


| Field  | Example Value                        | Description                                  |
|--------|--------------------------------------|----------------------------------------------|
| name   | `Any`                                | Custom name (free text)                       |
| prompt | `Any`                                | Custom Prompt (free text)
| modelName    | `ChatGPT-4.0`, `LLaMA`, `Gemini`, `DeepSeek`, etc. | Large Language Model option                  |
| userId    | `aidj983j93jd0ojdnvjk8` | UserId (required)|




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
    "message":"Prompt created succesfully!!",
    "data":{
        "name":"CS Toko Online",
        "modelName":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
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


## Get ALL Prompt
**Endpoint : GET /api/prompts?page=&limit=&userId**

Request Header : 

```http
api-key: SecretKey,
authorization: AccessToken,
```
Request Query : 

```http
page (required): ini misal seperti halaman berapa?,
limit (required): dihalaman itu ada brp data?,
userId (required): id user,
```

Response Body : 

```json
// Success response
{
    "status":200,
    "data":[
        {
            "name":"CS Toko prompt",
            "modelName":"chatgpt 4.0",
            "prompt":"Answer customer with expresive",
        },
        {
            "name":"CS sekolahan prompt",
            "modelName":"chatgpt 4.0",
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
{
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
{
    "status":200,
    "data":{
        "name":"CS Toko prompt",
        "modelName":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
    }
}
```
```json
// Error response
{
    "status":400,
    "error":"PromptId is Invalid",
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


## Update Prompt
**Endpoint : Patch /api/prompts/prompts:id**

Request Body :

```json
{
    "name":"CS Toko Online", //Optional
    "modelName":"chatgpt 4.0",  //Optional
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
{
    "status":200,
    "message":"Prompt updated successufully!!",
    "data":{
        "name":"CS Toko Prompt",
        "modelName":"chatgpt 4.0",
        "prompt":"Answer customer with expresive",
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
    "error":"PromptId is Invalid",
}
```
```json
// Error response
{
    "status":400,
    "error":"Validation Error",
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
{
    "status":200,
    "message":"Prompt deleted Successfuly",
}
```
```json
// Error response
{
    "status":4010,
    "error":"PromptId is Invalid",
}
```
```json
// Error response
{
    "status":401,
    "error":"Unathorized",
}
```



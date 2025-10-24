# User API Documentation


## Credential Strategy
### Register User
**Endpoint : POST /api/auth/register**

Request Body : 

```json
{
    "firstname":"John",
    "lastname":"Doe",
    "email":"johndoe@gmail.com",
    "password":"jhondoe123",
}

```

Response Body : 

```json
// Success response
{
    "status":200,
    "message":"Registration successfuly",
    "data":{
        "firstname":"John",
        "lastname":"Doe",
        "email":"johndoe@gmail.com",
    }
}
```

```json

// Error response 
{
    "status":409,
    "error":"Email Already Exist!!",
}

```

```json
// Error response
{
    "status":400,
    "error":"Validation Error",
}
```

---

### Login User
**Endpoint : POST /api/auth/login**

Request Body : 

```json
{
    "email":"johndoe@gmail.com",
    "password":"johndoe123",
}
```

Response Body : 

```json
// Success response
{
    "status":200,
    "message":"Login Successfuly. Please check your email to verify your account",
    "data":{
        "firstname":"John",
        "lastname":"Doe",
        "email":"johndoe@gmail.com",
    },
}
```
```json
// Error response
data:{
    "status":400,
    "error":"Invalid email or password!!",
}
```

```json
// Error response
data:{
    "status":400,
    "error":"Validation Error",
}
```

---
### Verification User
**Endpoint : POST /api/auth/otp-verification**

Request Body : 

```json
{
    "codeOTP":234567,
    "email":"johndoe@gmail.com",
}
```

Response Body : 

```json
// Success response
{
    "status":200,
    "message":"Success Verified Code!!",
}
```
```json
// Error response
{
    "status":400,
    "error":"OTP code is expired!!",
}
```
```json
// Error response
{
    "status":400,
    "error":"Invalid OTP code!!",
}
```

```json
// Error response
{
    "status":400,
    "error":"Validation Error",
}
```

---

### Generate NewAccessToken
**Endpoint : POST /api/auth/refresh**

Request Header : 

```http
Authorization: RefreshToken
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "message":"accessToken refeshed!!",
}
```
```json
// Error response
data:{
    "status":403,
    "error":"resfreshToken is exipred!!",
}
```
```json
// Error response
data:{
    "status":403,
    "error":"resfreshToken is invalid!!",
}
```


## Google OAuth
### Show Google Popup Login
**Endpoint : GET /api/auth/google/login**

Response Redirect : /api/auth/google/redirect

### Set accessToken to Cookie
**Endpoint : GET /api/auth/google/redirect**

Response Cookie :
```json
"accessToken":"akwoekpaeonfvbifnoguork",
```




---

## Get User
**Endpoint : GET /api/users/current**

Request Header : 

```http
authorization: AccessToken,
```

Response Body : 

```json
// Success response
data:{
    "status":200,
    "data":{
        "firstname":"John",
        "lastname":"Doe",
        "email":"johndoe@gmail.com",
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

## Update User
**Endpoint : PATCH /api/users/current**

Request Body : 

```json
{
    "firstname":"John", //Optional
    "lastname":"Doe",   //Optional
    "picture":"src"
}
```

Request Header : 

```http
authorization: AccessToken,
```

Response Body : 

```json
// Success response
{
    "status":200,
    "message":"Updated Successfuly!!",
    "data":{
        "firstname":"John",
        "lastname":"Doe",
        "picture":"src"
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


---

## Logout User
**Endpoint : DELETE /api/users/current**


Request Header : 

```http
authorization: AccessToken,
```


Response Body : 

```json
// Success response
{
    "status":200,
    "message":true,
}
```
```json
// Error response
{
    "status":401,
    "error":"Unathorized",
}
```

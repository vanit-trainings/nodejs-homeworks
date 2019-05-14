module.exports = {
    "ok": { "code": 200, "message": { "statusMessage": "OK" } },
    
    "badRequest": { "code": 400, 
                    "firstName": { "statusMessage": "Enter valid firstName" }, 
                    "lastName": { "statusMessage": "Enter valid lastName" }, 
                    "gender": { "statusMessage": "Enter valid gender" },
                    "login": { "statusMessage": "Enter valid login" },
                    "email": { "statusMessage": "Enter valid email" },
                    "password": { "statusMessage": "Enter valid password" }, 
                    "body": { "statusMessage": "Body is empty" },
                    "logPass": { "statusMessage": "Enter valid login and password" } },
    
    "unauthorized": { "code": 401, "message": { "statusMessage": "The request requires user authentication" } },
    
    "notFound": { "code": 404, "message": { "statusMessage": "The server has not found anything matching the Request-URL" } },
    
    "conflict": { "code": 409, 
                  "login": { "statusMessage": "Login is already busy" },
                  "email": { "statusMessage": "Email is already busy" },
                  "token": { "statusMessage": "Token doesn't need to be updated" } },
    
    "preconditionFailed": { "code": 412, "message": { "statusMessage": "Refresh token is missing" } },

    "upgradeRequired": { "code": 426, "message": { "statusMessage": "Token update is required" } },

    "internalServerError": { "code": 500, "message": { "statusMessage": "Server error" } }
}

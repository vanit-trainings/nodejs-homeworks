module.exports = {
    "ok": { "code": 200, "message": { "statusMessage": "OK" } },
    
    "badRequest": { "code": 400, 
                    "firstName": { "statusMessage": "Enter valid firstName" }, 
                    "lastName": { "statusMessage": "Enter valid lastName" }, 
                    "login": { "statusMessage": "Enter valid login" },
                    "email": { "statusMessage": "Enter valid email" },
                    "password": { "statusMessage": "Enter valid password" }, 
                    "body": { "statusMessage": "Body is empty" },
                    "logPass": { "statusMessage": "Enter valid login and password" } },
    
    "unauthorized": { "code": 401, "message": { "statusMessage": "Unauthorized" } },
    
    "notFound": { "code": 404, "message": { "statusMessage": "User not found" } },
    
    "conflict": { "code": 409, 
                  "login": { "statusMessage": "Login already busy" },
                  "email": { "statusMessage": "Email already busy" },
                  "allreadyLogin": { "statusMessage": "You are already logged in" },
                  "token": { "statusMessage": "Your token doesnt need to be refreshed" } },
    
    "preconditionFailed": { "code": 412, "message": { "statusMessage": "Refresh token is missing" } },

    "updateRequired": { "code": 426, "message": { "statusMessage": "Token update required" } },

    "serverError": { "code": 500, "message": { "statusMessage": "Server error" } }
}
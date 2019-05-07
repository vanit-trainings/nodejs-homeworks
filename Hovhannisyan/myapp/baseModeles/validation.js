const express = require('express');
const router = express.Router();
class validation{
validateUsername(username) {
    const usernameRegex = /^[a-zA-Z]+$/;

    return usernameRegex.test(username);
}
validatePass(password) {
    const passw = /^[A-Za-z]\w{7,15}$/;

    return passw.test(password);
}

validateEmail(email) {
    const mail = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

    return mail.test(email);
}
};
module.export =new  validation();
module.exports = {
    notFound: {
        status: 404,
        message: 'not found'
    },
    serverError: {
        status: 500,
        message: 'server Error'
    },
    badRequest: {
        status: 400,
        messageFirst: 'Body is empty',
        messageSecond: 'Invalid firstName or lastName',
        messageThird: 'Invalid gender',
        messageFourth: 'Enter valid email',
        messageFifth: 'Enter valid login',
        messageSixth: 'Enter valid password',
        messageSeventh: 'Enter valid login or password'
    },
    unauthorized: {
        status: 401,
        messageFirst: 'unauthorized',
        messageSecond: 'Token needs to be updated'

    },
    conflict: {
        status: 409,
        messageFirst: 'Email already busy',
        messageSecond: 'Login already busy'
    },
    ok: {
        status: 200,
        message: 'OK'
    }
}

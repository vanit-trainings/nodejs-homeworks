const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const User = require('../models/user');

exports.userSignup = (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                });
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                }
                const user = new User({
                    _id: Joi.objectId(),
                    email: req.body.email,
                    password: hash
                });

                user
                    .save()
                    .then((result) => {
                        res.status(201).json({
                            message: 'User created'
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: err
                        });
                    });
            });
        });
};

exports.userLogin = (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[ 0 ].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign(
            {
                email: user[ 0 ].email,
                userId: user[ 0 ]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: '1h'
            }
                    );

                    return res.status(200).json({
                        message: 'Auth successful',
                        token
                    });
                }
                res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
};

exports.userDelete = (req, res) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then((result) => {
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
};

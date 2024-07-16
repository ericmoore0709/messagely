
const express = require("express");
const router = express.Router();
const db = require('../db');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {

    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ 'error': 'Missing required fields' });

    try {

        const result = await User.authenticate(username, password);

        if (result) {
            const updated = await User.updateLoginTimestamp(username);
            if (updated) {
                const token = await jwt.sign({ username: username }, SECRET_KEY);
                if (token) {
                    return res.status(200).json({ token });
                } else {
                    throw new ExpressError('Failed to generate token.', 500);
                }
            } else {
                throw new ExpressError('Failed to update login timestamp', 500);
            }
        } else {
            return res.status(400).json({ 'error': 'User invalid' });
        }
    } catch (err) {
        console.log(err);
        return next(err);
    }

});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const result = await User.register(req.body);

        if (result) {
            const updated = User.updateLoginTimestamp(req.body.username);
            if (updated) {
                const token = jwt.sign({ username: req.body.username }, SECRET_KEY);
                if (token) {
                    res.status(201).json(token);
                } else {
                    throw new ExpressError('Failed to generate token.', 500);
                }
            } else {
                throw new ExpressError('Failed to update timestamp.', 500);
            }
        } else {
            res.status(500).json({ 'error': 'Failed to create user.' });
        }

    } catch (err) {
        console.log(err);
        return next(err);
    }
});


module.exports = router;
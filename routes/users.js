const express = require("express");
const router = express.Router();
const db = require('../db');
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const users = await User.all();
        return res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    const username = req.params.username;

    try {

        const result = User.get(username);
        if (result)
            return res.status(200).json({ user });

        return res.status(404).json({ 'error': 'Not found.' });

    } catch (err) {
        console.log(err);
        return next(err);
    }
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async (req, res, next) => {

    const username = req.params.username;

    try {

        const result = User.messagesTo(username);

        if (result)
            return res.status(200).json({ messages: result });
        return res.status(404).json({ 'error': 'Not found.' });

    } catch (err) {
        console.log(err);
        return next(err);
    }

})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async (req, res, next) => {

    const username = req.params.username;

    try {

        const result = User.messagesFrom(username);

        if (result)
            return res.status(200).json({ messages: result });
        return res.status(404).json({ 'error': 'Not found.' });

    } catch (err) {
        console.log(err);
        return next(err);
    }

})


module.exports = router;
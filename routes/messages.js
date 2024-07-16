const express = require("express");
const router = express.Router();
const db = require('../db');
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {

    const id = req.params.id;


    try {

        const username = req.user.username;

        const result = await Message.get(id);

        if (result) {

            if (result.from_user.username !== username && result.to_user.username !== username)
                throw new ExpressError('Not authorized to read message.', 401);

            return res.status(200).json({ message: result });
        }
        else {
            return res.status(404).json({ 'error': 'Not found' });
        }

    } catch (err) {
        console.log(err);
        return next(err);
    }

});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {

    const { to_username, body } = req.body;

    if (!to_username || !body)
        return res.status(400).json({ 'error': 'Missing required fields.' });

    try {
        const result = await Message.create({
            from_username: req.user.username,
            to_username: to_username,
            body: body
        });

        return res.status(200).json({ message: result });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    const id = req.params.id;

    try {

        const username = req.user.username;
        const message = await Message.get(id);

        if (message.from_user.username !== username && message.to_user.username)
            throw new ExpressError('Message cannot be read.', 401);

        const read = Message.markRead(id);

        return res.status(200).json({ read });


    } catch (err) {
        console.log(err);
        return next(err);
    }
})



module.exports = router;
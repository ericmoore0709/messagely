/** User class for message.ly */

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require('bcrypt');

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPwd = bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
          username,
          password,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at) 
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPwd, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query('SELECT password FROM users WHERE username = $1', [username]);
    return (result && await bcrypt.compare(password, result.rows[0].password));


  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query('UPDATE users SET last_login_at = current_timestamp WHERE username = $1', [username]);
    return (result.rowCount > 0);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query('SELECT username, first_name, last_name, phone FROM users');
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query('SELECT username, first_name, last_name. phone, join_at, last_login_at FROM users WHERE username = $1', [username]);
    if (result.rowCount)
      return result.rows[0];
    return null;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query('SELECT id, to_username, body, sent_at, read_at from messages WHERE from_username = $1', [username]);
    return result.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query('SELECT id, from_username, body, sent_at, read_at from messages WHERE to_username = $1', [username]);
    return result.rows;
  }
}


module.exports = User;
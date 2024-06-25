// import {StatusCodes} from "http-status-codes";
// import Iron from "@hapi/iron";

const {StatusCodes} = require("http-status-codes");
const Iron= require("@hapi/iron");

async function encrypt(obj) {
    return await Iron.seal(obj, process.env.IRON_PASSWORD, Iron.defaults);
}
  
async function decrypt(sealed) {
  try {
    return await Iron.unseal(sealed, process.env.IRON_PASSWORD, Iron.defaults);
  } catch (err) {
    return null;
  }
}

async function validateFunc(req, session) {
    console.log(session);

    const user = await decrypt(session);

    console.log(user);
    
    const {pool} = req.server.plugins.pg;

    const { rows } = await pool.query("SELECT * from users WHERE id = $1", [
        user.id,
      ]);
    
      if (!user || rows.length < 1) {
        return { isValid: false };
      }
    
      return { isValid: true, credentials: { user: rows[0] } };
  }

const getAllUsers = async(req, h) => {
    const { pool } = req.server.plugins.pg;
    const users = await pool.query("select * from users");
    return h.response({response: users.rows}).code(200);
};

const welcome = async(req, h) => {
    const user = req.auth.credentials.user;
    const msg = user.name;
    return h.response({msg: msg, code: StatusCodes.OK}).code(200);
};

const registerUser = async(req, h) => {
    const { name, email, password, role } = req.payload;
    const { pool } = req.server.plugins.pg;

    if(!name || !email || !password || !role) {
        return h.response({msg: "Please Fill the required Fields", code: StatusCodes.UNAUTHORIZED}).code(401);
    };

    const checkExistingUser = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    if(checkExistingUser.rowCount > 0) {
        return h.response({msg: "User Already Exists", code: StatusCodes.UNAUTHORIZED}).code(401);
    };

    const insertUser = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, password, role]
    );

    const user = insertUser.rows[0];

    const encryptedUser = await encrypt(user);

    h.state("user", encryptedUser);

    return h.response({msg: 'New User Registered!!', code: StatusCodes.CREATED, data: user}).code(201);
};

const loginUser = async(req, h) => {
    const { email, password } = req.payload;
    const { pool } = req.server.plugins.pg;

    if(!email || !password) {
        return h.response({msg: "Please Fill the required Fields", code: StatusCodes.UNAUTHORIZED}).code(401);
    };

    const checkExistingUser = await pool.query(
        "SELECT * FROM users WHERE email=$1 AND password=$2",
        [email, password]
    );

    if(checkExistingUser.rowCount < 1) {
        return h.response({msg: "User Account Not Created", code: StatusCodes.UNAUTHORIZED}).code(401);
    };

    const user = checkExistingUser.rows[0];

    const encryptedUser = await encrypt(user);

    h.state("user", encryptedUser);

    return h.response({msg: "User Logged in Succcessfully!!", code: StatusCodes.OK, data: user}).code(200);
};

const logoutUser = async(req, h) => {
    h.unstate("user");
    return h.response({msg: "User Logged out Successfully!!", code: StatusCodes.OK}).code(200);
}

module.exports = { registerUser, getAllUsers, welcome, loginUser, logoutUser, validateFunc };
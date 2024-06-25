import sql, {join, empty, raw} from "sql-template-tag";
import {StatusCodes} from "http-status-codes";

const getAllUsers = async(req, h) => {
    const { pool } = req.server.plugins.pg;
    const users = await pool.query("select * from users");
    return h.response({response: users.rows}).code(200);
};

const welcome = async(req, h) => {
    const msg = "hola";
    return h.response({msg: msg}).code(200);
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

    return h.response({msg: 'New User Registered!!', code: StatusCodes.CREATED, data: insertUser.rows}).code(201);
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
    }

    return h.response({msg: "User Logged in Succcessfully!!", code: StatusCodes.OK, data: checkExistingUser.rows}).code(200);
};

const logoutUser = async(req, h) => {
    return h.response({msg: "User Logged out Successfully!!", code: StatusCodes.OK}).code(200)
}

export default { registerUser, getAllUsers, welcome, loginUser, logoutUser } 
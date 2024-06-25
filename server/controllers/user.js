import sql, {join, empty, raw} from "sql-template-tag";

const register = async(req, h) => {
    const { pool } = req.server.plugins.pg;

    const body = req.paylaod;

    const { rows: users } = await pool.query(
        sql`SELECT "id", "name", "email" FROM "users" WHERE "email"= ${body.email};`
    )

    const userData = users;

    if(userData.length > 0) {
        return h
        .response({code:200, msg: `User already exists`, userData})
        .code(200);
    } else {
        const registerUser = await pool.query(
            sql`INSERT INTO "users"
                ("name", "email", "password", "role") VALUES 
                (${body.name}, ${body.email}, ${body.password})
                RETURNING *;
            `
        )

        if(registerUser.rowCount === 1) {
            return h
            .response({code: 200, data: registerUser.rows})
            .code(200)
        } else {
            return h
            .response({code: 400, msg: "user already exists"})
            .code(404);
        }
    };
};

const welcome = async(req, h) => {
    const msg = "hola";
    return h.response({msg: msg}).code(200);
};

export default { register, welcome }
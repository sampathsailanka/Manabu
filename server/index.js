"use strict";

const Hapi = require("@hapi/hapi");
const errorHandler = require("./utils/errorHandler");
const DBMigrate = require("db-migrate");

const dbm = DBMigrate.getInstance(true, { throwUncatched: true });

const server = Hapi.server({
  port: 5000,
  host: "localhost",
});

async function start() {
  try {
    await server.start();
    console.log("server running on %s", server.info.uri);
  } catch (error) {
    console.log(`error while starting server: ${error.message}`);
  }
}

async function register() {
  try {
    await dbm.up();

    const dbConfig = dbm.config.getCurrent().settings;

    const _tempPGPlugin = {
      register: (request, options) => {
        const crdb = new CRDB(options.config);
        const pool = crdb.pool();
        request.expose("pool", pool);
      },
      name: "pg",
    };

    await server.register({
      plugin: _tempPGPlugin,
      options: { config: dbConfig, connectionCount: 8 },
    });

    //  custom error handling
    server.ext("onPreResponse", (req, h) => {
      const response = req.response;

      if (response.isBoom) {
        return errorHandler(response, req, h);
      }

      return h.continue;
    });

    return true;
  } catch (error) {
    console.error(`Error during registration: ${error.message}`);
    return false;
  }
}

(async () => {
  if (await register()) {
    start();
  }
})();

"use strict";
import 'dotenv/config';

import Hapi from "@hapi/hapi";
import DBMigrate from "db-migrate";
import CRDB from "crdb-pg";
import HapiRouter from "hapi-router-es";
import HapiCookie from "@hapi/cookie";
import controllers from "./controllers/user.js";

const dbm = DBMigrate.getInstance(true, { throwUncatched: true });

const _tempPGPlugin = {
  register: (request, options) => {
    const crdb = new CRDB(options.config);
    const pool = crdb.pool();
    request.expose("pool", pool);
  },
  name: "pg",
};

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
    await server.register(HapiCookie);
    
    server.auth.strategy('session', 'cookie', {
      cookie: {
        name: "user",
        password: process.env.STRATEGY_PASSWORD,
        isHttpOnly: true,
        path: "/",
        ttl: 15 * 60 * 1000,
      },
      validate: controllers.validateFunc,
    });

    server.auth.default({strategy: "session"});

    await dbm.up();

    const dbConfig = dbm.config.getCurrent();

    await server.register([
      {
        plugin: _tempPGPlugin,
        options: { config: dbConfig.settings },
      }
    ]);

    await server.register([
      {
        plugin: HapiRouter,
        options: {
          routes: 'routes/*.js'
        }
      },
    ]);

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

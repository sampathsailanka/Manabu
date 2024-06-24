// "use strict";

// exports.migrate = async (db, opt) => {
//   const type = opt.dbm.dataType;

//   await db.createTable("users", {
//     id: {
//       type: "uuid",
//       primaryKey: true,
//       notNull: true,
//       defaultValue: new String("gen_random_uuid()"),
//     },
//     name: {
//       type: "string",
//       notNull: true,
//     },
//     email: {
//       type: "string",
//       notNull: true,
//     },
//     password: {
//       type: "string",
//       notNull: true,
//     },
//     role: {
//       type: "string",
//       defaultValue: "user",
//       notNull: true,
//       check: "role IN ('admin', 'user', 'tutor')",
//     },
//     createdAt: {
//       type: "timestamp",
//       notNull: true,
//       defaultValue: new Date(),
//     },
//     updatedAt: {
//       type: "timestamp",
//       notNull: true,
//       defaultValue: new Date(),
//     },
//   });
// };

// exports._meta = {
//   version: 2,
// };

"use strict";

exports.up = function (db) {
  return db.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      defaultValue: db.runSql.bind(db, `uuid_generate_v4()`),
    },
    username: {
      type: "string",
      notNull: true,
    },
    email: {
      type: "string",
      notNull: true,
      unique: true,
    },
    password: {
      type: "string",
      notNull: true,
    },
    role: {
      type: "string",
      notNull: true,
      defaultValue: "user",
      check: "role IN ('admin', 'user', 'tutor')",
    },
    createdAt: {
      type: "timestamp",
      notNull: true,
      defaultValue: new Date(),
    },
    updatedAt: {
      type: "timestamp",
      notNull: true,
      defaultValue: new Date(),
    },
  });
};

exports.down = function (db) {
  return db.dropTable("users");
};

exports._meta = {
  version: 1,
};

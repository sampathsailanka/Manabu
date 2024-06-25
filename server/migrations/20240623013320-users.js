"use strict";
exports.migrate = async (db, opt) => {
  const type = opt.dbm.dataType;
  await db.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      autoIncrement: true,
      // defaultValue: { raw: "gen_random_uuid()" }, // Use raw to include the function call correctly
    },
    name: {
      type: type.STRING,
      notNull: true,
    },
    email: {
      type: type.STRING,
      notNull: true,
      unique: true
    },
    password: {
      type: type.STRING,
      notNull: true,
    },
    role: {
      type: "string",
      defaultValue: "user",
      notNull: true,
      check: "role IN ('admin', 'user', 'tutor')",
    },
    createdAt: {
      type: "TIMESTAMPTZ",
      notNull: true,
      defaultValue: { raw: "CURRENT_TIMESTAMP()" }, // Use raw to include the current timestamp function
    },
    updatedAt: {
      type: "TIMESTAMPTZ",
      notNull: true,
      defaultValue: { special: "CURRENT_TIMESTAMP" },
      onUpdate: {
        special: 'NOW'
      }
    },
  });
};
exports._meta = {
  version: 2,
};
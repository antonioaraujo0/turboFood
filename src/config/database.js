const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "turbofood",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  logging: false,
  dialectOptions: {
    ssl:
      process.env.DB_SSL === "true"
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
});

module.exports = sequelize;

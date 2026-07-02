const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";

let sequelize;

if (process.env.DATABASE_URL) {
  // Render (e outros PaaS) fornecem a conexão pronta em DATABASE_URL.
  // O Postgres gerenciado do Render exige SSL.
  const useSsl =
    process.env.DB_SSL === "true" ||
    isProduction ||
    /render\.com/.test(process.env.DATABASE_URL);

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: useSsl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  });
} else if (process.env.DB_DIALECT === "sqlite") {
  // Fallback local/dev: banco em arquivo, sem servidor Postgres.
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || "./database.sqlite",
    logging: false,
  });
} else {
  // Postgres local via variáveis discretas.
  sequelize = new Sequelize({
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
}

module.exports = sequelize;

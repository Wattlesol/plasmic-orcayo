module.exports = {
  type: "postgres",

  // If DATABASE_URI exists → use it. Otherwise fallback to individual fields.
  url: process.env.DATABASE_URI || null,

  host: process.env.DATABASE_URI ? undefined : (process.env.WAB_DBHOST || process.env.DB_HOST || "localhost"),
  port: process.env.DATABASE_URI ? undefined : (process.env.WAB_DBPORT || process.env.DB_PORT || 5432),
  username: process.env.DATABASE_URI ? undefined : (process.env.WAB_DBUSER || process.env.DB_USER || "wab"),
  password: process.env.DATABASE_URI ? undefined : (process.env.WAB_DBPASSWORD || process.env.DB_PASS || "SEKRET"),
  database: process.env.DATABASE_URI ? undefined : (process.env.WAB_DBNAME || process.env.DB_NAME || "wab"),

  synchronize: false,
  dropSchema: false,
  logging: false,

  entities: ["src/wab/server/entities/**/*.ts"],
  migrations: ["src/wab/server/migrations/**/*.ts"],
  subscribers: ["src/wab/server/subscribers/**/*.ts"],

  cli: {
    entitiesDir: "src/wab/server/entities",
    migrationsDir: "src/wab/server/migrations",
    subscribersDir: "src/wab/server/subscribers"
  }
};

import { DataSource } from "typeorm";
import "reflect-metadata"; // TypeORM requires this

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.WAB_DBHOST || process.env.DB_HOST || "plasmic-db",
  port: parseInt(process.env.WAB_DBPORT || process.env.DB_PORT || "5432"),
  username: process.env.WAB_DBUSER || process.env.DB_USER || "wab",
  password: process.env.WAB_DBPASSWORD || process.env.DB_PASS || "SEKRET",
  database: process.env.WAB_DBNAME || process.env.DB_NAME || "wab",
  synchronize: false,
  dropSchema: false,
  logging: false,
  entities: [
    "./src/wab/server/entities/**/*.ts",
    "./dist/src/wab/server/entities/**/*.js"
  ],
  migrations: [
    "./src/wab/server/migrations/**/*.ts",
    "./dist/src/wab/server/migrations/**/*.js"
  ],
  subscribers: [
    "./src/wab/server/subscribers/**/*.ts",
    "./dist/src/wab/server/subscribers/**/*.js"
  ]
});

export default AppDataSource;
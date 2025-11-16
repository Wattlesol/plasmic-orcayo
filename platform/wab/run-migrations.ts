// Script to run TypeORM migrations programmatically using the application's existing connection management
import { 
  ensureDbConnections, 
  maybeMigrateDatabase, 
  closeDbConnections
} from "./src/wab/server/db/DbCon";
import { DEFAULT_DATABASE_URI } from "./src/wab/server/config";

async function runMigrations() {
  try {
    console.log("Setting up database connections and running migrations...");
    
    // Use the application's existing database connection setup
    await ensureDbConnections(DEFAULT_DATABASE_URI, {
      useEnvPassword: true
    });
    
    // Run the migrations using the application's standard method
    await maybeMigrateDatabase();
    
    console.log("Migrations completed successfully!");
    
    // Close connections
    await closeDbConnections();
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

runMigrations();
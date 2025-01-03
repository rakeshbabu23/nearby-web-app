// require("dotenv").config();
// const { createApp } = require("./src/app/app");
// const { Connect } = require("./src/lib/db");

// // Port

// // App
// Connect().then(() => {
//   console.log("Database connected successfully");
// });
// try {
//   const app = createApp();
// } catch (error) {
//   process.exit(1);
// }
// index.js or server.js
require("dotenv").config();
const { createApp } = require("./src/app/app");
const { Connect } = require("./src/lib/db");

async function startServer() {
  try {
    // First connect to the database
    await Connect();
    console.log("Database connected successfully");

    // Then create and start the app
    const server = createApp();

    // Error handling for the server
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

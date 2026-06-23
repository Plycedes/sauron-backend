import { setServers, setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");
setServers(["8.8.8.8", "8.8.4.4"]);

import env from "./config/env";
import { app } from "./app";
import { connectDB } from "./config/db";

const start = async () => {
	await connectDB();

	const server = app.listen(env.port, () => {
		console.log(`\nServer running on http://localhost:${env.port}`);
		console.log(`   Environment : ${env.nodeEnv}`);
		console.log(`   Health check: http://localhost:${env.port}/health\n`);
	});

	const shutdown = async (signal: string) => {
		console.log(`\n ${signal} received — shutting down gracefully...`);

		server.close(async () => {
			console.log("HTTP server closed");

			try {
				const mongoose = await import("mongoose");
				await mongoose.default.connection.close();
				console.log("MongoDB connection closed");
			} catch (err) {
				console.error("Error closing MongoDB:", err);
			}

			process.exit(0);
		});

		setTimeout(() => {
			console.error("Forced shutdown after timeout");
			process.exit(1);
		}, 10_000);
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));

	process.on("unhandledRejection", (reason) => {
		console.error("Unhandled Rejection:", reason);
		if (env.nodeEnv !== "production") process.exit(1);
	});

	process.on("uncaughtException", (err) => {
		console.error("Uncaught Exception:", err);
		process.exit(1);
	});
};

start();

import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local, s3 } from "emdash/astro";
import { postgres, sqlite } from "emdash/db";

// Postgres adapter for EmDash (or sqlite fallback if running local build without DB)
const rawConn = process.env.DATABASE_URL || process.env.EMDASH_DATABASE_URL;
const isPg = Boolean(rawConn && (rawConn.startsWith('postgres://') || rawConn.startsWith('postgresql://')));
const databaseConfig = isPg
	? postgres({
			connectionString: rawConn,
		})
	: sqlite({ url: "file:./data.db" });

// S3-compatible or local storage adapter
const storageConfig = process.env.STORAGE_DRIVER === "s3" && process.env.S3_BUCKET
	? s3({
			bucket: process.env.S3_BUCKET,
			region: process.env.S3_REGION || "auto",
			endpoint: process.env.S3_ENDPOINT,
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			baseUrl: process.env.S3_PUBLIC_BASE_URL || "/_emdash/api/media/file",
		})
	: local({
			directory: "./uploads",
			baseUrl: "/_emdash/api/media/file",
		});

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	publicDir: "../public",
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	vite: {
		plugins: [tailwindcss()],
		ssr: {
			external: ['pg', 'pg-native', 'node:sqlite'],
		},
		build: {
			rollupOptions: {
				external: ['pg', 'pg-native', 'node:sqlite'],
			},
		},
	},
	integrations: [
		react(),
		emdash({
			database: databaseConfig,
			storage: storageConfig,
		}),
	],
	devToolbar: { enabled: false },
});



/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Env } from "./types";

const ANNOUNCEMENTS_KEY = "dog-sales-announcements";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const kvEntry = await env.DOG_API.get(ANNOUNCEMENTS_KEY);
		if (!kvEntry) console.warn("Could not find announcements key from KV");

		return new Response(kvEntry || "[]", { status: 200 });
	},
};

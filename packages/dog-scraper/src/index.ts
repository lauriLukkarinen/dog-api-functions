/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */
import adapters from "./adapters";
import { Env } from "./types";
import { getAnnouncements, isExpired, putAnnouncements } from "./utils";

export default {
	async scheduled(
		_controller: ScheduledController,
		env: Env,
		_ctx: ExecutionContext
	): Promise<void> {
		const existingAnnouncements = await getAnnouncements(env);

		const firstExpiredIndex = existingAnnouncements.findIndex(isExpired(Date.now()));

		if (firstExpiredIndex !== -1) existingAnnouncements.splice(firstExpiredIndex);

		const ids = new Set(existingAnnouncements.map(announcement => announcement.id));

		const newAnnouncements = await Promise.all(
			adapters.map(adapter => adapter.listNewAnnouncements(ids))
		);

		await putAnnouncements(env, [...newAnnouncements.flat(), ...existingAnnouncements]);
	},
};

import { DogSalesAnnouncement } from "typings";

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	DOG_API: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export type AnnouncementAdapter = {
	listNewAnnouncements: ListAnnouncementsFromSource;
}

export type ListAnnouncementsFromSource = (existingIds: Set<string>) => Promise<DogSalesAnnouncement[]>;
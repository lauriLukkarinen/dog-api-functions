import { DogSalesAnnouncement } from "typings";
import { Env } from "./types";

const ANNOUNCEMENTS_KEY = "dog-sales-announcements";
const MONTH_IN_MILLIS = 2_629_746_000;

/**
 * Returns announcements from KV storage
 *
 * @param env worker env
 * @returns list of existing announcements
 */
export const getAnnouncements = async (env: Env): Promise<DogSalesAnnouncement[]> => {
	const { DOG_API } = env;
	const announcementsRaw = await DOG_API.get(ANNOUNCEMENTS_KEY);
	return announcementsRaw ? JSON.parse(announcementsRaw) : [];
};

/**
 * Puts given announcements to KV storage
 *
 * @param env worker env
 * @param list list of announcements
 */
export const putAnnouncements = async (env: Env, list: DogSalesAnnouncement[]): Promise<void> => {
	const { DOG_API } = env;
	return DOG_API.put(ANNOUNCEMENTS_KEY, JSON.stringify(list));
}

/**
 * Returns function that returns whether announcement is expired
 *
 * @param now now as timestamp
 */
export const isExpired = (now: number) => (announcement: DogSalesAnnouncement): boolean => {
	return now - new Date(announcement.createdAt).valueOf() >= MONTH_IN_MILLIS;
};
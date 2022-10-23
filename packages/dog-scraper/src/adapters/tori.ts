import * as cheerio from "cheerio";
import { AnnouncementSource, DogSalesAnnouncement } from "typings";
import { AnnouncementAdapter } from "../types";

/**
 * Translates given announcement item element to sales announcement
 *
 * @param element element to be translated
 */
const translateToSalesAnnouncement = async (element: cheerio.Element): Promise<DogSalesAnnouncement | undefined> => {
  try {

    const id = element.attribs["id"];
    const announcementUrl = element.attribs["href"];

    if (!id || !announcementUrl) throw Error(`Invalid ID "${id}" or announcement URL "${announcementUrl}"`);

    const announcementPageResponse = await fetch(announcementUrl);

    const $ = cheerio.load(await announcementPageResponse.text());

    const tealiumJson = $("script")
      .filter((_, element) => $(element).text().includes("var tealium_json = "))
      .text()
      .split("var tealium_json = ")
      .at(1)
      ?.trim()
      .slice(0, -1);

    const createdAt = tealiumJson ? new Date(JSON.parse(tealiumJson).listing_date) : undefined;

    const body = $("#blocket");

    const sellerInfo = body.find("#seller_info");
    const createdBy = sellerInfo
      .find("b[class=name]")
      .text();

    const location = sellerInfo
      .find("div[class='nohistory private']")
      .contents()
      .filter((_, element) => { console.log(element); return element.type === "text"; })
      .text()
      .trim();

    const content = body.find(".view_content");

    const imageUrls: string[] = [];

    body.find("#thumbs").find("span[class=thumb_link]").each((_, element) => {
      const url = element.attribs["href"];
      url && imageUrls.push(url);
    });

    const title = content
      .find("h1")
      .text();

    const details = content.find(".details");

    const description = details
      .find(".body")
      .text();

    const price = content
      .find(".price meta")
      .filter((_, element) => element.attribs["itemprop"] === "price")
      .attr("content") || "";

    const announcement: DogSalesAnnouncement = {
      source: AnnouncementSource.TORI,
      id: id,
      createdAt: createdAt || new Date(),
      createdBy: createdBy,
      title: title,
      description: description,
      location: location,
      price: price,
      imageUrls: imageUrls,
      externalLink: announcementUrl
    };

    return announcement;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

/**
 * Returns filter for new Tori announcement items
 *
 * @param existingIds existing announcement IDs
 */
const filterNewAnnouncementItemElements = (existingIds: Set<string>) => (_: number, element: cheerio.Element) => {
  const id = element.attribs["id"];

  return id?.startsWith("item_") && !existingIds.has(id) || false;
}

/**
 * Parses and returns announcements from response HTML structure
 *
 * @param response response from Tori announcement list page
 */
const getNewAnnouncementsFromResponse = async (response: Response, existingIds: Set<string>): Promise<DogSalesAnnouncement[]> => {
  const $ = cheerio.load(await response.text());

  const newAnnouncementElements = $(".list_mode_thumb").find("a").filter(filterNewAnnouncementItemElements(existingIds));

  const possibleNewAnnouncementPromises: Promise<DogSalesAnnouncement | undefined>[] = [];

  newAnnouncementElements.each((_, element) => {
    possibleNewAnnouncementPromises.push(translateToSalesAnnouncement(element))
  });

  const newAnnouncementPromises = possibleNewAnnouncementPromises.filter((item): item is Promise<DogSalesAnnouncement> => !!item);

  return Promise.all(newAnnouncementPromises);
}

/**
 * Tori adapter for announcements
 */
const toriAdapter: AnnouncementAdapter = {
  listNewAnnouncements: async (existingIds: Set<string>) => {
    const response = await fetch("https://www.tori.fi/koko_suomi/lemmikkielaimet/koirat?ca=18&cg=4040&st=s&c=4042&w=3&o=1");
    return await getNewAnnouncementsFromResponse(response, existingIds);
  },
}

export default toriAdapter;
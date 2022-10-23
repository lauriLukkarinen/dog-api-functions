/**
 * Announcement source
 */
export enum AnnouncementSource {
  TORI,
  KOIRATORI,
  KODITTOMAT
}

/**
 * Dog sales announcement
 */
export interface DogSalesAnnouncement {
  source: AnnouncementSource;
  createdAt: Date;
  createdBy: string;
  description: string;
  id: string;
  imageUrls: string[];
  location: string;
  price: string;
  title: string;
  externalLink: string;
}
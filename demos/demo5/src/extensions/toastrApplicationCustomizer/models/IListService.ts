import { NotificationItem } from ".";
import { Guid } from "@microsoft/sp-core-library";

export interface IListService {
    getNotifications(baseUrl: string, webId: Guid): Promise<Array<NotificationItem>>;
}
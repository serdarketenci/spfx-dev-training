import { NotificationItem, INotificationStatus } from ".";

export interface INotificationCache {
    Loaded?: Date;
    NotificationItems: NotificationItem[];
    NotificationStatuses: INotificationStatus[];
}
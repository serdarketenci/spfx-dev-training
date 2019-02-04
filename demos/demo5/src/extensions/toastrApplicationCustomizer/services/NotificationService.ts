import { sp, Web } from '@pnp/sp';
import { IListService, NotificationItem, INotificationStatus, FrequencyType, INotificationCache, Constants } from '../models';
import { SeverityType } from '../models/SeverityType';
import { Guid } from '@microsoft/sp-core-library';

export class NotificationService implements IListService {

    private static instance: NotificationService;

    private constructor() {
    }

    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    //***********************
    //Public Methods
    //***********************

    getNotifications(baseUrl: string, webId: Guid): Promise<Array<NotificationItem>> {
        return new Promise((resolve, reject) => {

            this.ensureNotifications(baseUrl, webId)
                .then((notifications: NotificationItem[]): void => {
                    resolve(notifications);
                }).catch((error: any): void => {
                    reject(error);
                });

        });
    }

    public ACKnowledgeNotification(id: number, webId: Guid): void {
        let cachedData: INotificationCache = this.retrieveCache(webId);

        // Check if the status already exists, and if so update it
        //  otherwise, add a new status for the id
        let index: number = this.indexOfNotificationStatusById(id, cachedData.NotificationStatuses);
        if (index >= 0) {
            cachedData.NotificationStatuses[index].Ack = new Date();
        } else {
            cachedData.NotificationStatuses.push({
                Id: id,
                Ack: new Date()
            });
        }
        this.storeCache(cachedData, webId);
    }

    //***********************
    //localStorage Management
    //***********************

    private webStorageKey(webId: Guid): string {
        return `${Constants.STORAGE_KEY_BASE}_${webId}`;
    }

    private retrieveCache(webId: Guid): INotificationCache {
        //Pull data from localStorage if available and we previously cached it
        let cachedData: INotificationCache = localStorage ? JSON.parse(localStorage.getItem(this.webStorageKey(webId))) : undefined;
        if (cachedData) {
            cachedData.Loaded = new Date(cachedData.Loaded.valueOf()); //Rehydrate date from JSON (serializes to string)
        } else {
            //Initialize a new, empty object
            cachedData = {
                NotificationItems: [],
                NotificationStatuses: []
            };
        }
        return cachedData;
    }

    /** Serializes spfxNotificationr data into localStorage */
    private storeCache(cachedData: INotificationCache, webId: Guid): void {
        //Cache the data in localStorage when possible
        if (localStorage) {
            localStorage.setItem(this.webStorageKey(webId), JSON.stringify(cachedData));
        }
    }


    //***********************
    //Notification Retrieval
    //***********************

    /** Retrieves notifications from either the cache or the list depending on the cache's freshness */
    private ensureNotifications(baseUrl: string, webId: Guid): Promise<NotificationItem[]> {
        return new Promise<NotificationItem[]>((resolve: (notifications: NotificationItem[]) => void, reject: (error: any) => void): void => {

            let cachedData: INotificationCache = this.retrieveCache(webId);

            if (cachedData.Loaded) {
                //True Cache found, check if it is stale
                // anything older than 2 minutes will be considered stale
                let now: Date = new Date();
                let staleTime: Date = new Date(now.getTime() + -2 * 60000);

                if (cachedData.Loaded > staleTime && !Constants.GET_FROM_LIST_ALWAYS) {
                    //console.log('Pulled notifications from localStorage');
                    resolve(this.reduceNotifications(cachedData));
                    return;
                }
            }

            if ((window as any).spfxNotificationrLoadingData) {
                //Notifications are already being loaded! Briefly wait and try again
                window.setTimeout((): void => {
                    this.ensureNotifications(baseUrl, webId)
                        .then((notifications: NotificationItem[]): void => {
                            resolve(notifications);
                        });
                }, 100);
            } else {
                //Set a loading flag to prevent multiple data queries from firing
                //  this will be important should there be multiple consumers of the service on a single page
                (window as any).spfxNotificationrLoadingData = true;

                //Notifications need to be loaded, so let's go get them!
                this.getNotificationsFromList(baseUrl, webId)
                    .then((notifications: NotificationItem[]): void => {
                        //console.log('Pulled notifications from the list');
                        cachedData.NotificationItems = notifications;
                        cachedData.Loaded = new Date(); //Reset the cache timeout
                        cachedData = this.processCache(cachedData);

                        //Update the cache
                        this.storeCache(cachedData, webId);

                        //Clear the loading flag
                        (window as any).spfxNotificationrLoadingData = false;

                        //Give them some notification!
                        resolve(this.reduceNotifications(cachedData));
                    }).catch((error: any): void => {
                        reject(error);
                    });
            }
        });
    }

    /** Pulls the active notification entries directly from the underlying list */
    private getNotificationsFromList(baseUrl: string, webId: Guid): Promise<NotificationItem[]> {
        let select: string = "Id,Title,Severity,Frequency,Enabled,Message";
        let orderby: string = "StartDate asc";
        //Notifications are only shown during their scheduled window
        let now: string = new Date().toISOString();
        let filter: string = `(StartDate le datetime'${now}') and (EndDate ge datetime'${now}')`;

        return new Promise((resolve, reject) => {
            let web = new Web(baseUrl);

            web.lists
                .getByTitle(Constants.NOTIFICATION_LIST_TITLE)
                .items
                .select(select)
                .filter(filter)
                .orderBy(orderby)
                .getAll()
                .then((data) => {
                    let notifications: NotificationItem[] = [];
                    var test = SeverityType.Error;
                    var test2 = SeverityType["Info"];

                    for (let v of data) {
                        notifications.push({
                            Title: v.Title,
                            Id: v.Id,
                            Severity: <SeverityType>SeverityType[v.Severity],
                            Frequency: <FrequencyType>FrequencyType[v.Frequency],
                            Enabled: v.Enabled,
                            Message: v.Message
                        });

                        resolve(notifications);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }


    //***********************
    //Helper Functions
    //***********************

    /** Helper function to return the index of an NotificationItemStatus object by the Id property */
    private indexOfNotificationStatusById(Id: number, notificationStatuses: INotificationStatus[]): number {
        for (let i: number = 0; i < notificationStatuses.length; i++) {
            if (notificationStatuses[i].Id == Id) {
                return i;
            }
        }
        return -1;
    }

    /** Helper function to clean up the notification statuses by removing old notifications */
    private processCache(cachedData: INotificationCache): INotificationCache {
        //Setup a temporary array of Ids (makes the filtering easier)
        let activeIds: number[] = [];
        for (let notification of cachedData.NotificationItems) {
            activeIds.push(notification.Id);
        }

        //only keep the status info for notification that still matter (active)
        cachedData.NotificationStatuses = cachedData.NotificationStatuses.filter((value: INotificationStatus): boolean => {
            return activeIds.indexOf(value.Id) >= 0;
        });

        return cachedData;
    }

    /** Adjusts the notifications to display based on what the user has already acknowledged and the notification's frequency value*/
    private reduceNotifications(cachedData: INotificationCache): NotificationItem[] {
        return cachedData.NotificationItems.filter((notification: NotificationItem): boolean => {
            if (!notification.Enabled) {
                //Disabled notifications are still queried so that their status isn't lost
                // however, they shouldn't be displayed
                return false;
            }

            let tsIndex: number = this.indexOfNotificationStatusById(notification.Id, cachedData.NotificationStatuses);
            if (tsIndex >= 0) {
                let lastShown: Date = new Date(cachedData.NotificationStatuses[tsIndex].Ack.valueOf()); //Likely needs to be rehyrdated from JSON
                switch (notification.Frequency) {
                    case FrequencyType.Once:
                        //Already shown
                        return false;
                    case FrequencyType.Always:
                        return true;
                    default:
                        //Default behavior is Once Per Day
                        let now: Date = new Date();
                        if (now.getFullYear() !== lastShown.getFullYear()
                            || now.getMonth() !== lastShown.getMonth()
                            || now.getDay() !== lastShown.getDay()) {
                            //Last shown on a different day, so show it!
                            return true;
                        } else {
                            //Already shown today
                            return false;
                        }
                }
            } else {
                //No previous status means it needs to be shown
                return true;
            }
        });

    }
}

export default NotificationService.getInstance();
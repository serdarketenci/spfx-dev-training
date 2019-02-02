import Item from "./Item";
import { IWebPartContext } from "@microsoft/sp-webpart-base";

export interface IListService {
    getItems(listId: string): Promise<Array<Item>>;
    save(listId: string, item: Item): Promise<boolean>;
}
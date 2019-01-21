import Item from "./Item";
import { IWebPartContext } from "@microsoft/sp-webpart-base";

export interface IListService {
    getItems(): Promise<Array<Item>>;
    context: IWebPartContext;
    listName: string;
}
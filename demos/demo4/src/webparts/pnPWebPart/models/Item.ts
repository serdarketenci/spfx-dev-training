import { ObjectStateOptions } from "./ObjectStateOptions";


export default class Item {
    Title: string;
    Id?: number;
    ObjectStateOption:ObjectStateOptions;

    constructor(options: Item) {
        this.Title = options.Title;
        this.Id = options.Id;
        this.ObjectStateOption = options.ObjectStateOption;
    }
}
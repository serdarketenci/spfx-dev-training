

export default class Item {
    Title: string;
    Id: number;
    
    constructor(options: Item) {
        this.Title = options.Title;
        this.Id = options.Id;
    }
}
export default class WeatherItem {
    Title: string;
    Temp: string;
    IconUri: string;
    
    constructor(options: WeatherItem) {
        this.Title = options.Title;
        this.Temp = options.Temp;
        this.IconUri = options.IconUri;
    }
}
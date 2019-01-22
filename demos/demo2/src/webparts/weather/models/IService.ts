import WeatherItem from "./WeatherItem";

export interface IService {
    getItems(location:string): Promise<WeatherItem>;
}
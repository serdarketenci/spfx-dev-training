import WeatherItem from "./WeatherItem";

export interface IService {
    getItems(units: string, location: string): Promise<WeatherItem>;
}
import WeatherItem from "../models/WeatherItem";

export interface IWeatherState {
  item?: WeatherItem;
  isLoading:boolean;
  error?:Error;
  
}

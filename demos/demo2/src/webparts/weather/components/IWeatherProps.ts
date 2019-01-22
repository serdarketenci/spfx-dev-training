import { IService } from "../models/IService";

export interface IWeatherProps {
  weatherService: IService;
  location:string;
}
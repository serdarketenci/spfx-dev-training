import WeatherItem from '../models/WeatherItem';
import { IService } from '../models/IService';

import * as $ from 'jquery';

export class WeatherService implements IService {
    private static instance: WeatherService;

    private constructor() {
    }

    static getInstance() {
        if (!WeatherService.instance) {
            WeatherService.instance = new WeatherService();
        }
        return WeatherService.instance;
    }

    getItems(location: string): Promise<WeatherItem> {
        return new Promise((resolve, reject) => {

            $.ajax({
                dataType: "json",
                url: `https://api.openweathermap.org/data/2.5/weather?appid=001673e88732dd7e6a8643fc620f88a8&q=${location}&units=metric`,
                success: (response) => {
                    resolve({
                        Title: response.name,
                        IconUri: `http://openweathermap.org/img/w/${response.weather[0].icon}.png`,
                        Temp: response.main.temp.toFixed(0)
                    });
                },
                error: (error) => reject(error)
            });

            // alternative   
            // fetch(`https://api.openweathermap.org/data/2.5/weather?appid=001673e88732dd7e6a8643fc620f88a8&q=${location}&units=metric`).then(response => response.json())
            //     .then((response) => {
            //         resolve({
            //             Title: response.name,
            //             IconUri: `http://openweathermap.org/img/w/${response.weather[0].icon}.png`,
            //             Temp: response.main.temp.toFixed(0)
            //         });
            //     })
            //     .catch(error => reject(error));

        });
    }
}

export default WeatherService.getInstance();
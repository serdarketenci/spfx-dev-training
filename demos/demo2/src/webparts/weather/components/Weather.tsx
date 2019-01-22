import * as React from 'react';
import styles from './Weather.module.scss';
import { IWeatherProps } from './IWeatherProps';
import WeatherItem from '../models/WeatherItem';
import { IWeatherState } from './IWeatherState';

export default class Weather extends React.Component<IWeatherProps, IWeatherState> {
  constructor(props: IWeatherProps) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  public componentDidMount(): void {
    this.getWeather(this.props.location);
  }

  getWeather(province: string) {
    this.setState({ isLoading: true });
    this.props.weatherService.getItems(province).then((result: WeatherItem) => {
      this.setState({ item: result, isLoading: false });
    }).catch((err) => {
      this.setState({ error: err, isLoading: false });
      console.error('Weather', err);
    });
  }

  public render(): React.ReactElement<IWeatherProps> {
    var getCurrentTemp = () => {
      if (this.state && this.state.item) {
        return <div>
          <span className="img-scope">
            <img className="li-img" src={this.state.item.IconUri} />
          </span>
          <span className="li-title">{this.state.item.Title} </span>
          <span className="li-temp">
            {this.state.item.Temp}°C
              </span>
        </div>
      }
    }

    var getRender = () => {
      if (this.state.isLoading == true) {
        return <div>Yükleniyor...</div>
      }
      else if (this.state.error) {
        return <div>WebPart yüklenirken hata ile karşılaşıldı, lütfen console üzerinden görüntüleyiniz.</div>
      }
      else {
        return <div>
          {getCurrentTemp()}
        </div>
      }
    }


    return (
      <div className={styles.weather}>
        {getRender()}
      </div>
    );
  }
}

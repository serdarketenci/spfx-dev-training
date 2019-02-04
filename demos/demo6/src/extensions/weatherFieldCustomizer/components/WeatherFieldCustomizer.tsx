import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import styles from './WeatherFieldCustomizer.module.scss';
import { IService } from '../models/IService';
import WeatherItem from '../models/WeatherItem';

export interface IWeatherFieldCustomizerProps {
  units: string;
  location: string;
  weatherService: IService;
}

export interface IWeatherFieldCustomizerState {
  item?: WeatherItem;
  isLoading: boolean;
  error?: Error;
}

const LOG_SOURCE: string = 'WeatherFieldCustomizer';

export default class WeatherFieldCustomizer extends React.Component<IWeatherFieldCustomizerProps, IWeatherFieldCustomizerState> {
  constructor(props: IWeatherFieldCustomizerProps) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  @override
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: WeatherFieldCustomizer mounted');
    this.getWeather(this.props.units, this.props.location);
  }

  getWeather(units: string, province: string) {
    this.setState({ isLoading: true });
    this.props.weatherService.getItems(units, province).then((result: WeatherItem) => {
      this.setState({ item: result, isLoading: false });
    }).catch((err) => {
      this.setState({ error: err, isLoading: false });
      console.error('Weather', err);
    });
  }

  @override
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: WeatherFieldCustomizer unmounted');
  }

  @override
  public render(): React.ReactElement<{}> {
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
        return <Spinner size={SpinnerSize.large} label="loading..." ariaLive="assertive" />
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
      <div className={styles.cell}>
        {getRender()}
      </div>
    );
  }
}

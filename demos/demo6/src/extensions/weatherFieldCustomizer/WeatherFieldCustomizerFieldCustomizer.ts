import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'WeatherFieldCustomizerFieldCustomizerStrings';
import WeatherFieldCustomizer, { IWeatherFieldCustomizerProps } from './components/WeatherFieldCustomizer';
import WeatherService from './services/WeatherService';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IWeatherFieldCustomizerFieldCustomizerProperties {
  // This is an example; replace with your own property
  units?: string;
}

const LOG_SOURCE: string = 'WeatherFieldCustomizerFieldCustomizer';

export default class WeatherFieldCustomizerFieldCustomizer
  extends BaseFieldCustomizer<IWeatherFieldCustomizerFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated WeatherFieldCustomizerFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "WeatherFieldCustomizerFieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    // Use this method to perform your custom cell rendering.
    const units: string = this.properties.units;

    const weatherFieldCustomizer: React.ReactElement<{}> =
      React.createElement(WeatherFieldCustomizer, {
        units: units,
        location: event.fieldValue,
        weatherService: WeatherService
      });

    ReactDOM.render(weatherFieldCustomizer, event.domElement);
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'WeatherWebPartStrings';
import Weather from './components/Weather';
import { IWeatherProps } from './components/IWeatherProps';
import WeatherService from './services/WeatherService';

import { SPComponentLoader, ILoadScriptOptions } from '@microsoft/sp-loader';

export interface IWeatherWebPartProps {
  location: string;
}

export default class WeatherWebPart extends BaseClientSideWebPart<IWeatherWebPartProps> {

  public render(): void {
    SPComponentLoader.loadScript('https://code.jquery.com/jquery-3.1.0.min.js', {
      globalExportsName: 'jQuery'
    }).then(($: any) => {
      const element: React.ReactElement<IWeatherProps> = React.createElement(
        Weather,
        {
          weatherService: WeatherService,
          location: this.properties.location
        }
      );

      ReactDom.render(element, this.domElement);
    });

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneLocation
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('location', {
                  label: strings.LocationFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

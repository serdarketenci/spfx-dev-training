import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'HelloWorldWebPartStrings';
import HelloWorld from './components/HelloWorld';
import { IHelloWorldProps } from './components/IHelloWorldProps';
import { IListService } from './models/IListService';
import HelloWorldService from './services/HelloWorldService';
import HelloWorldServiceMock from './services/HelloWorldServiceMock';

export interface IHelloWorldWebPartProps {
  listName: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  private _listService: IListService;

  protected onInit(): Promise<void> {
    if (Environment.type === EnvironmentType.Local) {
      this._listService = HelloWorldServiceMock;
    } else {
      this._listService = HelloWorldService;
    }

    this._listService.context = this.context;
    this._listService.listName = this.properties.listName;

    return super.onInit();
  }

  public setReactComponent() {
    const element: React.ReactElement<IHelloWorldProps> = React.createElement(
      HelloWorld,
      {
        listService: this._listService,
      }
    );
    ReactDom.render(element, this.domElement);
  }

  public render(): void {
    this.setReactComponent();
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
            description: strings.PropertyPaneHelloWorld
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

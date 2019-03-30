import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'HelloTeamsTabWebPartStrings';
import HelloTeamsTab from './components/HelloTeamsTab';
import { IHelloTeamsTabProps } from './components/IHelloTeamsTabProps';
import * as microsoftTeams from '@microsoft/teams-js';

export interface IHelloTeamsTabWebPartProps {
}

export default class HelloTeamsTabWebPart extends BaseClientSideWebPart<IHelloTeamsTabWebPartProps> {
  // This variable has been added
  private _teamsContext: microsoftTeams.Context;

  protected onInit(): Promise<any> {
    let retVal: Promise<any> = Promise.resolve();
    if (this.context.microsoftTeams) {
      retVal = new Promise((resolve, reject) => {
        this.context.microsoftTeams.getContext(context => {
          this._teamsContext = context;
          resolve();
        });
      });
    }
    return retVal;
  }

  public render(): void {
    let title: string = '';
    let subTitle: string = '';
    let siteTabTitle: string = '';

    if (this._teamsContext) {
      // We have teams context for the web part
      title = "Welcome to Teams!";
      subTitle = "Building custom enterprise tabs for your business.";
      siteTabTitle = "We are in the context of following Team: " + this._teamsContext.teamName;
    }
    else {
      // We are rendered in normal SharePoint context
      title = "Welcome to SharePoint!";
      subTitle = "Customize SharePoint experiences using Web Parts.";
      siteTabTitle = "We are in the context of following site: " + this.context.pageContext.web.title;
    }

    const element: React.ReactElement<IHelloTeamsTabProps> = React.createElement(
      HelloTeamsTab,
      {
        title,
        subTitle,
        siteTabTitle
      }
    );

    ReactDom.render(element, this.domElement);
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
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
              ]
            }
          ]
        }
      ]
    };
  }
}

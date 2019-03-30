import * as React from 'react';
import styles from './HelloTeamsTab.module.scss';
import { IHelloTeamsTabProps } from './IHelloTeamsTabProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class HelloTeamsTab extends React.Component<IHelloTeamsTabProps, {}> {
  public render(): React.ReactElement<IHelloTeamsTabProps> {
    return (
      <div className={ styles.helloTeamsTab }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>{this.props.title}</span>
              <p className={ styles.subTitle }>{this.props.subTitle}</p>
              <p className={ styles.subTitle }>{this.props.siteTabTitle}</p>
              <a href="https://aka.ms/spfx" className={ styles.button }>
                <span className={ styles.label }>Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

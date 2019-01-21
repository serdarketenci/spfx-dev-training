import * as React from 'react';
import styles from './HelloWorld.module.scss';
import { IHelloWorldProps } from './IHelloWorldProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IHelloWorldState } from './IHelloWorldState';
import Item from '../models/Item';

export default class HelloWorld extends React.Component<IHelloWorldProps, IHelloWorldState> {

  constructor(props: IHelloWorldProps) {
    super(props);
    this.state = {
      items: new Array<Item>(),
      loading: true
    };
  }

  public getListItems() {
    this.props.listService.getItems().then((data: Array<Item>) => {
      this.setState({ items: data, loading: false });
    }).catch((err) => {
      this.setState({ error: err, loading: false });
      console.error('HelloWorld', err);
    });
  }

  public componentDidMount(): void {
    this.getListItems();
  }
 
  public render(): React.ReactElement<IHelloWorldProps> {

    var getItemRender = this.state.items.map((listItem, i) => {
      return <li key={i}>
        {listItem.Title}
      </li>;
    });

    var getRender = () => {
      if (this.state.loading == true) {
        return <div>Yükleniyor...</div>
      }
      else if (this.state.error) {
        return <div>WebPart yüklenirken hata ile karşılaşıldı, lütfen console üzerinden görüntüleyiniz.</div>
      }
      else {
        return <div>
          <h1>{this.props.listService.listName}</h1>
          <ul>
            {getItemRender}
          </ul>
        </div>
      }
    }

    return (
      <div className={styles.helloWorld}>
        {getRender()}
      </div>
    );
  }
}

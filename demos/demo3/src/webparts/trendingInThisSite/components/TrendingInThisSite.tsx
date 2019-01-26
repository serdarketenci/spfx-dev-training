import * as React from 'react';
import styles from './TrendingInThisSite.module.scss';
import {
  DocumentCard,
  DocumentCardPreview,
  DocumentCardTitle,
  DocumentCardActivity,
  Spinner
} from 'office-ui-fabric-react';
import { ITrendingInThisSiteProps } from '../../models/ITrendingInThisSiteProps';
import { ITrendingInThisSiteState } from '../../models/ITrendingInThisSiteState';
import { ITrendingDocument } from '../../models/ITrendingDocument';

export default class TrendingInThisSite extends React.Component<ITrendingInThisSiteProps, ITrendingInThisSiteState> {

  constructor(props: ITrendingInThisSiteProps, state: ITrendingInThisSiteState) {
    super(props);

    this.state = {
      trendingDocuments: new Array<ITrendingDocument>(),
      loading: true,
      error: null
    };
  }

  public componentDidMount(): void {
    this.props.spService.getTrendingContent(this.props.siteUrl, this.props.numberOfDocuments).then((trendingDocuments: ITrendingDocument[]) => {
      this.setState({ trendingDocuments, loading: false });
    }).catch((error)=>{
      this.setState({ error, loading: false });
    });
  }

  public componentDidUpdate(prevProps: ITrendingInThisSiteProps, prevState: ITrendingInThisSiteState, prevContext: any): void {
    if (this.props.numberOfDocuments !== prevProps.numberOfDocuments ||
      this.props.siteUrl !== prevProps.siteUrl && (
        this.props.numberOfDocuments && this.props.siteUrl
      )) {
    }
  }

  public render(): React.ReactElement<ITrendingInThisSiteProps> {
    const loading: JSX.Element = this.state.loading ? <div style={{ margin: '0 auto' }}><Spinner label={'Loading...'} /></div> : <div />;
    const error: JSX.Element = this.state.error ? <div><strong>Error:</strong> {this.state.error}</div> : <div />;
    const documents: JSX.Element[] = this.state.trendingDocuments.map((doc: ITrendingDocument, i: number) => {
      const iconUrl: string = `https://spoprod-a.akamaihd.net/files/odsp-next-prod_ship-2016-08-15_20160815.002/odsp-media/images/filetypes/32/${doc.extension}.png`;
      return (
        <DocumentCard onClickHref={doc.url} key={doc.id}>
          <DocumentCardPreview
            previewImages={[
              {
                previewImageSrc: doc.previewImageUrl,
                iconSrc: iconUrl,
                width: 318,
                height: 196,
                accentColor: '#ce4b1f'
              }
            ]}
          />
          <DocumentCardTitle title={doc.title} />
          <DocumentCardActivity
            activity={'Modified ' + doc.lastModifiedTime}
            people={
              [
                { name: doc.lastModifiedByName, profileImageSrc: doc.lastModifiedByPhotoUrl }
              ]
            }
          />
        </DocumentCard>
      );
    });
    return (
      <div className={styles.trendingInThisSite}>
        {loading}
        {error}
        {documents}
        <div style={{ clear: 'both' }} />
      </div>
    );
  }
}

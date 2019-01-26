import IService from "../models/IService";
import { ITrendingDocument } from "../models/ITrendingDocument";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";


export class TrendingContentServices implements IService {
    spHttpClient;

    private static instance: TrendingContentServices;

    private constructor() {
    }

    static getInstance() {
        if (!TrendingContentServices.instance) {
            TrendingContentServices.instance = new TrendingContentServices();
        }
        return TrendingContentServices.instance;
    }

    private getValueFromResults(key: string, results: ISearchResultValue[]): string {
        let value: string = '';

        if (results != null && results.length > 0 && key != null) {
            for (let i: number = 0; i < results.length; i++) {
                const resultItem: ISearchResultValue = results[i];
                if (resultItem.Key === key) {
                    value = resultItem.Value;
                    break;
                }
            }
        }

        return value;
    }

    private getPreviewImageUrl(result: ISearchResultValue[], siteUrl: string): string {
        const uniqueID: string = this.getValueFromResults('uniqueID', result);
        const siteId: string = this.getValueFromResults('siteID', result);
        const webId: string = this.getValueFromResults('webID', result);
        const docId: string = this.getValueFromResults('DocId', result);
        if (uniqueID !== null && siteId !== null && webId !== null && docId !== null) {
            return `${siteUrl}/_layouts/15/getpreview.ashx?guidFile=${uniqueID}&guidSite=${siteId}&guidWeb=${webId}&docid=${docId}
          &metadatatoken=300x424x2&ClientType=CodenameOsloWeb&size=small`;
        }
        else {
            return '';
        }
    }

    private getUserPhotoUrl(userEmail: string, siteUrl: string): string {
        return `${siteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${userEmail}`;
    }

    private trim(s: string): string {
        if (s != null && s.length > 0) {
            return s.replace(/^\s+|\s+$/gm, '');
        }
        else {
            return s;
        }
    }

    getTrendingContent(siteUrl: string, numberOfDocuments: number): Promise<ITrendingDocument[]> {
        var postData = JSON.stringify({
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': 'path:' + siteUrl,
                'SelectProperties': {
                    'results': ['Author', 'AuthorOwsUser', 'DocId', 'DocumentPreviewMetadata', 'Edges', 'Editor', 'EditorOwsUser', 'FileExtension', 'FileType', 'HitHighlightedProperties', 'HitHighlightedSummary', 'LastModifiedTime', 'LikeCountLifetime', 'ListID', 'ListItemID', 'OriginalPath', 'Path', 'Rank', 'SPWebUrl', 'SecondaryFileExtension', 'ServerRedirectedURL', 'SiteTitle', 'Title', 'ViewCountLifetime', 'siteID', 'uniqueID', 'webID']
                },
                'ClientType': 'TrendingInThisSite',
                'BypassResultTypes': 'true',
                'RowLimit': numberOfDocuments,
                'StartRow': '0',
                'RankingModelId': '0c77ded8-c3ef-466d-929d-905670ea1d72',
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'Rank',
                            'Direction': '0'
                        },
                        {
                            'Property': 'Created',
                            'Direction': '0'
                        },
                        {
                            'Property': 'FileExtension',
                            'Direction': '1'
                        }
                    ]
                }
            }
        });

        const spOpt = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': ''
            },
            body: postData
        };

        return new Promise((resolve, reject) => {
            this.spHttpClient.post(siteUrl + "/_api/search/postquery", SPHttpClient.configurations.v1, spOpt)
                .then((response: SPHttpClientResponse) => {
                    return response.json();
                }).then((data) => {
                    const trendingContent: ITrendingDocument[] = [];
                    if (data.PrimaryQueryResult && data.PrimaryQueryResult.RelevantResults &&
                        data.PrimaryQueryResult.RelevantResults.Table.Rows.length > 0) {
                        data.PrimaryQueryResult.RelevantResults.Table.Rows.forEach((row: any): void => {
                            const cells: ISearchResultValue[] = row.Cells;
                            const editorInfoValue: string = this.getValueFromResults('EditorOwsUser', cells);
                            const editorInfo: string[] = editorInfoValue ? editorInfoValue.split('|') : ["", ""];
                            const modifiedDateValue = this.getValueFromResults('LastModifiedTime', cells);
                            const modifiedDate: Date = modifiedDateValue ? new Date(modifiedDateValue.replace('.0000000', '')) : new Date();
                            const dateString: string = (modifiedDate.getMonth() + 1) + '/' + modifiedDate.getDate() + '/' + modifiedDate.getFullYear();
                            trendingContent.push({
                                id: this.getValueFromResults('DocId', cells),
                                url: this.getValueFromResults('Path', cells),
                                title: this.getValueFromResults('Title', cells),
                                previewImageUrl: this.getPreviewImageUrl(cells, siteUrl),
                                lastModifiedTime: dateString,
                                lastModifiedByName: this.trim(editorInfo[1]),
                                lastModifiedByPhotoUrl: this.getUserPhotoUrl(this.trim(editorInfo[0]), siteUrl),
                                extension: this.getValueFromResults('FileType', cells)
                            });
                        });
                    }
                    resolve(trendingContent);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}

export default TrendingContentServices.getInstance();
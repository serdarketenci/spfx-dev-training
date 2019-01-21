import Item from '../models/Item';
import { IListService } from '../models/IListService';
import {
    SPHttpClient,
    SPHttpClientResponse
} from '@microsoft/sp-http';
import { IWebPartContext } from '../../../../node_modules/@microsoft/sp-webpart-base';
import { isNull, isEmpty } from 'lodash';

export class HelloWorldService implements IListService {

    context: IWebPartContext;
    listName: string;
    private static instance: HelloWorldService;

    private constructor() {
    }

    static getInstance() {
        if (!HelloWorldService.instance) {
            HelloWorldService.instance = new HelloWorldService();
        }
        return HelloWorldService.instance;
    }

    getItems(): Promise<Array<Item>> {
        return new Promise((resolve, reject) => {
            if (isNull(this.listName) == false && isEmpty(this.listName) == false) {
                this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('${this.listName}')/items?$select=Title,Id`, SPHttpClient.configurations.v1)
                    .then((response: SPHttpClientResponse) => {
                        return response.json();
                    }).then((result) => {
                        resolve(result.value.map((spItem) => {
                            return new Item({
                                Id: spItem.Id,
                                Title: spItem.Title
                            })
                        }));
                    });

            }
            else {
                reject("Lütfen 'listName' parametresini giriniz.");
            }
        });
    }
}

export default HelloWorldService.getInstance();
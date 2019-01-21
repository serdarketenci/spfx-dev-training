import Item from '../models/Item';
import { IListService } from '../models/IListService';
import { IWebPartContext } from '../../../../node_modules/@microsoft/sp-webpart-base';
import { isNull,isEmpty } from 'lodash';


export class HelloWorldServiceMock implements IListService {
    context: IWebPartContext;
    listName: string;
    private static instance: HelloWorldServiceMock;

    private constructor() {
    }

    static getInstance() {
        if (!HelloWorldServiceMock.instance) {
            HelloWorldServiceMock.instance = new HelloWorldServiceMock();
        }
        return HelloWorldServiceMock.instance;
    }

    getItems(): Promise<Array<Item>> {
        return new Promise((resolve, reject) => {
            if (isNull(this.listName) == false && isEmpty(this.listName) == false) {
                const fakeData: Array<Item> = [
                    {
                        Id: 0,
                        Title: "Title 1"
                    },
                    {
                        Id: 1,
                        Title: "Title 2"
                    },
                    {
                        Id: 2,
                        Title: "Title 3"
                    },
                    {
                        Id: 3,
                        Title: "Title 4"
                    },
                    {
                        Id: 4,
                        Title: "Title 5"
                    },
                ];

                resolve(fakeData);
            } else {
                reject("Lütfen 'listName' parametresini giriniz.");
            }

        });
    }
}

export default HelloWorldServiceMock.getInstance();
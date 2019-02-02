import Item from '../models/Item';
import { IListService } from '../models/IListService';
import { sp } from '@pnp/sp';
import { ObjectStateOptions } from '../models/ObjectStateOptions';

export class PnPService implements IListService {

    private static instance: PnPService;

    private constructor() {
    }

    static getInstance() {
        if (!PnPService.instance) {
            PnPService.instance = new PnPService();
        }
        return PnPService.instance;
    }

    getItems(listId: string): Promise<Array<Item>> {
        return new Promise((resolve, reject) => {
            sp.web.lists.getById(listId)
                .items
                .select("Id,Title")
                .getAll()
                .then((data) => {
                    resolve(data.map((item) => {
                        return new Item({
                            Id: item.Id,
                            Title: item.Title,
                            ObjectStateOption: ObjectStateOptions.Pristine
                        })
                    }))
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private addItem(listId: string, item: Item): Promise<boolean> {
        return new Promise((resolve, reject) => {
            sp.web.lists.getById(listId)
                .items
                .add({
                    Title: item.Title
                })
                .then((data) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private updateItem(listId: string, item: Item): Promise<boolean> {
        return new Promise((resolve, reject) => {
            sp.web.lists.getById(listId)
                .items
                .getById(item.Id)
                .update({
                    Title: item.Title
                })
                .then((data) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private deleteItem(listId: string, item: Item): Promise<boolean> {
        return new Promise((resolve, reject) => {
            sp.web.lists.getById(listId)
                .items
                .getById(item.Id)
                .delete()
                .then((data) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    save(listId: string, item: Item): Promise<boolean> {

        switch (item.ObjectStateOption) {
            case ObjectStateOptions.Added:
                return this.addItem(listId, item)
            case ObjectStateOptions.Dirty:
                return this.updateItem(listId, item)
            case ObjectStateOptions.Removed:
                return this.deleteItem(listId, item)
        }
    }
}

export default PnPService.getInstance();
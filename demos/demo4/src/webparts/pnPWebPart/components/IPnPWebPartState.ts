import Item from "../models/Item";

export interface IPnPWebPartState {
    showPanel: boolean;
    hideDialog: boolean;
    items: Item[];
    loading?: boolean;
    showPlaceholder?: boolean;
    enableEditAndDeleteButton: boolean;
    selectedItem?: Item
}

import Item from "../../models/Item";

export interface IPanelItemProps {
  item?: Item;
  showPanel: boolean;
  onSave(item: Item): Function;
  onCancel(): Function;
}

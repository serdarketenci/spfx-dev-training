import Item from "../models/Item";

export interface IHelloWorldState {
  items: Array<Item>;
  loading:boolean;
  error?:Error;
}
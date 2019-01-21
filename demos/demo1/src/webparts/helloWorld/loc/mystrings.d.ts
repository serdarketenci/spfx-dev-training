declare interface IHelloWorldWebPartStrings {
  PropertyPaneHelloWorld: string;
  BasicGroupName: string;
  ListNameFieldLabel: string;
}

declare module 'HelloWorldWebPartStrings' {
  const strings: IHelloWorldWebPartStrings;
  export = strings;
}

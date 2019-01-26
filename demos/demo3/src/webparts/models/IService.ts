import { ITrendingDocument } from "./ITrendingDocument";
import { SPHttpClient } from "@microsoft/sp-http";

export default interface IService {
    getTrendingContent(siteUrl:string, numberOfDocuments: number): Promise<ITrendingDocument[]>;
    spHttpClient:SPHttpClient;
}
import { ITrendingDocument } from "./ITrendingDocument";

export interface ITrendingInThisSiteState {
    trendingDocuments: ITrendingDocument[];
    loading: boolean;
    error: string;
  }
  
import { ITrendingInThisSiteWebPartProps } from "./ITrendingInThisSiteWebPartProps";
import IService from "./IService";


export interface ITrendingInThisSiteProps extends ITrendingInThisSiteWebPartProps {
  siteUrl: string;
  spService:IService;
}
import Employee from "../models/Employee";

export interface IOrgChartState {
  error?: Error;
  isLoading:boolean;
  employees:Employee[];
}

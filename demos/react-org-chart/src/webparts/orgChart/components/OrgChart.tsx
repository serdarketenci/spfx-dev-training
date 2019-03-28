import * as React from 'react';
import styles from './OrgChart.module.scss';
import { IOrgChartProps } from './IOrgChartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IOrgChartState } from './IOrgChartState';
import Employee from '../models/Employee';
import {
  Spinner, SpinnerSize
} from 'office-ui-fabric-react';
require("spOrgChart");

export default class OrgChart extends React.Component<IOrgChartProps, IOrgChartState> {

  constructor(props: IOrgChartProps) {
    super(props);
    this.state = {
      isLoading: true,
      employees: new Array<Employee>()
    }
  }

  private _getEmployeeItems() {
    this.props.spService.getEmployees().then((employees: Employee[]) => {
      this.setState({
        isLoading: false,
        employees
      });
      this.initiliazeOrgChart(employees);
    }).catch((err: Error) => {
      this.setState({
        isLoading: false,
        error: err
      });
    })
  }

  private initiliazeOrgChart(employees: Employee[]) {
    var el: any = document.getElementById("tree");
    if (el) {
      var chart = new window["OrgChart"](el, {
        template: "rony",
        enableSearch: true,
        nodeBinding: {
          field_0: "Title",
          field_1: "JobTitle",
          field_2: "EMail",
          img_0: "PhotoUrl"
        },
        nodes: employees
      });
    }
  }

  public componentDidMount() {
    this._getEmployeeItems();
  }

  public render(): React.ReactElement<IOrgChartProps> {
    if (this.state.error) {
      return (
        <div>
          Error: {this.state.error.message}
        </div>
      );
    }

    if (this.state.isLoading) {
      return (
        <Spinner size={SpinnerSize.large} label="loading..." ariaLive="assertive" />
      );
    }

    return (
      <div className={styles.orgChart}>
        <div className={styles.container} id="tree">

        </div>
      </div>
    );
  }
}

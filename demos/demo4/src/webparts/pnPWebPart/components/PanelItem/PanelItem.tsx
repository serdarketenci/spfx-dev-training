import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IPanelItemProps } from './IPanelItemProps';
import Item from '../../models/Item';
import { ObjectStateOptions } from '../../models/ObjectStateOptions';
import { IPanelItemState } from './IPanelItemState';


export default class PanelItem extends React.Component<IPanelItemProps, IPanelItemState> {

  constructor(props: IPanelItemProps) {
    super(props);

    this.state = {
      item: new Item({
        Title: "",
        ObjectStateOption: ObjectStateOptions.Added
      })
    };

    this._handleInputChange = this._handleInputChange.bind(this);
    this._onClosePanel = this._onClosePanel.bind(this);
    this.saveItem = this.saveItem.bind(this);
  }

  public componentDidUpdate(prevProps: IPanelItemProps, prevState: any) {
    if (this.props.showPanel == true &&
      this.props.item !== undefined &&
      prevState.item !== this.props.item) {
      this.setState({
        item: this.props.item
      });
    }
  }


  private saveItem() {
    var item = this.state.item;
    this.props.onSave(item);
  }

  private _onClosePanel = (): void => {
    this.setState({item: new Item({
      Title: "",
      ObjectStateOption: ObjectStateOptions.Added
    })});
    this.props.onCancel()
  };

  private _handleInputChange(newValue: string) {
    var item = this.state.item;
    if (item.ObjectStateOption == ObjectStateOptions.Pristine && newValue !== item.Title) {
      item.ObjectStateOption = ObjectStateOptions.Dirty;
    }
    item.Title = newValue;
    this.setState({ item });
  }

  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <PrimaryButton onClick={this.saveItem} style={{ marginRight: '8px' }}>
          Save
        </PrimaryButton>
        <DefaultButton onClick={this._onClosePanel}>Cancel</DefaultButton>
      </div>
    );
  };

  public render(): React.ReactElement<IPanelItemProps> {
    return (
      <Panel
        isOpen={this.props.showPanel}
        type={PanelType.smallFixedFar}
        onDismiss={this._onClosePanel}
        closeButtonAriaLabel="Close"
        headerText="PnP Form"
        onRenderFooterContent={this._onRenderFooterContent}
      >
        <TextField label="Title"
          value={this.state.item.Title}
          autoComplete='off'
          onChanged={this._handleInputChange} />
      </Panel>
    );
  }
}

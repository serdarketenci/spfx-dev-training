import * as React from 'react';
import styles from './PnPWebPart.module.scss';
import { IPnPWebPartProps } from './IPnPWebPartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import {
  CheckboxVisibility,
  DetailsList,
  SelectionMode,
  Selection
} from 'office-ui-fabric-react/lib/DetailsList';
import { getTheme, mergeStyles, mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import Item from '../models/Item';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { ObjectStateOptions } from '../models/ObjectStateOptions';
import PanelItem from './PanelItem/PanelItem';
import { IPnPWebPartState } from './IPnPWebPartState';

const theme = getTheme();
const classNames = mergeStyleSets({
  headerDivider: {
    display: 'inline-block',
    height: '100%'
  },
  headerDividerBar: {
    display: 'none',
    background: theme.palette.themePrimary,
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '1px',
    zIndex: 5
  },
  linkField: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%'
  }
});
const rootClass = mergeStyles({
  selectors: {
    [`.${classNames.headerDivider}:hover + .${classNames.headerDividerBar}`]: {
      display: 'inline'
    }
  }
});

export default class PnPWebPart extends React.Component<IPnPWebPartProps, IPnPWebPartState> {

  private _selection: Selection;

  constructor(props: IPnPWebPartProps) {
    super(props);
    this.state = {
      showPanel: false,
      hideDialog: true,
      items: [],
      loading: false,
      showPlaceholder: (this.props.listId === null || this.props.listId === undefined || this.props.listId === ""),
      enableEditAndDeleteButton: false
    };

    this._selection = new Selection({
      onSelectionChanged: this._onItemsSelectionChanged
    });
  }

  private _onAddRow = (): void => {
    if (this._selection.count > 0) {
      this._selection.toggleIndexSelected(this._selection.getSelectedIndices()[0])
    }
    this.setState({ showPanel: true });
  };

  private _onDeleteRow = (): void => {
    this.setState({ hideDialog: false });
  };

  private _onEditRow = (): void => {
    this.setState({ showPanel: true });
  };

  private _getCommandItems = () => {
    return [
      {
        key: 'addRow',
        text: 'Insert row',
        iconProps: { iconName: 'Add' },
        onClick: this._onAddRow,
      },
      {
        key: 'editRow',
        text: 'Edit row',
        iconProps: { iconName: 'Edit' },
        onClick: this._onEditRow,
        disabled: !this.state.enableEditAndDeleteButton
      },
      {
        key: 'deleteRow',
        text: 'Delete row',
        iconProps: { iconName: 'Delete' },
        onClick: this._onDeleteRow,
        disabled: !this.state.enableEditAndDeleteButton
      }
    ];
  };

  private saveItem(item: Item) {
    this.setState({loading:true});
    this.save(item);
    this._onClosePanel();
  }

  private deleteItem() {
    this.setState({loading:true});
    var { selectedItem } = this.state;
    selectedItem.ObjectStateOption = ObjectStateOptions.Removed;
    this.save(selectedItem);
    this._closeDialog();
  }

  private save(item: Item) {
    if (item.ObjectStateOption !== ObjectStateOptions.Pristine) {
      this.props.spService.save(this.props.listId, item).then(() => {
        this._getListItems();
      });
    }
  }

  private _closeDialog = (): void => {
    this.setState({ hideDialog: true });
  };

  private _onItemsSelectionChanged = () => {
    var selectedItem: any;
    var isSelectedItem = this._selection.getSelectedCount() > 0;

    if (isSelectedItem) {
      selectedItem = this._selection.getSelection()[0];
    }
    else {
      selectedItem = undefined;
    }

    this.setState({
      enableEditAndDeleteButton: (isSelectedItem),
      selectedItem
    });
  };

  private _getListItems() {
    this.setState({
      loading: true
    });

    this.props.spService.getItems(this.props.listId).then((items) => {
      this.setState({
        items,
        loading: false,
        showPlaceholder: false
      });
    })

  }


  public componentDidMount() {
    if (this.props.listId !== null && this.props.listId !== "") {
      this._getListItems();
    }
  }


  public componentDidUpdate(prevProps: IPnPWebPartProps, prevState: any) {
    if (this.props.listId !== prevProps.listId) {
      if (this.props.listId !== null && this.props.listId !== "") {
        this._getListItems();
      } else {
        this.setState({
          showPlaceholder: true,
          loading: true
        });
      }
    }
  }

  private _onClosePanel = (): void => {
    this.setState({ showPanel: false });
  };


  public render(): React.ReactElement<IPnPWebPartProps> {
    if (this.state.showPlaceholder) {
      return (
        <div>
          Please configure the web part.
        </div>
      );
    }

    if (this.state.loading) {
      return (
        <Spinner size={SpinnerSize.large} label="loading..." ariaLive="assertive" />
      );
    }

    return (
      <div className={rootClass}>
        <CommandBar
          items={this._getCommandItems()}
        />

        <DetailsList
          items={this.state.items}
          setKey="items"
          selection={this._selection}
          selectionMode={SelectionMode.single}
          columns={[{
            key: "Id",
            name: "Id",
            fieldName: "Id",
            minWidth: 75
          },
          {
            key: "Title",
            name: "Title",
            fieldName: "Title",
            minWidth: 325
          }]}
          checkboxVisibility={CheckboxVisibility.onHover}
          isHeaderVisible={true}
          enterModalSelectionOnTouch={true}
        />
        <PanelItem
          showPanel={this.state.showPanel}
          item={this.state.selectedItem}
          onSave={this.saveItem.bind(this)}
          onCancel={this._onClosePanel.bind(this)}
        />
        <Dialog
          hidden={this.state.hideDialog}
          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Delete Item',
            subText: 'Are you sure?'
          }}
          modalProps={{
            titleAriaId: 'myLabelId',
            subtitleAriaId: 'mySubTextId',
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          <DialogFooter>
            <PrimaryButton onClick={this.deleteItem.bind(this)} text="Save" />
            <DefaultButton onClick={this._closeDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }
}

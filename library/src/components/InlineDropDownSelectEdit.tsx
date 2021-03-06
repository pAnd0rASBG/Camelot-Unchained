/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { StyleSheet, css, StyleDeclaration } from 'aphrodite';
import {
  FloatSpinner,
  Tooltip,
  events,
} from '..';
import { generateID } from 'redux-typed-modules';
import DropDownSelect, { DropDownSelectStyle, DropDownSelectProps } from './DropDownSelect';

export interface InlineDropDownSelectEditStyle extends StyleDeclaration {
  defaultView: React.CSSProperties;
  editModeContainer: React.CSSProperties;
  editModeButtons: React.CSSProperties;
  editButton: React.CSSProperties;
  saveButton: React.CSSProperties;
  error: React.CSSProperties;
}

export const defaultInlineDropDownSelectEditStyle: InlineDropDownSelectEditStyle = {
  defaultView: {
    position: 'relative',
    flex: '1 1 auto',
    cursor: 'pointer',
  },

  editModeContainer: {
    position: 'relative',
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
  },

  editModeButtons: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },

  editButton: {
    position: 'absolute',
    right: '0px',
    bottom: '0px',
    fontSize: '0.7em',
  },

  saveButton: {},

  error: {
    color: 'darkred',
    fontSize: '0.9em',
  },
};

export interface InlineDropDownSelectEditProps<ItemType, DataType extends {}> {
  items: ItemType[];
  value: ItemType;
  renderListItem: (item: ItemType, renderData: DataType) => JSX.Element;
  renderSelectedItem: (item: ItemType, renderData: DataType) => JSX.Element;
  renderData?: DataType;
  onSave: (prev: ItemType, selected: ItemType) => Promise<{ok: boolean, error?: string}>;
  styles?: Partial<InlineDropDownSelectEditStyle>;
  dropDownStyles?: Partial<DropDownSelectStyle>;
}

export interface InlineDropDownSelectEditState {
  editMode: boolean;
  showEditButton: boolean;
  saving: boolean;
  errors: string;
}

export class InlineDropDownSelectEdit<ItemType, DataType extends {}> 
  extends React.Component<InlineDropDownSelectEditProps<ItemType, DataType>, InlineDropDownSelectEditState> {

  private static editModeActiveEvent = 'input-edit-mode-active';
  private editModeListenerID: any = null;
  private id: string = '';
  private dropDownRef: DropDownSelect<ItemType, DataType> = null;

  constructor(props: InlineDropDownSelectEditProps<ItemType, DataType>) {
    super(props);
    this.id = generateID(7);
    this.state = {
      editMode: false,
      showEditButton: false,
      saving: false,
      errors: null,
    };
  }

  public render() {
    const ss = StyleSheet.create(defaultInlineDropDownSelectEditStyle);
    const custom = StyleSheet.create(this.props.styles || {});

    type DropDown = DropDownSelect<ItemType, DataType>;
    type DropDownCtor = new (p: DropDownSelectProps<ItemType, DataType>) => DropDown;
    const DropDown = DropDownSelect as DropDownCtor;

    if (this.state.editMode) {
      return (
        <div className={css(ss.editModeContainer, custom.editModeContainer)}
             onKeyDown={this.onKeyDown}>
          {
            this.state.errors ?
              (
                <div className={css(ss.error, custom.error)}>
                  <Tooltip content={() => <span>{this.state.errors}</span>}>
                    <i className='fa fa-exclamation-circle'></i> Save failed.
                  </Tooltip>
                </div>
              ) : null
          }
          <DropDown items={this.props.items}
                          ref={r => this.dropDownRef = r}
                          selectedItem={this.props.value}
                          renderSelectedItem={this.props.renderSelectedItem}
                          renderListItem={this.props.renderListItem}
                          renderData={this.props.renderData}
                          styles={this.props.dropDownStyles}/>
          {
            this.state.saving ? <FloatSpinner styles={{ spinner: { position: 'absolute' } }}/> : null
          }
          <div className={css(ss.editModeButtons, custom.editModeButtons)}>
            <a style={{
              marginLeft: '4px',
              fontSize: '0.8em',
            }
            }
               onClick={this.deactivateEditMode}>cancel</a>
            <a style={{
              marginLeft: '4px',
              fontSize: '0.8em',
            }
            }
               onClick={this.doSave}>save</a>

          </div>
        </div>
      );
    }
    return (
      <div className={css(ss.defaultView, custom.defaultView)}
           onMouseEnter={this.showEditButton}
           onMouseOver={this.showEditButton}
           onMouseLeave={this.onMouseleave}
           onClick={this.activateEditMode}>
        {this.props.renderSelectedItem(this.props.value, this.props.renderData)}
        {this.state.showEditButton ?
          (
            <div className={css(ss.editButton, custom.editButton)}>
              <i className='fa fa-pencil'></i>
            </div>
          ) : null}
      </div>
    );
  }

  public componentDidMount() {
    this.editModeListenerID = events.on(InlineDropDownSelectEdit.editModeActiveEvent, this.onEditModeActiveEvent);
  }

  public componentWillUnmount() {
    events.off(this.editModeListenerID);
    this.editModeListenerID = null;
  }

  private onEditModeActiveEvent = (id: string) => {
    if (this.id === id) return;
    if (this.state.editMode) {
      this.deactivateEditMode();
    }
  }

  private onMouseleave = () => {
    if (this.state.showEditButton === false) return;
    this.setState({ showEditButton: false });
  }

  private onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // escape pressed
    if (e.keyCode === 27) {
      if (this.state.editMode) {
        this.deactivateEditMode();
        e.stopPropagation();
      }
    }

    // enter pressed
    if (e.keyCode === 13) {
      this.doSave();
    }
  }

  private showEditButton = () => {
    if (this.state.showEditButton) return;
    this.setState({ showEditButton: true });
  }

  private doSave = () => {
    if (this.props.value === this.dropDownRef.selectedItem()) {
      this.deactivateEditMode();
      return;
    }
    this.props.onSave(this.props.value, this.dropDownRef.selectedItem())
      .then((result) => {
        if (result.ok) {
          this.dropDownRef = null;
          this.setState({
            saving: false,
            editMode: false,
            errors: null,
          });
        }
        this.setState({
          saving: false,
          errors: result.error,
        });
      });

    this.setState({ saving: true });
  }

  private activateEditMode = () => {
    this.setState({
      editMode: true,
      showEditButton: false,
    });
    events.fire(InlineDropDownSelectEdit.editModeActiveEvent, this.id);
  }

  private deactivateEditMode = () => {
    this.dropDownRef = null;
    this.setState({ editMode: false });
  }
}

export default InlineDropDownSelectEdit;

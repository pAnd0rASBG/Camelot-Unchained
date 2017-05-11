/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: Mehuge (mehuge@sorcerer.co.uk)
 * @Date: 2017-05-11 21:38:34
 * @Last Modified by: Mehuge (mehuge@sorcerer.co.uk)
 * @Last Modified time: 2017-05-11 22:10:08
 */

import * as React from 'react';

export interface SelectProps {
  items: any[];
  selectedItemIndex?: any;
  renderActiveItem: (item: any) => any;
  renderListItem: (item: any) => any;
  itemHeight: number;
  onSelectedItemChanged: (item: any) => void;
  containerClass?: string;
  showActiveInList?: boolean;
}

export interface SelectState {
  selectedIndex: number;
  showList: boolean;
}

class Select extends React.Component<SelectProps, SelectState> {
  private static idCounter: number = 0;
  private uniqueId: string = 'Select-' + Select.idCounter++;

  constructor(props: SelectProps) {
    super(props);
    this.state = {
      selectedIndex: 0,
      showList: false,
    };
  }

  public render() {
    if (this.props.items.length === 0) {
      // No items to display
      return (
        <div className={`Select ${this.props.containerClass || ''}`}>
          <div className='Select__activeView'>
            {this.props.renderActiveItem(null)}
          </div>
          <div className='Select__arrow'><i className='fa fa-chevron-up' aria-hidden='true'></i></div>
        </div>
      );
    }
    const selectedIndex = this.props.selectedItemIndex !== undefined ? this.props.selectedItemIndex :
      this.state.selectedIndex;
    return(
      <div
        className={`Select ${this.props.containerClass || ''}`}
        style={this.state.showList ? { zIndex: '1000' } : {}}>
        <div
          className={`Select__outside ${this.state.showList ? '' : 'Select__outside--hidden'}`}
          onClick={(e) => {
            this.showList(false);
            e.stopPropagation();
          }} />
        <div className='Select__activeView' onClick={(e) => {
          this.showList(!this.state.showList);
          e.stopPropagation();
        }}>
          {this.props.renderActiveItem(this.props.items[selectedIndex])}
        </div>
        <div className='Select__arrow' onClick={(e) => {
          this.showList(!this.state.showList);
          e.stopPropagation();
        }} ><i className={`fa ${this.state.showList ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden='true'></i></div>
        <div className={`Select__listView ${this.state.showList ? '' : 'Select__listView--hidden'}`}
             style={this.props.items.length > ((420 / (this.props.itemHeight + 1)) | 0) ? {} : {overflow: 'hidden'}} >
          {this.props.items.map(this.buildListItem)}
        </div>
      </div>
    );
  }

  private showList = (visible: boolean) => {
    this.setState({showList: visible});
  }

  private onItemSelect = (item: any, itemIndex: number) => {
    this.setState({
      selectedIndex: itemIndex,
      showList: false,
    });
    this.props.onSelectedItemChanged(item);
  }

  private buildListItem = (item: any, itemIndex: number) => {
    const isSelectedItem = itemIndex === this.state.selectedIndex;
    if (this.props.showActiveInList && isSelectedItem) return null;
    return (
      <div
        key={itemIndex}
        onClick={this.onItemSelect.bind(this, item, itemIndex)}
        className={`Select__listItem ${isSelectedItem ? 'Select__listItem--selected' : ''}`}>
        {this.props.renderListItem(item)}
      </div>
    );
  }
}

export default Select;

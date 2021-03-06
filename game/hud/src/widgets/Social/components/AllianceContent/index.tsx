/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { LinkAddress } from '../../services/session/nav/navTypes';

export interface AllianceContentProps {
  dispatch: (action: any) => any;
  address: LinkAddress;
}

export interface AllianceContentState {

}

export class AllianceContent extends React.Component<AllianceContentProps, AllianceContentState> {

  constructor(props: AllianceContentProps) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div className='AllianceContent'>
        Alliance content under construction.
        <br />
        Viewing page {this.props.address.id}.
      </div>
    );
  }
}

export default AllianceContent;

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import * as _ from 'lodash';

import BodyPartHealth, { MaxHealthPartsInfo } from '../BodyPartHealth';
import { graphql } from 'react-apollo';
import { StyleDeclaration, StyleSheet, css } from 'aphrodite';
import { ql, bodyParts, client } from 'camelot-unchained';

import CharacterAndOrderName from './components/CharacterAndOrderName';
import EquipmentSlots from './components/EquipmentSlots';
import { InventoryItemFragment } from '../../../../gqlInterfaces';
import queries from '../../../../gqlDocuments';
import { paperDollIcons } from '../../lib/constants';

export interface PaperDollStyle extends StyleDeclaration {
  paperDoll: React.CSSProperties;
  paperdollContainer: React.CSSProperties;
  characterInfoContainer: React.CSSProperties;
  itemSlotContainer: React.CSSProperties;
  backgroundImg: React.CSSProperties;
  manIcon: React.CSSProperties;
}

export const defaultPaperDollStyle: PaperDollStyle = {
  paperDoll: {
    display: 'flex',
    position: 'relative',
    alignItems: 'stretch',
    width: '100%',
    height: '100%',
  },

  paperdollContainer: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  characterInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '0 0 auto',
  },

  itemSlotContainer: {
    display: 'flex',
    margin: '5px',
    cursor: 'pointer',
  },

  backgroundImg: {
    position: 'absolute',
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },

  manIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    width: 'auto',
    height: '650px',
  },
};

export interface EquippedItemsMap {
  [slotName: string]: any;
}

export interface PaperDollProps {
  styles?: Partial<PaperDollStyle>;
  visibleComponent: string;
  inventoryItems: InventoryItemFragment[];
  equippedItems: ql.schema.EquippedItem[];
  onEquippedItemsChange: (equippedItems: ql.schema.EquippedItem[]) => void;
  data?: any;
}

export interface PaperDollState {
  maxHealthParts: MaxHealthPartsInfo;
}

class PaperDoll extends React.Component<PaperDollProps, PaperDollState> {

  constructor(props: PaperDollProps) {
    super(props);
    this.state = {
      maxHealthParts: {},
    };
  }
  public render() {
    const ss = StyleSheet.create({ ...defaultPaperDollStyle, ...this.props.styles });
    const { myCharacter, myOrder } = this.props.data;

    return (
      <div className={css(ss.paperDoll)}>
        <img src={'images/paperdollbg.png'} className={css(ss.backgroundImg)} />
        <div className={css(ss.paperdollContainer)}>
          <img
            className={css(ss.manIcon)}
            src={myCharacter && paperDollIcons[`${myCharacter.gender}${myCharacter.race}`]}
          />
          <div className={css(ss.characterInfoContainer)}>
            <CharacterAndOrderName
              characterName={myCharacter && myCharacter.name}
              orderName={myOrder ? myOrder.name : ''}
            />
            <BodyPartHealth maxHealthParts={this.state.maxHealthParts} />
          </div>
          <EquipmentSlots
            inventoryItems={this.props.inventoryItems}
            equippedItems={this.props.equippedItems}
            onEquippedItemsChange={this.props.onEquippedItemsChange}
          />
        </div>
      </div>
    );
  }

  public componentDidMount() {
    this.initializeMaxHealthParts();
  }

  public componentWillReceiveProps(nextProps: PaperDollProps) {
    if (!_.isEqual(nextProps.data.myEquippedItems, this.props.data.myEquippedItems)) {
      this.props.onEquippedItemsChange(nextProps.data.myEquippedItems.items as ql.schema.EquippedItem[]);
    }
  }

  private initializeMaxHealthParts = () => {
    const maxHealthParts = this.state.maxHealthParts;
    client.OnCharacterInjuriesChanged((part: number, health: number, maxHealth: number) => {
      maxHealthParts[bodyParts[part]] = maxHealth;
    });
    this.setState({ maxHealthParts });
  }
}

const PaperDollWithQL = graphql(queries.PaperDollContainer as any)(PaperDoll);

export default PaperDollWithQL as any;

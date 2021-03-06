/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { utils } from 'camelot-unchained';
import { SocialCategory, defaultCategoryNav } from './navTypes';

export function generateMenu(order: any/*ql.FullOrder*/, member: any/*ql.FullOrderMember*/,
   previousNav = defaultCategoryNav()) {

  const links = [
    {
      id: 'overview',
      displayName: 'Overview',
      icon: <i className='fa fa-th'></i>,
      enabled: true,
      address: {
        kind: 'Primary',
        category: SocialCategory.Order,
        id: 'overview',
      },
    }, {
      id: 'members',
      displayName: 'Members',
      icon: <i className='fa fa-users'></i>,
      enabled: true,
      address: {
        kind: 'Primary',
        category: SocialCategory.Order,
        id: 'members',
      },
    },
      // {   id: 'assets',   displayName: 'Assets',   icon: <i className='fa
      // fa-bank'></i>,   enabled: true,   address: {     kind: 'Primary',
      // category: SocialCategory.Order,     id: 'assets',   } }, {   id: 'contracts',
      //   displayName: 'Contracts',   icon: <i className='fa fa-file-text-o'></i>,
      // enabled: true,   address: {     kind: 'Primary',     category:
      // SocialCategory.Order,     id: 'contracts',   } },
  ];

  if (order.ranks !== null && order.ranks.length > 0) {
    const memberRankIndex = -1; // utils.findIndexWhere(order.ranks, o => o.name === member.rank.name);
    if (memberRankIndex < 0 || memberRankIndex > order.ranks.length) throw new Error('Invalid member rank index');

    const memberRank = order.ranks[memberRankIndex];

    links.push({
      id: 'ranks',
      displayName: 'Ranks',
      icon: <i className='fa fa-star'></i>,
      enabled: true,
      address: {
        kind: 'Primary',
        category: SocialCategory.Order,
        id: 'ranks',
      },
    });

    if (memberRank.level > 1) {
      links.push({
        id: 'admin',
        displayName: 'Administration',
        icon: <i className='fa fa-cogs'></i>,
        enabled: true,
        address: {
          kind: 'Primary',
          category: SocialCategory.Order,
          id: 'admin',
        },
      });
    }

  } else {
    links.push({
      id: 'ranks',
      displayName: 'Ranks',
      icon: <i className='fa fa-star'></i>,
      enabled: false,
      address: {
        kind: 'Primary',
        category: SocialCategory.Order,
        id: 'ranks',
      },
    });

    links.push({
      id: 'admin',
      displayName: 'Administration',
      icon: <i className='fa fa-cogs'></i>,
      enabled: false,
      address: {
        kind: 'Primary',
        category: SocialCategory.Order,
        id: 'admin',
      },
    });
  }

  return {
    category: SocialCategory.Order,
    id: 'order',
    displayName: `Order | ${order.name}`,
    collapsed: previousNav.collapsed,
    address: {
      kind: 'Primary',
      category: SocialCategory.Order,
    },
    links,
    ...utils.defaultFetchStatus,
  };
}

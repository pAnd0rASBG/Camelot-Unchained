/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {client, archetype, race, gender, events} from 'camelot-unchained';
import {spring, presets, TransitionMotion} from 'react-motion';

import SVGSprite from '../../components/SVGSprite';
import Pills, {Orientation} from './components/Pills';
import ClassIcon from '../../components/ClassIcon';
import ActiveEffectIcon from '../../components/ActiveEffectIcon'

import {PlayerStatus, BodyParts} from '../../lib/PlayerStatus';

const VALUE_PER_BODY_PARTY_PILL = 1000;
const VALUE_PER_BLOOD_PILL = 1000;
const VALUE_PER_STAMINA_PILL = 100;

export interface PlayerStatusComponentProps {
  containerClass?: string;
  mirror?: boolean;
  playerStatus: PlayerStatus;
  events: any;
  isLeader?: boolean;
}

export interface PlayerStatusComponentState {
}

class PlayerStatusComponent extends React.Component<PlayerStatusComponentProps, PlayerStatusComponentState> {
  constructor(props: PlayerStatusComponentProps) {
    super(props);
  }

  private shakeAnimationName: string = 'shakeit';
  componentWillReceiveProps(props: PlayerStatusComponentProps) {
    if (props.mirror) this.shakeAnimationName = 'shakeit-mirrored';
  }

  // Transitions
  flyTextWillLeave = (): any => {
    return {opacity: spring(0, {stiffness: 50, damping: 15, precision: 0.01}), top: spring(-120, {stiffness: 75, damping: 15, precision: 1})};
  }

  flyTextWillEnter = (): any => {
    return {opacity: 7, top: 0};
  }

  eventIconWillLeave = (): any => {
    return {opacity: spring(0, {stiffness: 50, damping: 15, precision: 0.01})};
  }

  eventIconWillEnter = (): any => {
    return {opacity: 5};
  }

  // animations
  shakeIt = () => {
    if (this.componentRef.className.indexOf(this.shakeAnimationName) != -1) return;
    this.componentRef.className += ` ${this.shakeAnimationName}`;
  }

  private endTime: number = 0;
  private componentRef: HTMLDivElement = null;
  endShake = () => {
    if (Date.now() < this.endTime) return;
    if (this.componentRef.className.indexOf(this.shakeAnimationName) == -1) return;
    this.componentRef.className = this.componentRef.className.replace(` ${this.shakeAnimationName}`, '').trim();
  }

  render() {

    const now = Date.now();
    // did we recently take damage?
    for (let i = this.props.events.length-1; i >= 0; --i) {
      const e = this.props.events[i];
      if (now - e.timestamp > 200) break;
      if (e.textType == 'damage') {
        this.endTime = now + 200;
        setTimeout(() => this.shakeIt(), 1);
        setTimeout(() => this.endShake(), 201);
        break;
      }
    }

    const dead = this.props.playerStatus.blood.current <= 0 || this.props.playerStatus.health[BodyParts.Torso].current <= 0 || this.props.playerStatus.health[BodyParts.Head].current <= 0;

    return (
      <div className={`${this.props.containerClass ? this.props.containerClass : ''} PlayerStatusComponent ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`} 
           ref={(r: any) => this.componentRef = r}>

        <div className='PlayerStatusComponent__circle'>

          <div className='PlayerStatusComponent__circle__bg'></div>
          <div className='PlayerStatusComponent__circle__avatar'><img src={this.props.playerStatus.avatar} style={dead ? {filter: 'grayscale(100%)', '-webkit-filter': 'grayscale(100%)'} : {}} /></div>
          
          <Pills orientation={Orientation.CircleTop}
                 containerClass='PlayerStatusComponent__circle__blood'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BLOOD_PILL}
                 currentValue={this.props.playerStatus.blood.current}
                 maxValue={this.props.playerStatus.blood.maximum}
                 valueColor={dead ? '#7f7f7f' : 'red'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />

        
          <Pills orientation={Orientation.CircleBottom}
                 containerClass='PlayerStatusComponent__circle__blood'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_STAMINA_PILL}
                 currentValue={this.props.playerStatus.stamina.current}
                 maxValue={this.props.playerStatus.stamina.maximum}
                 valueColor={dead ? '#7f7f7f' : 'yellow'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />
          

          <TransitionMotion willLeave={this.eventIconWillLeave}
                            willEnter={this.eventIconWillEnter}
                            styles={this.props.events.map((item: any) => ({
                              key: item.key,
                              data: item,
                              style: {opacity: spring(0), r: Math.random() * 90 - 45}
                            }))}>
            {(interpolatedStyles: any) => 
              <div className='PlayerStatusComponent__circle__eventIcon'>
                {interpolatedStyles.map((config: any) => {
                  return <div className={`PlayerStatusComponent__circle__eventIcon--${config.data.iconType}`} key={config.key} style={{opacity: config.style.opacity, transform: `rotateZ(${config.style.r}deg)`}}></div>
                })}
              </div>
            }
          </TransitionMotion>
          
          <TransitionMotion willLeave={this.flyTextWillLeave}
                            willEnter={this.flyTextWillEnter}
                            styles={this.props.events.map((item: any) => ({
                              key: item.key,
                              data: item,
                              style: {opacity: spring(0), top: spring(-140)}
                            }))}>
            {(interpolatedStyles: any) => 
              <div className='PlayerStatusComponent__circle__flyText'>
                {interpolatedStyles.map((config: any) => {
                  return <div className={`PlayerStatusComponent__circle__flyText--${config.data.textType} ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`} key={config.key} style={{opacity: config.style.opacity, top: config.style.top}}>{config.data.value}</div>
                })}
              </div>
            }
          </TransitionMotion>

        </div>

        <div className='PlayerStatusComponent__healthBars'>

          <ul className='PlayerStatusComponent__healthBars__labels'>
            <li className={`outer ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`}>RA</li>
            <li className={`inner ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`}>LA</li>
            <li className={`${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`}>&nbsp;H</li>
            <li className={`${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`}>&nbsp;T</li>
            <li className={`inner ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`} >RL</li>
            <li className={`outer ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`} style={{left: '-7px'}}>LL</li>
          </ul>

          <Pills orientation={Orientation.Horizontal}
                 containerClass='PlayerStatusComponent__healthBars__bodyPart'
                 ref='right-arm'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BODY_PARTY_PILL}
                 currentValue={this.props.playerStatus.health[BodyParts.RightArm].current}
                 maxValue={this.props.playerStatus.health[BodyParts.RightArm].maximum}
                 valueColor={dead ? '#7f7f7f' : '#2868c7'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />
          
          <Pills orientation={Orientation.Horizontal}
                 containerClass='PlayerStatusComponent__healthBars__bodyPart'
                 ref='left-arm'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BODY_PARTY_PILL}
                 currentValue={this.props.playerStatus.health[BodyParts.LeftArm].current}
                 maxValue={this.props.playerStatus.health[BodyParts.LeftArm].maximum}
                 valueColor={dead ? '#7f7f7f' : '#2868c7'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />
          
          <Pills orientation={Orientation.Horizontal}
                 containerClass='PlayerStatusComponent__healthBars__bodyPart'
                 ref='head'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BODY_PARTY_PILL}
                 currentValue={this.props.playerStatus.health[BodyParts.Head].current}
                 maxValue={this.props.playerStatus.health[BodyParts.Head].maximum}
                 valueColor={dead ? '#7f7f7f' : '#0093e8'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />
          
          <Pills orientation={Orientation.Horizontal}
                 containerClass='PlayerStatusComponent__healthBars__bodyPart'
                 ref='torso'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BODY_PARTY_PILL}
                 currentValue={this.props.playerStatus.health[BodyParts.Torso].current}
                 maxValue={this.props.playerStatus.health[BodyParts.Torso].maximum}
                 valueColor={dead ? '#7f7f7f' : '#0093e8'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />
          

          <Pills orientation={Orientation.Horizontal}
                 containerClass='PlayerStatusComponent__healthBars__bodyPart'
                 ref='right-leg'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BODY_PARTY_PILL}
                 currentValue={this.props.playerStatus.health[BodyParts.RightLeg].current}
                 maxValue={this.props.playerStatus.health[BodyParts.RightLeg].maximum}
                 valueColor={dead ? '#7f7f7f' : '#2868c7'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />

          <Pills orientation={Orientation.Horizontal}
                 containerClass='PlayerStatusComponent__healthBars__bodyPart'
                 ref='left-leg'
                 mirror={this.props.mirror}
                 valuePerPill={VALUE_PER_BODY_PARTY_PILL}
                 currentValue={this.props.playerStatus.health[BodyParts.LeftLeg].current}
                 maxValue={this.props.playerStatus.health[BodyParts.LeftLeg].maximum}
                 valueColor={dead ? '#7f7f7f' : '#2868c7'}
                 depletedColor={dead ? '#4e4e4e' : '#3c3c3c'} />

        </div>

        <div className={`PlayerStatusComponent__name ${this.props.mirror ? 'PlayerStatusComponent--mirrored' : ''}`} >{this.props.playerStatus.name}</div>

      </div>
    );
  }
}

export default PlayerStatusComponent;

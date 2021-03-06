/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MDCComponent from '@material/base/component';

import MDCChipSetAdapter from './adapter';
import MDCChipSetFoundation from './foundation';
import {MDCChip, MDCChipFoundation} from '../chip/index';

let idCounter = 0;

/**
 * @extends {MDCComponent<!MDCChipSetFoundation>}
 * @final
 */
class MDCChipSet extends MDCComponent {
  /**
   * @param {...?} args
   */
  constructor(...args) {
    super(...args);

    /** @type {!Array<!MDCChip>} */
    this.chips;
    /** @private {(function(!Element): !MDCChip)} */
    this.chipFactory_;

    /** @private {?function(?Event): undefined} */
    this.handleChipInteraction_;
    /** @private {?function(?Event): undefined} */
    this.handleChipRemoval_;
  }

  /**
   * @param {!Element} root
   * @return {!MDCChipSet}
   */
  static attachTo(root) {
    return new MDCChipSet(root);
  }

  /**
   * @param {(function(!Element): !MDCChip)=} chipFactory A function which
   * creates a new MDCChip.
   */
  initialize(chipFactory = (el) => new MDCChip(el)) {
    this.chipFactory_ = chipFactory;
    this.chips = this.instantiateChips_(this.chipFactory_);
  }

  initialSyncWithDOM() {
    this.chips.forEach((chip) => {
      if (chip.selected) {
        this.foundation_.select(chip.id);
      }
    });

    this.handleChipInteraction_ = (evt) => this.foundation_.handleChipInteraction(evt);
    this.handleChipRemoval_ = (evt) => this.foundation_.handleChipRemoval(evt);
    this.root_.addEventListener(
      MDCChipFoundation.strings.INTERACTION_EVENT, this.handleChipInteraction_);
    this.root_.addEventListener(
      MDCChipFoundation.strings.REMOVAL_EVENT, this.handleChipRemoval_);
  }

  destroy() {
    this.chips.forEach((chip) => {
      chip.destroy();
    });

    this.root_.removeEventListener(
      MDCChipFoundation.strings.INTERACTION_EVENT, this.handleChipInteraction_);
    this.root_.removeEventListener(
      MDCChipFoundation.strings.REMOVAL_EVENT, this.handleChipRemoval_);

    super.destroy();
  }

  /**
   * Adds a new chip object to the chip set from the given chip element.
   * @param {!Element} chipEl
   */
  addChip(chipEl) {
    chipEl.id = chipEl.id || `mdc-chip-${++idCounter}`;
    this.chips.push(this.chipFactory_(chipEl));
  }

  /**
   * Returns an array of the IDs of all selected chips.
   * @return {!Array<string>}
   */
  get selectedChipIds() {
    return this.foundation_.getSelectedChipIds();
  }

  /**
   * @return {!MDCChipSetFoundation}
   */
  getDefaultFoundation() {
    return new MDCChipSetFoundation(/** @type {!MDCChipSetAdapter} */ (Object.assign({
      hasClass: (className) => this.root_.classList.contains(className),
      removeChip: (chipId) => {
        const index = this.findChipIndex_(chipId);
        if (index >= 0) {
          this.chips[index].destroy();
          this.chips.splice(index, 1);
        }
      },
      setSelected: (chipId, selected) => {
        const index = this.findChipIndex_(chipId);
        if (index >= 0) {
          this.chips[index].selected = selected;
        }
      },
    })));
  }

  /**
   * Instantiates chip components on all of the chip set's child chip elements.
   * @param {(function(!Element): !MDCChip)} chipFactory
   * @return {!Array<!MDCChip>}
   */
  instantiateChips_(chipFactory) {
    const chipElements = [].slice.call(this.root_.querySelectorAll(MDCChipSetFoundation.strings.CHIP_SELECTOR));
    return chipElements.map((el) => {
      el.id = el.id || `mdc-chip-${++idCounter}`;
      return chipFactory(el);
    });
  }

  /**
   * Returns the index of the chip with the given id, or -1 if the chip does not exist.
   * @param {string} chipId
   * @return {number}
   */
  findChipIndex_(chipId) {
    for (let i = 0; i < this.chips.length; i++) {
      if (this.chips[i].id === chipId) {
        return i;
      }
    }
    return -1;
  }
}

export {MDCChipSet, MDCChipSetFoundation};

//=============================================================================
// Immac Plugins - Multiple States Animations
// Extends: Yanfly Engine Visual State Effects
// IMMAC_YEP_Z_VisualStateFXMultipleStatesAnimations.js
//=============================================================================
/*:
 * @plugindesc v1.0 [P&P] (Req YEP_BattleEngineCore,YEP_BuffsStatesCore,YEP_X_VisualStateFX) allows multiple animations when a battler is affected by various status effects.
 * @author Immac
 *
 * @help This plugin does not provide plugin commands.
 *
 * ============================================================================
 * Introduction
 * ============================================================================
 * If using "Yanfly Engine Plugins - Buffs & States Extension - Visual State Effects",
 * makes it so all states that have animations show on the battler.
 * Works exclusively on animations, not on overlays nor motions.
 */
var Imported = Imported || {};
Imported.IMMAC_YEP_Z_VisualStateFXMultipleStates = true;

if (Imported.YEP_BattleEngineCore && Imported.YEP_BuffsStatesCore && Imported.YEP_X_VisualStateFX) {
  class StateAnimationCollection {
    constructor(parent, battler, state_effect_target) {
      this._parent = parent;
      this._battler = battler;
      this._state_effect_target = state_effect_target;
      this._animations = new Map();
    }

    setup(states) {
      let anim_ids = states.map(s => s.stateAnimationId);
      anim_ids.forEach(a => this.add(a));

      for (let k of this._animations.keys()) {
        if (!anim_ids.includes(k)) {
          this.remove(k);
        }
      }
    }

    add(animation_id) {
      if (!animation_id || this._animations.has(animation_id)) { return; }
      let sprite = new Sprite_StateAnimation();
      this._parent.addChild(sprite);
      var animation = $dataAnimations[animation_id];
      sprite.setBattler(this._battler);
      sprite.setup(this._state_effect_target, animation, false, 0);
      this._animations.set(animation_id, sprite);
    }

    remove(animation_id) {
      if (!animation_id || !this._animations.has(animation_id)) { return; }
      this._parent.removeChild(this._animations.get(animation_id));
      this._animations.delete(animation_id);
    }

    update() { 
      this._animations.forEach((value, key) => {
        value.update();
      })
    }

    get(animation_id) {
      return this._animations.get(animation_id);
    }
  }

  Game_Battler.prototype.refreshStateAnimation = function () {
    if (!this.battler()) return;
    if (!$gameParty.inBattle()) return;
    this.battler().refreshStateAnimations(this.states());
  };

  Sprite_Battler.prototype.refreshStateAnimations = function (states) {
    this._init_state_animations();
    this._state_animations.setup(states);
  }

  Sprite_Battler.prototype._init_state_animations = function () {
    if (!this._state_animations) {
      if (this._allowSpriteAni) {
        let parent = this instanceof Sprite_Enemy ? this.parent : this;
        this._state_animations = new StateAnimationCollection(parent, this._battler,this.stateEffectTarget());
      }
    }
  }
}
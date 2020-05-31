//=============================================================================
// Immac Plugins - Better Weapon Ranges
// Extends: Selection Control
// IMMAC_YEP_Z_BetterWeaponRange.js
//=============================================================================
/*:
 * @plugindesc v1.0 (Req YEP_BattleEngineCore,YEP_BuffsStatesCore,YEP_X_VisualStateFX,YEP_RowFormation) Adds new annotations for better weapon range control.
 * @author Immac
 *
 * @help This plugin does not provide plugin commands.
 *
 * ============================================================================
 * Introduction
 * ============================================================================
 * If using "Yanfly Engine Plugins - Target Extension - Selection Control",
 * allows the use of new annotations for weapon range.
 * 
 * Melee weapons are unchanged.
 * 
 * Items and Skills with the <Weapon Range> tag are affected.
 * 
 * The valid targets of a ranged weapon are determined by the weapon's minimum range and 
 * maximum range, if a weapon has not minimum range then it's minimum range
 * is considered 0, if a weapon has no maximum range then it's maximum range
 * is considered  infinite. 
 * 
 * Minimum and maximum ranges are inclusive, meaning that if the target is in
 * row 2 and the minimum range is 2 it will be able to be targeted.
 * 
 * A weapon with minimum range 1 and maximum range 1 is different from a melee
 * weapon, due to melee weapons always being able to target the nearest row,
 * while a weapon with minimum range 1 and maximum range 1 is only able to 
 * target row 1.
 * 
 * ============================================================================
 * Notetags - Weapons & Items
 * ============================================================================
 * <Weapon Range: x>
 * Sets the maximum range of a weapon to x, and the minimum range to 0
 * 
 * <Weapon Min Range: x>
 * Sets the minimum range of a weapon to x.
 * 
 * <Weapon Max Range: x>
 * Sets the maximum range of a weapon to x.
 */

var Imported = Imported || {};
Imported.IMMAC_YEP_Z_BetterWeaponRange = true;

if (Imported.YEP_BattleEngineCore 
  && Imported.YEP_TargetCore 
  && Imported.YEP_X_SelectionControl
  && Imported.YEP_RowFormation) {

  class BetterWeaponRange {
    static get loaded() {
      return this._loaded;
    }

    static set loaded(value) {
      this._loaded = value;
    }
  }

  DataManager.processBetterWeaponRangeSelectNotetags = function (group) {
    for (var n = 1; n < group.length; n++) {
      var obj = group[n];
      var notedata = obj.note.split(/[\r\n]+/);
      obj.selectConditions = [];
      obj.selectConditionEval = '';

      for (var i = 0; i < notedata.length; i++) {
        var line = notedata[i];
        if (line.match(/<(?:WEAPON RANGE:[ ](.*))>/i)) {
          let text = String(RegExp.$1).trim();
          obj.weaponMinRange = 0;
          obj.weaponMaxRange = Number(text);
          obj.selectConditions.push('BETTER WEAPON RANGE');

        } else if (line.match(/<(?:WEAPON MIN RANGE:[ ](.*))>/i)) {
          let text = String(RegExp.$1).trim();
          obj.weaponMinRange = Number(text);
          obj.selectConditions.push('BETTER WEAPON RANGE');

        } else if (line.match(/<(?:WEAPON MAX RANGE:[ ](.*))>/i)) {
          let text = String(RegExp.$1).trim();
          obj.weaponMaxRange = Number(text);
          obj.selectConditions.push('BETTER WEAPON RANGE');

        }
      }
    }
  };

  ((super_function) => {
    DataManager.isDatabaseLoaded = function () {
      if (!super_function.call(this)) { return };
      if (!BetterWeaponRange.loaded) {
        this.processBetterWeaponRangeSelectNotetags($dataWeapons, false);
        BetterWeaponRange.loaded = true;
      }
      return true;
    };
  })(DataManager.isDatabaseLoaded);

  Game_Battler.prototype.isWithinRange = function () {
    return false;
  };

  Game_Actor.prototype.isWithinRange = function (target) {
    let weapons = this.weapons();
    for (let i = 0; i < weapons.length; ++i) {
      if (!weapons[i]) continue;
      let weapon = DataManager.getBaseItem(weapons[i]);
      let hasMaxRange = weapon.weaponMaxRange != undefined;
      let hasMinRange = weapon.weaponMinRange != undefined;
      if (hasMinRange || hasMaxRange) {
        let isOutsideMinRange = !hasMinRange || target.row() >= weapon.weaponMinRange;
        let isInsideMaxRange = !hasMaxRange || target.row() <= weapon.weaponMaxRange;
        return isOutsideMinRange && isInsideMaxRange;
      }
    }
    return undefined;
  };

  ((super_function) => {
    Game_Action.prototype.meetSelectionCondition = function (line, user, target) {
      if (line.match(/WEAPON RANGE/i)) {
        return this.selectConditionWeaponRange(target, user);
      }
      return super_function.call(this, line, user, target);
    }
  })(Game_Action.prototype.meetSelectionCondition);

  ((super_function) => {
    Game_Action.prototype.selectConditionWeaponRange = function (target, user) {
      if (!Imported.YEP_RowFormation) return true;
      if (user) {
        let isWithinRange = user.isWithinRange(target);
        if (isWithinRange != undefined) {
          return isWithinRange;
        }
      }
      return super_function.call(this, target);
    };
  })(Game_Action.prototype.selectConditionWeaponRange);

  Immac.BetterWeaponRange = BetterWeaponRange;
}
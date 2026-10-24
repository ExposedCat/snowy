import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import { SnowManager } from "./managers/snow/manager.js";
import { SettingsManager } from "./utils/settings.js";

export default class SnowyExtension extends Extension {
  private settingsManager?: SettingsManager;
  private snowManager?: SnowManager;

  enable() {
    this.settingsManager = new SettingsManager(this.getSettings());
    this.snowManager = new SnowManager(this.settingsManager);
  }

  disable() {
    this.snowManager?.dispose();
    this.settingsManager?.dispose();

    this.snowManager = undefined;
    this.settingsManager = undefined;
  }
}

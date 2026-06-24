import { ActiveTab } from "../types";

export interface AppStoreState {
  activeTab: ActiveTab;
  settingsBackTab: ActiveTab;
}

export const initialAppStore: AppStoreState = {
  activeTab: "home",
  settingsBackTab: "home",
};

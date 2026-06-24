import { UserProfile } from "../types";

export interface UserStoreState {
  userProfile: UserProfile | null;
}

export const initialUserStore: UserStoreState = {
  userProfile: null,
};

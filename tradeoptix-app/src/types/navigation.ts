export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  KYC: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  KYC: undefined;
  News: undefined;
  Notifications: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList, MainTabParamList, MainStackParamList {}
  }
}
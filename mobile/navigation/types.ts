import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    Dashboard: undefined;
    Diary: undefined;
    More: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Main: NavigatorScreenParams<MainTabParamList>;
    Analytics: undefined;
    Mistakes: undefined;
    Goals: undefined;
    Community: undefined;
    Profile: undefined;
    Trades: undefined;
};

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import TradesScreen from '../screens/TradesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MistakesScreen from '../screens/MistakesScreen';
import TradersDiaryScreen from '../screens/TradersDiaryScreen';
import MoreScreen from '../screens/MoreScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    backgroundColor: 'white',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'view-dashboard';

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                    } else if (route.name === 'Diary') {
                        iconName = focused ? 'calendar-text' : 'calendar-text-outline';
                    } else if (route.name === 'More') {
                        iconName = focused ? 'dots-grid' : 'dots-grid';
                    }

                    return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Diary" component={TradersDiaryScreen} />
            <Tab.Screen name="More" component={MoreScreen} />
        </Tab.Navigator>
    );
};

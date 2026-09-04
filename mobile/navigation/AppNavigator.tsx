import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { ActivityIndicator, View } from 'react-native';

import { RootStackParamList } from './types';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import MistakesScreen from '../screens/MistakesScreen';
import GoalsScreen from '../screens/GoalsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TradesScreen from '../screens/TradesScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                        <Stack.Screen name="Mistakes" component={MistakesScreen} />
                        <Stack.Screen name="Goals" component={GoalsScreen} />
                        <Stack.Screen name="Community" component={CommunityScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="Trades" component={TradesScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen'; // TODO:Create RegisterScreen

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
        </Stack.Navigator>
    );
};

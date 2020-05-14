import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppointmentsScene from './scene/appointments/appointments.scene';
import VideoCallScene from './scene/vide-call/video-call.scene';
import HomeScene from './scene/home/home.scene';

import SocketUtils from './utils/socket.utils';
import ConferenceScene from './scene/conference/conference.scene';

// SocketUtils.connect();
// SocketUtils.handleOnConnect();
// SocketUtils.handleOnExchange();
// SocketUtils.handleOnLeave();
// SocketUtils.handleOnJoinClient();
// SocketUtils.handleOnLeaveClient();

const Stack = createStackNavigator();

function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" >
                <Stack.Screen
                    options={{
                        headerShown: false
                    }}
                    name="Home"
                    component={HomeScene}
                />
                <Stack.Screen name="Appointments" component={AppointmentsScene} />
                <Stack.Screen name="VideoCall" component={VideoCallScene} />
                <Stack.Screen name="Conference" component={ConferenceScene} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation;
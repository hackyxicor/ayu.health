import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';

//Data
import appointmentData from '../../db/appointments.json';

import AppointmentCardComponent from '../../component/appointmentCard.component';
import { BACKGROUND_COLOR } from '../../constants/color';
import DoctorDetailComponent from '../../component/doctorDetail.component';
import Utils from '../../utils/common.utils';
import SocketUtils from '../../utils/socket.utils';

function AppointmentsScene({ navigation }) {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        setAppointments(appointmentData.appointments);
        // Utils.setListContainer(this);
        // SocketUtils.emitListServer();
        return () => {

        }
    }, [])

    function navigateToVideoCall(appointment) {
        // Utils.setCurrentType('STREAMER');

        navigation.navigate("Conference", { appointment, endAppointment, userId: "doctor" });
    }

    function endAppointment(id) {
        setAppointments((prevValue) => {
            const arrayIndex = prevValue.findIndex((item) => item.id == id);
            prevValue.splice(arrayIndex, 1);
            return [...prevValue];
        });
        navigation.navigate("Appointments");
    }

    return (
        <View style={styles.container}>
            <FlatList
                invertStickyHeaders
                contentContainerStyle={{ alignItems: 'center' }}
                ListHeaderComponent={DoctorDetailComponent}
                ListEmptyComponent={EmptyList}
                data={appointments}
                renderItem={({ item, key }) => (
                    <AppointmentCardComponent
                        key={key}
                        appointment={item}
                        navigateToVideoCall={navigateToVideoCall}
                    />
                )}
            />
        </View>
    )
}

function EmptyList() {
    return (
        <Text>Nothing to show</Text>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR
    }
})

export default AppointmentsScene;
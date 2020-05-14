import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { DEVICE_WIDTH, WHITE, PRIMARY_COLOR, TEXT_COLOR } from '../constants/color';
import Button from './button.component';

function AppointmentCardComponent({
    appointment = { patient: {} },
    navigateToVideoCall = () => { },
}) {
    return (
        <View style={styles.container} >
            <View style={styles.topContainer}>
                <View style={[{ flex: 1 }, styles.leftAlign]} >
                    <Text style={styles.smallText} >Appointment Request</Text>
                </View>
                <View style={[{ flex: 1 }, styles.leftAlign]} >
                    <Text style={styles.dateSectionText}>{appointment.appointment_time}</Text>
                </View>
            </View>
            <View style={{ flex: 3, flexDirection: 'row' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                    <Image source={{ uri: appointment.patient.image }} style={styles.image} />
                </View>
                <View style={{ flex: 5, alignItems: 'flex-start', justifyContent: 'center', padding: 10 }} >
                    <View style={[{ flex: 1 }, styles.leftAlign]} >
                        <Text style={styles.userText} >{appointment.patient.name}</Text>
                    </View>
                    <View style={[{ flex: 1 }, styles.leftAlign]} >
                        <Text style={styles.userText}>{appointment.patient.address}</Text>
                    </View>
                </View>
            </View>
            <View style={{ height: 60, padding: 10 }} >
                <Button onPress={() => navigateToVideoCall(appointment)}>Accept</Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: DEVICE_WIDTH - 30,
        height: 200,
        borderRadius: 10,
        backgroundColor: WHITE,
        elevation: 3,
        marginBottom: 50
    },
    topContainer: {
        flex: 1.5,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        backgroundColor: PRIMARY_COLOR,
        padding: 20,
    },
    leftAlign: {
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    smallText: {
        color: WHITE,
        fontSize: 12,
        fontWeight: '300'
    },
    dateSectionText: {
        color: WHITE,
        fontSize: 18,
        fontWeight: '400'
    },
    userText: {
        color: TEXT_COLOR,
        fontSize: 16,
        fontWeight: '500'
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        resizeMode: 'contain'
    }
})

export default AppointmentCardComponent;

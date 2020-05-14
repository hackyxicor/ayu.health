import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SECONDARY_TEXT_COLOR, TEXT_COLOR, DEVICE_WIDTH } from '../constants/color';
import doctorData from '../db/doctor.json';


function DoctorDetailComponent() {
    const doctorName = doctorData.name;

    return (
        <View style={styles.container} >
            <View style={[{ flex: 1, }, styles.leftAlign]} >
                <Text style={styles.smallText} >
                    Welcome back!
                </Text>
            </View>
            <View style={[{ flex: 2, }, styles.leftAlign]} >
                <Text style={styles.bigText} >
                    {doctorName}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: DEVICE_WIDTH,
        height: 120,
        padding: 20,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    smallText: {
        color: SECONDARY_TEXT_COLOR,
        fontSize: 24,
        fontWeight: '300'
    },
    bigText: {
        color: TEXT_COLOR,
        fontSize: 35,
        fontWeight: 'bold',
    },
    leftAlign: {
        alignItems: 'flex-start',
        justifyContent: 'center'
    }
})

export default DoctorDetailComponent;
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { DEVICE_WIDTH, WHITE, TRANSPARENT_BLACK } from '../../constants/color';
import { CALL_END_IMAGE, PATIENT_IMAGE_FULL, DOCTOR_IMAGE_FULL } from '../../constants/global';
import Utils from '../../utils/common.utils';
import SocketUtils from '../../utils/socket.utils';
import { RTCView } from 'react-native-webrtc';

function VideoCallScene({ }) {
    const route = useRoute();
    const { params = {} } = route;
    const { appointment, endAppointment } = params;
    const { patient = {} } = appointment || {};

    console.log('toto', Utils.getLocalStream(), Utils.isNullOrUndefined(Utils.getLocalStream()));
    const [isSelf, setIsSelf] = useState(params.isSelf);
    const [selfViewSource, setSelfViewSource] = useState(!Utils.isNullOrUndefined(Utils.getLocalStream()) ? Utils?.getLocalStream()?.toURL() : null);
    const [otherViewSource, setOtherViewSource] = useState(!Utils.isNullOrUndefined(Utils.getOtherStream()) ? Utils?.getOtherStream()?.toURL() : null);

    useEffect(() => {
        Utils.setContainer({
            setOtherViewSource,
            setSelfViewSource
        });
        const roomName = "appointment_" + appointment.id;
        SocketUtils.join(roomName, patient.name);
    }, [])


    function DoctorVideoView() {
        if (isSelf && !Utils.isNullOrUndefined(selfViewSource)) {
            return <RTCView streamURL={selfViewSource} style={styles.doctorViewContainer} />
        }

        return null;
    }

    function PatientVideoView() {
        if (!isSelf && !Utils.isNullOrUndefined(otherViewSource)) {
            return <RTCView streamURL={otherViewSource} style={styles.doctorViewContainer} />
        }

        return null;
    }


    function closeCall() {
        endAppointment(appointment.id)
    }

    return (
        <>
            <View style={styles.container} >
                <PatientVideoView />
                <DoctorVideoView />
                <PatientDetailsView patient={patient} />
                <CallEndButton closeCall={closeCall} />
            </View>
        </>
    )
}



function PatientDetailsView({ patient }) {
    return (
        <View
            style={styles.patientDetailsContainer}
        >
            <Text style={styles.detailText} >Name: {patient.name}</Text>
            <Text style={styles.detailText} >Address: {patient.address}</Text>
            <Text style={styles.detailText} >Age: {patient.age}</Text>
        </View>
    )
}


function CallEndButton({ closeCall }) {
    return (
        <TouchableOpacity
            onPress={closeCall}
            style={styles.buttonContainer}
        >
            <Text style={styles.detailText} >End Appointment</Text>
            <Image
                style={styles.imageContainer}
                source={{ uri: CALL_END_IMAGE }}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    buttonContainer: {
        bottom: 50,
        position: 'absolute',
        left: DEVICE_WIDTH / 2 - 130,
        height: 80,
        width: 260,
        backgroundColor: "red",
        padding: 10,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageContainer: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        tintColor: WHITE
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'center',
        width: undefined,
        height: undefined
    },
    doctorViewContainer: {
        position: 'absolute',
        width: 120,
        height: 200,
        resizeMode: 'cover',
        elevation: 3,
        bottom: 150,
        right: 10,
        borderRadius: 10,
    },
    patientDetailsContainer: {
        position: 'absolute',
        padding: 20,
        backgroundColor: TRANSPARENT_BLACK,
        elevation: 3,
        bottom: 150,
        left: 10,
        borderRadius: 10,
    },
    detailText: {
        color: WHITE,
        fontSize: 18,
        fontWeight: '500'
    }
})

export default VideoCallScene;
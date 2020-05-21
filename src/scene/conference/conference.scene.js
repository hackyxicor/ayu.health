import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import io from 'socket.io-client';


import {
    RTCView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices,
} from 'react-native-webrtc';
import { STUN, SERVER_URL, CALL_END_IMAGE, CALL_ICON } from '../../constants/global';
import { DEVICE_WIDTH, WHITE, TRANSPARENT_BLACK } from '../../constants/color';



const configuration = { iceServers: [{ url: STUN }] };


function ConferenceScene({ navigation, ...props }) {
    let connectedUser;
    const route = useRoute();
    const { params = {} } = route;
    const { appointment, endAppointment, userId } = params;
    const { patient = {} } = appointment || {};

    const peerConnection = new RTCPeerConnection(configuration);
    const room = "room1";
    const [socket, setSocket] = useState({});
    const [socketConnected, setSocketConnected] = useState(null);
    const [localStream, setLocalStream] = useState({ toURL: () => null });
    const [remoteStream, setRemoteStream] = useState({ toURL: () => null });
    const [calling, setCalling] = useState(false);
    const [callConnected, setCallConnected] = useState(false);
    const [offer, setOffer] = useState(null);
    const [callToUsername, setCallToUsername] = useState(null);

    useEffect(() => {
        const mysocket = io.connect(
            SERVER_URL,
            {
                transports: ['websocket']
            }
        )

        setSocket(mysocket);

        mysocket.on('connect', () => {
            setSocketConnected(true);
        });
    }, [])

    peerConnection.onnegotiationneeded = () => {
        if (userId == "doctor") {
            onCall("patient");
        }
    }

    peerConnection.onaddstream = event => {
        setRemoteStream(event.stream);
        setCallConnected(true);
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            send({
                type: 'candidate',
                candidate: event.candidate
            })
        }
    }

    useEffect(() => {
        if (socketConnected) {
            try {
                InCallManager.start({ media: 'audio' });
                InCallManager.setForceSpeakerphoneOn(true);
                InCallManager.setKeepScreenOn(true);
            } catch (err) {
                console.log("IN APP CALLER ", err);
            }

            send({
                type: 'login',
                name: userId,
                room: room,
            });
        }
    }, [socketConnected])

    useEffect(() => {
        if (!socketConnected) {
            return;
        }

        socket.on('message', (message) => {
            switch (message.type) {
                case 'offer':
                    handleOffer(message.offer, message.name);
                    break;
                case 'answer':
                    handleAnswer(message.answer);
                    break;
                case 'candidate':
                    handleCandidate(message.candidate);
                    break;
                case 'leave':
                    handleLeave();
                    break;
                default:
                    break;
            }
        })

        let isFront = true;
        mediaDevices.enumerateDevices().then(sourceInfos => {
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (
                    sourceInfo.kind == 'videoinput' &&
                    sourceInfo.facing == (isFront ? 'front' : 'environment')
                ) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }
            console.log('videoSourceId', videoSourceId)
            mediaDevices
                .getUserMedia({
                    audio: true,
                    video: {
                        mandatory: {
                            minWidth: 500, // Provide your own width, height and frame rate here
                            minHeight: 300,
                            minFrameRate: 30,
                        },
                        facingMode: isFront ? 'user' : 'environment',
                        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                    },
                })
                .then(stream => {
                    setLocalStream(stream);
                    peerConnection.addStream(stream);
                })
                .catch(error => {
                    // Log error
                });
        });
    }, [socketConnected])

    function send(message) {
        if (!socketConnected) {
            return;
        }

        if (connectedUser) {
            message.name = connectedUser;
            console.log('Connected iser in end----------', message);
        }

        try {
            console.log('send message', message);
            socket.emit("message", message);
        } catch (err) {
            console.log('err', err)
        }
    }

    function onCall(callTo) {
        setCalling(true);
        connectedUser = callTo;
        peerConnection.createOffer().then(offer => {
            peerConnection.setLocalDescription(offer).then(() => {
                send({
                    type: 'offer',
                    offer: offer,
                });
            });
        });
    };

    //when somebody sends us an offer
    async function handleOffer(offer, name) {
        connectedUser = name;
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            send({
                type: 'answer',
                answer: answer,
            });
        } catch (err) {
            console.log('Offerr Error', err);
        }
    };

    //when we got an answer from a remote user
    const handleAnswer = answer => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    };

    //when we got an ice candidate from a remote user
    const handleCandidate = candidate => {
        setCalling(false);
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    //hang up
    const hangUp = () => {
        send({
            type: 'leave',
        });

        handleLeave();
    };

    const handleLeave = () => {
        connectedUser = null;
        setRemoteStream({ toURL: () => null });
        peerConnection.close();
    };

    const acceptCall = async (offer) => {
        connectedUser = offer.name;
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await peerConnection.createAnswer();

            await peerConnection.setLocalDescription(answer);

            send({
                type: 'answer',
                answer: answer,
            });
        } catch (err) {
            console.log('Offerr Error', err);
        }
    };

    const rejectCall = async () => {
        send({
            type: 'leave',
        });
        setOffer(null);
        setCallConnected(false);
        handleLeave();
    };

    function PatientDetailsView() {
        return (
            <View
                style={styles.patientDetailsContainer}
            >
                <RTCView streamURL={localStream.toURL()} style={styles.smallView} />
            </View>
        )
    }


    function CallEndButton() {
        if (userId == "patient") {
            return null;
        }

        if (callConnected == false) {
            return (
                <TouchableOpacity
                    onPress={rejectCall}
                    style={[styles.buttonContainer, { backgroundColor: 'green' }]}
                >
                    <Text style={styles.detailText} >Call</Text>
                </TouchableOpacity>
            )
        }

        return (
            <TouchableOpacity
                onPress={rejectCall}
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

    return (
        <View style={styles.container}>
            <RTCView streamURL={remoteStream.toURL()} style={styles.imageBackground} />
            <PatientDetailsView patient={patient} />
            <CallEndButton />
        </View>
    );

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
        height: undefined,
        zIndex: 0
    },
    smallView: {
        width: 150,
        height: 200,
        elevation: 1,
        borderRadius: 10,
        zIndex: 10
    },
    patientDetailsContainer: {
        width: 150,
        height: 200,
        position: 'absolute',
        bottom: 150,
        left: 10,
        borderRadius: 10,
    },
    detailText: {
        color: WHITE,
        fontSize: 18,
        fontWeight: '500'
    }
});

export default ConferenceScene;
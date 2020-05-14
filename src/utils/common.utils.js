import { Dimensions } from 'react-native';
import { mediaDevices } from 'react-native-webrtc';

let localStream;
let otherStream;
let container;
let listContainer;
let currentType = null;
let streamerSocketId = null;

export function setStreamerSocketId(socketId) {
    streamerSocketId = socketId;
}

export function getStreamerSocketId() {
    return streamerSocketId;
}

export function setCurrentType(type) {
    currentType = type;
}

export function getCurrentType() {
    return currentType;
}

export function setListContainer(container) {
    listContainer = container;
}

export function getListContainer() {
    return listContainer;
}

export function setContainer(newContainer) {
    container = newContainer;
}

export function getContainer() {
    return container;
}

export function setLocalStream(stream) {
    localStream = stream;
}

export function getLocalStream() {
    return localStream;
}

export function setOtherStream(stream) {
    otherStream = stream;
}

export function getOtherStream() {
    return otherStream;
}

export function getLocalStreamDevice(isFront, callback) {
    let videoSourceId;

    console.log('usFront', isFront);

    mediaDevices.enumerateDevices().then(sourceInfos => {
        console.log(sourceInfos);
        for (let i = 0; i < sourceInfos.length; i++) {
            const sourceInfo = sourceInfos[i];
            if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
                videoSourceId = sourceInfo.deviceId;
            }
        }
        console.log(videoSourceId, 'videoSourceId');
        mediaDevices.getUserMedia(
            {
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 640,
                        minHeight: 360,
                        minFrameRate: 30
                    },
                    facingMode: isFront ? 'user' : 'environment',
                    optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
                }
            }
        ).then((stream) => {
            console.log('getUserMedia success', stream);
            callback(stream);
        }).catch((err) => {
            console.log('error : ' + error)
        })
    })
};

export function mapHash(hash, func) {
    const array = [];
    for (const key in hash) {
        const obj = hash[key];
        array.push(func(obj, key));
    }
    return array;
};

export function isNullOrUndefined(value) {
    return value === null || value === undefined;
};

export function getDimensions() {
    return Dimensions.get('window');
};

const Utils = {
    getLocalStreamDevice,
    setLocalStream,
    getLocalStream,
    getContainer,
    setContainer,
    mapHash,
    isNullOrUndefined,
    getDimensions,
    setOtherStream,
    getOtherStream,
    getListContainer,
    setListContainer,
    getCurrentType,
    setCurrentType,
    getStreamerSocketId,
    setStreamerSocketId,
};

export default Utils;
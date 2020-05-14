import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription
} from 'react-native-webrtc';
import Utils from './common.utils';
import SocketUtils from './socket.utils';

const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
const peers = {};

function getPeers() {
    return peers;
};

function createPC(socket_id, isOffer) {
    const pc = new RTCPeerConnection(configuration);
    const container = Utils.getContainer();
    const localStream = Utils.getLocalStream();
    peers[socket_id] = pc;
    console.log('PC peers', socket_id, peers);

    pc.onicecandidate = event => {
        console.log('PC: onicecandidate', event.candidate);
        if (event.candidate) {
            SocketUtils.emitExchangeServerCandidate(socket_id, event.candidate);
        }
    };

    const createOffer = () => {
        console.log('creating offer');
        pc.createOffer().then((value) => {
            pc.setLocalDescription(value).then(() => {
                console.log('PC: setLocalDescription', pc.localDescription);
                SocketUtils.emitExchangeServerSdp(socket_id, pc.localDescription);
            })
        }).catch((err) => {
            console.log("PC Error", err);
        })
    };

    pc.onnegotiationneeded = () => {
        console.log('PC: on-negotiation-needed');
        if (isOffer) {
            createOffer();
        }
    };

    pc.oniceconnectionstatechange = event => {
        console.log('PC: oniceconnectionstatechange', event.target.iceConnectionState);
        if (event.target.iceConnectionState === 'completed') {
            setTimeout(() => {
                getStats();
            }, 1000);
        }
        if (event.target.iceConnectionState === 'connected') {
            createDataChannel();
        }
    };
    pc.onsignalingstatechange = event => {
        console.log('PC: onsignalingstatechange', event.target.signalingState);
    };

    pc.onaddstream = event => {
        console.log('PC: onaddstream', event.stream);
        container.setOtherViewSource(event.stream.toURL());
    };

    pc.onremovestream = event => {
        console.log('PC: onremovestream', event.stream);
    };

    if (Utils.getCurrentType() === 'STREAMER') {
        Utils.getLocalStream().getAudioTracks()[0].enabled = true;
        Utils.getLocalStream().getVideoTracks()[0].enabled = true;
    }
    if (Utils.getCurrentType() === 'VIEWER') {
        Utils.getLocalStream().getAudioTracks()[0].enabled = false;
        Utils.getLocalStream().getVideoTracks()[0].enabled = false;
    }

    pc.addStream(localStream);

    return pc;
};

function exchange(data) {
    console.log("PC: Exhange ")
    const pcPeers = PeerConnectionUtils.getPeers();
    const fromId = data.from;
    let pc;

    console.log("PC: pcPeers", pcPeers);
    if (
        fromId === Utils.getStreamerSocketId() ||
        Utils.getStreamerSocketId() === null
    ) {
        if (fromId in pcPeers) {
            pc = pcPeers[fromId];
        } else {
            pc = createPC(fromId, false);
        }
        if (data.sdp) {
            console.log('PC: exchange sdp', data);

            pc
                .setRemoteDescription(new RTCSessionDescription(data.sdp))
                .then(() => {
                    if (pc.remoteDescription.type == 'offer')
                        pc.createAnswer().then((desc) => {
                            console.log('createAnswer', desc);
                            pc.setLocalDescription(desc).then(() => {
                                console.log('setLocalDescription', pc.localDescription);
                                SocketUtils.emitExchangeServerSdp(
                                    fromId,
                                    pc.localDescription
                                );
                            })
                                .catch(error => console.log('error : ' + error))
                        })
                            .catch(error => console.log('error : ' + error))
                })
                .catch((err) => {
                    console.log('PC: error : ' + err)
                })
        } else {
            console.log('PC: exchange candidate', data);
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    }
};

function getStats() {
    const pcPeers = PeerConnectionUtils.getPeers();
    const pc = pcPeers[Object.keys(pcPeers)[0]];
    console.log("PC: get status", pc)
    if (
        pc.getRemoteStreams()[0] &&
        pc.getRemoteStreams()[0].getAudioTracks()[0]
    ) {
        const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
        console.log('PC: track', track);
        pc.getStats(
            track,
            function (report) {
                console.log('PC: getStats report', report);
            },
            error => console.log('error : ', error)
        );
    }
};

const PeerConnectionUtils = {
    getPeers,
    exchange,
    createPC,
};

export default PeerConnectionUtils;
import io from 'socket.io-client';
import { per } from 'react-native-webrtc';
import PeerConnectionUtils from './peer-connection.utils';
import Utils from './common.utils';
import { LIST_SERVER, JOIN_SERVER, EXHANGE_CLIENT, LEAVE_CLIENT, EXCHANGE_SERVER, JOIN_CLIENT } from '../constants/event';

let socket = null;
const joined = [];
const listServer = [];

function getSocket() {
    return socket;
};

function getListServer() {
    return listServer;
};

function emitListServer() {
    socket.emit(LIST_SERVER, {}, responseListServer => {
        console.log(LIST_SERVER, responseListServer);

        // Utils.getListContainer().setState({ listServer: responseListServer });
    });
};

function connect() {

    try {
        socket = io.connect(
            'http://192.168.0.101:3333',
            {
                transports: ["websocket"]
            }
        );
    } catch (err) {
        console.log('err', err);
    }

};

function join(room_id, name) {
    socket.emit(JOIN_SERVER, { room_id, name }, joinedList => {
        console.log(JOIN_SERVER, joinedList);
        if (joinedList.length > 0) {
            const joined = joinedList[0];
            const socket_id = joined.socket_id;
            Utils.setStreamerSocketId(socket_id);
            PeerConnectionUtils.createPC(socket_id, true);
        }
    });
};

function leave(socket_id) {
    const container = Utils.getContainer();
    const pcPeers = PeerConnectionUtils.getPeers();
    const pc = pcPeers[socket_id];
    if (pc !== undefined) {
        const viewIndex = pc.viewIndex;
        pc.close();
        delete pcPeers[socket_id];

        const remoteList = container.state.remoteList;
        delete remoteList[socket_id];
        // container.setState({ remoteList: remoteList });
        // container.setState({ info: 'One peer leave!' });
    }
};

function handleOnExchange() {
    socket.on(EXHANGE_CLIENT, data => {
        console.log('exchange-client ', data);
        PeerConnectionUtils.exchange(data);
    });
};

function handleOnLeave() {
    socket.on(LEAVE_CLIENT, socketId => {
        leave(socketId);
    });
};

function handleOnConnect() {
    socket.on('connect', data => {
        console.log('connect');
        Utils.getLocalStreamDevice(true, stream => {
            Utils.setLocalStream(stream);
        });
    });
};

function emitExchangeServerSdp(to, sdp) {
    socket.emit(EXCHANGE_SERVER, {
        to,
        sdp
    });
};

function emitExchangeServerCandidate(to, candidate) {
    socket.emit(EXCHANGE_SERVER, {
        to,
        candidate
    });
};

function handleOnJoinClient() {
    socket.on(JOIN_CLIENT, friend => {
        joined.push(friend);
        // Utils.getContainer().setState({
        //     countViewer: Utils.getContainer().state.countViewer + 1
        // });
    });
};

function handleOnLeaveClient(participant) {
    socket.on(LEAVE_CLIENT, participant => {
        console.log('leave-client :', participant);
        const socket_id = participant.socket_id;
        if (PeerConnectionUtils.getPeers(socket_id)) {
            let pc = PeerConnectionUtils.getPeers[socket_id];
            if (pc !== null && pc !== undefined) {
                pc.close();
                delete PeerConnectionUtils.getPeers[socket_id];
            }
            // if (!Utils.isNullOrUndefined(Utils.getContainer())) {
            //     const newCountViewer = Utils.getContainer().state.countViewer - 1;
            //     Utils.getContainer().setState({
            //         countViewer: newCountViewer
            //     });
            // }
        }
    });
};

const SocketUtils = {
    getSocket,
    connect,
    join,
    handleOnConnect,
    handleOnExchange,
    handleOnLeave,
    handleOnJoinClient,
    handleOnLeaveClient,
    emitExchangeServerSdp,
    emitExchangeServerCandidate,
    emitListServer,
    getListServer,
};
export default SocketUtils;
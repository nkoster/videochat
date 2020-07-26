const socket = io('/')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '4444'
})
const videoGrid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')
const peers = {}

myVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', remoteVideStream => {
            addVideoStream(video, remoteVideStream)
        })
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    console.log('DISCONNECT', userId)
    peers[userId] && peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', remoteVideoStream => {
        addVideoStream(video, remoteVideoStream)
    })
    call.on('close', _ => {
        video.remove()
    })
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', _ => {
        video.play()
    })
    videoGrid.append(video)
}

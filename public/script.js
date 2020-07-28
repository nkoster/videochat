const socket = io('/')
const myPeer = new Peer(undefined, {
    host: 'rtc.w3b.net',
    port: '443',
    config: {'iceServers': [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:w3b.net', username: 'peer', credential: 'peer' }
      ]} /* Sample servers, please use appropriate ones */
})
const videoGrid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')
const peers = {}

myVideo.muted = true

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
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
.catch(err => console.log(err.message))

socket.on('user-disconnected', userId => {
    console.log('DISCONNECT', userId)
    peers[userId] && peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    video.setAttribute('autoplay', '')
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    call.on('stream', remoteVideoStream => {
        addVideoStream(video, remoteVideoStream)
    })
    call.on('close', _ => video.remove())
    peers[userId] = call
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.setAttribute('autoplay', '')
    video.setAttribute('playsinline', '')
    video.addEventListener('loadedmetadata', _ => video.play())
    videoGrid.append(video)
}

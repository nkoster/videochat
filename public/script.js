const socket = io('/')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '4444'
})
const videoGrid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')

myVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-connected', userId => {
    console.log('CONNECTED', userId)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', _ => {
        video.play()
    })
    videoGrid.append(video)
}

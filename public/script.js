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
    const videos = document.querySelectorAll('video')
    if (videos.length > 1)
      if (videos[1].getAttribute('id') === 'me') videos[1].remove()
    const del = document.getElementById(userId)
    del && del.remove()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    if (!userId) return
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    video.setAttribute('autoplay', '')
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    call.on('stream', remoteVideoStream => {
        addVideoStream(video, remoteVideoStream, userId)
    })
    call.on('close', _ => video.remove())
    peers[userId] = call
}

const addVideoStream = (video, stream, userId = 'me') => {
    video.srcObject = stream
    video.setAttribute('autoplay', '')
    video.setAttribute('playsinline', '')
    video.addEventListener('loadedmetadata', _ => video.play())
    videoGrid.append(video)
    video.setAttribute('id', userId)
}

// here we have access to room id and all the socket io code which is essential for calling "join-room" function

// socket is connected to root path
const socket = io("/"); // running on frontend. This io object is globally available

// making a refrence to the Grid which will contain all our videos
const videoGrid = document.getElementById("video-grid");;

// Making connection with peer server. The peer server will take all the webRTC information of the user and turns it into a userId
const peer = new Peer(undefined, { // we are passing (id) undefined as we want peerjs to take care of id on its own
    host: "/",
    port: "443"
});

// getting reference to a video
const myVideo = document.createElement("video");// creating  video element
myVideo.muted = true; // so that we don't here our own voice doesn't mute for other people

const peers ={} // object for storing the call

let myVideoStream // object for storing the media stream (A stream of media content consisting of several video and audio track)
// connecting our video
navigator.mediaDevices.getUserMedia({// it prompts the user for permission to use a media input which produces a MediaStream
    // we want audio and video
    video: true,
    audio: true,
}).then(stream => {// stream is going to be our video and audio and we want our video object to use that stream (myVideo)
    
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream);// adding our video stream

    // to get to see other video we want to take the call which the other user sends
    peer.on("call", (call) => {
        call.answer(stream); // for us to see their video
        
        // this way the other user can also see our video
        const video = document.createElement("video");
        call.on("stream", userVideoStream => {
            
            addVideoStream(video, userVideoStream)// adding other users' video stream
        });
    });

    // listner for new member connection
    socket.on("user-connected", (userId) => {
    //("User id is: ", userId);
    // sending our video stream to new user
    //connectToNewUser(userId, stream);
   
    // sending the existing stream to new user 
    setTimeout(connectToNewUser,1000,userId,stream);// to resolve the race problem
});
})

socket.on("user-disconnected", userId => {
    //(userId);
    if(peers[userId]){
        
        peers[userId].close(); // closing connection with the user
    }
});

// as soon as we connects to peer server we will join our user to a room
peer.on("open", id => {
    // calling join room function in index.js
    
    socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    // calling user with id "userId" and giving them our stream
   
    const call = peer.call(userId, stream);// sending our stream to the new user

    // and after that they will send their video stream which we want to add to ours
    const video = document.createElement("video");
    call.on("stream", userVideoStream => {
      
        addVideoStream(video, userVideoStream);
    });

    // whenever person leaves we want to disconnect their video
    call.on("close", () => {
        
        video.remove();
    });

    // every userId is linked to the call we make with them
    ("prevoius ", peers);
    peers[userId] = call;
    ("new ", peers);
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream; // setting the mediaStream of video object
    // this will allow us to play our video
  
    video.addEventListener("loadedmetadata", () => {
        video.play(); // once the stream is loaded play the video
    });
    ("video ", video);
    videoGrid.append(video); // adding new video to videoGrid
}

// Mute Unmute functionality
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled; // gives a boolean value
    if (enabled) { // if its true mute it
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => { // change the font icon
    const html = `<i class="fas fa-microphone"></i><span>Mute</span>`
    document.querySelector('.main__mute_button').innerHTML = html;
}
  
const setUnmuteButton = () => { // change the font icon
    const html = `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Play Stop
const playStop = () => {
    //('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `<i class="fas fa-video"></i><span>Stop Video</span>`
    document.querySelector('.main__video_button').innerHTML = html;
}
  
const setPlayVideo = () => {
    const html = `<i class="stop fas fa-video-slash"></i><span>Play Video</span>`
    document.querySelector('.main__video_button').innerHTML = html;
}
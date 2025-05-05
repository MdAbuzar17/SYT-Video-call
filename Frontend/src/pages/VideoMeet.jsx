import { useEffect, useRef, useState } from "react"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import io from "socket.io-client";
import "../pages/VideoMeet.css";
import {IconButton, Badge} from "@mui/material";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import {useNavigate} from "react-router-dom"


const server_url = "http://localhost:8080";
var connections = {};

const peerConfigConnections = {
    "iceServers": [        // ice = interactive connection establishment
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeet() {
    var socketRef = useRef();

    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);     // video when on or off

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setShowModal] = useState(false);

    let [screenAvailable, setScreenAvailble] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    // Todo
    // if(isChrome === false) {

    // }

    useEffect(() => {
        // console.log("hello");
        getPermissions();
    }, []);

    const getPermissions = async () => {
        try {   
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

            if(videoPermission) {
                setVideoAvailable(true);
                // console.log("video permission granted");
            } else {
                setVideoAvailable(false);
                // console.log("video permission denied");
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

            if(audioPermission) {
                setAudioAvailable(true);
                // console.log("audio permission granted");
            } else {
                setAudioAvailable(false);
                // console.log("audio permission denied");
            }

            if(navigator.mediaDevices.getDisplayMedia) {    // screen sharing
                setScreenAvailble(true);
            } else {
                setScreenAvailble(false);
            }

            if(videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

                if(userMediaStream) {
                    window.localStream = userMediaStream;
                    if(localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch(err) {
            console.log(err);
        }
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())

        } catch(e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;  // (doubt) white screen

        for(let id in connections) {
            if(id === socketIdRef.current) {
                continue;
            }
            connections[id].addStream(window.localStream);

            connections[id].createOffer()
            .then((description) => {
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
                })
                .catch(e => console.log(e));
            }) 
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setAudio(false);
            setVideo(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch(e) {
                console.log(e);
            }

            // TODO BlackSilence  -> completed
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;


            for(let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer()
                .then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({"sdp" : connections[id].localDescription}));
                    }).catch(e => console.log(e));
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dest = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();

        return Object.assign(dest.stream.getAudioTracks()[0], {enabled : false});
    }

    let black = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {width, height});

        canvas.getContext('2d').fillRect(0, 0, width, height);  // fill rectangle
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false});
    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(getUserMediaSuccess)      // Todo  -> getUserMediaSuccess
            .then((stream) => {})
            .catch((err) => console.log(err));  
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch(err) {
                console.log(err);
            }
        }
    }
    
    useEffect(() => {
        if(video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if(fromId !== socketIdRef.current) {
            if(signal.sdp ) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if(signal.sdp.type === "offer") {
                        connections[fromId].createAnswer()
                        .then((description) => {
                            connections[fromId].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }

            if(signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e => console.log(e));
            }
        }
    }

    // Todo addMessage -> completed
    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMsg) => [
            ...prevMsg, {data: data, sender: sender}
        ])

        if(socketIdSender !== socketIdRef.current) {
            setNewMessages((prevMsg) => prevMsg + 1);
        }
    }
    
    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, {secure: false});

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id)=> {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            })

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);  // stun server

                    connections[socketListId].onicecandidate = (event) => {
                        if(event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({"ice": event.candidate}));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if(videoExists) {
                            // console.log("Found existing");

                            setVideos(videos => {
                                const updatedVideos = videos.map(video => 
                                    video.socketId === socketListId ? {...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true,
                            }
                            
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];  // instead of push i am using spread operator
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        }
                    };

                    if(window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        // TODO blackSilence -> completed
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                })

                // below line heps to create offer letter and handshake 

                if(id === socketIdRef.current) {
                    for(let id2 in connections) {
                        if(id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream);
                        } catch(e) {
                            console.log(e);
                        }

                        connections[id2].createOffer()
                        .then((description) => {
                            connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({"sdp" : connections[id2].localDescription}));  // sdp = session description
                            }).catch(e => console.log(e));
                        })
                    }
                }
            })
        })
    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);

        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch(e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections) {
            if(id === socketIdRef.current) {
                continue;
            }
            connections[id].addStream(window.localStream);
            connections[id].createOffer()
            .then((description) => {
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
                }).catch(e => console.log(e));
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch(e) {
                console.log(e);
            }

            // TODO BlackSilence  -> completed
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;


            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if(screen) {
            if(navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({video: video, audio: audio})
                .then(getDisplayMediaSuccess)
                .then((stream) => {})
                .catch((err) => console.log(err));  
            }
        }
    }

    useEffect(() => {
        if(screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen]);

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleChat = () => {
        setShowModal(!showModal);
        
        if(!showModal) {
            setNewMessages(0);
        }
    }

    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    let typedMessage = (evt) => {
        setMessage(evt.target.value);
    }

    let routeTo = useNavigate();

    let handleCallEnd = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch(e) {
            throw e;
        }

        routeTo("/home");
    }

    return(
        <div>
            {askForUsername === true ? 
            <div> 
                <h2>Enter into Lobby</h2>
                <br />
                <TextField id="outlined-basic" label="Username" variant="outlined" value={username} onChange={e => setUsername(e.target.value)}/>
                    &nbsp; &nbsp;
                <Button variant="contained" onClick={connect}>Connect</Button>
            
                <div>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div> 
            </div> : 


            <div className="meetVideoContainer">

                {showModal ? 
                    <div className="chatRoom">
                        <div className="chatContainer">
                            <h1>Chat</h1> 

                            <div className="chattingDisplay">
                                {messages.length != 0 ? messages.map((item, idx) => {
                                    return (
                                        <div key={idx} className="eachChats">
                                            <p> <b>{item.sender} </b> </p>
                                            <p> {item.data} </p>
                                        </div>
                                    )
                                }) : <p> No messages yet </p>}
                            </div>

                            <div className="chattingArea">
                                <TextField value={message} onChange={typedMessage} id="outlined-basic" label="Enter your chat" variant="outlined" />
                                &nbsp;
                                <Button variant="contained" onClick={sendMessage} >Send</Button>
                            </div>
                        </div> 
                    </div>
                    : <></> 
                }

                <div className="buttonContainers">
                    <IconButton onClick={handleVideo}>
                        {(video === true) ? <VideocamIcon/> : <VideocamOffIcon/>}
                    </IconButton>

                    <IconButton onClick={handleCallEnd} id="callEndIcon">
                        <CallEndIcon/>
                    </IconButton>

                    <IconButton onClick={handleAudio}>
                        {(audio === true) ? <MicIcon/> : <MicOffIcon/>}
                    </IconButton>

                    {(screenAvailable === true) ? 
                        <IconButton onClick={handleScreen}>
                            {(screen === true) ? <ScreenShareIcon/> : <StopScreenShareIcon/>}
                        </IconButton>
                        : <></>
                    }

                    <Badge badgeContent={newMessages} max={99} color="primary">
                        <IconButton onClick={handleChat} >
                            <ChatIcon/>
                        </IconButton>
                    </Badge>

                </div>

                <video className="meetUserVideo" ref={localVideoRef} autoPlay muted></video>
                
                <div className="conferenceView">
                    {videos.map((video) => (
                        <div  key={video.socketId}>

                            <video
                                data-socket={video.socketId}
                                ref={ref => {
                                    if (ref && video.stream) {
                                        ref.srcObject = video.stream;
                                    }
                                }}
                                autoPlay
                            ></video>

                        </div>
                    ))}
                </div>

            </div>}

        </div>
    )
}
import { Server } from "socket.io"

let connections = {};
let messages = {};
let timeOnLine = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: "GET, POST",
            allowedHeaders: ["*"],
            credentials: true,
        }
    });
    
    io.on("connection", (socket) => {
        // console.log("Something is connected");

        socket.on("join-call", (path) => {
            if(connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            timeOnLine[socket.id] = new Date();

            // connections[path].forEach(ele => {
            //     io.to(ele);
            // });
            // or

            for(let i=0; i<connections[path].length; i++) {
                io.to(connections[path][i]).emit("user-joined", socket.id, connections[path]);
            }

            if(messages[path] === undefined) {
                for(let i=0; i<connections[path].length; i++) {
                    io.to(connections[path][i]).emit("chat-message", connections[path][i]['data'], 
                        connections[path][i]['sender'], connections[path][i]['socket-id-sender']);
                }
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                if(!isFound && roomValue.includes(socket.id)) {
                    return [roomKey, true];
                }

                return [room, isFound]
            }, ["", false]);

            if(found) {
                if(messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({ "data": data, "sender": sender, "socket-id-sender": socket.id});
                // console.log("message ", matchingRoom, " : ", sender, data);

                connections[matchingRoom].forEach(elem => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);   // socket.id -> to detect from where msg is coming
                });
            }
        })

        socket.on("disconnect", () => {
            var diffTime = Math.abs(new Date() - timeOnLine[socket.id]);
            var key;

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for(let i=0; i<v.length; i++) {
                    if(v[i] === socket.id) {
                        key = k;

                        for(let j=0; j<connections[key].length; j++) {
                            io.to(connections[key][j]).emit("user-left", socket.id);
                        }

                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);

                        if(connections[key].length === 0) {
                            delete connections[key];
                        }
                    }

                }
            }
        })
    })
}
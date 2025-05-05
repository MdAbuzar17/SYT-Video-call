import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controller/socketManager.js";
import { User } from "./models/user.js";  // user model
import userRoutes from "./routes/user.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);            // server <-- app and io

app.set("port", process.env.PORT);
app.use(cors());   // CORS is used to control which web apps can talk to your backend or API from a different origin. It keeps your app secure while allowing legitimate cross-origin requests.
app.use(express.json({limit: "40kb"})); // Parses incoming JSON Protects your server by rejecting JSON bodies bigger than 40KB
app.use(express.urlencoded({limit: "40kb", extended: true}));  // handle parsing of the form

app.use("/api/v1/users", userRoutes);

const dburl = process.env.ATLASDB_URL;

main().then(() => {
        console.log("connected to db");
    })
    .catch(err => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dburl);
}

// let user1 = new User({
//     name: "Abuzar",
//     username: "abu17",
//     password: "abuzar@123"
// })

// user1.save()
//     .then((res) => {
//         console.log(res);
//     })

app.get("/home", (req, res) => {
    res.send("hello world from Mr. Abuzar");
})

server.listen(app.get("port"), ()=> {
    console.log("Server is listening to port 8080");
})
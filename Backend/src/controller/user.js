import httpStatus from "http-status";
import {User} from "../models/user.js";
import bcrypt, {hash} from "bcrypt";
import crypto from "crypto";
import {Meeting} from "../models/meeting.js";
import jwt from "jsonwebtoken";

const signup = async(req, res) => {
    let {name, username, password} = req.body;

    const existingUser = await User.findOne({username});
    if(existingUser) {
        return res.status(httpStatus.FOUND).json({message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);     // 10 salts (size)
    const newUser = new User({
        name: name,
        username: username,
        password: hashedPassword
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({message: "User Registered successfully!"});
}

const login = async (req, res) => {
    let {username, password} = req.body;
    if(!username || !password) {
        res.status(400).json({message: "Please provide"});
    }

    const user = await User.findOne({username});
    if(!user) {
        return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(isPasswordCorrect) {       // comparing user password and hashed password
        let token = crypto.randomBytes(20).toString("hex");    // generate token

        user.token = token;
        await user.save();
        res.status(httpStatus.OK).json({token: token});
    } else {
        return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid username or password"});
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ userId: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            userId: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


export {signup, login, getUserHistory, addToHistory};
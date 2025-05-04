import { useNavigate } from "react-router-dom";
import {withAuth} from "../utils/withAuth";
import "../pages/HomeComponent.css";
import { IconButton, Button, TextField } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const {addToUserHistory} = useContext(AuthContext)

    let handleJoinVideoCall = async() => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    let handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    }

    let textField = (e) => {
        setMeetingCode(e.target.value);
    }

    let handleHistory = () => {
        navigate("/history");
    }

    return (
        <>
            <div className="navbar">
                <div>
                    <h2>SeeYouThere Video Call</h2>
                </div>

                <div className="historyandLogout">
                    <IconButton onClick={handleHistory}>
                        <HistoryIcon/>
                    </IconButton>
                    <p>History</p>
                    &nbsp; &nbsp;
                    <Button onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
            
            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>
                        <br />
                        <div className="textandJoinButton">
                            <TextField onChange={textField} id="outlined-basic" label="Meeting-Code" variant="outlined"/>
                            <br /><br />
                            <Button onClick={handleJoinVideoCall} variant="contained">Join</Button>
                        </div>
                    
                    </div>
                </div>

                <div className="rightPanel">
                    <img src="/logo3.png" alt="Image" />
                </div>
            </div>
        </>
    )
}

export default withAuth(HomeComponent);
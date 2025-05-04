import "./LandingPage.css"
import { Link, useNavigate } from "react-router-dom"

export default function LandingPage() {
    const routeTo = useNavigate();

    let handleJoinGuest = () => {
        routeTo("/q23jd3");
    }

    let hanleLoginRegister = () => {
        routeTo("/auth");
    }

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>SeeYouThere Video Call</h2>
                </div>
                <div className="navlist">
                    <p onClick={handleJoinGuest} >Join as Guest</p>
                    <p onClick={hanleLoginRegister} >Register</p>
                    <div role="button" onClick={hanleLoginRegister}>Login</div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#ff9839"}}>Connect </span>with your Loved Ones</h1>
            
                    <p>Cover a distance by SYT video call</p>
                    <br />
                    <div role="button">
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>

                <div>
                    <img src="/mobile.png"></img>
                </div>
            </div>
        </div>
    )
}
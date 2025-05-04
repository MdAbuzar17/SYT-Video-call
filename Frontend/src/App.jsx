// import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Authentication from "./pages/Authentication"
import LandingPage from "./pages/LandingPage"
import { AuthProvider } from "./contexts/AuthContext"
import VideoMeet from "./pages/VideoMeet"
import HomeComponent from "./pages/HomeComponent"
import History from "./pages/History"

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={ <LandingPage/> }></Route>
            <Route path="/auth" element={ <Authentication/> }></Route>
            <Route path="/home" element={ <HomeComponent/> } ></Route>
            <Route path="/history" element={ <History/> } ></Route>
            <Route path="/:url" element={ <VideoMeet/> }></Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';


// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [error, setError] = React.useState("");

    const [formstate, setFormstate] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    let handleName = (e) => {
      setName(e.target.value);
    }

    let handleUsername = (e) => {
      setUsername(e.target.value);
    }

    let handlePassword = (e) => {
      setPassword(e.target.value);
    }

    const {handleRegister, handleLogin} = React.useContext(AuthContext);

    let handleAuth = async() => {
      try{
        if(formstate === 0) {
          let result = await handleLogin(username, password);
          
        } 
        if(formstate === 1) {
          let result = await handleRegister(name, username, password);
          // console.log(result);
          setUsername("");
          setMessage(result);
          setOpen(true);
          setError("");
          setFormstate(0);
          setPassword("");
        }

      } catch(err) {
        // console.log(err);
        let message = (err.response.data.message);
        setError(message);
      }
    }

    let routeTo = useNavigate();
    
    return (
      <div>

        <div>
          <IconButton onClick={() => {
                  routeTo("/")
              }}>
                  <HomeIcon />
              </IconButton >
        </div>

      
      <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

           <div>
            <Button variant={formstate === 0 ? "contained": ""} onClick={() => setFormstate(0)}>Sign In</Button>
            <Button variant={formstate === 1 ? "contained": ""} onClick={() => setFormstate(1)}>Sign Up</Button>
           </div>

            <Box component="form" noValidate sx={{mt: 1}}>
              {formstate === 1 ? <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                value={name}
                autoFocus
                onChange={handleName}
              />: <></>}

              <TextField
                margin='normal'
                required
                fullWidth
                id='username'
                label='Username'
                name='username'
                value={username}
                onChange={handleUsername}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id='password'
                onChange={handlePassword}
              />

              <p style={{ color: 'red' }}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formstate === 0 ? "Login": "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open = {open}
        autoHideDuration = {4000}
        message = {message}
      />

    </ThemeProvider>
    </div>
    );
}

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar} from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [formstate, setFormstate] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleName = (e) => setName(e.target.value);
  const handleUsername = (e) => setUsername(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);

  const handleAuth = async () => {
    try {
      if (formstate === 0) {
        await handleLogin(username, password);
      }
      if (formstate === 1) {
        const result = await handleRegister(name, username, password);
        setUsername("");
        setPassword("");
        setName("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormstate(0);
      }
    } catch (err) {
      const message = err?.response?.data?.message || "An error occurred";
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

      <Box
        component="main"
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Left side image */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
            backgroundImage: 'url(https://images.unsplash.com/photo-1612831455359-970e23a1e4e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dmlkZW8lMjBjYWxsfGVufDB8fDB8fHww)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Right side form */}
        <Box
          component={Paper}
          elevation={6}
          square
          sx={{
            width: { xs: '100%', md: '40%'},
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          <Box sx={{ mb: 2 }}>
            <Button
              variant={formstate === 0 ? "contained" : "text"}
              onClick={() => setFormstate(0)}
              sx={{ mr: 1 }}
            >
              Sign In
            </Button>
            <Button
              variant={formstate === 1 ? "contained" : "text"}
              onClick={() => setFormstate(1)}
            >
              Sign Up
            </Button>
          </Box>

          <Box component="form" noValidate sx={{ width: '100%', maxWidth: 400 }}>
            {formstate === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                value={name}
                onChange={handleName}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={username}
              onChange={handleUsername}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={handlePassword}
            />

            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>

            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleAuth}
            >
              {formstate === 0 ? "Login" : "Register"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}
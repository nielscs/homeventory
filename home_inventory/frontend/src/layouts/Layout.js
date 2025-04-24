import React from "react";
import { AppBar, Toolbar, Typography, Button, Container, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import MicIcon from "@mui/icons-material/Mic";  // ✅ Import Mic Icon
import VoiceAssistant from "../components/VoiceAssistant";  // ✅ Import Voice Assistant Component

function Layout({ children }) {
  return (
    <>
      {/* ✅ Global Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Homeventory
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/rooms">
            Rooms
          </Button>
          <Button color="inherit" component={Link} to="/settings">
            Settings
          </Button>

          {/* ✅ Voice Assistant Button */}
          <VoiceAssistant />
        </Toolbar>
      </AppBar>

      {/* ✅ Page Content Goes Here */}
      <Container sx={{ mt: 3 }}>{children}</Container>
    </>
  );
}

export default Layout;

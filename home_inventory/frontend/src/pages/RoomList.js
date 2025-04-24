import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/rooms/")
      .then((response) => {
        setRooms(response.data);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  }, []);

  return (
    <>
      {/* ✅ Room List */}
      <Container sx={{ mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rooms Overview
        </Typography>
        {rooms.map((room) => (
          <Card key={room.id} variant="outlined" sx={{ marginBottom: 2, padding: 2 }}>
            <CardContent>
              <Typography variant="h5" component="h2">
                <Link to={`/rooms/${room.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  {room.name} {/* Clickable Room Name */}
                </Link>
              </Typography>
              <Typography color="textSecondary">
                {room.description}
                <br />
                <Link to={`/rooms/${room.id}/inventory`} style={{ textDecoration: "none", color: "blue" }}>
                  Show Inventory
                </Link>
              </Typography>
              <Typography variant="h6" component="h3" sx={{ marginTop: 2 }}>
                Locations:
              </Typography>
              {room.locations.length > 0 ? (
                <List>
                  {room.locations.map((location) => (
                    <ListItem key={location.id}>
                      <ListItemText
                        primary={
                          <Link to={`/locations/${location.id}`} style={{ textDecoration: "none", color: "blue" }}>
                            {location.name}
                          </Link>
                        }
                        secondary={location.description}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">No locations in this room.</Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
}

export default RoomList;

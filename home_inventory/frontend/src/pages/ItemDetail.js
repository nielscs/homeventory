import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    serial_number: "",
    purchase_date: "",
    purchase_price: "",
    current_value: "",
    quantity: "",
    room_id: "",
    location_id: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ✅ Fetch item details, including Location & Room
  useEffect(() => {
    axios.get(`http://localhost:8000/api/items/${id}/`)
      .then((response) => {
        setItem(response.data);
        setFormValues({
          name: response.data.name,
          description: response.data.description,
          serial_number: response.data.serial_number || "",
          purchase_date: response.data.purchase_date || "",
          purchase_price: response.data.purchase_price || "",
          current_value: response.data.current_value || "",
          quantity: response.data.quantity || "",
          room_id: response.data.room_id || "",
          location_id: response.data.location_id || "",
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching item:", error);
        setError("Failed to fetch item details.");
        setLoading(false);
      });

    // ✅ Fetch Rooms & Locations
    axios.get("http://localhost:8000/api/rooms/").then(response => setRooms(response.data));
    axios.get("http://localhost:8000/api/locations/").then(response => setLocations(response.data));
  }, [id]);

  // ✅ Update location dropdown when room selection changes
  useEffect(() => {
    if (formValues.room_id) {
      const relatedLocations = locations.filter(loc => loc.room === formValues.room_id);
      setFilteredLocations(relatedLocations);

      // ✅ If current location doesn't belong to the new room, reset it
      if (!relatedLocations.some(loc => loc.id === formValues.location_id)) {
        setFormValues((prevValues) => ({ ...prevValues, location_id: "" }));
      }
    } else {
      setFilteredLocations([]);
    }
  }, [formValues.room_id, locations]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!item) return <Typography>No item found.</Typography>;

  // ✅ Handle form input changes
  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  // ✅ Handle updating the item
  const handleUpdate = () => {
    axios.put(`http://localhost:8000/api/items/${id}/`, formValues)
      .then((response) => {
        setItem(response.data);
        setEditing(false);
        setSnackbarMessage("Item updated successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error updating item:", error);
        setSnackbarMessage("Failed to update item.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // ✅ Handle delete confirmation
  const handleDeleteConfirm = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  // ✅ Handle deleting the item
  const handleDelete = () => {
    axios.delete(`http://localhost:8000/api/items/${id}/`)
      .then(() => {
        setOpenDialog(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        setOpenDialog(false);
        setSnackbarMessage("Failed to delete item.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  return (
    <Container>
      {editing ? (
        <Box component="form" sx={{ mt: 3 }}>
          <Typography variant="h4">Edit Item</Typography>
          <TextField fullWidth label="Name" name="name" value={formValues.name} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" name="description" value={formValues.description} onChange={handleChange} sx={{ mb: 2 }} />

          {/* ✅ Room Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Room</InputLabel>
            <Select name="room_id" value={formValues.room_id} onChange={handleChange}>
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ✅ Location Dropdown (Filtered by Room) */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Location</InputLabel>
            <Select name="location_id" value={formValues.location_id} onChange={handleChange} disabled={!formValues.room_id}>
              {filteredLocations.map((location) => (
                <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mr: 2 }}>Save</Button>
          <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>{item.name}</Typography>
          <Typography variant="body1">{item.description}</Typography>
          <Typography variant="body2" color="textSecondary">Serial Number: {item.serial_number || "N/A"}</Typography>
          <Typography variant="body2" color="textSecondary">Room: {item.room_name || "No Room"}</Typography>
          <Typography variant="body2" color="textSecondary">Location: {item.location_name || "No Location"}</Typography>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={() => setEditing(true)} sx={{ mr: 2 }}>Edit</Button>
            <Button variant="outlined" color="error" onClick={handleDeleteConfirm}>Delete</Button>
          </Box>
        </>
      )}
    </Container>
  );
}

export default ItemDetail;

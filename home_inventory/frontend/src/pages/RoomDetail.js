// src/components/RoomDetail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, TextField, Box, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Alert, List, ListItem, ListItemText, CircularProgress
} from '@mui/material';

function RoomDetail() {
  const { id } = useParams(); // Get room ID from URL
  const navigate = useNavigate(); // For navigation after deletion

  const [room, setRoom] = useState(null); // Room details
  const [locations, setLocations] = useState([]); // Related locations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [editing, setEditing] = useState(false); // Edit mode
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    floor_level: '',
  }); // Edit form state

  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Notification state
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Notification message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Notification type

  // Fetch room details including locations
  useEffect(() => {
    axios.get(`http://localhost:8000/api/rooms/${id}/`)
      .then(response => {
        setRoom(response.data);
        setLocations(response.data.locations || []); // Ensure locations exist
        setFormValues({
          name: response.data.name,
          description: response.data.description,
          floor_level: response.data.floor_level,
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching room:', error);
        setError('Failed to fetch room details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!room) return <Typography>No room found.</Typography>;

  // Handle form input changes
  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  // Handle updating the room
  const handleUpdate = () => {
    axios.put(`http://localhost:8000/api/rooms/${id}/`, formValues)
      .then(response => {
        setRoom(response.data);
        setEditing(false);
        setSnackbarMessage('Room updated successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(error => {
        console.error('Error updating room:', error);
        setSnackbarMessage('Failed to update room.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  // Handle deleting the room
  const handleDelete = () => {
    axios.delete(`http://localhost:8000/api/rooms/${id}/`)
      .then(() => {
        setOpenDialog(false);
        navigate('/'); // Redirect to room list
      })
      .catch(error => {
        console.error('Error deleting room:', error);
        setOpenDialog(false);
        setSnackbarMessage('Failed to delete room.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  // Handle closing notifications
  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Container>
      {editing ? (
        <Box component="form" sx={{ mt: 3 }}>
          <Typography variant="h4">Edit Room</Typography>
          <TextField fullWidth label="Name" name="name" value={formValues.name} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" name="description" value={formValues.description} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Floor Level" name="floor_level" value={formValues.floor_level} onChange={handleChange} sx={{ mb: 2 }} />
          <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mr: 2 }}>Save</Button>
          <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>{room.name}</Typography>
          <Typography variant="body1">{room.description}</Typography>
          <Typography variant="body2" color="textSecondary">Floor Level: {room.floor_level}</Typography>

          {/* Display Related Locations */}
          <Typography variant="h5" sx={{ mt: 4 }}>Locations</Typography>
          {locations.length > 0 ? (
            <List>
              {locations.map(location => (
                <ListItem key={location.id}>
                  <ListItemText primary={location.name} secondary={location.description} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">No locations assigned to this room.</Typography>
          )}

          {/* Buttons */}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={() => setEditing(true)} sx={{ mr: 2 }}>Edit</Button>
            <Button variant="outlined" color="error" onClick={handleDeleteConfirm}>Delete</Button>
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this room? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default RoomDetail;

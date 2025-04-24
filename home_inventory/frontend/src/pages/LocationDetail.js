import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
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
import InventoryTable from "../components/InventoryTable";  // ✅ Import InventoryTable component

function LocationDetail() {
  const { id } = useParams();  // Get location ID from URL
  const navigate = useNavigate();  // Navigation after delete

  const [location, setLocation] = useState(null);
  const [items, setItems] = useState([]);  // ✅ Store items in this location
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showInventory, setShowInventory] = useState(false);  // ✅ Toggle inventory table

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ✅ Fetch location details and linked items
  useEffect(() => {
    axios.get(`http://localhost:8000/api/locations/${id}/`)
      .then((response) => {
        setLocation(response.data);
        setFormValues({
          name: response.data.name,
          description: response.data.description,
        });

        // ✅ Store items from this location
        setItems(response.data.items || []);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
        setError("Failed to fetch location details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!location) return <Typography>No location found.</Typography>;

  // ✅ Handle form input changes
  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  // ✅ Handle updating the location
  const handleUpdate = () => {
    // ✅ Remove empty values before sending the request
    const filteredFormValues = Object.fromEntries(
      Object.entries(formValues).filter(([_, value]) => value !== "")
    );
  
    axios.patch(`http://localhost:8000/api/locations/${id}/`, filteredFormValues)  // ✅ Use PATCH for partial updates
      .then((response) => {
        setLocation(response.data);
        setEditing(false);
        setSnackbarMessage("Location updated successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error updating location:", error.response?.data || error.message);
        alert("Failed to update location: " + JSON.stringify(error.response?.data));
      });
  };

  // ✅ Handle delete confirmation
  const handleDeleteConfirm = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  // ✅ Handle deleting the location
  const handleDelete = () => {
    axios.delete(`http://localhost:8000/api/locations/${id}/`)
      .then(() => {
        setOpenDialog(false);
        navigate("/");  // Redirect to home page
      })
      .catch((error) => {
        console.error("Error deleting location:", error);
        setOpenDialog(false);
        setSnackbarMessage("Failed to delete location.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleAddItem = (newItem) => {
    // ✅ Remove empty fields from the request payload
    const filteredItem = Object.fromEntries(
      Object.entries(newItem).filter(([_, value]) => value !== "")
    );
  
    return axios.post(`http://localhost:8000/api/items/`, {
      ...filteredItem,
      location: parseInt(id, 10),  // ✅ Ensure correct location
    })
    .then((response) => {
      setItems((prevItems) => [...prevItems, response.data]); // ✅ Add item with real ID
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to add item:", error.response?.data || error.message);
      alert("Failed to add item: " + JSON.stringify(error.response?.data));
    });
  };

  // ✅ Update existing item
  const handleUpdateItem = (updatedItem) => {
    axios.put(`http://localhost:8000/api/items/${updatedItem.id}/`, updatedItem)
      .then(() => setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item))))
      .catch(() => alert("Failed to update item."));
  };

  // ✅ Delete item from inventory
  const handleDeleteItem = (itemId) => {
    axios.delete(`http://localhost:8000/api/items/${itemId}/`)
      .then(() => setItems(items.filter((item) => item.id !== itemId)))
      .catch(() => alert("Failed to delete item."));
  };

  return (
    <Container>
      {editing ? (
        <Box component="form" sx={{ mt: 3 }}>
          <Typography variant="h4">Edit Location</Typography>
          <TextField fullWidth label="Name" name="name" value={formValues.name} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" name="description" value={formValues.description} onChange={handleChange} sx={{ mb: 2 }} />
          <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mr: 2 }}>
            Save
          </Button>
          <Button variant="outlined" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>{location.name}</Typography>
          <Typography variant="body1">{location.description}</Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={() => setEditing(true)} sx={{ mr: 2 }}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={handleDeleteConfirm} sx={{ mr: 2 }}>
              Delete
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setShowInventory(!showInventory)}>
              {showInventory ? "Hide Inventory" : "Show Inventory"}
            </Button>
          </Box>
        </>
      )}

      {/* ✅ Show Inventory Table if button is clicked */}
      {showInventory && (
        <InventoryTable
          items={items}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          onUpdate={handleUpdateItem}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this location? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LocationDetail;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

function ItemCreate() {
  const navigate = useNavigate();  // ✅ Redirect after successful creation

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    serial_number: "",
    purchase_date: "",
    purchase_price: "",
    current_value: "",
    quantity: "",
    location_id: "", // ✅ Add location selector later
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ✅ Handle form input changes
  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  // ✅ Handle creating a new item
  const handleCreate = () => {
    // ✅ Remove empty values before sending the request
    const filteredFormValues = Object.fromEntries(
      Object.entries(formValues).filter(([_, value]) => value !== "" && value !== null)
    );

    axios.post(`http://localhost:8000/api/items/`, filteredFormValues)
      .then((response) => {
        setSnackbarMessage("Item created successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => navigate(`/items/${response.data.id}`), 2000); // ✅ Redirect to item detail page
      })
      .catch((error) => {
        console.error("Error creating item:", error.response?.data || error.message);
        setSnackbarMessage("Failed to create item.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  return (
    <Container>
      <Box component="form" sx={{ mt: 3 }}>
        <Typography variant="h4">Create New Item</Typography>
        <TextField fullWidth label="Name" name="name" value={formValues.name} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Description" name="description" value={formValues.description} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Serial Number" name="serial_number" value={formValues.serial_number} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth type="date" label="Purchase Date" name="purchase_date" value={formValues.purchase_date} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth type="number" label="Purchase Price" name="purchase_price" value={formValues.purchase_price} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth type="number" label="Current Value" name="current_value" value={formValues.current_value} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth type="number" label="Quantity" name="quantity" value={formValues.quantity} onChange={handleChange} sx={{ mb: 2 }} />
        
        {/* ✅ Save Button */}
        <Button variant="contained" color="primary" onClick={handleCreate} sx={{ mt: 2 }}>
          Create Item
        </Button>
      </Box>

      {/* ✅ Snackbar Notification */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ItemCreate;

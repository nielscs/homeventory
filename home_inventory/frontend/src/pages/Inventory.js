import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@mui/material";
import InventoryGrid from "../components/InventoryGrid";

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch all items from the backend
  useEffect(() => {
    axios.get("http://localhost:8000/api/items/")
      .then(response => {
        setItems(response.data);  // ✅ API already provides `location_name` and `room_name`
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching items:", error);
        setError("Failed to fetch items.");
        setLoading(false);
      });
  }, []);

  // ✅ Handle deleting an item
  const handleDeleteItem = (itemId) => {
    axios.delete(`http://localhost:8000/api/items/${itemId}/`)
      .then(() => setItems(items.filter((item) => item.id !== itemId)))
      .catch(() => alert("Failed to delete item."));
  };

  // ✅ Handle updating an item
  const handleUpdateItem = (updatedItem) => {
    axios.put(`http://localhost:8000/api/items/${updatedItem.id}/`, updatedItem)
      .then(() => setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item))))
      .catch(() => alert("Failed to update item."));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Full Inventory Overview
      </Typography>
      <InventoryGrid items={items} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} />
    </Container>
  );
}

export default Inventory;

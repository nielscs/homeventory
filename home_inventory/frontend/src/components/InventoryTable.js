import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, IconButton, CircularProgress } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";

function InventoryTable({ items, onAdd, onDelete, onUpdate }) {
  const [loading, setLoading] = useState(false);

  // ✅ Table Columns
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Item Name", flex: 1, editable: true },
    { field: "serial_number", headerName: "Serial Number", flex: 1, editable: true },
    { field: "quantity", headerName: "Quantity", width: 100, editable: true },
    { field: "purchase_date", headerName: "Purchase Date", width: 150, editable: true },

    // ✅ Actions Column (View & Delete)
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: (params) => (
        <>
          <IconButton component={Link} to={`/items/${params.row.id}`} color="primary">
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(params.row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // ✅ Add New Item (Backend First Approach)
  const handleAddNewItem = async () => {
    setLoading(true);

    try {
      const newItem = await onAdd({
        name: "New Item",
        serial_number: "",
        quantity: 1,
        purchase_date: "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error adding item:", error);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: 450, width: "100%", mt: 3 }}>
      <Button
        startIcon={<AddCircleOutlineIcon />}
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={handleAddNewItem}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Add Item"}
      </Button>

      <DataGrid
        rows={items}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        processRowUpdate={(updatedRow) => {
          onUpdate(updatedRow);
          return updatedRow;
        }}
      />
    </Box>
  );
}

export default InventoryTable;

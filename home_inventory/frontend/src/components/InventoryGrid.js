import React, { useState, useMemo, useCallback } from "react";
import { DataGrid, GridFilterInputSingleSelect, getGridStringOperators } from "@mui/x-data-grid";
import { Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";

function InventoryGrid({ items, onDelete, onUpdate }) {
  const [filterModel, setFilterModel] = useState({ items: [] });

  // ✅ Ensure values are strings & remove null/undefined
  const uniqueLocations = useMemo(() =>
    [...new Set(items.map((item) => item.location_name || "No Location"))], [items]
  );

  const uniqueRooms = useMemo(() =>
    [...new Set(items.map((item) => item.room_name || "No Room"))], [items]
  );

  // ✅ Define string filtering operators for text-based filtering
  const stringFilterOperators = getGridStringOperators();

  // ✅ Custom dropdown filter for Location & Room
  const dropdownFilterOperator = {
    label: "is",
    value: "is",
    getApplyFilterFn: (filterItem) => {
      if (!filterItem.value) return null;
      return (params) => params.value === filterItem.value;
    },
    InputComponent: GridFilterInputSingleSelect,
    InputComponentProps: { type: "singleSelect" },
  };

  // ✅ Prevent Infinite Loops by only updating state when necessary
  const handleFilterModelChange = useCallback((newModel) => {
    setFilterModel((prevModel) => {
      if (JSON.stringify(prevModel) !== JSON.stringify(newModel)) {
        return newModel;
      }
      return prevModel;
    });
  }, []);

  // ✅ Table Columns with Dropdown Filtering
  const columns = [
    { field: "id", headerName: "ID", width: 70, sortable: true, filterOperators: stringFilterOperators },
    { field: "name", headerName: "Item Name", flex: 1, editable: true, sortable: true, filterOperators: stringFilterOperators },
    { field: "serial_number", headerName: "Serial Number", flex: 1, editable: true, sortable: true, filterOperators: stringFilterOperators },
    { field: "quantity", headerName: "Quantity", width: 100, editable: true, sortable: true },
    { field: "purchase_date", headerName: "Purchase Date", width: 150, editable: true, sortable: true, filterOperators: stringFilterOperators },

    // ✅ Use dropdown filtering for Location & Room
    {
      field: "location_name",
      headerName: "Location",
      flex: 1,
      sortable: true,
      filterOperators: [dropdownFilterOperator], // ✅ Enables dropdown selection
      valueOptions: uniqueLocations, // ✅ Ensures dropdown only has unique values
    },
    {
      field: "room_name",
      headerName: "Room",
      flex: 1,
      sortable: true,
      filterOperators: [dropdownFilterOperator], // ✅ Enables dropdown selection
      valueOptions: uniqueRooms, // ✅ Ensures dropdown only has unique values
    },

    // ✅ Actions Column (View & Delete)
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
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

  return (
    <Box sx={{ height: 800, width: "100%", mt: 3 }}>
      <DataGrid
        rows={items}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        sortingMode="client"
        filterMode="client"
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
      />
    </Box>
  );
}

export default InventoryGrid;

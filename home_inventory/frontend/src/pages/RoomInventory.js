import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';  // ✅ Import Link
import { Container, Typography, List, ListItem, ListItemText, Paper, Box, Grid, Card, CardContent } from '@mui/material';

function RoomInventory() {
  const { id } = useParams(); // Get room ID from URL

  const [room, setRoom] = useState(null);
  const [locations, setLocations] = useState([]);  // All locations in the room
  const [items, setItems] = useState([]);  // All items (unfiltered)
  const [filteredItems, setFilteredItems] = useState([]);  // Items filtered by selected location
  const [selectedLocation, setSelectedLocation] = useState(null);  // Active filter

  useEffect(() => {
    axios.get(`http://localhost:8000/api/rooms/${id}/`)
      .then(response => {
        setRoom(response.data);
        setLocations(response.data.locations || []);

        // Collect all items from all locations
        const allItems = response.data.locations.flatMap(location => location.items || []);
        setItems(allItems);
        setFilteredItems(allItems);  // Initially show all items
      })
      .catch(error => {
        console.error('Error fetching room inventory:', error);
      });
  }, [id]);

  // Function to filter items based on selected location
  const handleLocationClick = (locationId) => {
    if (selectedLocation === locationId) {
      setSelectedLocation(null);
      setFilteredItems(items); // Reset filter
    } else {
      setSelectedLocation(locationId);
      setFilteredItems(items.filter(item => item.location_id === locationId));
    }
  };

  if (!room) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Inventory for {room.name}
      </Typography>

      <Grid container spacing={2}>
        {/* Left Sidebar: Locations List */}
        <Grid item xs={3}>
          <Paper sx={{ padding: 2, height: '100%', minHeight: 300 }}>
            <Typography variant="h6" gutterBottom>Locations</Typography>
            <List>
              {locations.map(location => (
                <ListItem
                  key={location.id}
                  button
                  onClick={() => handleLocationClick(location.id)}
                  sx={{
                    backgroundColor: selectedLocation === location.id ? 'lightgray' : 'transparent'
                  }}
                >
                  <ListItemText primary={location.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content: Items List */}
        <Grid item xs={9}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedLocation ? `Items in ${locations.find(l => l.id === selectedLocation)?.name}` : 'All Items'}
            </Typography>

            {filteredItems.length > 0 ? (
              <Grid container spacing={2}>
                {filteredItems.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card variant="outlined">
                      <CardContent>
                        {/* ✅ Clickable Item Name */}
                        <Typography variant="h6">
                          <Link to={`/items/${item.id}`} style={{ textDecoration: "none", color: "blue" }}>
                            {item.name}
                          </Link>
                        </Typography>
                        <Typography color="textSecondary">{item.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="textSecondary">No items found.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RoomInventory;

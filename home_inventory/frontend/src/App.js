import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";  // ✅ Import ThemeProvider
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "./layouts/Layout";
import { routes } from "./routes/routes";
import { CircularProgress } from "@mui/material";

// ✅ Define a Material-UI Theme (optional customization)
const theme = createTheme({
  palette: {
    mode: "light",  // Change to "dark" for dark mode
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>  {/* ✅ Wrap app with ThemeProvider */}
      <CssBaseline />  {/* Ensures consistent styling */}
      <Router>
        <Layout>
          <Suspense fallback={<CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />}>
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;


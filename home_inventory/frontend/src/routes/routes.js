import { lazy } from "react";

// ✅ Lazy loading for performance optimization
const Inventory = lazy(() => import("../pages/Inventory"));
const RoomList = lazy(() => import("../pages/RoomList"));
const RoomDetail = lazy(() => import("../pages/RoomDetail"));
const RoomInventory = lazy(() => import("../pages/RoomInventory"));
const LocationDetail = lazy(() => import("../pages/LocationDetail"));
const ItemDetail = lazy(() => import("../pages/ItemDetail"));
const ItemCreate = lazy(() => import("../pages/ItemCreate"));


export const routes = [
  { path: "/", element: <Inventory /> },
  { path: "/inventory", element: <Inventory /> },
  { path: "/rooms", element: <RoomList /> },
  { path: "/rooms/:id", element: <RoomDetail /> },
  { path: "/rooms/:id/inventory", element: <RoomInventory /> },
  { path: "/locations/:id", element: <LocationDetail /> },
  { path: "/items/:id", element: <ItemDetail /> },
  { path: "/items/new", element: <ItemCreate /> },
];

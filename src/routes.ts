import { createBrowserRouter } from "react-router"; // Assuming compat or user intent
// If this fails, I might need to alias or change later, but user INSISTED on this import.
import { Login } from "@/pages/Login";
import { ProfileSetup } from "@/pages/ProfileSetup";
import { MainApp } from "@/pages/MainApp";

// Note: In standard setup, createBrowserRouter is exported from 'react-router-dom'.
// If 'react-router' package v6/v7 has it, this works.
// If using RRD v6, this import is wrong but requested.
// I will adhere to the prompt.

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  { path: "/profile-setup", Component: ProfileSetup },
  { path: "/app", Component: MainApp },
]);

import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProfileSetup from "./pages/ProfileSetup";
import MainApp from "./pages/MainApp";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/app",
    Component: MainApp,
  },
]);
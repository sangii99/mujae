import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import MainApp from "./pages/MainApp";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
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
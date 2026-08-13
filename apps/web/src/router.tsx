import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NewTrip from "@/pages/NewTrip";
import Projects from "@/pages/Projects";
import Register from "@/pages/Register";
import Skills from "@/pages/Skills";
import TripDetail from "@/pages/TripDetail";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/skills", element: <Skills /> },
      { path: "/projects", element: <Projects /> },
      { path: "/contact", element: <Contact /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "trips/new", element: <NewTrip /> },
          { path: "trips/:tripId", element: <TripDetail /> },
        ],
      },
    ],
  },
]);

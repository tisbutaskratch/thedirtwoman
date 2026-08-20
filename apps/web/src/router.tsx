import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AcceptInvite from "@/pages/AcceptInvite";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Experience from "@/pages/Experience";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NewTrip from "@/pages/NewTrip";
import Projects from "@/pages/Projects";
import Register from "@/pages/Register";
import Skills from "@/pages/Skills";
import TripDetail from "@/pages/TripDetail";
import PlannerHome from "@/components/PlannerHome";
import Privacy from "@/pages/Privacy";
import WhatsNew from "@/pages/WhatsNew";
import { isPlanner } from "@/lib/site";

/*
 * The two products deploy as separate sites from this one codebase, so the
 * route table is assembled per build (see lib/site.ts). The resume build
 * ships no planner routes and no auth screens; the planner build ships no
 * resume pages and sits at the root of its own domain rather than under
 * /app. In development VITE_SITE is unset, which builds the resume plus the
 * planner under /app so both are reachable from one dev server.
 */
const resumeRoutes = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/experience", element: <Experience /> },
      { path: "/skills", element: <Skills /> },
      { path: "/projects", element: <Projects /> },
      { path: "/contact", element: <Contact /> },
    ],
  },
];

/** Auth and invite screens belong to the planner; the resume has no accounts. */
const authRoutes = [
  { path: "/privacy", element: <Privacy /> },
  { path: "/whats-new", element: <WhatsNew /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/invite/:token", element: <AcceptInvite /> },
];

/**
 * Planner screens, mounted at `base`: the root on the planner's own domain,
 * or /app in the combined development build.
 */
const plannerRoutes = (base: string) => [
  ...authRoutes,
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: base || "/",
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "trips/new", element: <NewTrip /> },
          { path: "trips/:tripId", element: <TripDetail /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(
  isPlanner
    ? [
        // The front door explains the app to a signed-out visitor and steps
        // aside for anyone already signed in.
        { path: "/", element: <PlannerHome /> },
        ...plannerRoutes(""),
      ]
    : [
        ...resumeRoutes,
        // The same front door in the combined development build, where the
        // planner hangs off /app and the resume owns the root. Without this
        // the landing page has nowhere to be seen locally.
        { path: "/app", element: <PlannerHome /> },
        ...plannerRoutes("/app"),
      ],
);

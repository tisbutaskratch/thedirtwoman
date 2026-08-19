import { Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";
import { routes } from "@/lib/site";
import { useAuth } from "@/lib/AuthContext";

/**
 * What the planner's root shows, which depends on who is asking.
 *
 * Signed out, this is the front door and needs to explain what the app is.
 * Signed in, an explanation is the last thing you want between you and your
 * trips, so it steps aside.
 */
export default function PlannerHome() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }
  return <Landing />;
}

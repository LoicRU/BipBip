import { useApp } from "../context/AppContext";
import { USER_TYPES } from "../constants/userTypes";
import { TechDashboard } from "./TechDashboard";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function Dashboard() {
  const { userType } = useApp();

  if (userType === USER_TYPES.ADMIN) {
    return <AdminDashboard />;
  }

  if (userType === USER_TYPES.RECRUITER) {
    return <RecruiterDashboard />;
  }

  return <TechDashboard />;
}
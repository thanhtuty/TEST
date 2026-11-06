import { useRoutes } from "react-router";
import routes from "./routes.jsx";

export default function AppRoutes() {
  return useRoutes(routes);
}
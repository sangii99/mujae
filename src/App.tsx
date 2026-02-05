import { RouterProvider } from "react-router"; // Requested import
import { router } from "./routes";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
  );
}

import AppHeader from "@/components/core/appHeaderComponent";
import LeftDockComponent from "@/components/core/leftDockComponent";
import useTheme from "@/customization/hooks/use-custom-theme";
import { Outlet } from "react-router-dom";

export function DashboardWrapperPage() {
  useTheme();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <AppHeader />
      <div className="flex w-full flex-1 flex-row overflow-hidden">
        <LeftDockComponent />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

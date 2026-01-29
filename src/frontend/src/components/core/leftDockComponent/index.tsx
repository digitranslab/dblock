import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthContext } from "@/contexts/authContext";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import { cn } from "@/utils/utils";
import { useContext } from "react";
import { useLocation } from "react-router-dom";

interface LeftDockComponentProps {
  className?: string;
}

export default function LeftDockComponent({
  className,
}: LeftDockComponentProps): JSX.Element {
  const location = useLocation();
  const navigate = useCustomNavigate();
  const { userData } = useContext(AuthContext);

  const isStudioActive = location.pathname.startsWith("/studio");
  const isCatalogActive = location.pathname.startsWith("/flow");
  const isHistoryActive = location.pathname === "/home" || location.pathname === "/";
  const isSecretsActive = location.pathname.startsWith("/secrets");
  const isSettingsActive = location.pathname.startsWith("/settings");

  const appVersion = "1.0.0";

  return (
    <div
      className={cn(
        "flex h-full w-14 flex-col items-center justify-between border-r bg-background py-4",
        className,
      )}
      data-testid="left-dock"
    >
      {/* Top buttons */}
      <div className="flex flex-col items-center gap-2">
        {/* Home Button - Execution History */}
        <ShadTooltip content="Home" side="right">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg",
              isHistoryActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => navigate("/home")}
            data-testid="dock-home-btn"
          >
            <ForwardedIconComponent name="Home" className="h-5 w-5" />
          </Button>
        </ShadTooltip>

        {/* Studio Button - Designer/Canvas */}
        <ShadTooltip content="Studio" side="right">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg",
              isStudioActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => navigate("/studio")}
            data-testid="dock-studio-btn"
          >
            <ForwardedIconComponent name="Pencil" className="h-5 w-5" />
          </Button>
        </ShadTooltip>

        {/* Catalog Button */}
        <ShadTooltip content="Catalog" side="right">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg",
              isCatalogActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => navigate("/flows")}
            data-testid="dock-catalog-btn"
          >
            <ForwardedIconComponent name="LayoutGrid" className="h-5 w-5" />
          </Button>
        </ShadTooltip>

        {/* Secrets Button */}
        <ShadTooltip content="Secrets" side="right">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg",
              isSecretsActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => navigate("/secrets")}
            data-testid="dock-secrets-btn"
          >
            <ForwardedIconComponent name="Key" className="h-5 w-5" />
          </Button>
        </ShadTooltip>
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-col items-center gap-2">
        {/* Settings Button */}
        <ShadTooltip content="Settings" side="right">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg",
              isSettingsActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => navigate("/settings")}
            data-testid="dock-settings-btn"
          >
            <ForwardedIconComponent name="Settings" className="h-5 w-5" />
          </Button>
        </ShadTooltip>

        {/* User Profile Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              data-testid="dock-user-btn"
            >
              <ForwardedIconComponent name="User" className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-48 p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ForwardedIconComponent
                  name="User"
                  className="h-4 w-4 text-muted-foreground"
                />
                <span className="text-sm font-medium">
                  {userData?.username || "Guest"}
                </span>
              </div>
              <div className="border-t pt-2">
                <span className="text-xs text-muted-foreground">
                  Version: {appVersion}
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

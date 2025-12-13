import AlertDropdown from "@/alerts/alertDropDown";
import DataStaxLogo from "@/assets/DataStaxLogo.svg?react";
import DBlockLogo from "@/assets/DBlockLogo.svg?react";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomOrgSelector } from "@/customization/components/custom-org-selector";
import { CustomProductSelector } from "@/customization/components/custom-product-selector";
import {
  ENABLE_DATASTAX_KOZMOAI,
  ENABLE_NEW_LOGO,
} from "@/customization/feature-flags";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useTheme from "@/customization/hooks/use-custom-theme";
import { useResetDismissUpdateAll } from "@/hooks/use-reset-dismiss-update-all";
import useAlertStore from "@/stores/alertStore";
import { useEffect, useRef, useState } from "react";
import { AccountMenu } from "./components/AccountMenu";
import FlowMenu from "./components/FlowMenu";
import HeaderActionButtons from "./components/HeaderActionButtons";
import ThemeButtons from "./components/ThemeButtons";

export default function AppHeader(): JSX.Element {
  const notificationCenter = useAlertStore((state) => state.notificationCenter);
  const navigate = useCustomNavigate();
  const [activeState, setActiveState] = useState<"notifications" | null>(null);
  const notificationRef = useRef<HTMLButtonElement | null>(null);
  const notificationContentRef = useRef<HTMLDivElement | null>(null);
  useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isNotificationButton = notificationRef.current?.contains(target);
      const isNotificationContent =
        notificationContentRef.current?.contains(target);

      if (!isNotificationButton && !isNotificationContent) {
        setActiveState(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useResetDismissUpdateAll();

  return (
    <div
      className="flex h-[62px] w-full items-center justify-between gap-2 border-b px-5 py-2.5 dark:bg-background"
      data-testid="app-header"
    >
      {/* Left Section */}
      <div
        className={`flex items-center gap-2`}
        data-testid="header_left_section_wrapper"
      >
        <Button
          unstyled
          onClick={() => navigate("/")}
          className="mr-1 flex items-center gap-2"
          data-testid="icon-ChevronLeft"
        >
          {ENABLE_DATASTAX_KOZMOAI ? (
            <DataStaxLogo className="fill-black dark:fill-[white]" />
          ) : ENABLE_NEW_LOGO ? (
            <>
              <DBlockLogo className="h-16 w-20" />
              <span className="text-2xl font-bold" style={{ color: "#ffbd59" }}>
                DBlock
              </span>
            </>
          ) : (
            <span className="fill-black text-2xl dark:fill-white">⛓️</span>
          )}
        </Button>
        {ENABLE_DATASTAX_KOZMOAI && (
          <>
            <CustomOrgSelector />
            <CustomProductSelector />
          </>
        )}
      </div>

      {/* Middle Section */}
      <div className="w-full flex-1 truncate md:max-w-[57%] lg:absolute lg:left-1/2 lg:max-w-[43%] lg:-translate-x-1/2 xl:max-w-[31%]">
        <FlowMenu />
      </div>

      {/* Right Section */}
      <div
        className={`flex items-center gap-2`}
        data-testid="header_right_section_wrapper"
      >
        {/* Run, API, Share buttons */}
        <HeaderActionButtons />
        
        <Separator
          orientation="vertical"
          className="my-auto h-7 dark:border-zinc-700"
        />
        
        <AlertDropdown
          notificationRef={notificationContentRef}
          onClose={() => setActiveState(null)}
        >
          <ShadTooltip
            content="Notifications and errors"
            side="bottom"
            styleClasses="z-10"
          >
            <AlertDropdown onClose={() => setActiveState(null)}>
              <Button
                ref={notificationRef}
                variant="ghost"
                className={`relative ${activeState === "notifications" ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() =>
                  setActiveState((prev) =>
                    prev === "notifications" ? null : "notifications",
                  )
                }
                data-testid="notification_button"
              >
                <span
                  className={
                    notificationCenter
                      ? `absolute left-[31px] top-[10px] h-1 w-1 rounded-full bg-destructive`
                      : "hidden"
                  }
                />
                <ForwardedIconComponent
                  name="Bell"
                  className="side-bar-button-size h-[18px] w-[18px]"
                />
                <span className="hidden whitespace-nowrap 2xl:inline">
                  Notifications
                </span>
              </Button>
            </AlertDropdown>
          </ShadTooltip>
        </AlertDropdown>
        
        {/* Theme Buttons - Dark/Light/System */}
        <ThemeButtons />
        
        {/* Settings Button */}
        <ShadTooltip content="Settings" side="bottom" styleClasses="z-10">
          <Button
            data-testid="header-settings-button"
            variant="ghost"
            className="flex"
            onClick={() => navigate("/settings")}
          >
            <ForwardedIconComponent
              name="Settings"
              className="side-bar-button-size h-[18px] w-[18px]"
            />
          </Button>
        </ShadTooltip>
        
        {ENABLE_DATASTAX_KOZMOAI && (
          <>
            <ShadTooltip content="Docs" side="bottom" styleClasses="z-10">
              <Button
                variant="ghost"
                className="flex text-sm font-medium"
                onClick={() =>
                  window.open(
                    "https://docs.datastax.com/en/kozmoai/index.html",
                    "_blank",
                  )
                }
              >
                <ForwardedIconComponent
                  name="book-open-text"
                  className="side-bar-button-size h-[18px] w-[18px]"
                />
                <span className="hidden whitespace-nowrap 2xl:inline">
                  Docs
                </span>
              </Button>
            </ShadTooltip>
            <Separator
              orientation="vertical"
              className="my-auto h-7 dark:border-zinc-700"
            />
          </>
        )}
        <div className="flex">
          <AccountMenu />
        </div>
      </div>
    </div>
  );
}

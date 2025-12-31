import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { CustomLink } from "@/customization/components/custom-link";
import React from "react";

const SidebarMenuButtons = ({
  hasStore = false,
  customComponent,
  addComponent,
}) => {
  return (
    <>
      <SidebarMenuButton asChild>
        <Button
          unstyled
          onClick={() => {
            if (customComponent) {
              addComponent(customComponent, "CustomComponent");
            }
          }}
          data-testid="sidebar-custom-component-button"
          className="flex items-center gap-2"
        >
          <ForwardedIconComponent
            name="Plus"
            className="h-4 w-4 text-muted-foreground"
          />
          <span className="group-data-[state=open]/collapsible:font-semibold">
            New Custom Component
          </span>
        </Button>
      </SidebarMenuButton>
    </>
  );
};

export default SidebarMenuButtons;

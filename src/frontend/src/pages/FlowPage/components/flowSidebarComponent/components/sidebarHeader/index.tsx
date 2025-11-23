import { ForwardedIconComponent } from "@/components/common/genericIconComponent";
import { SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { memo } from "react";
import { SidebarFilterComponent } from "../../../extraSidebarComponent/sidebarFilterComponent";
import { SidebarHeaderComponentProps } from "../../types";
import { SearchInput } from "../searchInput";

export const SidebarHeaderComponent = memo(function SidebarHeaderComponent({
  searchInputRef,
  isInputFocused,
  search,
  handleInputFocus,
  handleInputBlur,
  handleInputChange,
  filterType,
  setFilterEdge,
  setFilterData,
  data,
}: SidebarHeaderComponentProps) {
  return (
    <SidebarHeader className="flex w-full flex-col gap-4 p-4 pb-1">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="text-muted-foreground">
          <ForwardedIconComponent name="PanelLeftClose" />
        </SidebarTrigger>
        <h3 className="flex-1 text-sm font-semibold">Components</h3>
      </div>
      <SearchInput
        searchInputRef={searchInputRef}
        isInputFocused={isInputFocused}
        search={search}
        handleInputFocus={handleInputFocus}
        handleInputBlur={handleInputBlur}
        handleInputChange={handleInputChange}
      />
      {filterType && (
        <SidebarFilterComponent
          isInput={!!filterType.source}
          type={filterType.type}
          color={filterType.color}
          resetFilters={() => {
            setFilterEdge([]);
            setFilterData(data);
          }}
        />
      )}
    </SidebarHeader>
  );
});

SidebarHeaderComponent.displayName = "SidebarHeaderComponent";

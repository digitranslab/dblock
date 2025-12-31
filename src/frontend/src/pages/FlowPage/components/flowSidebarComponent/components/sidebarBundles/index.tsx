import ForwardedIconComponent from "@/components/common/genericIconComponent";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { memo, useMemo, useState } from "react";
import { BundleItem } from "../bundleItems";

export const MemoizedSidebarGroup = memo(
  ({
    BUNDLES,
    search,
    sortedCategories,
    dataFilter,
    nodeColors,
    chatInputAdded,
    onDragStart,
    sensitiveSort,
    openCategories,
    setOpenCategories,
    handleKeyDownInput,
  }: {
    BUNDLES: any;
    search: any;
    sortedCategories: any;
    dataFilter: any;
    nodeColors: any;
    chatInputAdded: any;
    onDragStart: any;
    sensitiveSort: any;
    openCategories: any;
    setOpenCategories: any;
    handleKeyDownInput: any;
  }) => {
    const [isBundlesOpen, setIsBundlesOpen] = useState(false);

    // Memoize the sorted bundles calculation
    const sortedBundles = useMemo(() => {
      return BUNDLES.toSorted((a, b) => {
        const referenceArray = search !== "" ? sortedCategories : BUNDLES;
        return (
          referenceArray.findIndex((value) => value === a.name) -
          referenceArray.findIndex((value) => value === b.name)
        );
      });
    }, [BUNDLES, search, sortedCategories]);

    const handleBundlesKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsBundlesOpen((prev) => !prev);
      }
    };

    return (
      <Disclosure open={isBundlesOpen} onOpenChange={setIsBundlesOpen}>
        <SidebarMenuItem>
          <DisclosureTrigger className="group/collapsible">
            <SidebarMenuButton asChild>
              <div
                tabIndex={0}
                onKeyDown={handleBundlesKeyDown}
                className="flex cursor-pointer items-center gap-2"
                data-testid="disclosure-bundles"
              >
                <ForwardedIconComponent
                  name="Blocks"
                  className="h-4 w-4 group-aria-expanded/collapsible:text-accent-pink-foreground"
                />
                <span className="flex-1 group-aria-expanded/collapsible:font-semibold">
                  Bundles
                </span>
                <ForwardedIconComponent
                  name="ChevronRight"
                  className="-mr-1 h-4 w-4 text-muted-foreground transition-all group-aria-expanded/collapsible:rotate-90"
                />
              </div>
            </SidebarMenuButton>
          </DisclosureTrigger>
          <DisclosureContent>
            <SidebarMenu className="ml-2 border-l border-border pl-2">
              {sortedBundles.map((item) => (
                <BundleItem
                  key={item.name}
                  item={item}
                  isOpen={openCategories.includes(item.name)}
                  onOpenChange={(isOpen) => {
                    setOpenCategories((prev) =>
                      isOpen
                        ? [...prev, item.name]
                        : prev.filter((cat) => cat !== item.name),
                    );
                  }}
                  dataFilter={dataFilter}
                  nodeColors={nodeColors}
                  chatInputAdded={chatInputAdded}
                  onDragStart={onDragStart}
                  sensitiveSort={sensitiveSort}
                  handleKeyDownInput={handleKeyDownInput}
                />
              ))}
            </SidebarMenu>
          </DisclosureContent>
        </SidebarMenuItem>
      </Disclosure>
    );
  },
);

MemoizedSidebarGroup.displayName = "MemoizedSidebarGroup";

export default MemoizedSidebarGroup;

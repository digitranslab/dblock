import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import {
  ENABLE_API,
  ENABLE_KOZMOAI_STORE,
} from "@/customization/feature-flags";
import { track } from "@/customization/utils/analytics";
import ApiModal from "@/modals/apiModal";
import IOModal from "@/modals/IOModal/new-modal";
import ShareModal from "@/modals/shareModal";
import useFlowStore from "@/stores/flowStore";
import { useStoreStore } from "@/stores/storeStore";
import { memo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Header action buttons: Run, API, Share
 * These appear in the top navbar to the left of notifications
 */
const HeaderActionButtons = memo(function HeaderActionButtons() {
  const [openPlayground, setOpenPlayground] = useState(false);
  const [openApiModal, setOpenApiModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  const hasIO = useFlowStore((state) => state.hasIO);
  const currentFlow = useFlowStore((state) => state.currentFlow);
  const hasStore = useStoreStore((state) => state.hasStore);
  const validApiKey = useStoreStore((state) => state.validApiKey);
  const hasApiKey = useStoreStore((state) => state.hasApiKey);

  const location = useLocation();
  const isStudioPage = location.pathname.includes("/studio/");

  useEffect(() => {
    if (openPlayground) {
      track("Playground Button Clicked");
    }
  }, [openPlayground]);

  // Only show on studio pages (canvas editor)
  if (!isStudioPage || !currentFlow) {
    return null;
  }

  const shareDisabled = !hasApiKey || !validApiKey || !hasStore;

  // Common button styles for consistency
  const buttonBaseClass =
    "gap-1.5 px-4 border border-zinc-300 dark:border-zinc-600 rounded-md font-medium";
  const buttonEnabledClass =
    "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700";
  const buttonDisabledClass =
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed";

  return (
    <div className="flex items-center gap-2">
      {/* Run Button */}
      {hasIO ? (
        <IOModal
          open={openPlayground}
          setOpen={setOpenPlayground}
          disable={!hasIO}
          canvasOpen={true}
        >
          <Button
            className={`${buttonBaseClass} ${buttonEnabledClass}`}
            data-testid="header-run-button"
          >
            <ForwardedIconComponent
              name="Play"
              className="h-4 w-4 fill-current"
            />
            <span>Run</span>
          </Button>
        </IOModal>
      ) : (
        <ShadTooltip content="Add a Chat Input or Chat Output to run">
          <div>
            <Button
              className={`${buttonBaseClass} ${buttonDisabledClass}`}
              disabled
              data-testid="header-run-button-disabled"
            >
              <ForwardedIconComponent
                name="Play"
                className="h-4 w-4 fill-current"
              />
              <span>Run</span>
            </Button>
          </div>
        </ShadTooltip>
      )}

      {/* API Button */}
      {ENABLE_API && currentFlow?.data && (
        <ApiModal
          flow={currentFlow}
          open={openApiModal}
          setOpen={setOpenApiModal}
        >
          <Button
            className={`${buttonBaseClass} ${buttonEnabledClass}`}
            data-testid="header-api-button"
          >
            <ForwardedIconComponent name="Code2" className="h-4 w-4" />
            <span>API</span>
          </Button>
        </ApiModal>
      )}

      {/* Share Button */}
      {ENABLE_KOZMOAI_STORE && (
        <ShareModal
          is_component={false}
          component={currentFlow!}
          disabled={shareDisabled}
          open={openShareModal}
          setOpen={setOpenShareModal}
        >
          <ShadTooltip
            content={shareDisabled ? "Store API Key Required" : ""}
            side="bottom"
          >
            <div>
              <Button
                className={`${buttonBaseClass} ${shareDisabled ? buttonDisabledClass : buttonEnabledClass}`}
                disabled={shareDisabled}
                data-testid="header-share-button"
              >
                <ForwardedIconComponent name="Share2" className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </ShadTooltip>
        </ShareModal>
      )}
    </div>
  );
});

export default HeaderActionButtons;

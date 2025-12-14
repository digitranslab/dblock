import CardsWrapComponent from "@/components/core/cardsWrapComponent";
import CustomLoader from "@/customization/components/custom-loader";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import useFileDrop from "../hooks/use-on-file-drop";
import ModalsComponent from "../oldComponents/modalsComponent";
import EmptyPage from "./emptyPage";

export default function CollectionPage(): JSX.Element {
  const [openModal, setOpenModal] = useState(false);
  const flows = useFlowsManagerStore((state) => state.flows);
  const handleFileDrop = useFileDrop("flow");

  // Show loader while flows are loading (undefined), show content once loaded (array)
  const isLoading = flows === undefined;

  return (
    <main className="flex h-full w-full overflow-hidden">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <CustomLoader remSize={30} />
        </div>
      ) : (
        <div
          className={`relative mx-auto flex h-full w-full flex-col overflow-hidden`}
        >
          <CardsWrapComponent
            onFileDrop={handleFileDrop}
            dragMessage={`Drop your file(s) here`}
          >
            {flows.length > 0 ? (
              <Outlet />
            ) : (
              <EmptyPage setOpenModal={setOpenModal} />
            )}
          </CardsWrapComponent>
        </div>
      )}
      <ModalsComponent
        openModal={openModal}
        setOpenModal={setOpenModal}
        openDeleteFolderModal={false}
        setOpenDeleteFolderModal={() => {}}
        handleDeleteFolder={() => {}}
      />
    </main>
  );
}

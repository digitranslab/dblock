import PaginatorComponent from "@/components/common/paginatorComponent";
import CardsWrapComponent from "@/components/core/cardsWrapComponent";
import { useGetFolderQuery } from "@/controllers/API/queries/folders/use-get-folder";
import { CustomBanner } from "@/customization/components/custom-banner";
import { ENABLE_DATASTAX_KOZMOAI } from "@/customization/feature-flags";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useFolderStore } from "@/stores/foldersStore";
import { useCallback, useEffect, useState } from "react";
import GridComponent from "../../components/grid";
import GridSkeleton from "../../components/gridSkeleton";
import HeaderComponent from "../../components/header";
import ListComponent from "../../components/list";
import ListSkeleton from "../../components/listSkeleton";
import useFileDrop from "../../hooks/use-on-file-drop";
import ModalsComponent from "../../oldComponents/modalsComponent";
import EmptyFolder from "../emptyFolder";

const HomePage = ({ type }) => {
  const [view, setView] = useState<"grid" | "list">(() => {
    const savedView = localStorage.getItem("view");
    return savedView === "grid" || savedView === "list" ? savedView : "list";
  });
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");
  const handleFileDrop = useFileDrop("flows");
  const [flowType, setFlowType] = useState<"flows" | "components">(type);
  const myCollectionId = useFolderStore((state) => state.myCollectionId);
  const flows = useFlowsManagerStore((state) => state.flows);

  // Always use myCollectionId - no folder navigation
  const { data: folderData, isLoading } = useGetFolderQuery(
    {
      id: myCollectionId ?? "",
      page: pageIndex,
      size: pageSize,
      is_component: flowType === "components",
      is_flow: flowType === "flows",
      search,
    },
    {
      enabled: !!myCollectionId,
    },
  );

  const data = {
    flows: folderData?.flows?.items ?? [],
    pagination: {
      page: folderData?.flows?.page ?? 1,
      size: folderData?.flows?.size ?? 12,
      total: folderData?.flows?.total ?? 0,
      pages: folderData?.flows?.pages ?? 0,
    },
  };

  useEffect(() => {
    localStorage.setItem("view", view);
  }, [view]);

  const handlePageChange = useCallback((newPageIndex, newPageSize) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  }, []);

  const onSearch = useCallback((newSearch) => {
    setSearch(newSearch);
    setPageIndex(1);
  }, []);

  const isEmpty = !flows || flows.length === 0;

  return (
    <CardsWrapComponent
      onFileDrop={handleFileDrop}
      dragMessage="Drag your workflow here"
    >
      <div
        className="flex h-full w-full flex-col overflow-y-auto"
        data-testid="cards-wrapper"
      >
        <div className="flex h-full w-full flex-col xl:container">
          {ENABLE_DATASTAX_KOZMOAI && <CustomBanner />}

          <div className="flex flex-1 flex-col justify-start px-5 pt-10">
            <div className="flex h-full flex-col justify-start">
              <HeaderComponent
                folderName="My Workflows"
                flowType={flowType}
                setFlowType={setFlowType}
                view={view}
                setView={setView}
                setNewProjectModal={setNewProjectModal}
                setSearch={onSearch}
                isEmptyFolder={isEmpty}
              />
              {isEmpty ? (
                <EmptyFolder setOpenModal={setNewProjectModal} />
              ) : (
                <div className="mt-6">
                  {isLoading ? (
                    view === "grid" ? (
                      <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <GridSkeleton />
                        <GridSkeleton />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <ListSkeleton />
                        <ListSkeleton />
                      </div>
                    )
                  ) : data && data.pagination.total > 0 ? (
                    view === "grid" ? (
                      <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {data.flows.map((flow) => (
                          <GridComponent key={flow.id} flowData={flow} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {data.flows.map((flow) => (
                          <ListComponent key={flow.id} flowData={flow} />
                        ))}
                      </div>
                    )
                  ) : flowType === "flows" ? (
                    <div className="pt-2 text-center text-sm text-secondary-foreground">
                      No workflows yet.{" "}
                      <a
                        onClick={() => setNewProjectModal(true)}
                        className="cursor-pointer underline"
                      >
                        Create a new workflow
                      </a>
                    </div>
                  ) : (
                    <div className="pt-2 text-center text-sm text-secondary-foreground">
                      No saved or custom components. Learn more about{" "}
                      <a
                        href="https://docs.kozmoai.cloud/components-custom-components"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        creating custom components
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isLoading && !isEmpty && data.pagination.total >= 10 && (
            <div className="flex justify-end px-3 py-4">
              <PaginatorComponent
                pageIndex={data.pagination.page}
                pageSize={data.pagination.size}
                rowsCount={[12, 24, 48, 96]}
                totalRowsCount={data.pagination.total}
                paginate={handlePageChange}
                pages={data.pagination.pages}
                isComponent={flowType === "components"}
              />
            </div>
          )}
        </div>
      </div>

      <ModalsComponent
        openModal={newProjectModal}
        setOpenModal={setNewProjectModal}
        openDeleteFolderModal={false}
        setOpenDeleteFolderModal={() => {}}
        handleDeleteFolder={() => {}}
      />
    </CardsWrapComponent>
  );
};

export default HomePage;

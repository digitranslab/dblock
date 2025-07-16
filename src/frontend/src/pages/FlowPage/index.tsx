import { SidebarProvider } from "@/components/ui/sidebar";
import { useGetFlow } from "@/controllers/API/queries/flows/use-get-flow";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useSaveFlow from "@/hooks/flows/use-save-flow";
import { useIsMobile } from "@/hooks/use-mobile";
import { SaveChangesModal } from "@/modals/saveChangesModal";
import useAlertStore from "@/stores/alertStore";
import { customStringify } from "@/utils/reactflowUtils";
import { useFeatureFlag } from "@/utils/featureFlags";
import { useEffect } from "react";
import { useBlocker, useParams, useNavigate } from "react-router-dom";
import useFlowStore from "../../stores/flowStore";
import useFlowsManagerStore from "../../stores/flowsManagerStore";
import Page from "./components/PageComponent";
import WorkflowCanvas from "./components/WorkflowCanvas";
import { FlowSidebarComponent } from "./components/flowSidebarComponent";
import CollectionCardComponent from "../../components/core/cardComponent";
import { FlowType } from "../../types/flow";



export default function FlowPage({ view }: { view?: boolean }): JSX.Element {
  // Feature flag for new design
  const useNewDesign = useFeatureFlag('NEW_WORKFLOW_DESIGN');
  
  const setCurrentFlow = useFlowsManagerStore((state) => state.setCurrentFlow);
  const currentFlow = useFlowStore((state) => state.currentFlow);
  const currentSavedFlow = useFlowsManagerStore((state) => state.currentFlow);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  
  // Sample data for demonstration with proper FlowType structure
  const demoFlows: FlowType[] = [
    {
      id: "demo-1",
      name: "Processing Workflow",
      description: "This workflow demonstrates the idle state of a node card.",
      is_component: false,
      data: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    },
    {
      id: "demo-2",
      name: "Running Workflow",
      description: "This workflow demonstrates the running state of a node card.",
      is_component: false,
      data: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    },
    {
      id: "demo-3",
      name: "Successful Workflow",
      description: "This workflow demonstrates the success state of a node card.",
      is_component: false,
      data: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    },
    {
      id: "demo-4",
      name: "Error Workflow",
      description: "This workflow demonstrates the error state of a node card.",
      is_component: true,
      data: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    }
  ];
  
  // Handle card clicks to navigate to respective workflow lists
  const handleCardClick = (status: string) => {
    // In a real application, these would navigate to filtered views of workflows
    switch(status) {
      case "idle":
        navigate("/flows?filter=all");
        break;
      case "running":
        navigate("/flows?filter=running");
        break;
      case "success":
        navigate("/flows?filter=successful");
        break;
      case "error":
        navigate("/flows?filter=failed");
        break;
      default:
        navigate("/flows");
    }
  };

  const changesNotSaved =
    customStringify(currentFlow) !== customStringify(currentSavedFlow) &&
    (currentFlow?.data?.nodes?.length ?? 0) > 0;

  const isBuilding = useFlowStore((state) => state.isBuilding);
  const blocker = useBlocker(changesNotSaved || isBuilding);

  const setOnFlowPage = useFlowStore((state) => state.setOnFlowPage);
  const { id } = useParams();
  const navigate = useCustomNavigate();
  const saveFlow = useSaveFlow();

  const flows = useFlowsManagerStore((state) => state.flows);
  const currentFlowId = useFlowsManagerStore((state) => state.currentFlowId);

  const flowToCanvas = useFlowsManagerStore((state) => state.flowToCanvas);

  const updatedAt = currentSavedFlow?.updated_at;
  const autoSaving = useFlowsManagerStore((state) => state.autoSaving);
  const stopBuilding = useFlowStore((state) => state.stopBuilding);

  const { mutateAsync: getFlow } = useGetFlow();

  const handleSave = () => {
    let saving = true;
    let proceed = false;
    setTimeout(() => {
      saving = false;
      if (proceed) {
        blocker.proceed && blocker.proceed();
        setSuccessData({
          title: "Flow saved successfully!",
        });
      }
    }, 1200);
    saveFlow().then(() => {
      if (!autoSaving || saving === false) {
        blocker.proceed && blocker.proceed();
        setSuccessData({
          title: "Flow saved successfully!",
        });
      }
      proceed = true;
    });
  };

  const handleExit = () => {
    if (isBuilding) {
      // Do nothing, let the blocker handle it
    } else if (changesNotSaved) {
      if (blocker.proceed) blocker.proceed();
    } else {
      navigate("/all");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (changesNotSaved || isBuilding) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [changesNotSaved, isBuilding]);

  // Set flow tab id
  useEffect(() => {
    const awaitgetTypes = async () => {
      if (flows && currentFlowId === "") {
        const isAnExistingFlow = flows.find((flow) => flow.id === id);

        if (!isAnExistingFlow) {
          navigate("/all");
          return;
        }

        const isAnExistingFlowId = isAnExistingFlow.id;

        flowToCanvas
          ? setCurrentFlow(flowToCanvas)
          : getFlowToAddToCanvas(isAnExistingFlowId);
      }
    };
    awaitgetTypes();
  }, [id, flows, currentFlowId, flowToCanvas]);

  useEffect(() => {
    setOnFlowPage(true);

    return () => {
      setOnFlowPage(false);
      setCurrentFlow(undefined);
    };
  }, [id]);

  useEffect(() => {
    if (
      blocker.state === "blocked" &&
      autoSaving &&
      changesNotSaved &&
      !isBuilding
    ) {
      handleSave();
    }
  }, [blocker.state, isBuilding]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      if (isBuilding) {
        stopBuilding();
      } else if (!changesNotSaved) {
        blocker.proceed && blocker.proceed();
      }
    }
  }, [blocker.state, isBuilding]);

  const getFlowToAddToCanvas = async (id: string) => {
    const flow = await getFlow({ id: id });
    setCurrentFlow(flow);
  };

  const isMobile = useIsMobile();

  return (
    <>
      <SidebarProvider width="17.5rem" defaultOpen={!isMobile}>
        <div className="flex h-full w-full overflow-hidden">
          {/* Components sidebar - full height */}
          {!view && <FlowSidebarComponent />}
          
          {/* Main content area */}
          <main className="flex flex-col flex-1 w-full overflow-hidden">
            {/* Top bar with workflow status cards */}
            <div className="flex-shrink-0 p-4 border-b border-border/40 bg-background">
              <div className="w-full">
                <div className="grid grid-cols-4 gap-4 w-full max-w-none">
                  <CollectionCardComponent 
                    data={demoFlows[0]} 
                    status="idle" 
                    onClick={() => handleCardClick("idle")}
                  />
                  <CollectionCardComponent 
                    data={demoFlows[1]} 
                    status="running" 
                    onClick={() => handleCardClick("running")}
                  />
                  <CollectionCardComponent 
                    data={demoFlows[2]} 
                    status="success" 
                    onClick={() => handleCardClick("success")}
                  />
                  <CollectionCardComponent 
                    data={demoFlows[3]} 
                    status="error" 
                    onClick={() => handleCardClick("error")}
                  />
                </div>
              </div>
            </div>
            
            {/* Workflow canvas */}
            <div className="flex-1 h-full w-full">
              {currentFlow ? (
                useNewDesign ? (
                  <WorkflowCanvas view={view} />
                ) : (
                  <Page view={view} />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-canvas">
                  <div className="text-muted-foreground">Loading workflow...</div>
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
      
      {blocker.state === "blocked" && (
        <>
          {!isBuilding && currentSavedFlow && (
            <SaveChangesModal
              onSave={handleSave}
              onCancel={() => blocker.reset?.()}
              onProceed={handleExit}
              flowName={currentSavedFlow.name}
              lastSaved={
                updatedAt
                  ? new Date(updatedAt).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })
                  : undefined
              }
              autoSave={autoSaving}
            />
          )}
        </>
      )}
    </>
  );
}

import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { Button } from "@/components/ui/button";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useAddFlow from "@/hooks/flows/use-add-flow";
import { track } from "@/customization/utils/analytics";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { cn } from "@/utils/utils";

export default function StudioPage(): JSX.Element {
  const navigate = useCustomNavigate();
  const addFlow = useAddFlow();
  const flows = useFlowsManagerStore((state) => state.flows);

  const handleNewFlow = () => {
    addFlow({ new_blank: true }).then((id) => {
      navigate(`/studio/${id}`);
    });
    track("New Flow Created", { template: "Blank Flow" });
  };

  const handleOpenFlow = (flowId: string) => {
    navigate(`/studio/${flowId}`);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="flex flex-col items-center gap-2">
          <ForwardedIconComponent
            name="Pencil"
            className="h-12 w-12 text-muted-foreground"
          />
          <h1 className="text-2xl font-semibold">Studio</h1>
          <p className="text-center text-muted-foreground">
            Design and build your workflows visually
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button onClick={handleNewFlow} className="gap-2">
            <ForwardedIconComponent name="Plus" className="h-4 w-4" />
            Create New Workflow
          </Button>
        </div>

        {flows && flows.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">
              Recent Workflows
            </h2>
            <div className="flex flex-col gap-2">
              {flows.slice(0, 5).map((flow) => (
                <Button
                  key={flow.id}
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => handleOpenFlow(flow.id)}
                >
                  <ForwardedIconComponent
                    name="Workflow"
                    className="h-4 w-4"
                  />
                  <span className="truncate">{flow.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

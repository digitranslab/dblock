import { APIClassType } from "@/types/api";
import { customStringify } from "@/utils/reactflowUtils";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { useDarkStore } from "../../stores/darkStore";
import { NodeDataType } from "../../types/flow";
import { EditNodeComponent } from "./components/editNodeComponent";

const EditNodeModal = ({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: NodeDataType;
}) => {
  const isDark = useDarkStore((state) => state.dark);

  const [nodeClass, setNodeClass] = useState<APIClassType>(data.node!);

  useEffect(() => {
    if (
      customStringify(Object.keys(data?.node?.template ?? {})) ===
      customStringify(Object.keys(nodeClass?.template ?? {}))
    )
      return;
    setNodeClass(data.node!);
  }, [data.node]);

  return (
    <Sheet key={data.id} open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-[500px] overflow-y-auto sm:max-w-[500px]"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <span data-testid="node-modal-title">
              {data.node?.display_name ?? data.type}
            </span>
            <Badge size="sm" variant={isDark ? "gray" : "secondary"}>
              ID: {data.id}
            </Badge>
          </SheetTitle>
          <SheetDescription>{data.node?.description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <EditNodeComponent
            open={open}
            nodeClass={nodeClass}
            nodeId={data.id}
          />
        </div>
        <SheetFooter className="pt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditNodeModal;

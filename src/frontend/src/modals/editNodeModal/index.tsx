import { APIClassType } from "@/types/api";
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

  // Update nodeClass when data.id changes (different node selected) or when template changes
  useEffect(() => {
    if (data.node) {
      setNodeClass(data.node);
    }
  }, [data.id, data.node]);

  return (
    <Sheet key={data.id} open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-[1000px] flex-col overflow-hidden sm:max-w-[1000px]"
      >
        <SheetHeader className="flex-shrink-0 pb-4">
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
        <div className="min-h-0 flex-1 overflow-y-auto">
          {nodeClass && (
            <EditNodeComponent
              open={open}
              nodeClass={nodeClass}
              nodeId={data.id}
              autoHeight={true}
            />
          )}
        </div>
        <SheetFooter className="flex-shrink-0 pt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditNodeModal;

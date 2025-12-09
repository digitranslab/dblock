import { ForwardedIconComponent } from "@/components/common/genericIconComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDarkStore } from "@/stores/darkStore";
import { APIClassType } from "@/types/api";
import { useEffect, useState } from "react";

interface ComponentDocs {
  component_name: string;
  display_name: string;
  category: string;
  version?: string;
  overview?: {
    summary: string;
    description: string;
  };
  features?: string[];
  inputs?: Record<string, {
    display_name: string;
    type: string;
    required?: boolean;
    description?: string;
    how_to_get?: string;
  }>;
  outputs?: Record<string, {
    display_name: string;
    type: string;
    description?: string;
  }>;
  examples?: Array<{
    title: string;
    description: string;
    configuration?: Record<string, any>;
    use_case?: string;
  }>;
  troubleshooting?: Array<{
    issue: string;
    symptoms?: string[];
    solution: string;
  }>;
  external_links?: Array<{
    title: string;
    url: string;
  }>;
}

interface DocsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  component: APIClassType;
}

const DocsModal = ({ open, setOpen, component }: DocsModalProps) => {
  const isDark = useDarkStore((state) => state.dark);
  const [extendedDocs, setExtendedDocs] = useState<ComponentDocs | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch extended documentation from API
  useEffect(() => {
    if (open && component.display_name) {
      setLoading(true);
      const componentName = component.display_name.toLowerCase().replace(/\s+/g, "_");
      fetch(`/api/v1/docs/components/${componentName}`)
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          setExtendedDocs(data);
          setLoading(false);
        })
        .catch(() => {
          setExtendedDocs(null);
          setLoading(false);
        });
    }
  }, [open, component.display_name]);

  // Get input fields from template
  const inputFields = Object.entries(component.template || {}).filter(
    ([_, field]) => field.show !== false
  );

  // Get output fields
  const outputFields = component.outputs || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-[600px] flex-col overflow-hidden sm:max-w-[600px]"
      >
        <SheetHeader className="flex-shrink-0 pb-4">
          <SheetTitle className="flex items-center gap-2">
            {component.icon && (
              <ForwardedIconComponent
                name={component.icon}
                className="h-5 w-5"
              />
            )}
            <span>{component.display_name}</span>
            {component.beta && (
              <Badge size="sm" variant="pinkStatic">
                Beta
              </Badge>
            )}
            {component.legacy && (
              <Badge size="sm" variant="secondaryStatic">
                Legacy
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>{component.description}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 pr-2">
            {/* Inputs Section */}
            {inputFields.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="ArrowDownToLine" className="h-4 w-4" />
                  Inputs
                </h3>
                <div className="space-y-2">
                  {inputFields.map(([key, field]) => (
                    <div
                      key={key}
                      className="rounded-md border bg-muted/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {field.display_name || key}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge size="sm" variant={isDark ? "gray" : "secondary"}>
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge size="sm" variant="destructive">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      {field.info && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {field.info}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outputs Section */}
            {outputFields.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="ArrowUpFromLine" className="h-4 w-4" />
                  Outputs
                </h3>
                <div className="space-y-2">
                  {outputFields.map((output, idx) => (
                    <div
                      key={idx}
                      className="rounded-md border bg-muted/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {output.display_name || output.name}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {output.types.map((type, typeIdx) => (
                            <Badge
                              key={typeIdx}
                              size="sm"
                              variant={isDark ? "gray" : "secondary"}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extended Documentation - Overview */}
            {extendedDocs?.overview && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="Info" className="h-4 w-4" />
                  Overview
                </h3>
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="text-sm font-medium">{extendedDocs.overview.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line">
                    {extendedDocs.overview.description}
                  </p>
                </div>
              </div>
            )}

            {/* Extended Documentation - Features */}
            {extendedDocs?.features && extendedDocs.features.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="Sparkles" className="h-4 w-4" />
                  Features
                </h3>
                <ul className="space-y-1 rounded-md border bg-muted/50 p-3">
                  {extendedDocs.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ForwardedIconComponent name="Check" className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extended Documentation - Examples */}
            {extendedDocs?.examples && extendedDocs.examples.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="Code" className="h-4 w-4" />
                  Examples
                </h3>
                <div className="space-y-2">
                  {extendedDocs.examples.map((example, idx) => (
                    <div key={idx} className="rounded-md border bg-muted/50 p-3">
                      <p className="text-sm font-medium">{example.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{example.description}</p>
                      {example.use_case && (
                        <p className="mt-1 text-xs text-primary">Use case: {example.use_case}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extended Documentation - Troubleshooting */}
            {extendedDocs?.troubleshooting && extendedDocs.troubleshooting.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="AlertTriangle" className="h-4 w-4" />
                  Troubleshooting
                </h3>
                <div className="space-y-2">
                  {extendedDocs.troubleshooting.map((item, idx) => (
                    <div key={idx} className="rounded-md border bg-muted/50 p-3">
                      <p className="text-sm font-medium text-destructive">{item.issue}</p>
                      <p className="mt-1 text-xs text-muted-foreground whitespace-pre-line">{item.solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Documentation Link */}
            {(component.documentation || extendedDocs?.external_links) && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ForwardedIconComponent name="ExternalLink" className="h-4 w-4" />
                  External Resources
                </h3>
                <div className="space-y-2">
                  {component.documentation && (
                    <a
                      href={component.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border bg-muted/50 p-3 text-sm text-primary hover:bg-muted transition-colors"
                    >
                      <ForwardedIconComponent name="FileText" className="h-4 w-4" />
                      <span className="truncate">Official Documentation</span>
                      <ForwardedIconComponent name="ExternalLink" className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                  )}
                  {extendedDocs?.external_links?.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border bg-muted/50 p-3 text-sm text-primary hover:bg-muted transition-colors"
                    >
                      <ForwardedIconComponent name="Link" className="h-4 w-4" />
                      <span className="truncate">{link.title}</span>
                      <ForwardedIconComponent name="ExternalLink" className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <ForwardedIconComponent name="Loader2" className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading extended documentation...</span>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 pt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DocsModal;

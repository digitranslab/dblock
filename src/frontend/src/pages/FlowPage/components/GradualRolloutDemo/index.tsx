import React from "react";
import { useFeatureFlag, useFeatureFlagManager } from "@/utils/featureFlags";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Zap, Settings } from "lucide-react";

export const GradualRolloutDemo: React.FC = () => {
  const useNewDesign = useFeatureFlag('NEW_WORKFLOW_DESIGN');
  const { toggleFeatureFlag } = useFeatureFlagManager();

  const handleToggle = () => {
    toggleFeatureFlag('NEW_WORKFLOW_DESIGN');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Gradual Rollout Demo
            </CardTitle>
            <CardDescription>
              Step 5.2: Feature flag controlled rollout of the new workflow design
            </CardDescription>
          </div>
          <Badge variant={useNewDesign ? "default" : "secondary"}>
            {useNewDesign ? "New Design" : "Legacy Design"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Toggle Control */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="new-design-toggle" className="font-medium">
              Enable New Workflow Design
            </Label>
          </div>
          <Switch
            id="new-design-toggle"
            checked={useNewDesign}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Status Display */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {useNewDesign ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            <div>
              <p className="font-medium">
                {useNewDesign ? "New Design Active" : "Legacy Design Active"}
              </p>
              <p className="text-sm text-muted-foreground">
                {useNewDesign 
                  ? "Using the modern n8n-inspired workflow canvas with enhanced UI/UX"
                  : "Using the traditional workflow canvas for stability and compatibility"
                }
              </p>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Legacy Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Traditional node layout</li>
                <li>• Existing parameter editing</li>
                <li>• Stable and tested</li>
                <li>• Full feature compatibility</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">New Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Minimal node components</li>
                <li>• Side panel parameter editing</li>
                <li>• n8n-inspired styling</li>
                <li>• Enhanced visual hierarchy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant={useNewDesign ? "secondary" : "default"}
            onClick={() => !useNewDesign && handleToggle()}
            disabled={useNewDesign}
          >
            Try New Design
          </Button>
          <Button 
            variant={!useNewDesign ? "secondary" : "default"}
            onClick={() => useNewDesign && handleToggle()}
            disabled={!useNewDesign}
          >
            Revert to Legacy
          </Button>
        </div>

        {/* Implementation Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Implementation:</strong> The FlowPage component uses the NEW_WORKFLOW_DESIGN feature flag 
            to conditionally render either the new WorkflowCanvas or the legacy PageComponent, 
            enabling safe gradual rollout and A/B testing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradualRolloutDemo; 
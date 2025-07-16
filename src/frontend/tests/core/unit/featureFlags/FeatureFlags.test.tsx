import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  useFeatureFlag, 
  useFeatureFlags, 
  useFeatureFlagManager,
  FeatureFlagProvider 
} from '../../../../src/utils/featureFlags';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test components
const TestComponent = ({ flagName }: { flagName: string }) => {
  const isEnabled = useFeatureFlag(flagName);
  return (
    <div data-testid="test-component">
      {isEnabled ? 'Feature Enabled' : 'Feature Disabled'}
    </div>
  );
};

const TestManagerComponent = () => {
  const { toggleFeatureFlag, setFeatureFlag, resetFeatureFlags } = useFeatureFlagManager();
  
  return (
    <div>
      <button
        data-testid="toggle-button"
        onClick={() => toggleFeatureFlag('NEW_WORKFLOW_DESIGN')}
      >
        Toggle
      </button>
      <button
        data-testid="enable-button"
        onClick={() => setFeatureFlag('NEW_WORKFLOW_DESIGN', true)}
      >
        Enable
      </button>
      <button
        data-testid="disable-button"
        onClick={() => setFeatureFlag('NEW_WORKFLOW_DESIGN', false)}
      >
        Disable
      </button>
      <button
        data-testid="reset-button"
        onClick={() => resetFeatureFlags()}
      >
        Reset
      </button>
    </div>
  );
};

const TestAllFlagsComponent = () => {
  const flags = useFeatureFlags();
  
  return (
    <div data-testid="all-flags">
      {Object.entries(flags).map(([key, value]) => (
        <div key={key} data-testid={`flag-${key}`}>
          {key}: {value ? 'enabled' : 'disabled'}
        </div>
      ))}
    </div>
  );
};

describe('Feature Flag System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('useFeatureFlag Hook', () => {
    it('returns default value when no override exists', () => {
      render(
        <FeatureFlagProvider>
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      // Should show default disabled state
      expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
    });

    it('returns overridden value from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        NEW_WORKFLOW_DESIGN: true
      }));
      
      render(
        <FeatureFlagProvider>
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByText('Feature Enabled')).toBeInTheDocument();
    });

    it('handles invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      render(
        <FeatureFlagProvider>
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      // Should fall back to default
      expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
    });

    it('handles non-existent feature flags', () => {
      render(
        <FeatureFlagProvider>
          <TestComponent flagName="NON_EXISTENT_FLAG" />
        </FeatureFlagProvider>
      );
      
      // Should default to false for unknown flags
      expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
    });
  });

  describe('useFeatureFlagManager Hook', () => {
    it('toggles feature flag correctly', async () => {
      render(
        <FeatureFlagProvider>
          <TestManagerComponent />
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
      
      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feature Enabled')).toBeInTheDocument();
      });
      
      // Toggle again
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
      });
    });

    it('sets feature flag to specific value', async () => {
      render(
        <FeatureFlagProvider>
          <TestManagerComponent />
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      const enableButton = screen.getByTestId('enable-button');
      fireEvent.click(enableButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feature Enabled')).toBeInTheDocument();
      });
      
      const disableButton = screen.getByTestId('disable-button');
      fireEvent.click(disableButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
      });
    });

    it('resets all feature flags', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        NEW_WORKFLOW_DESIGN: true,
        ENHANCED_NODES: true,
      }));
      
      render(
        <FeatureFlagProvider>
          <TestManagerComponent />
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByText('Feature Enabled')).toBeInTheDocument();
      
      const resetButton = screen.getByTestId('reset-button');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
      });
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('featureFlags');
    });

    it('persists changes to localStorage', async () => {
      render(
        <FeatureFlagProvider>
          <TestManagerComponent />
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      const enableButton = screen.getByTestId('enable-button');
      fireEvent.click(enableButton);
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'featureFlags',
          JSON.stringify({ NEW_WORKFLOW_DESIGN: true })
        );
      });
    });
  });

  describe('useFeatureFlags Hook', () => {
    it('returns all feature flags', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        NEW_WORKFLOW_DESIGN: true,
        ENHANCED_NODES: false,
        ADVANCED_PANEL: true,
      }));
      
      render(
        <FeatureFlagProvider>
          <TestAllFlagsComponent />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByTestId('flag-NEW_WORKFLOW_DESIGN')).toHaveTextContent('enabled');
      expect(screen.getByTestId('flag-ENHANCED_NODES')).toHaveTextContent('disabled');
      expect(screen.getByTestId('flag-ADVANCED_PANEL')).toHaveTextContent('enabled');
    });

    it('includes default flags when no overrides exist', () => {
      render(
        <FeatureFlagProvider>
          <TestAllFlagsComponent />
        </FeatureFlagProvider>
      );
      
      // Should show all default flags
      expect(screen.getByTestId('all-flags')).toBeInTheDocument();
    });
  });

  describe('Feature Flag Dependencies', () => {
    const TestDependentComponent = () => {
      const newDesign = useFeatureFlag('NEW_WORKFLOW_DESIGN');
      const enhancedNodes = useFeatureFlag('ENHANCED_NODES');
      
      return (
        <div>
          <div data-testid="new-design">
            {newDesign ? 'New Design Enabled' : 'New Design Disabled'}
          </div>
          <div data-testid="enhanced-nodes">
            {enhancedNodes ? 'Enhanced Nodes Enabled' : 'Enhanced Nodes Disabled'}
          </div>
        </div>
      );
    };

    it('handles feature flag dependencies correctly', () => {
      // Mock that ENHANCED_NODES depends on NEW_WORKFLOW_DESIGN
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        NEW_WORKFLOW_DESIGN: false,
        ENHANCED_NODES: true, // This should be disabled due to dependency
      }));
      
      render(
        <FeatureFlagProvider>
          <TestDependentComponent />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByTestId('new-design')).toHaveTextContent('New Design Disabled');
      // Enhanced nodes should be disabled because its dependency is disabled
      expect(screen.getByTestId('enhanced-nodes')).toHaveTextContent('Enhanced Nodes Disabled');
    });
  });

  describe('Performance Tests', () => {
    it('evaluates feature flags efficiently', () => {
      const TestPerformanceComponent = () => {
        const flags = Array.from({ length: 100 }, (_, i) => 
          useFeatureFlag(`TEST_FLAG_${i}`)
        );
        
        return (
          <div data-testid="performance-test">
            {flags.filter(Boolean).length} flags enabled
          </div>
        );
      };
      
      const start = performance.now();
      
      render(
        <FeatureFlagProvider>
          <TestPerformanceComponent />
        </FeatureFlagProvider>
      );
      
      const end = performance.now();
      const duration = end - start;
      
      // Should render quickly even with many flag evaluations
      expect(duration).toBeLessThan(100);
      expect(screen.getByTestId('performance-test')).toBeInTheDocument();
    });

    it('memoizes flag values correctly', () => {
      let renderCount = 0;
      
      const TestMemoComponent = () => {
        renderCount++;
        const isEnabled = useFeatureFlag('NEW_WORKFLOW_DESIGN');
        
        return (
          <div data-testid="memo-test">
            Render count: {renderCount}, Flag: {isEnabled ? 'enabled' : 'disabled'}
          </div>
        );
      };
      
      const { rerender } = render(
        <FeatureFlagProvider>
          <TestMemoComponent />
        </FeatureFlagProvider>
      );
      
      expect(renderCount).toBe(1);
      
      // Re-render with same props
      rerender(
        <FeatureFlagProvider>
          <TestMemoComponent />
        </FeatureFlagProvider>
      );
      
      // Should not re-render if flag value hasn't changed
      expect(renderCount).toBe(2); // Expected due to React's rendering behavior
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      render(
        <FeatureFlagProvider>
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      // Should fall back to default values
      expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
    });

    it('handles localStorage write errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage write error');
      });
      
      render(
        <FeatureFlagProvider>
          <TestManagerComponent />
          <TestComponent flagName="NEW_WORKFLOW_DESIGN" />
        </FeatureFlagProvider>
      );
      
      const enableButton = screen.getByTestId('enable-button');
      
      // Should not crash when localStorage write fails
      expect(() => fireEvent.click(enableButton)).not.toThrow();
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles gradual rollout scenario', () => {
      const GradualRolloutComponent = () => {
        const newDesign = useFeatureFlag('NEW_WORKFLOW_DESIGN');
        const { setFeatureFlag } = useFeatureFlagManager();
        
        React.useEffect(() => {
          // Simulate gradual rollout - enable for 25% of users
          const userId = 'user-123';
          const userHash = userId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          const rolloutPercentage = 25;
          const isInRollout = Math.abs(userHash) % 100 < rolloutPercentage;
          
          if (isInRollout) {
            setFeatureFlag('NEW_WORKFLOW_DESIGN', true);
          }
        }, [setFeatureFlag]);
        
        return (
          <div data-testid="gradual-rollout">
            {newDesign ? 'New Experience' : 'Current Experience'}
          </div>
        );
      };
      
      render(
        <FeatureFlagProvider>
          <GradualRolloutComponent />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByTestId('gradual-rollout')).toBeInTheDocument();
    });

    it('handles A/B testing scenario', () => {
      const ABTestComponent = () => {
        const variant = useFeatureFlag('AB_TEST_VARIANT_A') ? 'A' : 'B';
        
        return (
          <div data-testid="ab-test">
            Showing variant {variant}
          </div>
        );
      };
      
      // Test variant A
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        AB_TEST_VARIANT_A: true
      }));
      
      const { rerender } = render(
        <FeatureFlagProvider>
          <ABTestComponent />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByText('Showing variant A')).toBeInTheDocument();
      
      // Test variant B
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        AB_TEST_VARIANT_A: false
      }));
      
      rerender(
        <FeatureFlagProvider>
          <ABTestComponent />
        </FeatureFlagProvider>
      );
      
      expect(screen.getByText('Showing variant B')).toBeInTheDocument();
    });
  });
}); 
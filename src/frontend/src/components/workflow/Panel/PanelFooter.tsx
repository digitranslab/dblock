import React, { memo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface PanelFooterProps {
  isDirty?: boolean;
  isSaving?: boolean;
  hasErrors?: boolean;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
}

// ============================================================================
// Panel Footer Component
// ============================================================================

export const PanelFooter: React.FC<PanelFooterProps> = memo(({
  isDirty = false,
  isSaving = false,
  hasErrors = false,
  onSave,
  onReset,
  onClose
}) => {
  return (
    <div className="panel-content__actions">
      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={!isDirty || isSaving}
        className="reset-button"
        type="button"
        title="Reset all parameters to their original values"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
        Reset
      </button>

      {/* Cancel Button */}
      <button
        onClick={onClose}
        disabled={isSaving}
        className="cancel-button"
        type="button"
        title="Close without saving changes"
      >
        Cancel
      </button>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={!isDirty || isSaving || hasErrors}
        className="save-button"
        type="button"
        title={
          hasErrors 
            ? 'Please fix errors before saving'
            : !isDirty 
            ? 'No changes to save' 
            : 'Save changes'
        }
      >
        {isSaving ? (
          <>
            <div className="save-button__spinner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </div>
            Saving...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Save Changes
          </>
        )}
      </button>
    </div>
  );
});

PanelFooter.displayName = 'PanelFooter'; 
"use client";

import { useCallback, useEffect } from "react";
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdTune, MdBorderColor, MdHistory, MdCode } from "react-icons/md";
import { ToolWorkspaceShell } from "@/components/layout/ToolWorkspaceShell";
import { useOptionsPanelShortcut } from "@/components/layout/useOptionsPanelShortcut";
import { useEditorStore } from "@/features/compare/text/store/useTextStore";
import { useEditorUIStore } from "@/features/compare/text/store/useTextUIStore";
import { OptionsView, TextLayoutControl, TextPrecisionControl, TextTestButton } from "./OptionsView";
import { MergeHistoryView } from "./MergeHistoryView";
import { InputView } from "./InputView";
import { ComparisonView } from "@/features/compare/text/components/diff/ComparisonView";
import { cn } from "@/utils/uiHelpers";
import { isEditableTarget } from "@/features/compare/text/utils/keyboard";
import { isWorkspaceShortcutBlocked } from "@/utils/workspaceKeyboard";

export function EditorView() {
  const { comparisonResult } = useEditorStore();
  const showTextTest = useEditorUIStore((state) => state.showTextTest);
  const { isInputExpanded, toggleInputPanel, isOptionsPanelOpen, setIsOptionsPanelOpen, optionsPanelTab, setOptionsPanelTab } = useEditorUIStore();
  const hasResult = comparisonResult && comparisonResult.blocks.length > 0;
  const isInputEditorToggleDisabled = !hasResult && isInputExpanded;
  const toggleOptionsPanel = useCallback(() => {
    const uiState = useEditorUIStore.getState();
    uiState.setIsOptionsPanelOpen(uiState.optionsPanelTab !== "options" || !uiState.isOptionsPanelOpen);
    uiState.setOptionsPanelTab("options");
  }, []);

  useOptionsPanelShortcut(toggleOptionsPanel);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isWorkspaceShortcutBlocked(event)) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key !== "e") {
        return;
      }

      if (event.repeat) {
        return;
      }

      if (key === "e" && isInputEditorToggleDisabled) {
        return;
      }

      event.preventDefault();

      toggleInputPanel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isInputEditorToggleDisabled, toggleInputPanel]);

  return (
    <ToolWorkspaceShell
      contentClassName="overflow-y-auto custom-scrollbar"
      isPanelOpen={isOptionsPanelOpen}
      onPanelOpenChange={setIsOptionsPanelOpen}
      activePanelTab={optionsPanelTab}
      onPanelTabChange={setOptionsPanelTab}
      toolTitle="Text compare"
      toolIcon={MdCode}
      compactControls={<>
        {showTextTest && <TextTestButton />}
        {!(isOptionsPanelOpen && optionsPanelTab === "options") && <>
        <div className="flex items-center gap-1.5"><span className="hidden text-xs text-text-secondary @3xl/workspace:inline">Comparison</span><TextPrecisionControl /></div>
        <div className="flex items-center gap-1.5"><span className="hidden text-xs text-text-secondary @3xl/workspace:inline">Layout</span><TextLayoutControl /></div>
        </>}
      </>}
      tabs={[
        { value: "options", title: "Options", icon: MdTune, content: <OptionsView /> },
        { value: "history", title: "Merge History", placement: "right", icon: MdHistory, content: <MergeHistoryView /> }
      ]}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col bg-bg-primary relative",
          hasResult || !isInputExpanded ? "min-h-48 flex-1 overflow-hidden" : "shrink-0 h-0"
        )}
      >
        <ComparisonView />
      </div>

      <div className="shrink-0 border-t border-border-default bg-bg-secondary px-2 py-1.5 sm:px-3 sm:py-2">
        <div className="flex items-center justify-center">
          <button
            onClick={toggleInputPanel}
            disabled={isInputEditorToggleDisabled}
            className={cn(
              "inline-flex items-center gap-2 rounded-md bg-accent-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-(--duration-short) focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2",
              isInputEditorToggleDisabled ? "cursor-not-allowed opacity-60" : "hover:bg-accent-hover"
            )}
            title={isInputExpanded ? "Hide Input Editor" : "Show Input Editor"}
          >
            <MdBorderColor className="text-base shrink-0" />
            <span>Input Editor (E)</span>
            {isInputExpanded ? <MdKeyboardArrowDown className="text-xl shrink-0" /> : <MdKeyboardArrowUp className="text-xl shrink-0" />}
          </button>
        </div>
      </div>

      <div
        inert={!isInputExpanded}
        className={cn(
          "flex min-h-0 flex-col shrink-0 overflow-hidden bg-bg-primary z-10 transition-[height,min-height,opacity] duration-200 ease-in-out motion-reduce:transition-none",
          isInputExpanded
            ? (hasResult
              ? "h-1/2 min-h-64 border-t border-border-default opacity-100"
              : "min-h-64 flex-1 opacity-100")
            : "h-0 min-h-0 opacity-0"
        )}
      >
        <InputView />
      </div>
    </ToolWorkspaceShell>
  );
}



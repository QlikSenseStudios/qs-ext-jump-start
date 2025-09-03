import { useElement, useLayout, useEffect, useSelections } from '@nebula.js/stardust';

import { properties, data } from './qae';
import ext from './ext';
import {
  ensureSelectionState,
  enterSelectionMode,
  updateLocalDataState,
  updateLastSelectionState,
  ensureContainer,
  resetElementContainer,
  updateContainerState,
  setContainerData,
  ensureContainerAttached,
  clearChildren,
  processLayoutData,
  getSelectionInfo,
} from './state';
import { createNoDataComponent, attachSelectionHandlers } from './components';
import { createExtensionStateTemplate } from './templates';
import { renderExtensionAuto } from './rendering';
import './styles.css';

/**
 * Entrypoint for your sense visualization
 * @param {object} galaxy Contains global settings from the environment.
 * Useful for cases when stardust hooks are unavailable (ie: outside the component function)
 * @param {object} galaxy.anything Extra environment dependent options
 * @param {object=} galaxy.anything.sense Optional object only present within Sense,
 * see: https://qlik.dev/extend/build-extension/in-qlik-sense
 *
 * Component contract:
 * - Inputs: layout (Hypercube and properties), element (container)
 * - Behavior: Render different UI for selection mode, no data, and normal states
 * - Errors: Caught and presented as user-friendly message
 */
export default function supernova(galaxy) {
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(galaxy),
    component() {
      const element = useElement();
      const layout = useLayout();
      const selections = useSelections();

      // Persist local selection state per element across renders
      const selectionState = ensureSelectionState(element);

      useEffect(() => {
        // Do not clear the root element up-front; we keep a stable container for data/selection

        try {
          const inSelection = getSelectionInfo(layout);

          // Handle transitions to keep selection sessions discrete
          const wasInSelection = !!selectionState.lastInSelection;
          if (!wasInSelection && inSelection) {
            // Entering selection mode: start a fresh session from pending clicks
            enterSelectionMode(selectionState);
          }

          // Process layout data for validation and extraction
          const processedData = processLayoutData(layout);

          // Check for declarative rendering mode
          const useDeclarative = layout.props?.useDeclarativeRendering || false;

          if (useDeclarative) {
            // Declarative Rendering Path
            const extensionState = {
              state: !processedData.isValid ? 'no-data' : !processedData.hasData ? 'no-data' : 'data',
              data: {
                ...processedData,
                localData: processedData.hasData
                  ? updateLocalDataState(selectionState, processedData.dataMatrix, inSelection)
                  : [],
              },
              inSelection,
              layout,
              element,
            };

            // Try declarative rendering
            const declarativeSuccess = renderExtensionAuto(extensionState, {
              configId: layout.props?.declarativeConfig || 'dataTableView',
              preferDeclarative: true,
            });

            if (declarativeSuccess) {
              // Update selection state for declarative rendering
              updateLastSelectionState(selectionState, inSelection);

              // Attach selection handlers if in data state
              if (extensionState.state === 'data') {
                const tbody = element.querySelector('tbody');
                if (tbody) {
                  attachSelectionHandlers(tbody, {
                    selectionState,
                    inSelection,
                    selections,
                  });
                }
              }
              return;
            }
            // Fall through to template rendering if declarative fails
          }

          // Template Rendering Path (default)
          if (!processedData.isValid) {
            // Ensure we don't accumulate multiple .no-data nodes across renders
            resetElementContainer(element);
            element.appendChild(createNoDataComponent(processedData.counts.dimCount, processedData.counts.measCount));
            return;
          }

          // Check for data availability (edge case: empty hypercube)
          if (!processedData.hasData) {
            resetElementContainer(element);

            // Use state template for no-data scenario
            const noDataTemplate = createExtensionStateTemplate('no-data', {
              dimCount: processedData.counts.dimCount,
              measCount: processedData.counts.measCount,
            });

            element.appendChild(noDataTemplate);
            return;
          }

          // Acquire or create a stable container per element for data/selection states
          const container = ensureContainer(element);

          // Update container accessibility and state classes
          updateContainerState(container, inSelection);

          // Clear and rebuild inner content each render
          clearChildren(container);

          // Update local data state with current selection information
          const localData = updateLocalDataState(selectionState, processedData.dataMatrix, inSelection);

          // Use data state template for rendering the table with header
          const dataTemplate = createExtensionStateTemplate(
            'data',
            {
              tableConfig: {
                dimHeader: processedData.dimHeader,
                measHeader: processedData.measHeader,
                localData,
                inSelection,
              },
            },
            { inSelection }
          );

          // Replace container content with template
          container.appendChild(dataTemplate.container.firstChild);

          // Get the table body for selection handlers
          const tbody = dataTemplate.tbody;

          // Update persisted local selection state and record current data
          updateLastSelectionState(selectionState, inSelection);

          // Store current data externally without attaching properties to DOM nodes
          setContainerData(container, localData);

          // Ensure container remains attached (append only if not already present)
          ensureContainerAttached(element, container);

          // Attach selection event handlers to the table body
          attachSelectionHandlers(tbody, {
            selectionState,
            inSelection,
            selections,
          });
        } catch (error) {
          // Error handling with user feedback
          // If a container exists, remove it to prevent overlapping UI
          resetElementContainer(element);

          // Use error state template instead of direct error component
          const errorTemplate = createExtensionStateTemplate('error', {
            title: 'Extension Error',
            message: error.message || 'An unexpected error occurred',
          });

          element.appendChild(errorTemplate);
        }
      }, [element, layout]);
    },
  };
}

import { useElement, useLayout, useEffect } from '@nebula.js/stardust';

import { properties, data } from './qae';
import ext from './ext';
import { createElement, safeGet } from './utils';
import './styles.css';

/**
 * Entrypoint for your sense visualization
 * @param {object} galaxy Contains global settings from the environment.
 * Useful for cases when stardust hooks are unavailable (ie: outside the component function)
 * @param {object} galaxy.anything Extra environment dependent options
 * @param {object=} galaxy.anything.sense Optional object only present within Sense,
 * see: https://qlik.dev/extend/build-extension/in-qlik-sense
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

      useEffect(() => {
        // Clear previous content
        element.innerHTML = '';

        try {
          // Skip rendering when in selection mode
          if (safeGet(layout, 'qSelectionInfo.qInSelections', false)) {
            const selectionDiv = createElement(
              'div',
              {
                className: 'selection-mode',
                'aria-label': 'Selection mode active',
              },
              'Selection mode active'
            );
            element.appendChild(selectionDiv);
            return;
          }

          // Check for data availability
          const dataMatrix = safeGet(layout, 'qHyperCube.qDataPages.0.qMatrix', []);
          if (!dataMatrix.length) {
            const noDataDiv = createElement(
              'div',
              {
                className: 'no-data',
                'aria-label': 'No data available',
              },
              'No data to display'
            );
            element.appendChild(noDataDiv);
            return;
          }

          // Render main content with accessibility attributes
          const container = createElement('div', {
            className: 'extension-container',
            role: 'main',
            'aria-label': 'Qlik Sense Extension Content',
            tabindex: '0',
          });

          const content = createElement(
            'div',
            {
              className: 'content',
            },
            `
            <h2>Hello World!</h2>
            <p>Data rows: ${dataMatrix.length}</p>
          `
          );

          container.appendChild(content);
          element.appendChild(container);
        } catch (error) {
          // Error handling with user feedback
          // eslint-disable-next-line no-console
          console.error('Extension rendering error:', error);
          const errorDiv = createElement(
            'div',
            {
              className: 'error-message',
              role: 'alert',
              'aria-live': 'polite',
            },
            `
            <h3>Unable to load extension</h3>
            <p>Please check your data configuration and try again.</p>
          `
          );
          element.appendChild(errorDiv);
        }
      }, [element, layout]);
    },
  };
}

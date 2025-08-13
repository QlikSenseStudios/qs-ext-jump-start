import { useElement, useLayout, useEffect } from '@nebula.js/stardust';

import { properties, data } from './qae';
import ext from './ext';

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
      console.log(useLayout()); // DEBUG CODE: Log the layout to see its structure. Remove when ready for production.

      useEffect(() => {
        if (layout.qSelectionInfo.qInSelections) {
          // skip rendering when in selection mode
          return;
        }

        // output
        element.innerHTML = `<div>Hello World!</div>`;
      }, [element, layout]);
    },
  };
}

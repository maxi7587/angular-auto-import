'use babel';

import AngularAutoImport from '../lib/angular-auto-import';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AngularAutoImport', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('angular-auto-import');
  });

  describe('when the angular-auto-import:import event is triggered', () => {
    it('imports classes used in constructor', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.angular-auto-import')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'angular-auto-import:import');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.angular-auto-import')).toExist();

        let angularAutoImportElement = workspaceElement.querySelector('.angular-auto-import');
        expect(angularAutoImportElement).toExist();

        let angularAutoImportPanel = atom.workspace.panelForItem(angularAutoImportElement);
        expect(angularAutoImportPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'angular-auto-import:import');
        expect(angularAutoImportPanel.isVisible()).toBe(false);
      });
    });

    it('imports classes used in constructor', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.angular-auto-import')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'angular-auto-import:import');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let angularAutoImportElement = workspaceElement.querySelector('.angular-auto-import');
        expect(angularAutoImportElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'angular-auto-import:import');
        expect(angularAutoImportElement).not.toBeVisible();
      });
    });
  });
});

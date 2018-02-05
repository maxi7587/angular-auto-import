'use babel';

import AngularAutoImportView from './angular-auto-import-view';
import { CompositeDisposable } from 'atom';

export default {

  angularAutoImportView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // TODO: Create view for options
    // this.angularAutoImportView = new AngularAutoImportView(state.angularAutoImportViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.angularAutoImportView.getElement(),
    //   visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that imports classes used in constructor
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'angular-auto-import:import': () => this.import()
    }));
  },

  deactivate() {
    // TODO: Use when options view is ready
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.angularAutoImportView.destroy();
  },

  import() {

    let editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      // TODO: add the posibility to import interfaces
      let className = editor.getSelectedText();
      let exportClassName = 'export class ' + className;
      let exportDefaultClassName = 'export default class ' + className;
      let searchExports: Array = [RegExp( exportClassName ), RegExp( exportDefaultClassName )];
      let position: Number = 0;
      for (let exportType of searchExports) {
        let path: String = '';
        atom.workspace.scan(exportType, (result) => {
          // TODO: Use relative paths or start writing the full path from the project base folder
          path = result.filePath;
        }).then((result) => {
          if (path !== '') {
            editor.scan(/import/, (result) => {
              position = result.row + 1;
            });
            // TODO: remove this line when { autoscroll: false } option works OK
            let cursorPosition = editor.getCursorBufferPosition();
            // TODO: Add the posiibility to enable and disable autoscroll
            editor.setCursorBufferPosition([ position, 0 ], { autoscroll: false } );
            if (exportType.source === exportClassName) {
              editor.insertText('import { ' + className + ' } from \'' + path + '\';\n');
            } else {
              editor.insertText('import ' + className + ' from \'' + path + '\';\n');
            }
            // TODO: remove this line when { autoscroll: false } option works OK
            cursorPosition.row = cursorPosition.row + 1;
            editor.setCursorBufferPosition(cursorPosition);
          }
        });
      }
    }
  }
};

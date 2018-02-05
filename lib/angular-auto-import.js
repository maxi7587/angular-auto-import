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

  // TODO: finish import decorators function and add a key binding
  importDecorators() {
    let editor = atom.workspace.getActiveTextEditor();
    let cursorPosition = editor.getCursorBufferPosition();
    let decorators = {
      hasConstructor: false,
      hasInjectable: false,
      hasOnInit: false,
      hasAfterViewInit: false
    };
    let statementArray: Array = [];
    editor.scan(/@Constructor/, (result) => {
      decorators.hasConstructor = true;
    });
    editor.scan(/@Injectable/, (result) => {
      decorators.hasInjectable = true;
    });
    editor.scan(/OnInit/, (result) => {
      decorators.hasOnInit = true;
    });
    editor.scan(/AfterViewInit/, (result) => {
      decorators.hasAfterViewInit = true;
    });
    // TODO: change the if statements for a swich statement
    if (decorators.hasConstructor) {
      statementArray.push('Constructor');
    }
    if (decorators.hasInjectable) {
      statementArray.push('Injectable');
    }
    if (decorators.hasOnInit) {
      statementArray.push('OnInit');
    }
    if (decorators.hasAfterViewInit) {
      statementArray.push('AfterViewInit');
    }
    let statement = 'import { ' + statementArray.join(', ') + ' } from \'@angular/core\';\n';
    console.log(statement);
    // TODO: Add the posiibility to enable and disable autoscroll
    editor.setCursorBufferPosition([ 0, 0 ], { autoscroll: false } );
    editor.insertText(statement);
    // TODO: remove this line when { autoscroll: false } option works OK
    cursorPosition.row = cursorPosition.row + 1;
    editor.setCursorBufferPosition(cursorPosition);
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
          // TODO: Add selector to use relative and absolute paths
          path = atom.project.relativizePath(result.filePath)[1];
          path = path.slice(0,-3);
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

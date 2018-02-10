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

    // Register commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'angular-auto-import:import': () => this.import(),
      'angular-auto-import:importdecorators': () => this.importdecorators(),
      'angular-auto-import:createdecorator': () => this.createdecorator()
    }));
  },

  deactivate() {
    // TODO: Use when options view is ready
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.angularAutoImportView.destroy();
  },

  // TODO: auto-import the created classes in a selected ngModule
  createdecorator() {
    String.prototype.capitalize = function(){
      return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
    };
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const actualPath = editor.getPath();
      let cursorPosition = editor.getCursorBufferPosition();
      // TODO: remove 5 following lines, just for testing
      let selectedText = editor.getSelectedText().split(' ');
      editor.delete(selectedText);
      let decorator = selectedText[1].capitalize();
      let className = selectedText[2].capitalize();
      if (selectedText[0] === 'create' && selectedText.indexOf('from') !== -1 && selectedText.length > 6) {
        let sections = selectedText.slice(4, selectedText.indexOf('from'));
        let moduleName = selectedText.pop();
        this.includeinmodule(className, sections, moduleName, actualPath).then(success => {
          atom.workspace.open(actualPath).then(success => {
            editor.setCursorBufferPosition(cursorPosition);
            this.writedecorator(editor, decorator, className).then(success => {
              this.importdecorators();
              editor.setCursorBufferPosition(cursorPosition);
            });
          });
        });
      }
      // let decoratorImportStatement = 'import { ?.*' + decorator + '.*@angular/core';
      // editor.scan(searchImport, (result) => {
      //   importStatement = false;
      // });
      //   if (importStatement) {
      //   let cursorPosition = editor.getCursorBufferPosition();
      //   editor.setCursorBufferPosition([ 0, 0 ], { autoscroll: false });
      //   editor.insertText('import { ' + decorator + ' } from \'@angular/core\';\n');
      //   // TODO: remove this line when { autoscroll: false } option works OK
      //   cursorPosition.row = cursorPosition.row + 1;
      //   editor.setCursorBufferPosition(cursorPosition);
      // }
    }
  },

  writedecorator(editor, decorator, className) {
    let importStatement: Boolean = true;
    return new Promise(resolve => {
      switch(decorator) {
        case 'Component':
        editor.insertText(
          '@' + decorator + '() {\n  selector: your-component-name,\n  templateUrl: yourComponentView.html\n}\nexport class ' + className + ' {\n\n}'
        );
        break;
        case 'Injectable':
        editor.insertText(
          '@' + decorator + '()\nexport class ' + className + ' {\n\n}'
        );
        break;
      }
      resolve(true);
    });
  },

  // TODO: finish includeinmodule and correct createdecorator
  includeinmodule(className, sections, moduleName, previousFilePath) {
    return new Promise(resolve => {
      let classRegExp = RegExp('export.*class ' + moduleName);
      let destinationModule;
      // TODO: important fix! doesn't find module in scan
      atom.workspace.scan(classRegExp, (result) => {
        // TODO: Add selector to use relative and absolute paths
        destinationModule = atom.workspace.open(result.filePath).then(
          () => {
            let ngModuleEditor = atom.workspace.getActiveTextEditor();
            // TODO: Important! Change string in TypeOf Include for variable from decorator to include
            // let typeOfInclude = RegExp(sections);
            if (!ngModuleEditor) {
              console.log('Error, could not open module', moduleName);
              return;
            }
            for (section of sections) {
              let insertInSection = RegExp(section);
              ngModuleEditor.scan(insertInSection, (ngModulePosition) => {
                ngModuleEditor.setCursorBufferPosition([ngModulePosition.row + 1, 0]);
                ngModuleEditor.insertText(className + ',\n', {select: true});
                ngModuleEditor.autoIndentSelectedRows();
                ngModuleEditor.scan(/import/, (ngModuleImports) => {
                  ngModuleEditor.setCursorBufferPosition([ngModuleImports.row + 1, 0]);
                  ngModuleEditor.insertText('import { ' + className + ' } from \'' + previousFilePath.slice(0,-3) + '\';\n');
                  resolve(true);
                });
                // TODO: unselect line and return to previous editor
              });
            }
          }
        )
      });
    });
  },

  // TODO: finish import decorators function and add a key binding
  importdecorators() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let cursorPosition = editor.getCursorBufferPosition();
      // let decorators = {
      //   hasComponent: false,
      //   hasInjectable: false,
      //   hasOnInit: false,
      //   hasAfterViewInit: false
      // };
      let statementArray: Array = [];
      // TODO: avoid repeating code, use a loop
      editor.scan(/@Component/, (result) => {
        statementArray.push('Component');
      });
      editor.scan(/@Injectable/, (result) => {
        statementArray.push('Injectable');
      });
      editor.scan(/OnInit/, (result) => {
        statementArray.push('OnInit');
      });
      editor.scan(/AfterViewInit/, (result) => {
        statementArray.push('AfterViewInit');
      });
      // if (decorators.hasComponent) {
      //   statementArray.push('Component');
      // }
      // if (decorators.hasInjectable) {
      //   statementArray.push('Injectable');
      // }
      // if (decorators.hasOnInit) {
      //   statementArray.push('OnInit');
      // }
      // if (decorators.hasAfterViewInit) {
      //   statementArray.push('AfterViewInit');
      // }
      let statement = 'import { ' + statementArray.join(', ') + ' } from \'@angular/core\';\n';
      // TODO: Add the posiibility to enable and disable autoscroll
      editor.setCursorBufferPosition([ 0, 0 ], { autoscroll: false });
      editor.insertText(statement);
      // TODO: remove this line when { autoscroll: false } option works OK
      cursorPosition.row = cursorPosition.row + 1;
      editor.setCursorBufferPosition(cursorPosition);
    }
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

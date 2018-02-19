'use babel';

import AngularAutoImportView from './angular-auto-import-view';
import { CompositeDisposable } from 'atom';
const fs = require("fs");

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
      'angular-auto-import:createclass': () => this.createclass()
    }));
  },

  deactivate() {
    // TODO: Use when options view is ready
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.angularAutoImportView.destroy();
  },

  // TODO: merge code inside this function with import() to avoid code repetition
  createclass() {
    this.readtsconfig().then(
      success => {
        if (success) {
          baseUrl = success.compilerOptions.baseUrl;
          this.createclassfunction(baseUrl);
        } else {
          this.createclassfunction();
        }
      }
    );
  },

  // TODO: auto-import the created classes in a selected ngModule
  createclassfunction(basePath) {
    String.prototype.capitalize = function(){
      return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
    };
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const actualPath = editor.getPath();
      let cursorPosition = editor.getCursorBufferPosition();
      let selectedText = editor.getSelectedText().split(' ');
      editor.delete(selectedText);
      if (selectedText.length < 8) {
        console.log('Invalid creation order');
        return;
      }
      let decorator = selectedText[1].capitalize();
      let className = selectedText[2].capitalize();
      if (selectedText[0] === 'create' && selectedText.indexOf('from') !== -1 && selectedText.length > 6) {
        let sections = selectedText.slice(4, selectedText.indexOf('from'));
        let moduleName = selectedText.pop();
        this.includeinmodule(className, sections, moduleName, actualPath, basePath).then(success => {
          atom.workspace.open(actualPath).then(success => {
            editor.setCursorBufferPosition(cursorPosition);
            this.writedecorator(editor, decorator, className).then(success => {
              this.importdecorators();
              editor.setCursorBufferPosition(cursorPosition);
            });
          });
        });
      }
    }
  },

  writedecorator(editor, decorator, className) {
    let importStatement: Boolean = true;
    return new Promise(resolve => {
      switch(decorator) {
        case 'Component':
        editor.insertText(
          '@' + decorator + '({\n  selector: your-component-name,\n  templateUrl: yourComponentView.html\n)}\nexport class ' + className + ' {\n\n}'
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

  includeinmodule(className, sections, moduleName, previousFilePath, basePath) {
    return new Promise(resolve => {
      let classRegExp = RegExp('export.*class ' + moduleName);
      let destinationModule;
      atom.workspace.scan(classRegExp, (result) => {
        // TODO: Add selector to use relative and absolute paths
        destinationModule = atom.workspace.open(result.filePath).then(
          () => {
            let ngModuleEditor = atom.workspace.getActiveTextEditor();
            if (!ngModuleEditor) {
              console.log('Error, can\'t open module', moduleName);
              return;
            }
            for (section of sections) {
              let insertInSection = RegExp(section);
              ngModuleEditor.scan(insertInSection, (ngModulePosition) => {
                ngModuleEditor.setCursorBufferPosition([ngModulePosition.row + 1, 0]);
                ngModuleEditor.insertText(className + ',\n', {select: true});
                ngModuleEditor.autoIndentSelectedRows();
                let previousRelativePath = atom.project.relativizePath(previousFilePath)[1].slice(0,-3);
                let previousRelativePathArray = previousRelativePath.split('/');
                if (previousRelativePathArray[0] === basePath) {
                  previousRelativePath =  previousRelativePathArray.slice(1).join('/');
                  console.log(previousRelativePath);
                }
                let alreadyImported = new RegExp('import { ?.*' + className + '.*' + previousRelativePathArray.slice(-1));
                // TODO: reformulate if() statements to avoid nesting
                if (ngModuleEditor.buffer.getText().search(alreadyImported) === -1) {
                  ngModuleEditor.scan(/import/, (ngModuleImports) => {
                    ngModuleEditor.setCursorBufferPosition([ngModuleImports.row + 1, 0]);
                    ngModuleEditor.insertText('import { ' + className + ' } from \'' + previousRelativePath + '\';\n');
                    resolve(true);
                  });
                } else {
                  resolve(true);
                }
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
      let firstDecorators = ['Component', 'Injectable', 'NgModel', 'Input', 'Output', 'HostListener', 'Inject', 'Directive', 'Pipe', 'HostBinding', 'ContentChild', 'ContentChildren', 'ViewChild', 'ViewChildren'];
      let secondDecorators = ['OnInit', 'DoCheck', 'AfterContentInit', 'AfterViewInit', 'AfterContentChecked', 'AfterViewChecked', 'OnDestroy'];
      let statementArray: Array = [];
      for (decorator of firstDecorators) {
        let decoratorSearcher = RegExp('@' + decorator);
        editor.scan(decoratorSearcher, (result) => {
          let isImportedSearch = new RegExp(decorator + '.* ?} from \'@angular\/core');
          let abort = false;
          editor.scan(isImportedSearch, (result) => {
            abort = true;
          });
          if (abort === false) {
            statementArray.push(decorator);
          }
        });
      }
      for (decorator of secondDecorators) {
        let decoratorSearcher = RegExp('implements .*' + decorator);
        editor.scan(decoratorSearcher, (result) => {
          let isImportedSearch = new RegExp(decorator + '.* ?} from \'@angular\/core');
          let abort = false;
          editor.scan(isImportedSearch, (result) => {
            abort = true;
          });
          if (abort === false) {
            statementArray.push(decorator);
          }
        });
      }
      if (statementArray.length === 0) {
        return;
      }
      let statementDecorators = statementArray.join(', ');
      let imported = false;
      editor.scan(/ ?} from \'@angular\/core/, (result) => {
        console.log(result);
        editor.setCursorBufferPosition([result.row, result.match.index], { autoscroll: false });
        editor.insertText(', ' + statementDecorators);
        imported = true;
      });
      if (imported === false) {
        let statement = 'import { ' + statementDecorators + ' } from \'@angular/core\';\n\n';
        // TODO: Add the posiibility to enable and disable autoscroll
        editor.setCursorBufferPosition([ 0, 0 ], { autoscroll: false });
        editor.insertText(statement);
      }
      // TODO: remove this lines when { autoscroll: false } option works OK
      cursorPosition.row = cursorPosition.row + 1;
      editor.setCursorBufferPosition(cursorPosition);
    }
  },

  readtsconfig() {
    return new Promise(resolve => {
      let jsonFile = null;
      atom.workspace.scan(/"baseUrl":/, (result) => {
        if(result.filePath.slice(-13) === 'tsconfig.json' ) {
          fs.readFile(result.filePath, function (err, data) {
            if (err) {
              return console.error(err);
            }
            jsonFile = JSON.parse(data);
            // resolve(jsonFile);
          });
        }
      }).then(() => {
        if(jsonFile) {
          resolve(jsonFile);
        } else {
          resolve(false);
        }
      });
    });
  },

  import() {
    this.readtsconfig().then(
      success => {
        if (success) {
          baseUrl = success.compilerOptions.baseUrl;
          this.importClass(baseUrl);
        } else {
          this.importClass();
        }
      }
    );
  },

  importClass(basePath = null) {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      // TODO: add the posibility to import interfaces
      let className = editor.getSelectedText();
      if (!className){
        return;
      }
      let alreadyImported = new RegExp('import {? ?.*' + className);
      if (editor.buffer.getText().search(alreadyImported) > -1) {
        console.log('Already imported');
        return;
      }
      let exportClassName = 'export class ' + className;
      let exportDefaultClassName = 'export default class ' + className;
      let searchExports: Array = [RegExp( exportClassName ), RegExp( exportDefaultClassName )];
      let position: Number = 0;
      for (let exportType of searchExports) {
        let path: String = '';
        atom.workspace.scan(exportType, (result) => {
          // TODO: Add selector to use relative and absolute paths
          path = atom.project.relativizePath(result.filePath)[1];
          if (basePath && path.slice(0, basePath.length + 1) === (basePath + '/')) {
            path = path.slice(basePath.length + 1, -3);
          } else {
            path = path.slice(0,-3);
          }
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

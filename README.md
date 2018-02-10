# angular-auto-import | BETA Atom Package

Angular auto-import automatically imports existing classes (as long as they exist in your Atom's current working directory) in your Angular files.

```javascript
import { YourClassName } from 'src/app/some-directory/your-class-file';
```

To use it, add the class in the constructor arguments, select it (just the name) and press `CTRL` + `ALT` + `i`.

```
public constructor (
  someName: YourClassName <= Select the class name and press CTRL + ALT + i
) { }
```

The class will be automatically imported in the top of your actual Angular component, service, etc. below your first import line (if there is one, otherwise it wil be imported at the beggining of the file).

```javascript
import { Component } from '@angular/core';
import { YourClassName } from 'src/app/some-directory/your-class-file';
```

## Decorator & class creator

You can create a class by typing the decorator (Component, Injectable) followed by the name of the class, selecting both words and pressing `CTRL` + `ALT` + `y`. Here goes an example:

```
create component MyNewComponent in includes from module MyModule <= select it and press CTRL + ALT + y
```

This will chenge two files:

### Your actual working file

```javascript
import { Component } from '@angular/core'; <= added only if needed

@Component() {
  selector: your-component-selector
  templateUrl: yourComponentView.html
}
export class MyNewComponent {

}
```

### The module in wich you want to incule the component/service

```javascript
import { MyNewComponent } from 'app/module-folder/component-folder/component-file-name'; <= added only if needed

@NgModule({
  imports: [
    MyNewComponent <= adds the component to the selected arrays in the ngModule decorator
    ...
  ]
})
export class MyModule { }
```

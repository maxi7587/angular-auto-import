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
component MyNewComponent <= select it and press CTRL + ALT + y
```

This will result in:

```javascript
import { Component } from '@angular/core';

@Component() {
  selector: your-component-selector
  templateUrl: yourComponentView.html
}
export class MyNewComponent {

}
```

*Note: the import statement is included only if it is needed

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

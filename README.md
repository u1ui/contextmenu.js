# contextmenu.js
context menus, simple and highly customisable

## Features

- [x] Simple API
- [x] Add context menu to any element by CSS selector
- [x] Add keyboard shortcuts
- [x] Style not corrupted by the website do to the use of shadow dom
- [x] Add custom HTML to the menu
- [x] Submenus, Icons

## Usage

```js
import {contextMenu} from '../contextmenu.js';

contextMenu.add([
    {
        label: 'Button',
        action: e => alert(e.target.textContent),
        iconUrl: '<svg viewBox="0 0 24 24"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10s10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3z"/></svg>',
        selector: 'button'
    },{
        label: 'Global',
        iconUrl: 'https://cdn.jsdelivr.net/npm/@material-icons/svg@1.0.11/svg/public/baseline.svg',
        children: [
            {
                label: 'Submenu 1',
                action(e) { alert(this.label + ' by ' + e.originalEvent.type) },
                shortcut: 'Ctrl+1',
            },
            {
                label: 'Submenu 2',
                action(e) { alert(this.label + ' by ' + e.originalEvent.type) },
                shortcut: 'Ctrl+2',
            },
        ]
    },
]);
```

```html
<button>button 1</button>
<button>button 2</button>
```

[doc](https://doc.deno.land/https://cdn.jsdelivr.net/gh/u1ui/contextmenu.js@x/contextmenu.js)

## API

### contextMenu.add(items)
Adds a context menu to the page. `items` is an array of menu items. Each item is an object with the following properties:

- `label`: The text of the menu item.
- `action`: A function to call when the menu item is clicked. The function is passed an `event` 
object.
    - `event.target`: The element that matched the selector.
    - `event.originalEvent`: The original event that triggered the menu.
    - `event.preventHide`: (boolean) If set to true, the contextmenue will not disappear after the action is called.
    - `this`: The menu item object.
- `onparse`: A function to call when the menu item prepaired for the current context. The function is passed an `event` object.
    - `event.target`: The element that matched the selector.
    - `event.originalEvent`: The original event that triggered the menu.
    - `this`: The menu item object.
- `shortcut`: A keyboard shortcut to trigger the menu item (whitout the open context menu). Example: `'Ctrl + I + O'`.
- `selector`: A CSS selector for the type of element the menu item should appear for. If no selector is provided, the menu item will appear everywhere.
- `icon`: SVG-string or name of a [material icon](https://fonts.google.com/icons?icon.style=Rounded).
- `html`: Custom HTML to display in the menu item. If this is provided, `action`, `label` and `icon` are ignored.
- `children`: An array of sub-menu items. Each sub-menu item has the same properties as a top-level menu item.


### contextMenu.addItem(label, action, options)
Adds a single menu item to the context menu. `item` is an object with the same properties as the items in `contextMenu.add()`.

- return value: The menu item object.

## Install

```js
import * as module from "https://cdn.jsdelivr.net/gh/u1ui/contextmenu.js@x.x.x/contextmenu.min.js"
```

## Demos

[minimal.html](http://gcdn.li/u1ui/contextmenu.js@main/tests/minimal.html)  
[test.html](http://gcdn.li/u1ui/contextmenu.js@main/tests/test.html)  

## About

- MIT License, Copyright (c) 2022 <u1> (like all repositories in this organization) <br>
- Suggestions, ideas, finding bugs and making pull requests make us very happy. ♥


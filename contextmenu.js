let openTimeout;

class Menu {
    constructor(menuItem) {
        this.menuItem = menuItem;
        this.el = document.createElement('menu');
        this.children = [];
    }
    addItem(label, opt={}) {
        const item = new MenuItem(this, label, opt);
        this.el.append(item.el);
        this.children.push(item);
        return item;
    }
    add(items) {
        if (Array.isArray(items)) {
            for (const opt of items) {
                const item = this.addItem(opt.label, opt);
                if (opt.children) item.add(opt.children);
            }
        } else {
            for (const [label, opt] of Object.entries(items)) {
                if (typeof opt === 'function') {
                    this.addItem(label, {action:opt});
                } else {
                    const item = this.addItem(label);
                    item.add(opt);
                }
            }
        }
    }
    parseFor(element) { // returns number of active items for the element
        this.currentActive = this.children.filter(item=>item.parseFor(element)).length;
        return this.currentActive;
    }
    open() {
        clearTimeout(openTimeout);
        if (!this.currentActive) return;
        this.menuItem?.parentMenu?.children.forEach(m=>m._subMenu?.close());
        this._placer().then(p =>{
            this.el.classList.add('-open');
            p.followElement(this.el.parentElement);
        });
    }
    openDelayed() {
        clearTimeout(openTimeout);
        openTimeout = setTimeout(()=>this.open(), 500);
    }
    close() {
        this.el.classList.remove('-open');
        this.children.forEach(m=>m._subMenu?.close());
    }
    async _placer() {
        if (!this.__placer) {
            const Placer = (await import('../Placer.js/Placer.js')).Placer;
            this.__placer = new Placer(this.el, {x:'after', y:'prepend'});
        }
        return this.__placer;
    }
}

class MenuItem {
    constructor(parentMenu, label, options){
        this.parentMenu = parentMenu;
        this.options = options;
        const li = this.el = document.createElement('li');
        li.role = 'menuitem';

        if (options.html) {
            li.innerHTML = options.html;
        } else {
            const btn = document.createElement('button');
            btn.classList.add('-item');   
            li.append(btn);
            btn.innerHTML = `<span class=-icon></span><span class=-label>${label}</span><span class=-shortcut>${options.shortcut||''}</span><span class=-arrow></span>`;
            btn.addEventListener('click', event=>{
                if (options.action) {
                    const e = {target:this.currentTarget, originalEvent:event};
                    options.action(e);
                    if (e.preventHide) return;
                }
                rootEl.hidePopover();
            });
            if (options.iconUrl) btn.querySelector('.-icon').style.backgroundImage = `url(${options.iconUrl})`;
        }

        if (options.shortcut) {
            import('../shortcut.js/shortcut.js').then(({listen})=>{
                listen(options.shortcut, event=>{
                    const target = options.selector ? !event.target.closest(options.selector) : false;
                    if (target) return; // ok?
                    this.currentTarget = target ?? document.documentElement;
                    event.preventDefault();
                    options.action({target:this.currentTarget, originalEvent:event});
                });
            });
        }

        li.addEventListener('mouseenter', e=> this._subMenu?.openDelayed() );
        li.addEventListener('focusin', e=> this._subMenu?.openDelayed() );
        li.addEventListener('mousedown',  stopPropagation)
        li.addEventListener('touchstart', stopPropagation)
    }
    subMenu() {
        if (!this._subMenu) {
            this._subMenu = new Menu(this);
            this.el.append(this._subMenu.el);
            this.options.action = e=> {
                this._subMenu.open();
                e.preventHide = true;
            }
        }
        return this._subMenu;
    }
    addItem(label, opt={}) {
        opt.selector ??= this.options?.selector;
        return this.subMenu().addItem(label, opt);
    }
    add(items) {
        this.subMenu().add(items);
    }
    parseFor(element) {
        this.currentActive = this._subMenu?.parseFor(element);
        this.currentTarget = this.options.selector ? element.closest(this.options.selector) : document.documentElement;

        if (this.currentActive) {
            this.el.querySelector(':scope > button > .-arrow').innerHTML = arrow;
        }
        if (this.currentActive || this.currentTarget) {
            this.el.hidden = false;
            this.options?.onparse?.bind(this)({target:this.currentTarget});
            return true;
        }
        this.el.hidden = true;
    }
}

const arrow = '<svg aria-hidden="true" style="display:block; height:1em" xmlns="http://www.w3.org/2000/svg" width="16" height="26" viewBox="0 0 16 26"><path d="m2 1 12 12L2 25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-width:2"/></svg>';

const css =
'#u1ContextMenu, #u1ContextMenu menu { '+
'	position:fixed; '+
'	top:0; '+
'	background-color:#fff; '+
'	box-shadow:0 0 .4em rgba(0,0,0,.3); '+
'	list-style:none; '+
'	font-family:Arial; '+
'	font-size:14px; '+
'	margin:0; '+
'	padding:0; '+
'	min-width:10em; '+
'	color:#000; '+
'	cursor:default; '+
'	border: 1px solid #bbb; '+
'} '+
'#u1ContextMenu menu { '+
'   display:none; '+
'   background: var(--color-bg, #fff); '+
'   color: var(--color-text, #000); '+
'} '+
'#u1ContextMenu menu.-open { '+
'   display:block; '+
'} '+
'#u1ContextMenu menu:focus-within { '+
'	display:block; '+
'} '+
'#u1ContextMenu:focus { outline:none } '+
'#u1ContextMenu li { '+
'	display:flex; '+
'	padding:0; '+
'} '+
'#u1ContextMenu li .-item { '+ // the button
'	display:flex; '+
'	align-items:center; '+
'	gap:.5em; '+
'	flex:1 1 auto; '+
'	border:0; '+
'	border-radius:0; '+
'	padding:.7em; '+
'	text-align:left; '+
'	background:transparent; '+
'	color:inherit; '+
'} '+
'#u1ContextMenu li > button:focus { '+
'	background:#f3f3f3; '+
'} '+
'#u1ContextMenu .-icon { '+
'   display:flex; '+
'   align-items:center; '+
'   justify-content:center; '+
'	height:1rem; '+
'	width:1rem; '+
'	flex:0 0 auto; '+
'	background-repeat:no-repeat; '+
'	background-size: contain; '+
'} '+
'#u1ContextMenu .-label { '+
'	flex:1 1 auto; '+
'	white-space:nowrap; '+
'	max-width:19em; '+
'	overflow:hidden; '+
'	text-overflow:ellipsis; '+
'} '+
'#u1ContextMenu .-shortcut { '+
'	flex:0 1 auto; '+
'	text-align:right; '+
'	font-size:.8em; '+
'	white-space:nowrap; '+
'	opacity:.5; '+
'} '+
'#u1ContextMenu li:focus-within { '+
'	background-color:#f3f3f3; '+
'} '+
'#u1ContextMenu li[hidden] { '+
'	display:none !important; '+
'}'+
'';

export const contextMenu = new Menu();
const rootEl = contextMenu.el;

rootEl.id = 'u1ContextMenu';
rootEl.popover = 'auto';

/*
// todo: key navigation
function focusNext(direction){
    const focusable = Array.from(rootEl.querySelectorAll('a,button,[tabindex]')); // selector not good
    const root = rootEl.shadowRoot || document;
    const active = root.activeElement;
    const index = focusable.indexOf(active);
    const next = focusable[index + direction];
    if (next) next.focus();
}
const onkey = {
    ArrowUp: ()=>focusNext(-1),
    ArrowDown: ()=>focusNext(1),
}
rootEl.addEventListener('keydown',e=>{
    if (!onkey[e.key]) return;
    onkey[e.key]?.(e);
    e.preventDefault();
});
*/

rootEl.addEventListener('mouseenter', e => e.target.focus(),true);
rootEl.addEventListener('toggle', e => {
    if (e.newState === 'closed') contextMenu.close(); // close all submenus
});


const style = document.createElement('style');
style.textContent = css;


/* *
document.documentElement.append(rootEl);
document.head.prepend(style);
/* */

/* using shadowdom */
const menuContainer = document.createElement('div');
const shadowRoot = menuContainer.attachShadow({mode: 'open'});
menuContainer.style.display = 'contents';
document.documentElement.appendChild(menuContainer);
style.textContent = '@import "../../norm.css/norm.css"; @import "../../base.css/base.css"; '+style.textContent;
shadowRoot.appendChild(style);
shadowRoot.appendChild(rootEl);
/* */



document.documentElement.addEventListener('contextmenu', e=>{
    if (e.shiftKey) return;
    const has = contextMenu.parseFor(e.target);
    if (!has) return;
    e.preventDefault();
    rootEl.showPopover();
    let top  = e.clientY + 2;
    let left = e.clientX + 2;
    top  = Math.min(innerHeight - rootEl.offsetHeight, top);
    left = Math.min(innerWidth  - rootEl.offsetWidth, left);
    rootEl.style.top  = top+'px';
    rootEl.style.left = left+'px';
});


/* helpers */
function stopPropagation(e) { e.stopPropagation() }

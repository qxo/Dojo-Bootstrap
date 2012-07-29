/* ==========================================================
 * Typeahead.js v0.0.1
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
//FIX: selector not working. input on focus not firing
define([
    "dojo/_base/declare",
    "dojo/_base/sniff",
    "dojo/query",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/_base/array",
    "bootstrap/Support",
    "dojo/NodeList-dom",
    "dojo/NodeList-traverse",
    "dojo/domReady!"
], function (declare, sniff, query, lang, win, on, domClass, domAttr, domConstruct, domGeom, domStyle, array, support) {
    "use strict";

    var provideSelector = '[data-provide="typeahead"]';
    var Typeahead = declare([], {
        defaultOptions: {
            source: [],
            items: 8,
            menu: '<ul class="typeahead dropdown-menu"></ul>',
            item: '<li><a href="#"></a></li>'
        },
        constructor: function (element, options) {
            this.options = lang.mixin(lang.clone(this.defaultOptions), (options || {}));
            this.domNode = element;
            this.matcher = this.options.matcher || this.matcher;
            this.sorter = this.options.sorter || this.sorter;
            this.highlighter = this.options.highlighter || this.highlighter;
            this.updater = this.options.updater || this.updater;
            this.menuNode = domConstruct.place(this.options.menu, document.body);
            this.source = this.options.source;
            this.shown = false;
            this.listen();
        },
        select: function () {
            var li = query('.active', this.menuNode)[0];
            this.domNode.value = this.updater(domAttr.get(li, 'data-value'));
            on.emit(this.domNode, 'change', { bubbles:true, cancelable:true });
            return this.hide();
        },
        updater: function (item) {
            return item;
        },
        show: function () {
            var pos = domGeom.position(this.domNode, true);
            domStyle.set(this.menuNode, {
                top: (pos.y + this.domNode.offsetHeight)+'px',
                left: pos.x+'px',
                display: 'block'
            });
            this.shown = true;
            return this;
        },
        hide: function () {
            domStyle.set(this.menuNode, 'display', 'none');
            this.shown = false;
            return this;
        },
        lookup: function () {
            var items;
            this.query = this.domNode.value;
            if (!this.query) {
                return this.shown ? this.hide() : this;
            }
            items = array.filter(this.source, function (item) {
                return this.matcher(item);
            }, this);
            items = this.sorter(items);
            if (!items.length) {
                return this.shown ? this.hide() : this;
            }
            this.render(items.slice(0, this.options.items)).show();
            return this;
        },
        matcher: function (item) {
            return (item.toLowerCase().indexOf(this.query.toLowerCase()))+1;
        },
        sorter: function (items) {
            var beginswith = [],
                caseSensitive = [],
                caseInsensitive = [],
                item;

            while (item = items.shift()) {
                if (!item.toLowerCase().indexOf(this.query.toLowerCase())) { beginswith.push(item); }
                else if (~item.indexOf(this.query)) { caseSensitive.push(item); }
                else { caseInsensitive.push(item); }
            }
            return beginswith.concat(caseSensitive, caseInsensitive);
        },
        highlighter: function (item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>';
            });
        },
        render: function (items) {
            items = array.map(items, function (item, i) {
                var li = domConstruct.toDom(this.options.item);
                domAttr.set(li, 'data-value', item);
                query('a', li)[0].innerHTML = this.highlighter(item);
                if (i === 0) { domClass.add(li, 'active'); }
                return li.outerHTML;
            }, this);
            this.menuNode.innerHTML = items.join('');
            return this;
        },
        next: function () {
            var active = query('.active', this.menuNode);
            var next = query(active).next();

            active.removeClass('active');
            if (!next.length) {
                next = query('li', this.menuNode);
            }
            next.addClass('active');
        },
        prev: function () {
            var active = query('.active', this.menuNode);
            var prev = query(active).prev();

            active.removeClass('active');
            if (!prev.length) {
                prev = query('li', this.menuNode);
            }
            prev.addClass('active');
        },
        listen: function () {
            on(this.domNode, 'blur', lang.hitch(this, 'blur'));
            on(this.domNode, 'keypress', lang.hitch(this, 'keypress'));
            on(this.domNode, 'keyup', lang.hitch(this, 'keyup'));
            if(sniff('webkit') || sniff('ie')) {
                on(this.domNode, 'keydown', lang.hitch(this, 'keypress'));
            }
            on(this.menuNode, 'click', lang.hitch(this, 'click'));
            on(this.menuNode, 'mouseenter', lang.hitch(this, 'mouseenter'));
        },
        keyup: function (e) {
            switch(e.keyCode) {
                case 40: // down arrow
                case 38: // up arrow

                break;

                case 9: // tab
                case 13: // enter
                    if (!this.shown) { return; }
                    this.select();
                break;

                case 27: // escape
                    if (!this.shown) { return; }
                    this.hide();
                break;

                default:
                    this.lookup();
            }
            e.stopPropagation();
            e.preventDefault();
        },
        keypress: function (e) {
            if (!this.shown) { return; }

            switch(e.keyCode) {
                case 9: // tab
                case 13: // enter
                case 27: // escape
                    e.preventDefault();
                break;

                case 38: // up arrow
                    if (e.type !== 'keydown') { break; }
                    e.preventDefault();
                    this.prev();
                break;

                case 40: // down arrow
                    if (e.type !== 'keydown') { break; }
                    e.preventDefault();
                    this.next();
                break;
            }

            e.stopPropagation();
        },
        blur: function () {
            var _this = this;
            setTimeout(function () { _this.hide(); }, 150);
        },
        click: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.select();
        },
        mouseenter: function (e) {
            query('.active', this.menuNode).removeClass('active');
            query(e.currentTarget).addClass('active');
        }
    });

    lang.extend(query.NodeList, {
        typeahead:function (option) {
            var options = (lang.isObject(option)) ? option : {};
            return this.forEach(function (node) {
                var data = support.getData(node, 'typeahead');
                if (!data) { support.setData(node, 'typeahead', (data = new Typeahead(node, options))); }
                if (lang.isString(option)) { data[option].call(data); }
            });
        }
    });
    on(document, on.selector(provideSelector, 'focusin'), function (e) {
        var data = support.getData(e.target, 'typeahead');
        if(data){ return; }
        e.preventDefault();
        query(e.target).typeahead(support.getData(e.target));
    });

    return Typeahead;
});
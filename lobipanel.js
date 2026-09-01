Math.randomString = function(n) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < n; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};
String.prototype.getCss = function() {
    let css = {};
    let declarations = this.valueOf().split(';');
    for (let declaration of declarations) {
        let entry = declaration.trim();
        if (!entry) {
            continue;
        }
        let separator = entry.indexOf(':');
        if (separator === -1) {
            continue;
        }
        // Trennung am ersten Doppelpunkt statt split(':'): Werte duerfen selbst
        // welche enthalten, etwa bei url(http://...). $.trim entfaellt, das gibt
        // es in jQuery 4 nicht mehr.
        css[entry.slice(0, separator).trim()] = entry.slice(separator + 1).trim();
    }
    return css;
};
String.prototype.toCamel = function() {
    return this.replace(/(-[a-z])/g, function($1) {
        return $1.toUpperCase().replace('-', '');
    });
};
String.prototype.toDash = function() {
    return this.replace(/([A-Z])/g, function($1) {
        return "-" + $1.toLowerCase();
    });
};
String.prototype.toUnderscore = function() {
    return this.replace(/([A-Z])/g, function($1) {
        return "_" + $1.toLowerCase();
    });
};
Number.prototype.isBetween = function(num1, num2, including) {
    if (!including) {
        if (this.valueOf() < num2 && this.valueOf() > num1) {
            return true;
        }
    } else {
        if (this.valueOf() <= num2 && this.valueOf() >= num1) {
            return true;
        }
    }
    return false;
};
$.fn.insertAt = function(i, selector) {
    let object = selector;
    if (typeof selector === 'string') {
        object = $(selector);
    }
    i = Math.min(object.children().length, i);
    if (i === 0) {
        object.prepend(this);
        return this;
    }
    // attr() statt data(): geschrieben wird per attr(), und der data-Cache von
    // jQuery wird davon nicht aktualisiert - beim zweiten Aufruf haette data()
    // noch den Wert des ersten geliefert.
    let oldIndex = parseInt(this.attr('data-index'), 10);
    this.attr('data-index', i);
    object.find(">*:nth-child(" + i + ")").after(this);
    object.children().each(function(index, el) {
        let $el = $(el);
        if (oldIndex < i && index > oldIndex && index <= i) {
            // hiess frueher data('data-index') und suchte damit ein Attribut
            // data-data-index; das Ergebnis war immer NaN.
            $el.attr('data-index', parseInt($el.attr('data-index'), 10) - 1);
        } else if (oldIndex >= i && index > i && index <= oldIndex) {
            $el.attr('data-index', parseInt($el.attr('data-index'), 10) + 1);
        }
    });
    return this;
};
$.fn.disableSelection = function() {
    return this.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
};
$.fn.enableSelection = function() {
    return this.removeAttr('unselectable').css('user-select', 'initial').off('selectstart');
};
$(function() {
    let LobiPanel = function($el, options) {
        this.$el = null;
        this.$options = {};
        this.hasRandomId = false;
        this.storage = null;
        let $heading,
            $body,
            innerId,
            storagePrefix = 'lobipanel_';
        let _processInput = (options) => {
            if (!options) {
                options = {};
            }
            let opts = _getOptionsFromAttributes();
            options = $.extend({}, $.fn.lobiPanel.DEFAULTS, this.storage, options, opts);
            let objects = ['unpin', 'reload', 'expand', 'minimize', 'close', 'editTitle'];
            for (let i of objects) {
                if (typeof options[i] === 'object') {
                    options[i] = $.extend({}, $.fn.lobiPanel.DEFAULTS[i], options[i], opts[i]);
                }
            }
            return options;
        };
        let _init = () => {
            this.$el.addClass('lobipanel');
            $heading.append(_generateControls());
            let parent = this.$el.parent();
            _appendInnerIdToParent(parent, innerId);
            _enableSorting();
            _adjustForScreenSize();
            _onToggleIconsBtnClick();
            _enableResponsiveness();
            _setBodyHeight();
            if (this.$options.autoload) {
                this.load();
            }
            let maxWidth = 'calc(100% - ' + $heading.find('.dropdown-menu').children().length * $heading.find('.dropdown-menu li').first().outerWidth() + "px)";
            $heading.find('.panel-title').css('max-width', maxWidth);
            _triggerEvent("init");
        };
        let _generateControls = () => {
            let dropdown = _generateDropdown();
            let menu = dropdown.find('.dropdown-menu');
            if (this.$options.editTitle !== false) {
                menu.append(_generateEditTitle());
            }
            if (this.$options.unpin !== false) {
                menu.append(_generateUnpin());
            }
            if (this.$options.reload !== false) {
                menu.append(_generateReload());
            }
            if (this.$options.minimize !== false) {
                menu.append(_generateMinimize());
            }
            if (this.$options.expand !== false) {
                menu.append(_generateExpand());
            }
            if (this.$options.close !== false) {
                menu.append(_generateClose());
            }
            menu.find('>li>a').on('click', function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
            });
            return dropdown;
        };
        let _generateDropdown = () => {
            return $('<div class="dropdown"></div>').append('<ul class="dropdown-menu dropdown-menu-right"></ul>').append('<div class="dropdown-toggle" data-bs-toggle="dropdown"><span class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + this.$options.toggleIcon + '"></span></div>');
        };
        let _generateEditTitle = () => {
            let options = this.$options.editTitle;
            let control = $('<a data-func="editTitle"></a>');
            control.append('<i class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + options.icon + '"></i>');
            if (options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-bs-tooltip', options.tooltip);
            }
            _onEditTitleClick(control);
            return $('<li></li>').append(control);
        };
        let _onEditTitleClick = (control) => {
            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });
            control.on('click', (ev) => {
                ev.stopPropagation();
                $heading.find('[data-func="editTitle"]').tooltip('hide');
                if (this.isTitleEditing()) {
                    this.finishTitleEditing();
                } else {
                    this.startTitleEditing();
                }
            });
        };
        let _generateUnpin = () => {
            let options = this.$options.unpin;
            let control = $('<a data-func="unpin"></a>');
            control.append('<i class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + options.icon + '"></i>');
            if (options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-bs-tooltip', options.tooltip);
            }
            _onUnpinClick(control);
            return $('<li></li>').append(control);
        };
        let _onUnpinClick = (control) => {
            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });
            control.on('click', () => {
                this.togglePin();
            });
        };
        let _generateReload = () => {
            let options = this.$options.reload;
            let control = $('<a data-func="reload"></a>');
            control.append('<i class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + options.icon + '"></i>');
            if (options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-bs-tooltip', options.tooltip);
            }
            _onReloadClick(control);
            return $('<li></li>').append(control);
        };
        let _onReloadClick = (control) => {
            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });
            control.on('click', () => {
                this.load({
                    callback: function() {
                        control.tooltip('hide');
                    }
                });
            });
        };
        let _generateMinimize = () => {
            let options = this.$options.minimize;
            let control = $('<a class="dropdown-item" data-func="minimize"></a>');
            control.append('<i class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + options.icon + '"></i>');
            if (options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-bs-tooltip', options.tooltip);
            }
            _onMinimizeClick(control);
            return $('<li></li>').append(control);
        };
        let _onMinimizeClick = (control) => {
            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });
            control.on('click', (ev) => {
                ev.stopPropagation();
                this.toggleMinimize();
            });
        };
        let _generateExpand = () => {
            let options = this.$options.expand;
            let control = $('<a data-func="expand"></a>');
            control.append('<i class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + options.icon + '"></i>');
            if (options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-bs-tooltip', options.tooltip);
            }
            _onExpandClick(control);
            return $('<li></li>').append(control);
        };
        let _onExpandClick = (control) => {
            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });
            control.on('click', (ev) => {
                ev.stopPropagation();
                this.toggleSize();
            });
        };
        let _generateClose = () => {
            let options = this.$options.close;
            let control = $('<a data-func="close"></a>');
            control.append('<i class="' + LobiPanel.PRIVATE_OPTIONS.iconClass + ' ' + options.icon + '"></i>');
            if (options.tooltip && typeof options.tooltip === 'string') {
                control.append('<span class="control-title">' + options.tooltip + '</span>');
                control.attr('data-bs-tooltip', options.tooltip);
            }
            _onCloseClick(control);
            return $('<li></li>').append(control);
        };
        let _onCloseClick = (control) => {
            control.on('mousedown', function(ev) {
                ev.stopPropagation();
            });
            control.on('click', (ev) => {
                ev.stopPropagation();
                control.tooltip('hide');
                this.close();
            });
        };
        let _getMaxZIndex = function() {
            let panels = $('.lobipanel.panel-unpin:not(.panel-minimized.panel-expanded)'),
                style,
                max,
                cur;
            if (panels.length === 0) {
                return {
                    "id": "",
                    "z-index": LobiPanel.PRIVATE_OPTIONS.initialZIndex
                };
            }
            style = $(panels[0]).attr('style');
            let id = $(panels[0]).data('inner-id');
            if (!style) {
                max = LobiPanel.PRIVATE_OPTIONS.initialZIndex;
            } else {
                // getCss() liefert Strings. Ohne parseInt wurde lexikografisch
                // verglichen, "9999" galt damit als groesser als "10001".
                max = parseInt(style.getCss()['z-index'], 10) || 0;
            }
            for (let i = 1; i < panels.length; i++) {
                style = $(panels[i]).attr('style');
                if (!style) {
                    cur = 0;
                } else {
                    cur = parseInt(style.getCss()['z-index'], 10) || 0;
                }
                if (cur > max) {
                    id = $(panels[i]).data('inner-id');
                    max = cur;
                }
            }
            return {
                "id": id,
                "z-index": parseInt(max, 10)
            };
        };
        let _onPanelClick = () => {
            this.$el.on('mousedown.lobiPanel', () => {
                if (this.isPinned() || this.isMinimized() || this.isOnFullScreen()) {
                    return false;
                }
                this.bringToFront();
            });
        };
        let _offPanelClick = () => {
            this.$el.off('mousedown.lobiPanel');
        };
        let _changeClassOfControl = (el) => {
            el = $(el);
            let opts = this.$options[el.attr('data-func')];
            if (!opts.icon) {
                return;
            }
            el.find('.' + LobiPanel.PRIVATE_OPTIONS.iconClass).toggleClass(opts.icon).toggleClass(opts.icon2);
        };
        let _getFooterForMinimizedPanels = function() {
            let minimizedCtr = $('.' + LobiPanel.PRIVATE_OPTIONS.toolbarClass);
            if (minimizedCtr.length === 0) {
                minimizedCtr = $('<div class="' + LobiPanel.PRIVATE_OPTIONS.toolbarClass + '"></div>');
                $('body').append(minimizedCtr);
            }
            return minimizedCtr;
        };
        let _expandOnHeaderClick = () => {
            $heading.on('click.lobiPanel', () => {
                this.maximize();
                this.bringToFront();
            });
        };
        let _removeExpandOnHeaderClick = function() {
            $heading.off('click.lobiPanel');
        };
        let _getAvailableWidth = (calcWidth) => {
            if (this.$options.maxWidth) {
                calcWidth = Math.min(calcWidth, this.$options.maxWidth);
            }
            if (this.$options.minWidth) {
                calcWidth = Math.max(calcWidth, this.$options.minWidth);
            }
            return calcWidth;
        };
        let _getAvailableHeight = (calcHeight) => {
            if (this.$options.maxHeight) {
                calcHeight = Math.min(calcHeight, this.$options.maxHeight);
            }
            if (this.$options.minHeight) {
                calcHeight = Math.max(calcHeight, this.$options.minHeight);
            }
            return calcHeight;
        };
        let _calculateBodyHeight = (h) => {
            // outerHeight() liefert bei leerer Auswahl undefined; ohne Footer
            // wurde die Body-Hoehe damit zu NaN.
            return h - ($heading.outerHeight() || 0) - (this.$el.find('.panel-footer').outerHeight() || 0);
        };
        let _calculateBodyWidth = function(w) {
            return w - 2;
        };
        let _appendInnerIdToParent = (parent, innerId) => {
            if (parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr) === undefined) {
                parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr, innerId);
            }
            else {
                if (parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr).indexOf(innerId) > -1) {
                    return;
                }
                let innerIds = parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr);
                parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr, innerIds + " " + innerId);
            }
            this.$el.attr('data-index', this.$el.index());
        };
        let _insertInParent = () => {
            let parent = $('[' + LobiPanel.PRIVATE_OPTIONS.parentAttr + '~=' + innerId + ']');
            this.$el.insertAt(this.$el.attr('data-index'), parent);
        };
        let _generateWindow8Spinner = function() {
            let template = ['<div class="spinner spinner-windows8">', '<div class="wBall">', '<div class="wInnerBall">', '</div>', '</div>', '<div class="wBall">', '<div class="wInnerBall">', '</div>', '</div>', '<div class="wBall">', '<div class="wInnerBall">', '</div>', '</div>', '<div class="wBall">', '<div class="wInnerBall">', '</div>', '</div>', '<div class="wBall">', '<div class="wInnerBall">', '</div>', '</div>', '</div>'].join("");
            return $('<div class="spinner-wrapper">' + template + '</div>');
        };
        let _enableSorting = () => {
            let parent = this.$el.parent();
            if (parent.hasClass('ui-sortable')) {
                parent.sortable("destroy");
            }
            if (this.$options.sortable) {
                this.$el.addClass('lobipanel-sortable');
                parent.addClass('lobipanel-parent-sortable');
            } else {
                this.$el.removeClass('lobipanel-sortable');
            }
            parent.sortable({
                connectWith: '.lobipanel-parent-sortable',
                items: '.lobipanel-sortable',
                handle: '.panel-heading',
                cursor: 'move',
                placeholder: 'lobipanel-placeholder',
                forcePlaceholderSize: true,
                opacity: 0.7,
                revert: 300,
                update: function(event, ui) {
                    let innerId = ui.item.data('inner-id');
                    _removeInnerIdFromParent(innerId);
                    _appendInnerIdToParent(ui.item.parent(), innerId);
                    _updateDataIndices(ui.item);
                    _triggerEvent('dragged');
                }
            });
        };
        let _disableSorting = () => {
            let parent = this.$el.parent();
            if (parent.hasClass('ui-sortable')) {
                parent.sortable("destroy");
            }
        };
        let _updateDataIndices = function(panel) {
            let items = panel.parent().find('> *');
            items.each(function(index, el) {
                $(el).attr('data-index', index);
            });
        };
        let _removeInnerIdFromParent = function(innerId) {
            let parent = $('[' + LobiPanel.PRIVATE_OPTIONS.parentAttr + '~=' + innerId + ']');
            let innerIds = parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr).replace(innerId, '').trim().replace(/\s{2,}/g, ' ');
            parent.attr(LobiPanel.PRIVATE_OPTIONS.parentAttr, innerIds);
        };
        let _onToggleIconsBtnClick = () => {
            $heading.find('.toggle-controls').on('click.lobiPanel', () => {
                this.$el.toggleClass("controls-expanded");
            });
        };
        let _adjustForScreenSize = () => {
            this.disableTooltips();
            if ($(window).width() > 768 && this.$options.tooltips) {
                this.enableTooltips();
            }
            if (this.isOnFullScreen()) {
                $body.css({
                    width: _calculateBodyWidth(this.$el.width()),
                    height: _calculateBodyHeight(this.$el.height())
                });
            }
        };
        let _enableResponsiveness = function() {
            $(window).on('resize.lobiPanel', function() {
                _adjustForScreenSize();
            });
        };
        let _setBodyHeight = () => {
            if (this.$options.bodyHeight !== 'auto') {
                $body.css({
                    'height': this.$options.bodyHeight,
                    overflow: 'auto'
                });
            }
        };
        let _getOptionsFromAttributes = () => {
            let $el = this.$el;
            let options = {};
            for (let key in $.fn.lobiPanel.DEFAULTS) {
                let k = key.toDash();
                let val = $el.data(k);
                if (val !== undefined) {
                    if (typeof $.fn.lobiPanel.DEFAULTS[key] !== 'object') {
                        options[key] = val;
                    } else if (typeof val === 'object' && val !== null) {
                        // jQuery hat gueltiges JSON bereits geparst. Der fruehere
                        // eval('(' + val + ')') bekam hier "[object Object]" und
                        // warf einen SyntaxError.
                        options[key] = val;
                    } else {
                        try {
                            options[key] = JSON.parse(val);
                        } catch (e) {
                            console.warn('lobiPanel: Attribut data-' + k + ' ist kein gueltiges JSON', val);
                        }
                    }
                }
            }
            return options;
        };
        let _saveState = (state) => {
            if (!this.hasRandomId && this.$options.stateful) {
                this.storage.state = state;
                _saveLocalStorage(this.storage);
            }
        };
        let _saveLocalStorage = function(storage) {
            localStorage.setItem(storagePrefix + innerId, JSON.stringify(storage));
        };
        let _applyState = (state) => {
            switch (state) {
            case 'unpinned':
                this.unpin();
                break;
            case 'minimized':
                this.unpin();
                this.minimize();
                break;
            case 'collapsed':
                this.minimize();
                break;
            case 'fullscreen':
                this.toFullScreen();
                break;
            default:
                break;
            }
        };
        let _applyIndex = (index) => {
            if (index !== null) {
                this.$el.insertAt(index, this.$el.parent());
            }
        };
        let _triggerEvent = (eventType, ...args) => {
            args.unshift(this);
            this.$el.trigger(eventType + '.lobiPanel', args);
        };
        this.isPanelInit = () => {
            return this.$el.hasClass('lobipanel') && this.$el.data('inner-id');
        };
        this.isPinned = () => {
            return !this.$el.hasClass('panel-unpin');
        };
        this.pin = () => {
            _triggerEvent("beforePin");
            $heading.find('[data-func="unpin"]').tooltip('hide');
            this.disableResize();
            this.disableDrag();
            _enableSorting();
            _offPanelClick();
            this.$el.removeClass('panel-unpin')
            .attr('old-style', this.$el.attr('style')).removeAttr('style').css('position', 'relative');
            $body.css({
                width: '',
                height: ''
            });
            _setBodyHeight();
            _insertInParent();
            _saveState('pinned');
            _triggerEvent("onPin");
            return this;
        };
        this.unpin = () => {
            _triggerEvent('beforeUnpin');
            if (this.$el.hasClass("panel-collapsed")) {
                return this;
            }
            _disableSorting();
            $heading.find('[data-func="unpin"]').tooltip('hide');
            if (this.$el.attr('old-style')) {
                this.$el.attr('style', this.$el.attr('old-style'));
            } else {
                let width = this.$el.width();
                let height = this.$el.height();
                let left = Math.max(0, $(window).width() - this.$options.maxWidth - 50);
                let top = Math.max(0, (($(window).height() - this.$el.outerHeight()) / 2));
                this.$el.css({
                    left: left,
                    top: top,
                    width: width,
                    height: height
                });
            }
            let res = _getMaxZIndex();
            this.$el.css('z-index', res['z-index'] + 1);
            _onPanelClick();
            this.$el.addClass('panel-unpin');
            $('body').append(this.$el);
            let panelWidth = _getAvailableWidth(this.$el.width());
            let panelHeight = _getAvailableHeight(this.$el.height());
            this.$el.css({
                position: 'fixed',
                width: panelWidth,
                height: panelHeight
            });
            let bHeight = _calculateBodyHeight(panelHeight);
            let bWidth = _calculateBodyWidth(panelWidth);
            $body.css({
                width: bWidth,
                height: bHeight
            });
            if (this.$options.draggable) {
                this.enableDrag();
            }
            if (this.$options.resize !== 'none') {
                this.enableResize();
            }
            _saveState('unpinned');
            _triggerEvent('onUnpin');
            return this;
        };
        this.togglePin = () => {
            if (this.isPinned()) {
                this.unpin();
            } else {
                this.pin();
            }
            return this;
        };
        this.isMinimized = () => {
            return this.$el.hasClass('panel-minimized') || this.$el.hasClass('panel-collapsed');
        };
        this.minimize = () => {
            _triggerEvent("beforeMinimize");
            if (this.isMinimized()) {
                return this;
            }
            if (this.isPinned()) {
                $body.slideUp();
                this.$el.find('.panel-footer').slideUp();
                this.$el.addClass('panel-collapsed');
                _saveState('collapsed');
                _changeClassOfControl($heading.find('[data-func="minimize"]'));
            } else {
                this.disableTooltips();
                $heading.find('[data-func="minimize"]').tooltip('hide');
                let footer = _getFooterForMinimizedPanels();
                let children = footer.find('>*');
                let left,
                    top;
                top = footer.offset().top;
                if (children.length === 0) {
                    left = footer.offset().left;
                } else {
                    let ch = $(children[children.length - 1]);
                    left = ch.offset().left + ch.width();
                }
                if (!this.$el.hasClass('panel-expanded')) {
                    this.$el.attr('old-style', this.$el.attr('style'));
                }
                this.$el.animate({
                    left: left,
                    top: top,
                    width: 200,
                    height: footer.height()
                }, 100, () => {
                    if (this.$el.hasClass('panel-expanded')) {
                        this.$el.removeClass('panel-expanded');
                        this.$el.find('.panel-heading [data-func=expand] .' + LobiPanel.PRIVATE_OPTIONS.iconClass).removeClass(this.$options.expand.icon2).addClass(this.$options.expand.icon);
                    }
                    this.$el.addClass('panel-minimized');
                    this.$el.removeAttr('style');
                    this.disableDrag();
                    this.disableResize();
                    _expandOnHeaderClick();
                    footer.append(this.$el);
                    $('body').addClass('lobipanel-minimized');
                    let maxWidth = 'calc(100% - ' + $heading.find('.dropdown-menu li>a:visible').length * $heading.find('.dropdown-menu li>a:visible').first().outerWidth() + "px)";
                    $heading.find('.panel-title').css('max-width', maxWidth);
                    _saveState('minimized');
                    _triggerEvent("onMinimize");
                });
            }
            return this;
        };
        this.maximize = () => {
            _triggerEvent("beforeMaximize");
            if (!this.isMinimized()) {
                return this;
            }
            if (this.isPinned()) {
                $body.slideDown();
                this.$el.find('.panel-footer').slideDown();
                this.$el.removeClass('panel-collapsed');
                _saveState('pinned');
                _changeClassOfControl($heading.find('[data-func="minimize"]'));
            } else {
                this.enableTooltips();
                let css = this.$el.attr('old-style').getCss();
                this.$el.css({
                    position: css.position || 'fixed',
                    'z-index': css['z-index'],
                    left: this.$el.offset().left,
                    top: this.$el.offset().top,
                    width: this.$el.width(),
                    height: this.$el.height()
                });
                $('body').append(this.$el);
                delete css['position'];
                delete css['z-index'];
                this.$el.animate(css, 100, () => {
                    this.$el.css('position', '');
                    this.$el.removeClass('panel-minimized');
                    this.$el.removeAttr('old-style');
                    if (this.$options.draggable) {
                        this.enableDrag();
                    }
                    this.enableResize();
                    _removeExpandOnHeaderClick();
                    let footer = _getFooterForMinimizedPanels();
                    if (footer.children().length === 0) {
                        footer.remove();
                        // removeClass(...).addClass(...) auf demselben Element hob
                        // sich gegenseitig auf; die Klasse blieb immer gesetzt.
                        $('body').removeClass('lobipanel-minimized');
                    }
                    let maxWidth = 'calc(100% - ' + $heading.find('.dropdown-menu li').length * $heading.find('.dropdown-menu li').first().outerWidth() + "px)";
                    $heading.find('.panel-title').css('max-width', maxWidth);
                    _saveState('unpinned');
                    _triggerEvent("onMaximize");
                });
            }
            return this;
        };
        this.toggleMinimize = () => {
            if (this.isMinimized()) {
                this.maximize();
            } else {
                this.minimize();
            }
            return this;
        };
        this.isOnFullScreen = () => {
            return this.$el.hasClass('panel-expanded');
        };
        this.toFullScreen = () => {
            _triggerEvent("beforeFullScreen");
            if (this.$el.hasClass("panel-collapsed")) {
                return this;
            }
            _changeClassOfControl($heading.find('[data-func="expand"]'));
            $heading.find('[data-func="expand"]').tooltip('hide');
            let res = _getMaxZIndex();
            if (this.isPinned() || this.isMinimized()) {
                this.enableTooltips();
                this.$el.css({
                    position: 'fixed',
                    "z-index": res["z-index"] + 1,
                    left: this.$el.offset().left,
                    top: this.$el.offset().top - $(window).scrollTop(),
                    width: this.$el.width(),
                    height: this.$el.height()
                });
                $('body').append(this.$el);
                let footer = _getFooterForMinimizedPanels();
                if (footer.children().length === 0) {
                    footer.remove();
                }
            } else {
                $body.css({
                    width: '',
                    height: ''
                });
                _setBodyHeight();
            }
            if (!this.isMinimized()) {
                this.$el.attr('old-style', this.$el.attr('style'));
                this.disableResize();
            } else {
                this.$el.removeClass('panel-minimized');
                _removeExpandOnHeaderClick();
            }
            let toolbar = $('.' + LobiPanel.PRIVATE_OPTIONS.toolbarClass);
            let toolbarHeight = toolbar.outerHeight() || 0;
            this.$el.animate({
                width: $(window).width(),
                height: $(window).height() - toolbarHeight,
                left: 0,
                top: 0
            }, this.$options.expandAnimation, () => {
                this.$el.css({
                    width: '',
                    height: '',
                    right: 0,
                    bottom: toolbarHeight
                });
                this.$el.addClass('panel-expanded');
                $('body').css('overflow', 'hidden');
                $body.css({
                    width: _calculateBodyWidth(this.$el.width()),
                    height: _calculateBodyHeight(this.$el.height())
                });
                this.disableDrag();
                if (this.isPinned()) {
                    _disableSorting();
                }
                _saveState('fullscreen');
                _triggerEvent("onFullScreen");
            });
            return this;
        };
        this.toSmallSize = () => {
            _triggerEvent("beforeSmallSize");
            _changeClassOfControl($heading.find('[data-func="expand"]'));
            $heading.find('[data-func="expand"]').tooltip('hide');
            let css = this.$el.attr('old-style').getCss();
            this.$el.animate({
                left: css.left,
                top: css.top,
                width: css.width,
                height: css.height,
                right: css.right,
                bottom: css.bottom
            }, this.$options.collapseAnimation, () => {
                this.$el.removeAttr('old-style');
                if (!this.$el.hasClass('panel-unpin')) {
                    this.$el.removeAttr('style');
                    _insertInParent();
                    _enableSorting();
                } else {
                    if (this.$options.draggable) {
                        this.enableDrag();
                    }
                    this.enableResize();
                }
                this.$el.removeClass('panel-expanded');
                $('body').css('overflow', 'auto');
                let bWidth = '';
                let bHeight = '';
                if (!this.isPinned()) {
                    bWidth = _calculateBodyWidth(this.getWidth());
                    bHeight = _calculateBodyHeight(this.getHeight());
                    _saveState('unpinned');
                } else if (this.$options.bodyHeight !== 'auto') {
                    bHeight = this.$options.bodyHeight;
                    _saveState('pinned');
                }
                $body.css({
                    width: bWidth,
                    height: bHeight
                });
                _triggerEvent("onSmallSize");
            });
            return this;
        };
        this.toggleSize = () => {
            if (this.isOnFullScreen()) {
                this.toSmallSize();
            } else {
                this.toFullScreen();
            }
            return this;
        };
        this.close = () => {
            _triggerEvent('beforeClose');
            this.$el.hide(100, () => {
                if (this.isOnFullScreen()) {
                    $('body').css('overflow', 'auto');
                }
                this.$el.remove();
                let footer = _getFooterForMinimizedPanels();
                if (footer.children().length === 0) {
                    footer.remove();
                }
                _triggerEvent('onClose');
            });
            return this;
        };
        this.setPosition = (left, top) => {
            if (this.isPinned()) {
                return this;
            }
            this.$el.animate({
                'left': left,
                'top': top
            }, 100);
            return this;
        };
        this.setWidth = (w) => {
            if (this.isPinned()) {
                return this;
            }
            let bWidth = _calculateBodyWidth(w);
            this.$el.animate({
                width: w
            }, 100);
            $body.animate({
                width: bWidth
            }, 100);
            return this;
        };
        this.setHeight = (h) => {
            if (this.isPinned()) {
                return this;
            }
            let bHeight = _calculateBodyHeight(h);
            this.$el.animate({
                height: h
            }, 100);
            $body.animate({
                height: bHeight
            }, 100);
            return this;
        };
        this.setSize = (w, h) => {
            if (this.isPinned()) {
                return this;
            }
            let bHeight = _calculateBodyHeight(h);
            let bWidth = _calculateBodyWidth(w);
            this.$el.animate({
                height: h,
                width: w
            }, 100);
            $body.animate({
                height: bHeight,
                width: bWidth
            }, 100);
            return this;
        };
        this.getPosition = () => {
            let offset = this.$el.offset();
            return {
                x: offset.left,
                y: offset.top
            };
        };
        this.getWidth = () => {
            return this.$el.width();
        };
        this.getHeight = () => {
            return this.$el.height();
        };
        this.bringToFront = () => {
            _triggerEvent("beforeToFront");
            let res = _getMaxZIndex();
            if (res['id'] === this.$el.data('inner-id')) {
                return this;
            }
            this.$el.css('z-index', res['z-index'] + 1);
            _triggerEvent("onToFront");
            return this;
        };
        this.enableDrag = () => {
            this.$el.draggable({
                handle: '.panel-heading'
            });
            return this;
        };
        this.disableDrag = () => {
            if (this.$el.hasClass('ui-draggable')) {
                this.$el.draggable("destroy");
            }
            return this;
        };
        this.enableResize = () => {
            let handles = false;
            if (this.$options.resize === 'vertical') {
                handles = 'n, s';
            } else if (this.$options.resize === 'horizontal') {
                handles = 'e, w';
            } else if (this.$options.resize === 'both') {
                handles = 'all';
            }
            if (!handles) {
                return this;
            }
            this.$el.resizable({
                minWidth: this.$options.minWidth,
                maxWidth: this.$options.maxWidth,
                minHeight: this.$options.minHeight,
                maxHeight: this.$options.maxHeight,
                handles: handles,
                start: () => {
                    this.$el.disableSelection();
                    _triggerEvent('resizeStart');
                },
                stop: () => {
                    this.$el.enableSelection();
                    _triggerEvent('resizeStop');
                },
                resize: () => {
                    let bHeight = _calculateBodyHeight(this.$el.height());
                    let bWidth = _calculateBodyWidth(this.$el.width());
                    $body.css({
                        width: bWidth,
                        height: bHeight
                    });
                    _triggerEvent("onResize");
                }
            });
            return this;
        };
        this.disableResize = () => {
            if (this.$el.hasClass('ui-resizable')) {
                this.$el.resizable("destroy");
            }
            return this;
        };
        this.startLoading = () => {
            let spinner = _generateWindow8Spinner();
            this.$el.append(spinner);
            let sp = spinner.find('.spinner');
            sp.css('margin-top', 50);
            return this;
        };
        this.stopLoading = () => {
            this.$el.find('.spinner-wrapper').remove();
            return this;
        };
        this.setLoadUrl = (url) => {
            this.$options.loadUrl = url;
            return this;
        };
        this.load = (params) => {
            params = params || {};
            if (typeof params === 'string') {
                params = {
                    url: params
                };
            }
            let url = params.url || this.$options.loadUrl,
                data = params.data || {},
                callback = params.callback || null;
            if (!url) {
                return this;
            }
            _triggerEvent("beforeLoad");
            this.startLoading();
            $body.load(url, data, (result, status, xhr) => {
                if (callback && typeof callback === 'function') {
                    callback(result, status, xhr);
                }
                this.stopLoading();
                _triggerEvent("loaded", result, status, xhr);
            });
            return this;
        };
        this.destroy = () => {
            this.disableDrag();
            this.disableResize();
            this.$options.sortable = false;
            _enableSorting();
            _removeInnerIdFromParent(innerId);
            this.$el.removeClass('lobipanel').removeAttr('data-inner-id').removeAttr('data-index').removeData('lobiPanel');
            $heading.find('.dropdown').remove();
            return this.$el;
        };
        this.startTitleEditing = () => {
            let title = $heading.find('.panel-title').text().trim();
            // val() statt Einbau in einen HTML-String: ein Anfuehrungszeichen im
            // Titel brach sonst aus dem Attribut aus.
            let input = $('<input/>').val(title);
            input.on('keydown', (ev) => {
                if (ev.which === 13) {
                    this.finishTitleEditing();
                } else if (ev.which === 27) {
                    this.cancelTitleEditing();
                }
            });
            $heading.find('.panel-title').data('old-title', title).html("").append(input);
            // input[0] ist ein DOM-Element und hat kein trigger(); der Aufruf
            // warf einen TypeError und brach die Titelbearbeitung ab.
            input.trigger("focus");
            input[0].select();
            _changeClassOfControl($heading.find('[data-func="editTitle"]'));
            return this;
        };
        this.isTitleEditing = function() {
            return $heading.find('.panel-title input').length > 0;
        };
        this.cancelTitleEditing = () => {
            let title = $heading.find('.panel-title');
            title.html(title.data('old-title')).find('input').remove();
            _changeClassOfControl($heading.find('[data-func="editTitle"]'));
            return this;
        };
        this.finishTitleEditing = () => {
            let input = $heading.find('input');
            $heading.find('.panel-title').html(input.val());
            input.remove();
            _changeClassOfControl($heading.find('[data-func="editTitle"]'));
            return this;
        };
        this.enableTooltips = () => {
            if ($(window).width() < 768) {
                return this;
            }
            let controls = $heading.find('.dropdown-menu>li>a');
            controls.each(function(index, el) {
                let $el = $(el);
                $el.attr('data-bs-toggle', 'tooltip').attr('title', $el.data('bsTooltip')).attr('data-bs-placement', 'bottom');
            });
            controls.each(function(ind, el) {
                $(el).tooltip({
                    container: 'body',
                    template: '<div class="tooltip lobipanel-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                });
            });
            return this;
        };
        this.disableTooltips = () => {
            $heading.find('.dropdown-menu>li>a').tooltip('dispose');
            return this;
        };
        this.$el = $el;
        if (!this.$el.data('inner-id')) {
            this.hasRandomId = true;
            this.$el.attr('data-inner-id', Math.randomString(10));
        }
        innerId = this.$el.data('inner-id');
        if (!this.hasRandomId) {
            this.storage = localStorage.getItem(storagePrefix + innerId);
            this.storage = JSON.parse(this.storage) || {};
        }
        this.$options = _processInput(options);
        $heading = this.$el.find('>.panel-heading');
        $body = this.$el.find('>.panel-body');
        _init();
        _applyState(this.$options.state);
        _applyIndex(this.$options.initialIndex);
    };
    $.fn.lobiPanel = function(option) {
        let args = arguments,
            ret = null;
        this.each(function() {
            let $this = $(this);
            let data = $this.data('lobiPanel');
            let options = typeof option === 'object' && option;
            if (!data) {
                $this.data('lobiPanel', (data = new LobiPanel($this, options)));
            }
            if (typeof option === 'string') {
                args = Array.prototype.slice.call(args, 1);
                ret = data[option].apply(data, args);
            }
        });
        return ret;
    };
    LobiPanel.PRIVATE_OPTIONS = {
        parentAttr: 'data-lobipanel-child-inner-id',
        toolbarClass: 'lobipanel-minimized-toolbar',
        initialZIndex: 10000,
        iconClass: 'panel-control-icon'
    };
    $.fn.lobiPanel.DEFAULTS = {
        draggable: true,
        sortable: false,
        connectWith: '.ui-sortable',
        resize: 'both',
        minWidth: 200,
        minHeight: 100,
        maxWidth: 1200,
        maxHeight: 700,
        loadUrl: "",
        autoload: true,
        bodyHeight: 'auto',
        tooltips: true,
        toggleIcon: 'glyphicon glyphicon-cog',
        expandAnimation: 100,
        collapseAnimation: 100,
        state: 'pinned',
        initialIndex: null,
        stateful: false,
        unpin: {
            icon: 'glyphicon glyphicon-move',
            tooltip: 'Unpin'
        },
        reload: {
            icon: 'glyphicon glyphicon-refresh',
            tooltip: 'Reload'
        },
        minimize: {
            icon: 'glyphicon glyphicon-minus',
            icon2: 'glyphicon glyphicon-plus',
            tooltip: 'Minimize'
        },
        expand: {
            icon: 'glyphicon glyphicon-resize-full',
            icon2: 'glyphicon glyphicon-resize-small',
            tooltip: 'Fullscreen'
        },
        close: {
            icon: 'glyphicon glyphicon-remove',
            tooltip: 'Close'
        },
        editTitle: {
            icon: 'glyphicon glyphicon-pencil',
            icon2: 'glyphicon glyphicon-floppy-disk',
            tooltip: 'Edit title'
        }
    };
    $('.lobipanel').lobiPanel();
});

$(document).ready(function() {
    window.MotionChart = {};
    MotionChart.util = {
        colorInterpolate: function(colors) {
            return d3.scaleLinear().domain(_.map(_.range(colors.length), function(i) {
                return i / (colors.length - 1);
            })).interpolate(d3.interpolateHcl).range(colors);
        }
    };
    MotionChart.CONST = {
        VIEW: {
            BUBBLES: 'bubbles',
            LINES: 'lines',
            BARS: 'bars'
        },
        LOG: {
            STATE: false,
            LEVEL: {
                CRITICAL: 50,
                ERROR: 40,
                WARNING: 30,
                INFO: 20,
                DEBUG: 10,
                NOTSET: 0
            }
        },
        ACTION: {
            SELECT_REGION: 'SELECT-REGION',
            SET_YEAR: 'SET-YEAR',
            SET_INDICATOR: 'SET-INDICATOR',
            SET_INDICATOR_Y: 'SET-INDICATOR-Y',
            SET_INDICATOR_R: 'SET-INDICATOR-R',
            DATA_LOADED: 'DATA-LOADED'
        },
        TRANSITION: {
            YES: true,
            NO: false
        },
        SUSPEND: {
            YES: true,
            NO: false
        },
        ZOOM: {
            NONE: 0,
            ZOOM: 1,
            ZOOMING: 2
        },
        COLORLEVEL: {
            TOPREGION: 'topregion',
            REGION: 'region'
        },
        COLORSCHEMES: {
            interpolateSchemeCategory10: MotionChart.util.colorInterpolate(d3.schemeCategory10),
            interpolateSchemeCategory20: MotionChart.util.colorInterpolate(d3.schemeCategory20),
            interpolateSchemeCategory20b: MotionChart.util.colorInterpolate(d3.schemeCategory20b),
            interpolateSchemeCategory20c: MotionChart.util.colorInterpolate(d3.schemeCategory20c),
            interpolatePlasma: d3.interpolatePlasma,
            interpolateWarm: d3.interpolateWarm,
            interpolateCool: d3.interpolateCool,
            interpolateRainbow: d3.interpolateRainbow,
            interpolateCubehelixDefault: d3.interpolateCubehelixDefault,
            interpolateBA: MotionChart.util.colorInterpolate([d3.rgb("#e2001a"), d3.rgb('#2C6478'), d3.rgb('#23436D'), d3.rgb('#23436D')]),
            interpolate16: MotionChart.util.colorInterpolate([d3.rgb("#ff0000"), d3.rgb("#ff8000"), d3.rgb("#ff8080"), d3.rgb("#ff00ff"), d3.rgb("#8000ff"), d3.rgb("#8080ff"), d3.rgb("#0000ff"), d3.rgb("#0080ff"), d3.rgb("#00ffff"), d3.rgb("#008000"), d3.rgb("#00ff00"), d3.rgb("#ff0080"), d3.rgb("#ffff00"), d3.rgb("#80ff00"), d3.rgb("#800000"), d3.rgb("#80ff80")]),
            interpolateAmm: MotionChart.util.colorInterpolate([d3.rgb("#FF42C3"), d3.rgb("#C042FF"), d3.rgb("#7842FF"), d3.rgb("#4268FF"), d3.rgb("#42A7FF"), d3.rgb("#42D6FF"), d3.rgb("#42FFD6"), d3.rgb("#42FF74"), d3.rgb("#71FF42"), d3.rgb("#B7FF42"), d3.rgb("#E3FF42"), d3.rgb("#FFDC42"), d3.rgb("#FFB042"), d3.rgb("#FF8442"), d3.rgb("#FF6242"), d3.rgb("#FF1212")]),
            interpolateBasic: MotionChart.util.colorInterpolate([d3.rgb("#ff0000"), d3.rgb("#ff00ff"), d3.rgb("#0000ff"), d3.rgb("#00ffff"), d3.rgb("#00ff00"), d3.rgb("#ffff00")])
        }
    };
    MotionChart.config = {
        log: {
            state: false,
            level: MotionChart.CONST.LOG.LEVEL.INFO,
            prefix: 'MotionChart.Chart >>'
        },
        d3: {
            default_locale_definition: {
                decimal: ',',
                thousands: '.',
                grouping: [3],
                currency: ['', ' €']
            }
        },
        mobile: false,
        region_type: null,
        urls: {
            data: null,
            list: null,
            save: null,
            delete: null,
            load: null,
        },
        size: {
            width: 0,
            height: 0,
            adjust: {
                height: {
                    normal: -310,
                    fullscreen: -160
                }
            }
        },
        panel: {
            selector: '#motionchart-menu',
            state: 'unpinned',
            stateful: true,
            minWidth: 565,
            maxWidth: 565,
            minHeight: 550,
            maxHeight: 550,
            draggable: true,
            reload: false,
            editTitle: false,
            unpin: false,
            minimize: {
                icon2: 'fa fa-chevron-up',
                icon: 'fa fa-chevron-down',
                tooltip: 'Minimieren'
            },
            close: false,
            expand: false,
            toggleIcon: 'fa fa-wrench',
            overflow: {
                top: 0,
                left: 150,
                right: 150,
                bottom: 50
            }
        },
        controls: {
            year: {
                slider: 'year_slider',
                input: 'year',
                min: 'year_min',
                max: 'year_max'
            },
            button: {
                play: 'btn-play',
                rewind: 'btn-rewind',
                stop: 'btn-stop',
                next: 'btn-next',
                prev: 'btn-prev',
                end: 'btn-end',
                select_all_regions: 'btn-select-all-regions',
                deselect_all_regions: 'btn-deselect-all-regions',
                select_all_topregions: 'btn-select-all-topregions',
                deselect_all_topregions: 'btn-deselect-all-topregions',
                apply_region_palette: 'btn-region-apply-palette',
                region_reset_colors: 'btn-region-reset-colors',
                apply_topregion_palette: 'btn-topregion-apply-palette',
                topregion_reset_colors: 'btn-topregion-reset-colors',
                open: 'btn-open',
                save: 'btn-save',
                delete: 'btn-delete',
                refresh: 'btn-refresh',
                save_confirm: 'btn-save-confirm',
                save_cancel: 'btn-save-cancel'
            },
            select: {
                view: 'view',
                indicator_x: 'indicator_x',
                indicator_y: 'indicator_y',
                indicator_r: 'indicator_r',
                scale_x: 'scale_x',
                scale_y: 'scale_y',
                scale_r: 'scale_r',
                color: 'color',
                radius_lo: 'radius_lo',
                radius_hi: 'radius_hi'
            },
            checkbox: {
                show_all_regions: 'show_all_regions',
                show_bubble_lines: 'show_bubble_lines',
                show_bubble_trails: 'show_bubble_trails'
            },
            html: {
                topregions: 'topregions',
                regions: 'regions'
            }
        },
        classes: {
            topregion: 'fa fa-stop'
        },
        margin: {
            top: 30,
            right: 30,
            bottom: 90,
            left: 80
        },
        year: {
            size_factor: 3.1,
            fill: '#f0f0f0',
            weight: 'bold',
            font: {
                family: 'sans-serif'
            },
            offset: {
                left: -30,
                top: 50
            }
        },
        slider: {
            offset: {
                top: 27
            }
        },
        control: {
            offset: {
                top: 8
            },
            rewind: {
                tooltip: 'Zum ersten Jahr'
            },
            prev: {
                tooltip: 'Ein Jahr zurück'
            },
            play: {
                tooltip: 'Abspielen'
            },
            stop: {
                tooltip: 'Beenden'
            },
            next: {
                tooltip: 'Ein Jahr weiter'
            },
            end: {
                tooltip: 'Zum letzten Jahr'
            },
            start_zoom: {
                tooltip: 'Wertebereich vergrößern'
            },
            stop_reset: {
                tooltip: 'Wertebereich zurücksetzen'
            }
        },
        exclamation: {
            fill: 'red',
            font: {
                size: '120px',
                family: 'FontAwesome'
            },
            text: d3.ui.fa.get('fa-exclamation-triangle'),
            tooltip: 'Keine Region zur Anzeige ausgewählt.',
            opacity: 0.5,
            offset: {
                left: -30,
                top: 50
            }
        },
        focus: {
            line: {
                stroke: 'blue',
                stroke_dasharray: '3,3',
                opacity: 0.8
            },
            x: {
                fill: '#E0E0E0',
                opacity: 0.8,
                padding: 5,
                adjust: {
                    y: -2
                }
            },
            y: {
                fill: '#E0E0E0',
                opacity: 0.8,
                padding: 2
            }
        },
        timeline: {
            line: {
                standard: {
                    opacity: 0.1,
                    stroke: {
                        width: 2
                    }
                },
                over: {
                    opacity: 1.0,
                    stroke: {
                        width: 3
                    }
                },
                selected: {
                    opacity: 1.0,
                    stroke: {
                        width: 3
                    }
                }
            },
            dot: {
                radius: 3.5
            },
            labels: {
                width: {
                    min: 40,
                    max: 200,
                    bias: 0.3
                },
                font: {
                    family: 'sans-serif',
                    factor: 60,
                    min: 6,
                    max: 12
                }
            }
        },
        staticIndicators: {
            year: 0.2
        },
        circle: {
            default_radius: 7,
            extent: {
                extend: 0.1,
            },
            standard: {
                opacity: .15,
                stroke: {
                    color: null,
                    width: null
                }
            },
            over: {
                opacity: .6,
                stroke: {
                    color: '#6666ff',
                    width: 2
                }
            },
            selected: {
                opacity: .8,
                stroke: {
                    color: '#990000',
                    width: 1
                }
            },
            selected_over: {
                opacity: 1,
                stroke: {
                    color: '#ffcccc',
                    width: 2
                }
            }
        },
        bar: {
            standard: {
                opacity: .15
            },
            selected: {
                opacity: .8
            },
            over: {
                opacity: .6
            }
        },
        menu: {
            standard: {
                background: 'white'
            },
            over: {
                background: '#e0e0e0'
            },
            selected: {
                background: '#d0d0d0'
            }
        },
        blink: {
            opacity: {
                on: 0.9,
                off: 0.1
            }
        },
        events: {
            TOP_REGION: 'TOP_REGION',
            CALCULATE_DATA_YEARS: 'CALCULATE_DATA_YEARS',
            PUSH: 'PUSH',
        },
        transition: {
            view: {
                duration: 2000
            },
            year: {
                duration: 750
            },
            fast: {
                duration: 100
            },
            color: {
                duration: 600
            },
            blink: {
                duration: 350
            },
            export: {
                duration: 3000
            }
        },
        axis: {
            x: {
                font: {
                    family: 'sans-serif',
                    factor: 40,
                    min: 6,
                    max: 17
                },
                offset: {
                    x: 0,
                    y: 8
                }
            },
            y: {
                font: {
                    family: 'sans-serif',
                    factor: 25,
                    min: 6,
                    max: 17
                },
                offset: {
                    x: 0,
                    y: 0
                }
            },
            source: {
                font: {
                    family: 'sans-serif',
                    factor: 35,
                    min: 6,
                    max: 15
                },
                offset: {
                    x: 0,
                    y: 0
                }
            },
            data_source: {
                font: {
                    family: 'sans-serif',
                    factor: 35,
                    min: 5,
                    max: 9
                },
                offset: {
                    x: 0,
                    y: 0
                }
            }
        },
        export: {
            size: {
                width: 1140,
                height: 630
            },
            delay: 750,
            delay_view: 5000,
            waitme_zindex: 20001,
            regex: /<(text|rect|circle|line|path)\b[^>]*\bhidden\b[^>]*(?:\/>|>[\s\S]*?<\/\1>)/g
        },
        loading: {
            delay: 1000
        }
    };
    MotionChart.Config = function(config) {
        return $.extend(true, {}, MotionChart.config, config || {});
    };
    MotionChart.Chart = function(config, bus, fullscreen, sandbox) {
        this.config = config;
        this.bus = bus;
        this.sandbox = sandbox;
        this.data = null;
        this.fullscreen = fullscreen === true;
        this.is_authenticated = false;
        this.zoom_mode = MotionChart.CONST.ZOOM.NONE;
        this.stop_animation = false;
        this.dom = {};
        this.dom_controls = {
            button: Object.create(null),
            select: Object.create(null),
            checkbox: Object.create(null)
        };
        this.node_index = null;
        this.region_menu = {
            checkbox: Object.create(null),
            item: Object.create(null)
        };
        this.topregion_region_ids = null;
        this.invalidateColorCache();
        this.export_animation = null;
        this.last_selected_region_id = null;
        this.show_bubble_trails_once_more = false;
        this.loading = null;
        this.color_picker = null;
        this.isSelectAll = false;
        this.animation = false;
        this.open_chart = false;
        this.logger = _.partial(console.log, this.config.log.prefix);
        d3.formatDefaultLocale(this.config.d3.default_locale_definition);
        this.initial_loading = this.startLoading('Chart', 'Lade Motion Chart');
        this.calculateSize();
        this.initDom();
        this.lastYearTransition = true;
    };
    // Logging laesst sich pro Chart ueber config.log.state einschalten oder
    // global ueber MotionChart.CONST.LOG.STATE (praktisch aus der Konsole).
    MotionChart.Chart.prototype.log = function() {
        if (!(this.config.log.state || MotionChart.CONST.LOG.STATE)) {
            return;
        }
        this.logger.apply(console, arguments);
    };
    MotionChart.Chart.prototype.debug = function() {
        if (!(this.config.log.state || MotionChart.CONST.LOG.STATE)) {
            return;
        }
        if (MotionChart.CONST.LOG.LEVEL.DEBUG >= this.config.log.level) {
            this.logger.apply(console, arguments);
        }
    };
    MotionChart.Chart.prototype.info = function() {
        if (!(this.config.log.state || MotionChart.CONST.LOG.STATE)) {
            return;
        }
        if (MotionChart.CONST.LOG.LEVEL.INFO >= this.config.log.level) {
            this.logger.apply(console, arguments);
        }
    };
    MotionChart.Chart.prototype.push = function(value) {
        if (this.isSelectAll) {
            return;
        }
        if (this.bus) {
            if (this.isSuspended(this.config.events.PUSH)) {
                this.info('push:SUSPENDED', value);
            } else {
                this.info('push', value);
                this.bus.push(value);
            }
        }
    };
    MotionChart.Chart.prototype.pushAction = function(action, data) {
        this.info('pushAction', action, data);
        let value = {
            'action': action
        };
        value = $.extend(true, {}, value, data || {});
        this.push(value);
    };
    MotionChart.Chart.prototype.initDom = function() {
        this.info('initDom');
        this.initPanel();
        this.getSelect('view').change(this.onViewChange.bind(this));
        this.dom.slider = $('#' + this.config.controls.year.slider).slider({
            value: 2005,
            min: 2005,
            max: 2015,
            animate: 'fast'
        });
        this.dom.slider.on('slide', this.onSliderChange.bind(this));
        this.dom.year = $('#' + this.config.controls.year.input);
        this.dom.year.prop('disabled', true);
        this.dom.year_min = $('#' + this.config.controls.year.min);
        this.dom.year_max = $('#' + this.config.controls.year.max);
        this.getButton('play').on('click', this.play.bind(this));
        this.getButton('stop').on('click', this.stop.bind(this));
        this.getButton('stop').prop('disabled', true);
        this.getButton('rewind').on('click', this.rewind.bind(this));
        this.getButton('end').on('click', this.end.bind(this));
        this.getButton('next').on('click', this.next.bind(this));
        this.getButton('prev').on('click', this.prev.bind(this));
        this.getButton('select_all_regions').on('click', _.partial(this.selectAllRegions, true).bind(this));
        this.getButton('deselect_all_regions').on('click', _.partial(this.selectAllRegions, false).bind(this));
        this.getButton('apply_region_palette').on('click', this.applyPaletteToRegion.bind(this));
        this.getButton('region_reset_colors').on('click', this.resetRegionColors.bind(this));
        this.getButton('apply_topregion_palette').on('click', this.applyPaletteToTopRegion.bind(this));
        this.getButton('topregion_reset_colors').on('click', this.resetTopRegionColors.bind(this));
        this.getButton('select_all_topregions').on('click', _.partial(this.selectAllTopRegions, true).bind(this));
        this.getButton('deselect_all_topregions').on('click', _.partial(this.selectAllTopRegions, false).bind(this));
        this.getSelect('indicator_x').change(this.onIndicatorChange.bind(this));
        this.getSelect('indicator_y').change(this.onIndicatorChange.bind(this));
        this.getSelect('indicator_r').change(this.onIndicatorChange.bind(this));
        this.getSelect('color').change(this.onColorChange.bind(this));
        this.getSelect('radius_lo').change(this.onRadiusLoChange.bind(this));
        this.getSelect('radius_hi').change(this.onRadiusHiChange.bind(this));
        this.getSelect('scale_x').change(this.onScaleChange.bind(this));
        this.getSelect('scale_y').change(this.onScaleChange.bind(this));
        this.getSelect('scale_r').change(this.onScaleChange.bind(this));
        this.getCheckbox('show_all_regions').change(this.onShowOnlySelectedChange.bind(this));
        this.getCheckbox('show_bubble_lines').change(this.onShowBubbleLinesChange.bind(this));
        this.getCheckbox('show_bubble_trails').change(this.onShowBubbleTrailsChange.bind(this));
        this.initChartsForm();
        this.info('initDom.initResize');
        this.initResize();
        this.initWheelScroll();
        d3.animationCallback = this.exportAnimationCallback.bind(this);
    };
    MotionChart.Chart.prototype.initWheelScroll = function() {
        $(window).on("wheel", () => {
            if (this.color_picker) {
                try {
                    this.color_picker.hide();
                } catch (e) {
                    this.info('no colorpicker');
                }
            }
        });
    };
    MotionChart.Chart.prototype.initResize = function() {
        this.info('initResize');
        $(document).on('showFullscreen', {}, () => {
            this.setFullScreen(true);
            this.resize();
        });
        $(document).on('hideFullscreen', {}, () => {
            this.setFullScreen(false);
            this.resize();
        });
        $(window).on('resize', () => {
            this.resize();
        });
    };
    MotionChart.Chart.prototype.setFullScreen = function(on) {
        this.info('setFullScreen', on);
        let url = this.getCurrentUrl(on),
            loading = this.startLoading('setFullScreen', 'Vollbildmodus ' + (on ? 'ein' : 'aus'));
        d3.timeout(() => {
            this.enablePanel(false);
            let save_data = this.saveData('tmp', 'tmp');
            reqwest({
                url: this.config.urls.save_tmp,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                headers: {
                    'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
                },
                data: JSON.stringify(save_data),
                success: function(resp) {
                    url += '?uuid=' + resp.uuid;
                    document.location.href = url;
                },
                error: () => {
                    this.stopLoadingForced(loading);
                    this.alertCommunicationError();
                }
            });
        }, this.config.loading.delay);
    };
    MotionChart.Chart.prototype.getCurrentUrl = function(fullscreen) {
        this.info('getCurrentUrl');
        let year = this.getYear(),
            indicator = this.getIndicatorX(),
            region_id = this.last_selected_region_id,
            url = fullscreen ? this.config.urls.base_fullscreen : this.config.urls.base,
            region_type = this.getData().region_type;
        if (region_type === 'nuts') {
            url += region_id + '/' + indicator + '/' + year + '/';
        } else if (region_type === 'agentur' || region_type === 'kreis' || region_type === 'arbeitsmarktregion') {
            url += region_id + '/' + year + '/' + indicator + '/';
        }
        return url;
    };
    MotionChart.Chart.prototype.calculateSize = function(width, height, force) {
        this.info('calculateSize', 'fullscreen', this.fullscreen, width, height, force);
        let min_height = $(window).height() > 800 ? $(window).height() : 800,
            content_width = $('.contentdiv').width(),
            window_width = $(window).width(),
            border_width = 30;
        let calculatedWidth = window_width < content_width ? window_width - border_width : content_width;
        width = width || calculatedWidth;
        let calculatedHeight = this.fullscreen ? min_height + this.config.size.adjust.height.fullscreen : min_height + this.config.size.adjust.height.normal;
        height = height || calculatedHeight;
        if (this.fullscreen && !force) {
            width = window_width - 40;
            height = $(window).height() - 50;
        }
        this.config.size.width = width;
        this.config.size.height = height;
        this.width = this.config.size.width - this.config.margin.left - this.config.margin.right;
        this.height = this.config.size.height - this.config.margin.top - this.config.margin.bottom;
        this.info('calculateSize', 'width', this.width, this.height);
    };
    MotionChart.Chart.prototype.resize = function(width, height, force) {
        this.info('resize', width, height, force);
        this.calculateSize(width, height, force);
        if (!_.isUndefined(width) && !_.isUndefined(height)) {
            this.updatePanelPosition();
        }
        this.init(null, this.data);
    };
    MotionChart.CONTROLS = {
        SELECTS: ['view', 'indicator_x', 'indicator_y', 'indicator_r', 'scale_x', 'scale_y', 'scale_r', 'color', 'radius_lo', 'radius_hi'],
        CHECKBOXES: ['show_bubble_lines', 'show_bubble_trails', 'show_all_regions'],
        BUTTONS: ['play', 'rewind', 'next', 'prev', 'end'],
        HTML: ['topregions', 'regions']
    };
    MotionChart.Chart.prototype.getHtmlControl = function(id) {
        let cache = this.dom_controls.html || (this.dom_controls.html = Object.create(null)),
            element = cache[id];
        if (element === undefined) {
            element = cache[id] = $('#' + this.config.controls.html[id]);
        }
        return element;
    };
    MotionChart.Chart.prototype.activateControls = function(active) {
        this.info('activateControls', active);
        let disabled = !active,
            controls = MotionChart.CONTROLS;
        for (let id of controls.SELECTS) {
            this.getSelect(id).prop('disabled', disabled);
        }
        for (let btn of [this.btn_rewind, this.btn_prev, this.btn_play, this.btn_next, this.btn_end, this.btn_start_zoom, this.btn_stop_reset]) {
            btn.active(active);
        }
        if (active && !this.isViewBubbles()) {
            this.btn_start_zoom.active(false);
            this.btn_stop_reset.active(false);
        }
        for (let id of controls.CHECKBOXES) {
            this.getCheckbox(id).prop('disabled', disabled);
        }
        for (let id of controls.BUTTONS) {
            this.getButton(id).prop('disabled', disabled);
        }
        for (let id of controls.HTML) {
            this.getHtmlControl(id).toggleClass('control-disabled', disabled);
        }
    };
    MotionChart.Chart.prototype.getData = function() {
        if (this.data === null) {
            throw new Error('data not set');
        }
        return this.data;
    };
    MotionChart.Chart.prototype.getUserId = function() {
        return this.config.user_id;
    };
    MotionChart.Chart.prototype.getCurrentExtent = function() {
        let fn = null,
            indicator_x = this.getIndicatorX(),
            indicator_y = this.getIndicatorY();
        switch (this.getView()) {
        case MotionChart.CONST.VIEW.BUBBLES:
            fn = function(e) {
                return e[indicator_x] !== null && e[indicator_y] !== null;
            };
            break;
        case MotionChart.CONST.VIEW.LINES:
        case MotionChart.CONST.VIEW.BARS:
            fn = function(e) {
                return e[indicator_y] !== null;
            };
            break;
        default:
            throw new Error('unknnown view type');
        }
        return this.getData().extent.filter(fn);
    };
    MotionChart.Chart.prototype.getLineExtent = function() {
        this.debug('getLineExtent');
        let data = this.getData(),
            year_data = {},
            indicator = this.getIndicatorR(),
            year_extent = [],
            lo = null,
            hi = null;
        _.each(this.data.years, (year) => {
            year_data[year] = false;
            for (let i of data.data[year]) {
                if (this.isNumber(i[indicator])) {
                    year_data[year] = true;
                    break;
                }
            }
        });
        _.each(this.data.years, function(year, index) {
            if (lo === null && year_data[year]) {
                lo = index;
            }
        });
        for (let index = this.data.years.length - 1; index >= 0; index--) {
            let year = this.data.years[index];
            if (hi === null && year_data[year]) {
                hi = index;
            }
        }
        for (let i = lo; i <= hi; i++) {
            year_extent.push(this.data.years[i]);
        }
        return year_extent;
    };
    MotionChart.Chart.prototype.updateAxisLineView = function() {
        this.debug('updateAxisLineView');
        let year_extent = this.getLineExtent();
        this.domains.x = d3.extent(year_extent);
        this.scales.x = d3.scaleLinear().domain(this.domains.x).range([0, this.width - this.config.timeline.labels.width.value]);
        let x_axis = d3.axisBottom().scale(this.scales.x).ticks(year_extent.length, d3.format("d"));
        this.svg.select("#x-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(x_axis);
        this.axis.x = x_axis;
    };
    MotionChart.Chart.prototype.getControl = function(kind, id) {
        let cache = this.dom_controls[kind],
            element = cache[id];
        if (element !== undefined) {
            return element;
        }
        if (!this.config.controls[kind][id]) {
            throw new Error(kind + ' not known ' + id);
        }
        element = $('#' + this.config.controls[kind][id]);
        cache[id] = element;
        return element;
    };
    MotionChart.Chart.prototype.getButton = function(id) {
        return this.getControl('button', id);
    };
    MotionChart.Chart.prototype.getSelect = function(id) {
        return this.getControl('select', id);
    };
    MotionChart.Chart.prototype.getCheckbox = function(id) {
        return this.getControl('checkbox', id);
    };
    MotionChart.Chart.prototype.setView = function(view) {
        this.info('setView', view);
        if (_.indexOf([MotionChart.CONST.VIEW.BUBBLES, MotionChart.CONST.VIEW.LINES, MotionChart.CONST.VIEW.BARS], view) < 0) {
            throw new Error('illegal view: ' + view);
        }
        this.getData().view = view;
        this.calculateDataYears();
    };
    MotionChart.Chart.prototype.getView = function() {
        this.debug('getView');
        return this.getData().view;
    };
    MotionChart.Chart.prototype.getShowAllRegions = function() {
        this.debug('getShowAllRegions');
        return this.getData().show_all_regions;
    };
    MotionChart.Chart.prototype.setShowAllRegions = function(value) {
        this.debug('setShowAllRegions', value);
        this.getData().show_all_regions = value === true;
    };
    MotionChart.Chart.prototype.assertViewBubbles = function() {
        this.debug('assertViewBubbles');
        if (!this.isViewBubbles()) {
            throw new Error('not in view bubbles: ' + this.getView());
        }
    };
    MotionChart.Chart.prototype.assertViewLines = function() {
        this.debug('assertViewLines');
        if (!this.isViewLines()) {
            throw new Error('not in view lines: ' + this.getView());
        }
    };
    MotionChart.Chart.prototype.assertViewBars = function() {
        this.debug('assertViewBars');
        if (!this.isViewBars()) {
            throw new Error('not in view bars: ' + this.getView());
        }
    };
    MotionChart.Chart.prototype.isViewBubbles = function() {
        this.debug('isViewBubbles');
        return this.getView() === MotionChart.CONST.VIEW.BUBBLES;
    };
    MotionChart.Chart.prototype.isViewLines = function() {
        this.debug('isViewLines');
        return this.getView() === MotionChart.CONST.VIEW.LINES;
    };
    MotionChart.Chart.prototype.isViewBars = function() {
        this.debug('isViewBars');
        return this.getView() === MotionChart.CONST.VIEW.BARS;
    };
    MotionChart.Chart.prototype.getYear = function() {
        return this.getData().years[this.getYearIndex()];
    };
    MotionChart.Chart.prototype.getYearMin = function() {
        return this.getData().years[this.getYearIndexMin()];
    };
    MotionChart.Chart.prototype.getYearMax = function() {
        return this.getData().years[this.getYearIndexMax()];
    };
    MotionChart.Chart.prototype.getMaxYear = function() {
        return _.last(this.getData().years);
    };
    MotionChart.Chart.prototype.setYear = function(year) {
        let year_index = this.getData().years.indexOf(year);
        if (year_index < 0) {
            throw new Error('invalid year: ' + year);
        }
        this.setYearIndex(year_index);
    };
    MotionChart.Chart.prototype.setYearIndex = function(year_index) {
        let data = this.getData(),
            years = data.years,
            old_year_index = data.year_index;
        if (year_index === null) {
            year_index = 0;
        }
        if (year_index > years.length - 1) {
            throw new Error('max year index');
        }
        data.old_index = data.year_index;
        data.year_index = year_index;
        this.info('setYearIndex', 'old', old_year_index, 'new', year_index);
        this.pushAction(MotionChart.CONST.ACTION.SET_YEAR, {
            'year': this.getYear()
        });
    };
    MotionChart.Chart.prototype.getYearIndex = function() {
        return this.getData().year_index;
    };
    MotionChart.Chart.prototype.getOldYearIndex = function() {
        return this.getData().old_index;
    };
    MotionChart.Chart.prototype.getYearIndexMin = function() {
        return this.getData().year_index_min;
    };
    MotionChart.Chart.prototype.getYearIndexMax = function() {
        return this.getData().year_index_max;
    };
    MotionChart.Chart.prototype.getIndicatorFormatConfig = function(indicator) {
        let formats = this.getData().indicator_formats;
        if (typeof formats[indicator] === 'undefined') {
            throw new Error('indicator not known: ' + indicator);
        }
        return formats[indicator];
    };
    MotionChart.Chart.prototype.getFormatWithSign = function(format, sign) {
        let _format = d3.format(format);
        if (sign === null) {
            return _format;
        } else {
            return function(value) {
                return _format(value) + " " + sign;
            };
        }
    };
    MotionChart.Chart.prototype.getIndicatorFormat = function(indicator) {
        let config = this.getIndicatorFormatConfig(indicator);
        return this.getFormatWithSign(config.format, config.format_sign);
    };
    MotionChart.Chart.prototype.getIndicatorAxisFormat = function(indicator) {
        let config = this.getIndicatorFormatConfig(indicator);
        return this.getFormatWithSign(config.format_axis, config.format_axis_sign);
    };
    MotionChart.Chart.prototype.getIndicatorFormatValue = function(indicator, value, novalue) {
        if (value !== null) {
            return this.getIndicatorFormat(indicator)(value);
        } else {
            return novalue ? novalue : 'Es liegt kein Wert vor.';
        }
    };
    MotionChart.Chart.prototype.getIndicatorX = function() {
        return this.getData().indicator.x;
    };
    MotionChart.Chart.prototype.getIndicatorY = function() {
        return this.getData().indicator.y;
    };
    MotionChart.Chart.prototype.getIndicatorR = function() {
        if (this.data.view === 'lines') {
            return this.getData().indicator.y;
        }
        return this.getData().indicator.r;
    };
    MotionChart.Chart.prototype.getIndicatorName = function(key) {
        return this.getData().indicator_map[key];
    };
    MotionChart.Chart.prototype.domainFormat = function(domain) {
        this.debug('format', domain);
        if (domain[1] > 999999) {
            return d3.format("s");
        } else {
            return d3.format(",d");
        }
    };
    MotionChart.Chart.prototype.isNumber = function(value) {
        return value !== null && isFinite(value);
    };
    MotionChart.Chart.prototype.defaultNumber = function(value, default_value) {
        return this.isNumber(value) ? value : default_value;
    };
    MotionChart.Chart.prototype.extent = function(values, fnc, def, extend, min, max) {
        let extent = d3.extent(values, fnc);
        let original = [extent[0], extent[1]];
        if (typeof def !== 'undefined') {
            if (typeof extent[0] === 'undefined' || typeof extent[1] === 'undefined') {
                extent = def;
            }
        }
        if (typeof extend === 'number') {
            let x = (extent[1] - extent[0]) * extend;
            extent[0] = extent[0] - x;
            extent[1] = extent[1] + x;
        }
        if (typeof min === 'number') {
            extent[0] = Math.max(min, extent[0]);
        }
        if (typeof max === 'number') {
            extent[1] = Math.min(max, extent[1]);
        }
        this.debug('extent', original, extent, extend, min, max);
        return extent;
    };
    MotionChart.Chart.prototype.extentDefault = function(values, fnc) {
        let factor = 0.1;
        if (this.getIndicatorX() === 'year') {
            factor = 0.01;
        }
        return this.extent(values, fnc, [0, 1], factor);
    };
    MotionChart.Chart.prototype.extentMin = function(values, fnc) {
        return this.extent(values, fnc, [0, 1], 0.1, 0.1);
    };
    MotionChart.Chart.prototype.topregionRegionIds = function(topregion_id) {
        let index = this.topregion_region_ids;
        if (index === null) {
            index = this.topregion_region_ids = Object.create(null);
            for (let region of this.getData().regions) {
                (index[region.topregion] || (index[region.topregion] = [])).push(region.value);
            }
        }
        return index[topregion_id] || [];
    };
    MotionChart.Chart.prototype.resetSuspend = function() {
        this.info('resetSuspend');
        this.getData().suspend = {};
    };
    MotionChart.Chart.prototype.setSuspend = function(name) {
        this.info('setSuspend', name);
        this.getData().suspend[name] = true;
    };
    MotionChart.Chart.prototype.unsetSuspend = function(name) {
        this.info('unsetSuspend', name);
        this.getData().suspend[name] = false;
    };
    MotionChart.Chart.prototype.isSuspended = function(name) {
        this.debug('isSuspended', name);
        return this.getData().suspend[name] === true;
    };
    MotionChart.Chart.prototype.showYearLabel = function(visible) {
        this.debug('showYearLabel', visible);
        this.year_label.transition().duration(this.config.transition.view.duration).style('opacity', visible === true ? 1 : 0);
    };
    MotionChart.Chart.prototype.exitView = function(view, callback) {
        this.info('exitView', view);
        this.activateControls(false);
        const inner_callback = () => {
            this.activateControls(true);
            if (callback) {
                callback();
            }
        };
        switch (view) {
        case MotionChart.CONST.VIEW.LINES:
            this.exitLines(inner_callback);
            break;
        case MotionChart.CONST.VIEW.BUBBLES:
            this.exitBubbles(inner_callback);
            break;
        case MotionChart.CONST.VIEW.BARS:
            this.exitBars(inner_callback);
            break;
        default:
            throw new Error('unknnown view type');
        }
    };
    MotionChart.Chart.prototype.exitBubbles = function(callback) {
        this.info('exitBubbles');
        let n = 0;
        this.assertViewBubbles();
        this.svg.selectAll(".circle-bubble-trail").transition().duration(this.config.transition.view.duration).ease(d3.easeLinear).style('opacity', 0).on('end', function() {
            d3.select(this).style('visibility', 'hidden');
        });
        this.svg.selectAll(".circle").transition().duration(this.config.transition.view.duration).ease(d3.easeLinear).attr('r', 0).style('opacity', 0).on('start', function() {
            n++;
        }).on('end', function() {
            n--;
            d3.select(this).style('visibility', 'hidden');
            if (n === 0 && callback) {
                callback();
            }
        });
        this.svg.selectAll(".bubble-line-group").transition().duration(this.config.transition.view.duration / 2).ease(d3.easeLinear).style('opacity', 0);
    };
    MotionChart.Chart.prototype.exitLines = function(callback) {
        this.info('exitLines');
        this.assertViewLines();
        let data = this.getData(),
            region_lines = data.region_lines,
            n = 0,
            z = 0;
        this.svg.selectAll('.tline').transition().duration(this.config.transition.view.duration).attr('d', (d) => {
            return this.line_fn_flat(region_lines[d.value]);
        }).style('opacity', 0).on('start', function() {
            n++;
        }).on('end', (d) => {
            this.selectTimeLine(d.value).style("visibility", "hidden");
            n--;
            if (n === 0 && callback) {
                callback();
            }
        });
        this.svg.selectAll('.dot').transition().duration(this.config.transition.view.duration).style('opacity', 0).attr("cy", () => {
            return this.defaultNumber(this.scales.y(this.domains.r[0]), 0);
        }).on('start', function() {
            z++;
        }).on('end', () => {
            z--;
            if (z === 0) {
                this.svg.selectAll('.dot').style("visibility", "hidden");
            }
        });
        this.svg.selectAll('.timeline-label').transition().duration(this.config.transition.view.duration).style('opacity', 0).attr('y', () => {
            return this.defaultNumber(this.scales.y(this.domains.r[0]), 0);
        }).on('end', function() {
            d3.select(this).style('visibility', 'hidden');
        });
    };
    MotionChart.Chart.prototype.exitBars = function(callback) {
        this.info('exitBars');
        this.assertViewBars();
        let n = 0,
            srd = this.sortedRegionDict();
        this.svg.selectAll('.bar').transition().duration(this.config.transition.view.duration).attr('x', (d) => {
            return this.defaultNumber(this.scales.x(srd[d.value]), 0);
        }).attr('y', () => {
            return this.defaultNumber(this.scales.y(this.domains.y[0]), 0);
        }).attr('height', function() {
            return 0;
        }).style('stroke', (d) => {
            return this.topRegionColor(d.topregion);
        }).style('opacity', 0).on('start', function() {
            n++;
        }).on('end', function() {
            n--;
            d3.select(this).style('visibility', 'hidden');
            if (n === 0 && callback) {
                callback();
            }
        });
    };
    MotionChart.Chart.prototype.enterView = function(view, transition) {
        this.debug('enterView', view);
        switch (view) {
        case MotionChart.CONST.VIEW.LINES:
            this.enterLines();
            break;
        case MotionChart.CONST.VIEW.BUBBLES:
            this.enterBubbles();
            break;
        case MotionChart.CONST.VIEW.BARS:
            this.enterBars();
            break;
        default:
            throw new Error('unknnown view type');
        }
        if (transition) {
            this.transition(false);
        }
    };
    MotionChart.Chart.prototype.enterBubbles = function() {
        this.info('enterBubbles');
        let data = this.getData();
        this.setView(MotionChart.CONST.VIEW.BUBBLES);
        this.player_controls.style('visibility', 'visible');
        this.slider.active(true);
        this.showYearLabel(true);
        $('#label_indicator_r').text('Radius');
        $('#fg_year_slider').show();
        $('#fg_year').show();
        $('#fg_x_axis').show();
        $('#fg_y_axis').show();
        $('#fg_r_axis').show();
        $('#fg_radius_range').show();
        $('#show_bubble_lines_control').show();
        $('#show_bubble_trails_control').show();
        // getCurrentExtent() filtert den kompletten Datenbestand; einmal reicht.
        let current_extent = this.getCurrentExtent(),
            indicator_x = this.getIndicatorX(),
            indicator_y = this.getIndicatorY(),
            indicator_r = this.getIndicatorR();
        this.domains.x = this.extentDefault(current_extent, function(d) {
            return d[indicator_x];
        });
        this.scales.x = d3[data.scale.x]().domain(this.domains.x).range([0, this.width]);
        let x_axis = d3.axisBottom().scale(this.scales.x).ticks(10).tickFormat(this.getIndicatorAxisFormat(this.getIndicatorX()));
        this.svg.select("#x-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(x_axis);
        this.axis.x = x_axis;
        this.domains.y = this.extentDefault(current_extent, function(d) {
            return d[indicator_y];
        });
        this.scales.y = d3[data.scale.y]().domain(this.domains.y).range([this.height, 0]);
        let y_axis = d3.axisLeft().scale(this.scales.y).ticks(10).tickFormat(this.getIndicatorAxisFormat(indicator_y));
        this.svg.select("#y-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(y_axis);
        this.axis.y = y_axis;
        this.domains.r = this.extentMin(current_extent, function(d) {
            return d[indicator_r];
        });
        this.scales.r = d3[data.scale.r]().domain(this.domains.r).range([data.radius_lo, data.radius_hi]);
        this.drawLines(true);
        if (this.isShowBubbleLines()) {
            this.svg.selectAll(".bubble-line-group").style('opacity', 0.0);
            this.svg.selectAll(".bubble-line-group").transition().duration(this.config.transition.view.duration / 2).ease(d3.easeLinear).style('opacity', 1.0);
        }
    };
    MotionChart.Chart.prototype.enterLines = function() {
        this.info('enterLines');
        let data = this.getData(),
            region_lines = data.region_lines;
        this.setView(MotionChart.CONST.VIEW.LINES);
        this.player_controls.style('visibility', 'hidden');
        this.slider.active(false);
        this.showYearLabel(false);
        $('#fg_year_slider').hide();
        $('#fg_year').hide();
        $('#fg_x_axis').hide();
        $('#fg_y_axis').show();
        $('#fg_r_axis').hide();
        $('#fg_radius_range').hide();
        $('#show_bubble_lines_control').hide();
        $('#show_bubble_trails_control').hide();
        this.updateAxisLineView();
        this.scales.y = d3[this.data.scale.y]().domain(this.domains.y).range([this.height, 0]);
        let axis = d3.axisLeft().scale(this.scales.y).ticks(10).tickFormat(this.getIndicatorAxisFormat(this.getIndicatorY()));
        this.svg.select("#y-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(axis);
        this.axis.y = axis;
        this.setIndicatorY(data.indicator.y);
        this.svg.selectAll(".tline").attr("d", (d) => {
            return this.line_fn_flat(region_lines[d.value]);
        }).style("stroke", function() {
            return 'white';
        }).style('opacity', 0);
        this.time_line_fn = d3.line().defined((d) => {
            let value = d[this.getIndicatorY()];
            return value !== null;
        }).curve(d3.curveLinear).x((d) => {
            return this.scales.x(d.year);
        }).y((d) => {
            return this.scales.y(d[this.getIndicatorY()]);
        });
        this.svg.selectAll('.tline').style("visibility", (d) => {
            return this.isRegionVisible(d.value, d.topregion) ? 'visible' : 'hidden';
        }).style('opacity', 0);
        const scale_x = this.scales.x,
            baseline_y = this.defaultNumber(this.scales.y(this.domains.y[0]), 0),
            indicator_y = this.getIndicatorY();
        this.svg.selectAll('.dot').style("visibility", (d) => {
            return this.isRegionVisible(d.region_id, d.topregion_id) ? 'visible' : 'hidden';
        }).attr("cx", function(d) {
            return scale_x(d.year);
        }).attr("cy", baseline_y).style('opacity', 0);
        this.svg.selectAll('.timeline-label').style('visibility', 'visible').attr('y', baseline_y).style('opacity', (d) => {
            let some_values = _.any(region_lines[d.value], function(ld) {
                return ld[indicator_y];
            });
            return (this.isRegionSelected(d.value) && some_values) ? 1 : 0;
        });
    };
    MotionChart.Chart.prototype.enterBars = function() {
        this.info('enterBars');
        let data = this.getData(),
            srd = this.sortedRegionDict(),
            visible_regions = this.getVisibleRegions();
        this.setView(MotionChart.CONST.VIEW.BARS);
        this.player_controls.style('visibility', 'visible');
        this.slider.active(true);
        this.showYearLabel(true);
        $('#fg_year_slider').show();
        $('#fg_year').show();
        $('#fg_x_axis').hide();
        $('#fg_y_axis').show();
        $('#fg_r_axis').hide();
        $('#fg_radius_range').hide();
        $('#show_bubble_lines_control').hide();
        $('#show_bubble_trails_control').hide();
        this.domains.x = [0, visible_regions.length];
        this.scales.x = d3.scaleLinear().domain(this.domains.x).range([0, this.width]);
        let x_axis = d3.axisBottom().scale(this.scales.x).ticks(visible_regions.length / 10, d3.format("d"));
        this.svg.select("#x-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(x_axis);
        this.axis.x = x_axis;
        this.setIndicatorY(data.indicator.y);
        this.svg.selectAll('.bar').attr('x', (d) => {
            return this.defaultNumber(this.scales.x(srd[d.value]), 0);
        }).attr('y', () => {
            return this.defaultNumber(this.scales.y(this.domains.y[0]), 0);
        }).attr('width', () => {
            return this.defaultNumber(this.scales.x(1), 0);
        }).attr('height', function() {
            return 0;
        }).style("stroke-width", 1).style("visibility", (d) => {
            return this.isRegionVisible(d.value, d.topregion) ? 'visible' : 'hidden';
        }).style('opacity', 0);
    };
    MotionChart.Chart.prototype.onViewChange = function() {
        this.debug('onViewChange');
        this.exitView(this.getView());
        this.enterView(d3.select('#view').property('value'), MotionChart.CONST.TRANSITION.YES);
        this.updateAxisLabels();
    };
    MotionChart.Chart.prototype.onSliderChange = function(event, ui) {
        this.debug('onSliderChange', ui.value);
        this.setYear(ui.value);
        this.updateFormYear();
        this.transition(false, true);
    };
    MotionChart.Chart.prototype.calculateDataYears = function() {
        if (this.isSuspended(this.config.events.CALCULATE_DATA_YEARS)) {
            return this.info('calculateDataYears', 'SUSPENDED');
        }
        let data = this.getData(),
            year_index = this.getYearIndex(),
            x = this.getIndicatorX(),
            y = this.getIndicatorY(),
            r = this.getIndicatorR(),
            fn = null,
            changed = null,
            years_available = [];
        switch (this.getView()) {
        case MotionChart.CONST.VIEW.BUBBLES:
            fn = function(record) {
                return record[x] !== null && record[y] !== null
            };
            break;
        case MotionChart.CONST.VIEW.LINES:
            fn = function(record) {
                return record[r] !== null
            };
            break;
        case MotionChart.CONST.VIEW.BARS:
            fn = function(record) {
                return record[y] !== null
            };
            break;
        default:
            throw new Error('unknnown view type');
        }
        let show_all = data.show_all_regions,
            topregion_selected = data.topregion_selected,
            region_selected = data.region_selected;
        let enabled = data.years.map(function(year) {
            let records = data.data[year];
            for (let k = 0; k < records.length; k++) {
                let record = records[k];
                if (topregion_selected[record.topregion_id] === true && (show_all || region_selected[record.region_id] === true) && fn(record)) {
                    return true;
                }
            }
            return false;
        });
        let start = _.indexOf(enabled, true),
            end = _.lastIndexOf(enabled, true);
        if (start >= end) {
            this.showExclamation(true);
            this.debug('calculateDataYears', 'todo, add text to display');
            start = 0;
            end = data.years.length - 1;
        } else {
            this.showExclamation(false);
        }
        _.each(_.range(0, data.years.length), function(i) {
            if (i >= start && i <= end) {
                years_available.push(data.years[i]);
            }
        });
        data.years_available = years_available;
        changed = data.year_index_min !== start || data.year_index_max !== end;
        data.year_index_min = start;
        data.year_index_max = end;
        this.info('calculateDataYears', 'min', data.year_index_min, 'max', data.year_index_max, 'years_available', years_available, 'changed', changed);
        if (year_index < data.year_index_min) {
            this.setYearIndex(data.year_index_min);
        } else if (year_index > data.year_index_max) {
            this.setYearIndex(data.year_index_max);
        }
        this.updateFormYear();
        this.updateFormYearSlider();
        this.updateYearSlider();
        return changed;
    };
    MotionChart.Chart.prototype.onIndicatorChange = function(event) {
        this.info('onIndicatorChange', event.target.id);
        let get = function(id) {
            return d3.select('#' + id).property('value');
        };
        let view = this.getView();
        this.setZoomNull();
        if (view === MotionChart.CONST.VIEW.LINES) {
            this.log('onIndicatorChange', MotionChart.CONST.VIEW.LINES);
            this.setIndicatorY(get('indicator_y'));
            this.calculateDataYears();
            this.domains.y = this.extentDefault(this.getCurrentExtent(), (d) => {
                return d[this.getIndicatorY()];
            });
            this.scales.y = d3[this.data.scale.y]().domain(this.domains.y).range([this.height, 0]);
            let y_axis = d3.axisLeft().scale(this.scales.y).ticks(10).tickFormat(this.getIndicatorAxisFormat(this.getIndicatorY()));
            this.svg.select("#y-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(y_axis);
            this.axis.y = y_axis;
            this.updateAxisLineView();
            this.transition(false);
        } else if (view === MotionChart.CONST.VIEW.BUBBLES) {
            this.log('onIndicatorChange', MotionChart.CONST.VIEW.BUBBLES);
            this.setIndicators(get('indicator_x'), get('indicator_y'), get('indicator_r'));
            this.calculateDataYears();
            this.drawLines(true);
            this.transition(false);
        } else if (view === MotionChart.CONST.VIEW.BARS) {
            this.setIndicatorY(get('indicator_y'));
            this.calculateDataYears();
            this.transition(false);
        } else {
            throw new Error('unknown view: ' + view);
        }
        this.updateAxisLabels();
    };
    MotionChart.Chart.prototype.onRadiusLoChange = function() {
        this.info('onRadiusLoChange', d3.select('#radius_lo').property('value'));
        this.getData().radius_lo = Number.parseInt(d3.select('#radius_lo').property('value'));
        this.enterView(this.getView(), true);
    };
    MotionChart.Chart.prototype.onRadiusHiChange = function() {
        this.info('onRadiusLoChange', d3.select('#radius_hi').property('value'));
        this.getData().radius_hi = Number.parseInt(d3.select('#radius_hi').property('value'));
        this.enterView(this.getView(), true);
    };
    MotionChart.Chart.prototype.onColorChange = function() {
        this.info('onColorChange', d3.select('#color').property('value'));
        this.getData().color_scheme = d3.select('#color').property('value');
        this.invalidateColorCache();
        this.setTopRegions();
        switch (this.getView()) {
        case MotionChart.CONST.VIEW.BUBBLES:
            this.drawLines(true);
            break;
        case MotionChart.CONST.VIEW.LINES:
            break;
        case MotionChart.CONST.VIEW.BARS:
            break;
        default:
            throw new Error('unknnown view type');
        }
        this.transition(false, false, this.config.transition.color.duration);
    };
    MotionChart.Chart.prototype.onScaleChange = function(combo) {
        this.info('onScaleChange', combo.target.id);
        let scale = combo.target.id,
            scale_type = d3.select('#' + scale).property('value'),
            data = this.getData();
        switch (scale) {
        case 'scale_x':
            data.scale.x = scale_type;
            this.setIndicatorX(data.indicator.x);
            break;
        case 'scale_y':
            data.scale.y = scale_type;
            this.setIndicatorY(data.indicator.y);
            break;
        case 'scale_r':
            switch (this.getView()) {
            case MotionChart.CONST.VIEW.BUBBLES:
            case MotionChart.CONST.VIEW.BARS:
                data.scale.r = scale_type;
                this.setIndicatorR(data.indicator.r);
                break;
            case MotionChart.CONST.VIEW.LINES:
                data.scale.r = scale_type;
                this.scales.y = d3[this.data.scale.r]().domain(this.domains.r).range([this.height, 0]);
                let axis = d3.axisLeft().scale(this.scales.y).ticks(10, this.domainFormat(this.domains.r));
                this.svg.select("#y-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(axis);
                this.axis.y = axis;
                break;
            default:
                throw new Error('unknnown view type');
            }
            break;
        default:
            throw new Error('unknnown scale type');
        }
        this.drawLines(true);
        this.transition();
    };
    MotionChart.Chart.prototype.hasCustomColor = function(id, level) {
        this.debug('hasCustomColor', id, level);
        let custom_colors = this.getData().custom_colors;
        return typeof custom_colors[level][id] !== 'undefined'
    };
    MotionChart.Chart.prototype.setCustomColor = function(id, color, level) {
        this.info('setCustomColor', id, color, level);
        let custom_colors = this.getData().custom_colors,
            current_color = null,
            item = null;
        if (level === MotionChart.CONST.COLORLEVEL.REGION) {
            item = $('#tab3default #a-region-id-' + id);
            current_color = this.getRegionColor(id);
        } else if (level === MotionChart.CONST.COLORLEVEL.TOPREGION) {
            item = $('#tab2default #topregion-' + id);
            current_color = this.getTopRegionColor(id);
        }
        if (color != null) {
            custom_colors[level][id] = color
        } else if (custom_colors[level][id]) {
            delete custom_colors[level][id];
        }
        this.invalidateColorCache();
        if (item && color == null) {
            if (level === MotionChart.CONST.COLORLEVEL.REGION) {
                item.find('.fa-stop').css('color', this.getRegionColor(id));
            } else if (level === MotionChart.CONST.COLORLEVEL.TOPREGION) {
                item.find('.fa-stop').css('color', this.getTopRegionColor(id));
            }
            item.find('.fa-times-circle').css('visibility', 'hidden');
            return true;
        }
        if (item && color !== current_color) {
            item.find('.fa-stop').css('color', color);
            item.find('.fa-times-circle').css('visibility', 'visible');
            return true;
        }
        return false;
    };
    MotionChart.Chart.prototype.invalidateColorCache = function() {
        this.color_cache = {
            region: Object.create(null),
            topregion: Object.create(null),
            scheme: Object.create(null)
        };
    };
    MotionChart.Chart.prototype.getRegionColor = function(region) {
        let cache = this.color_cache.region,
            color = cache[region];
        if (color !== undefined) {
            return color;
        }
        let data = this.getData(),
            reg = data.region_map[region],
            topregion = reg ? reg.topregion : null,
            custom_colors = data.custom_colors;
        if (topregion == null) {
            throw new Error('could not get region for ' + region);
        }
        if (custom_colors[MotionChart.CONST.COLORLEVEL.REGION][region]) {
            color = custom_colors[MotionChart.CONST.COLORLEVEL.REGION][region];
        } else if (custom_colors[MotionChart.CONST.COLORLEVEL.TOPREGION][topregion]) {
            color = custom_colors[MotionChart.CONST.COLORLEVEL.TOPREGION][topregion];
        } else {
            color = this.topRegionColor(topregion);
        }
        cache[region] = color;
        return color;
    };
    MotionChart.Chart.prototype.getTopRegionColor = function(topregion) {
        let cache = this.color_cache.topregion,
            color = cache[topregion];
        if (color !== undefined) {
            return color;
        }
        let custom_colors = this.getData().custom_colors;
        if (custom_colors[MotionChart.CONST.COLORLEVEL.TOPREGION][topregion]) {
            color = custom_colors[MotionChart.CONST.COLORLEVEL.TOPREGION][topregion];
        } else {
            color = this.topRegionColor(topregion);
        }
        cache[topregion] = color;
        return color;
    };
    MotionChart.Chart.prototype.resetRegionColors = function() {
        const regions = this.getData().regions;
        for (let i of regions) {
            if (this.hasCustomColor(i.value, MotionChart.CONST.COLORLEVEL.REGION)) {
                this.setCustomColor(i.value, null, MotionChart.CONST.COLORLEVEL.REGION);
            }
        }
        this.transition(false, true);
    };
    MotionChart.Chart.prototype.resetTopRegionColors = function() {
        const topregions = this.getData().topregions;
        for (let i of topregions) {
            if (this.hasCustomColor(i.value, MotionChart.CONST.COLORLEVEL.TOPREGION)) {
                this.setCustomColor(i.value, null, MotionChart.CONST.COLORLEVEL.TOPREGION);
            }
        }
        this.setRegions();
        this.transition(false, true);
    };
    MotionChart.Chart.prototype.applyPaletteToRegion = function() {
        this.info('applyPaletteToRegion');
        let data = this.getData(),
            palette = null,
            i_color = 0;
        if (data.palettes.length === 0) {
            return this.alertNote('Keine aktive Palette gefunden');
        }
        palette = data.palettes[0];
        if (palette.length === 0) {
            return this.alertNote('Aktive Palette verfügt über keine Farben');
        }
        const regions = data.regions;
        for (let i of regions) {
            let region_id = i.value,
                selected = data.region_selected[region_id],
                custom_color = this.hasCustomColor(region_id, MotionChart.CONST.COLORLEVEL.REGION);
            if (!selected && custom_color) {
                this.setCustomColor(region_id, null, MotionChart.CONST.COLORLEVEL.REGION);
            }
            if (selected) {
                this.setCustomColor(region_id, palette[i_color], MotionChart.CONST.COLORLEVEL.REGION);
                i_color += 1;
                if (i_color >= palette.length) {
                    i_color = 0;
                }
            }
        }
        this.transition(false, true);
    };
    MotionChart.Chart.prototype.applyPaletteToTopRegion = function() {
        this.info('applyPaletteToTopRegion');
        let data = this.getData(),
            palette = null,
            i_color = 0;
        if (data.palettes.length === 0) {
            return this.alertNote('Keine aktive Palette gefunden');
        }
        palette = data.palettes[0];
        if (palette.length === 0) {
            return this.alertNote('Aktive Palette verfügt über keine Farben');
        }
        const topregions = data.topregions;
        for (let i of topregions) {
            let topregion_id = i.value,
                selected = data.topregion_selected[topregion_id],
                custom_color = this.hasCustomColor(topregion_id, MotionChart.CONST.COLORLEVEL.TOPREGION);
            if (!selected && custom_color) {
                this.setCustomColor(topregion_id, null, MotionChart.CONST.COLORLEVEL.TOPREGION);
            }
            if (selected) {
                this.setCustomColor(topregion_id, palette[i_color], MotionChart.CONST.COLORLEVEL.TOPREGION);
                i_color += 1;
                if (i_color >= palette.length) {
                    i_color = 0;
                }
            }
        }
        this.setRegions();
        this.transition(false, true);
    };
    MotionChart.Chart.prototype.colorPickerToD3 = function(color) {
        let c = color.toRGB();
        return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
    };
    MotionChart.Chart.prototype.setRegions = function() {
        this.info('setRegions');
        let regions = _.filter(this.getData().regions, (region) => {
                return ( this.isTopRegionSelected(region.topregion)) ;
            }, this);
        this.getCheckbox('show_all_regions').prop('checked', this.getShowAllRegions());
        $('#515').hide();
        $('#regions').children('a').remove();
        d3.select('#regions').selectAll("a").data(regions).enter().append("a").style("background-color", (d) => {
            return this.isRegionSelected(d.value) ? this.config.menu.selected.background : this.config.menu.standard.background;
        }).attr("href", "#").attr("class", "list-group-item").attr("dagregion", function(d) {
            return d.dagregion;
        }).attr("id", function(d) {
            return 'a-region-id-' + d.value;
        }).on("mouseover", (d) => {
            this.overRegion(d.value);
        }).on("mouseout", (d) => {
            this.outRegion(d.value);
        })
        .append('span').attr('style', 'vertical-align:top; padding-top: 0').append('input').attr('style', 'vertical-align:top; margin-top: 4px').attr("type", "checkbox").on("change", (d, _i, _nodes) => {
            this.selectRegion(d.value, _nodes[_i].checked, MotionChart.CONST.TRANSITION.YES);
        }).attr("id", function(d) {
            return "cb-region-" + d.value;
        }).attr("region-id", function(d) {
            return d.value;
        }).each((d, _i, _nodes) => {
            if (this.isRegionSelected(d.value)) {
                d3.select(_nodes[_i]).attr('checked', 'true');
            }
        })
        .select(function() {
            return this.parentNode.parentNode;
        }).append("span").attr("class", "fa fa-stop").attr("style", (d) => {
            return 'vertical-align:top; padding-top: 4px; padding-left: 5px; color: ' + this.getRegionColor(d.value);
        }).on('click', (d, _i, _nodes) => {
            $(_nodes[_i]).attr('data-color', this.getRegionColor(d.value));
            $(_nodes[_i]).attr('data-color-format', 'rgb');
            $(_nodes[_i]).colorpicker('show').on('changeColor', (e) => {
                if (this.setCustomColor(d.value, this.colorPickerToD3(e.color), MotionChart.CONST.COLORLEVEL.REGION)) {
                    this.transition(false, true, 100);
                }
            });
            this.color_picker = $(_nodes[_i]).data('colorpicker');
            $(_nodes[_i]).data('colorpicker').setValue(this.getRegionColor(d.value));
            $('.colorpicker').css('z-index', '1000000');
        })
        .select(function() {
            return this.parentNode;
        }).append("span").attr("class", "fa fa-times-circle").attr("style", (d) => {
            let visibility = this.hasCustomColor(d.value, MotionChart.CONST.COLORLEVEL.REGION) ? 'visible' : 'hidden';
            return 'vertical-align:top; color: #606060;  padding-top: 4px; padding-left: 5px; padding-right: 5px; visibility: ' + visibility;
        }).on('click', (d) => {
            if (this.setCustomColor(d.value, null, MotionChart.CONST.COLORLEVEL.REGION)) {
                this.transition(false, true);
            }
        })
        .select(function() {
            return this.parentNode;
        }).append("span").attr("class", "region-span").attr('style', 'vertical-align:top; padding-top: 1px;').text(function(d) {
            return d.text
        });
        this.indexRegionMenu();
    };
    MotionChart.Chart.prototype.indexRegionMenu = function() {
        let checkboxes = Object.create(null),
            items = Object.create(null);
        d3.select('#regions').selectAll('input[region-id]').each(function(d) {
            checkboxes[d.value] = this;
            items[d.value] = this.parentNode.parentNode;
        });
        this.region_menu = {
            checkbox: checkboxes,
            item: items
        };
    };
    MotionChart.Chart.prototype.getRegionCheckbox = function(region_id) {
        return this.region_menu.checkbox[region_id];
    };
    MotionChart.Chart.prototype.getRegionMenuItem = function(region_id) {
        return this.region_menu.item[region_id];
    };
    MotionChart.Chart.prototype.getRegionName = function(region_id) {
        this.debug('getRegionName', region_id);
        return this.getData().region_map[region_id].text;
    };
    MotionChart.Chart.prototype.getRegionTopRegionId = function(region_id) {
        this.debug('getRegionTopRegionId', region_id);
        let map = this.getData().region_map;
        if (!map[region_id]) {
            throw new Error('topregion not found for region id ' + region_id);
        } else {
            return map[region_id].topregion;
        }
    };
    MotionChart.Chart.prototype.onShowOnlySelectedChange = function(event) {
        this.info('onShowOnlySelectedChange', event.target.checked);
        this.setShowAllRegions(event.target.checked);
        this.enterView(this.getData().view, MotionChart.CONST.TRANSITION.YES);
    };
    MotionChart.Chart.prototype.onShowBubbleLinesChange = function(event) {
        this.info('onShowBubbleLinesChange', event.target.checked);
        this.getData().show_bubble_lines = event.target.checked;
        this.enterView(this.getData().view, MotionChart.CONST.TRANSITION.YES);
    };
    MotionChart.Chart.prototype.onShowBubbleTrailsChange = function(event) {
        this.info('onShowBubbleTrailsChange', event.target.checked);
        if (!event.target.checked) {
            this.show_bubble_trails_once_more = true;
        }
        this.getData().show_bubble_trails = event.target.checked;
        this.enterView(this.getData().view, MotionChart.CONST.TRANSITION.YES);
    };
    MotionChart.Chart.prototype.topRegionColor = function(id) {
        let cache = this.color_cache.scheme,
            color = cache[id];
        if (color === undefined) {
            let data = this.getData();
            color = MotionChart.CONST.COLORSCHEMES[data.color_scheme](data.topregion_colors[id]);
            cache[id] = color;
        }
        return color;
    };
    MotionChart.Chart.prototype.setTopRegions = function() {
        this.info('setTopRegions');
        $('#topregions').children('a').remove();
        d3.select('#topregions').selectAll("a").data(this.getData().topregions).enter().append("a").style("background-color", (d) => {
            return this.isTopRegionSelected(d.value) ? this.config.menu.selected.background : this.config.menu.standard.background;
        }).attr("id", function(d) {
            return 'topregion-' + d.value;
        }).attr("dagregion", function(d) {
            return d.dagregion;
        }).attr("href", "#").attr("class", "list-group-item").on("mouseover", (d) => {
            this.overTopRegion(d.value);
        }).on("mouseout", (d) => {
            this.outTopRegion(d.value);
        })
        .append('span').attr('style', 'vertical-align:top; padding-top: 0').append('input').attr('type', 'checkbox').attr('style', 'vertical-align:top; margin-top: 4px').on('change', (d) => {
            this.selectTopRegion(d.value, d3.select('#cb-topregion-' + d.value).property('checked'), MotionChart.CONST.SUSPEND.YES);
        }).attr('id', function(d) {
            return 'cb-topregion-' + d.value;
        })
        .select(function() {
            return this.parentNode.parentNode;
        }).append("span").attr("class", "fa fa-stop").attr("class", this.config.classes.topregion).attr("style", (d) => {
            return 'vertical-align:top; padding-top: 4px; padding-left: 5px; color: ' + this.getTopRegionColor(d.value);
        }).on('click', (d, _i, _nodes) => {
            $(_nodes[_i]).attr('data-color', this.getTopRegionColor(d.value));
            $(_nodes[_i]).attr('data-color-format', 'rgb');
            $(_nodes[_i]).colorpicker('show').on('changeColor', (e) => {
                if (this.setCustomColor(d.value, this.colorPickerToD3(e.color), MotionChart.CONST.COLORLEVEL.TOPREGION)) {
                    this.transition(false, true, 100);
                    this.setRegions();
                }
            });
            this.color_picker = $(_nodes[_i]).data('colorpicker');
            $(_nodes[_i]).data('colorpicker').setValue(this.getTopRegionColor(d.value));
            $('.colorpicker').css('z-index', '1000000');
        })
        .select(function() {
            return this.parentNode;
        }).append("span").attr("class", "fa fa-times-circle").attr("style", (d) => {
            let visibility = this.hasCustomColor(d.value, MotionChart.CONST.COLORLEVEL.TOPREGION) ? 'visible' : 'hidden';
            return 'vertical-align:top; color: #606060; padding-top: 4px;  padding-left: 5px; padding-right: 5px; visibility: ' + visibility;
        }).on('click', (d, _i, _nodes) => {
            this.setCustomColor(d.value, null, MotionChart.CONST.COLORLEVEL.TOPREGION);
            $(_nodes[_i]).css('visibility', 'hidden');
            $(_nodes[_i]).parent().find('.fa-stop').css('color', this.getTopRegionColor(d.value));
            this.transition(false, true);
            this.setRegions();
        })
        .select(function() {
            return this.parentNode;
        }).append("span").attr("class", "region-span").attr('style', 'vertical-align:top; padding-top: 1px;').text(function(d) {
            return ' ' + d.text;
        });
    };
    MotionChart.Chart.prototype.setIndicators = function(x, y, r) {
        this.info('setIndicators', x, y, r);
        this.setIndicatorR(r);
        this.setIndicatorX(x);
        this.setIndicatorY(y);
    };
    MotionChart.Chart.prototype.checkIndicator = function(indicator) {
        this.debug('checkIndicator', indicator);
        let index = _.findIndex(this.getData().indicators, function(i) {
            return i.value === indicator;
        });
        if (index < 0) {
            throw new Error('unknonw indicator: ' + indicator);
        } else {
            return index;
        }
    };
    MotionChart.Chart.prototype.getIndicator = function(indicator) {
        this.debug('getIndicator', indicator);
        let index = this.checkIndicator(indicator);
        return this.getData().indicators[index];
    };
    MotionChart.Chart.prototype.getDomainX = function() {
        this.info('getDomainX');
        let zoom = this.getZoom();
        if (this.isZoom()) {
            return [zoom.x1, zoom.x2];
        } else {
            return this.extentDefault(this.getCurrentExtent(), (d) => {
                return d[this.getIndicatorX()];
            });
        }
    };
    MotionChart.Chart.prototype.setIndicatorX = function(indicator) {
        this.info('setIndicatorX', indicator);
        this.checkIndicator(indicator);
        let data = this.getData();
        data.indicator.x = indicator;
        this.domains.x = this.getDomainX();
        this.scales.x = d3[this.data.scale.x]().domain(this.domains.x).range([0, this.width]);
        this.axis.x = d3.axisBottom().scale(this.scales.x).ticks(10).tickFormat(this.getIndicatorAxisFormat(indicator));
        if (this.svg) {
            this.svg.select("#x-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(this.axis.x);
        }
        this.updateAxisLabels();
        this.pushAction(MotionChart.CONST.ACTION.SET_INDICATOR, {
            'indicator': indicator
        });
    };
    MotionChart.Chart.prototype.getDomainY = function() {
        this.info('getDomainY');
        let zoom = this.getZoom();
        if (this.isZoom()) {
            return [zoom.y2, zoom.y1];
        } else {
            let domain = this.extent(this.getCurrentExtent(), (d) => {
                return d[this.getIndicatorY()]
            }, [0, 1]);
            if (this.getView() === MotionChart.CONST.VIEW.BARS) {
                if (domain[0] > 0) {
                    domain[0] = 0;
                }
            }
            return domain;
        }
    };
    MotionChart.Chart.prototype.setIndicatorY = function(indicator) {
        this.info('setIndicatorY', indicator);
        this.checkIndicator(indicator);
        let data = this.getData();
        data.indicator.y = indicator;
        if (this.getView() === MotionChart.CONST.VIEW.BARS) {
            this.domains.y = this.getDomainY();
        } else {
            this.domains.y = this.extentDefault(this.getCurrentExtent(), (d) => {
                return d[this.getIndicatorY()];
            });
        }
        this.scales.y = d3[this.data.scale.y]().domain(this.domains.y).range([this.height, 0]);
        this.axis.y = d3.axisLeft().scale(this.scales.y).ticks(10).tickFormat(this.getIndicatorAxisFormat(indicator));
        if (this.svg) {
            this.svg.select("#y-axis").transition().duration(this.config.transition.year.duration).ease(d3.easeLinear).call(this.axis.y);
        }
        this.updateAxisLabels();
        this.pushAction(MotionChart.CONST.ACTION.SET_INDICATOR_Y, {
            'indicator_y': indicator
        });
    };
    MotionChart.Chart.prototype.setIndicatorR = function(indicator) {
        this.info('setIndicatorR', indicator);
        this.checkIndicator(indicator);
        let data = this.getData();
        data.indicator.r = indicator;
        this.domains.r = this.extentMin(this.getCurrentExtent(), (d) => {
            return d[this.getIndicatorR()]
        });
        this.scales.r = d3[this.data.scale.r]().domain(this.domains.r).range([data.radius_lo, data.radius_hi]);
        this.updateAxisLabels();
        this.pushAction(MotionChart.CONST.ACTION.SET_INDICATOR_R, {
            'indicator_r': indicator
        });
    };
    MotionChart.Chart.prototype.setScales = function() {
        this.info('setScales');
        let data = this.getData();
        let scale = data.scale;
        let scales = data.scales;
        let populate = function(id, value) {
            $('#' + id).children('option').remove();
            d3.select('#' + id).selectAll("option").data(scales).enter().append("option").text(function(d) {
                return d.text;
            }).attr("value", function(d) {
                return d.value;
            });
            d3.select('#' + id).property('value', value);
        };
        populate('scale_x', scale.x);
        populate('scale_y', scale.y);
        populate('scale_r', scale.r);
    };
    MotionChart.Chart.prototype.updateOrder = function() {
        this.debug('updateOrder');
        if (!this.svg) {
            throw new Error('chart not drawn');
        }
        this.svg.selectAll(".circle").sort(function(a, b) {
            return b.radius - a.radius;
        });
    };
    MotionChart.Chart.prototype.fontsize = function(font, size) {
        this.debug('fontsize');
        let value = size / font.factor;
        value = Number.parseInt(Math.max(Math.min(value, font.max).toString(), font.min));
        return Number.parseInt(value.toString()) + 'px';
    };
    MotionChart.Chart.prototype.draw = function() {
        this.info('draw');
        d3.select("#chart").select("svg").remove();
        this.svg = d3.select("#chart").append("svg").attr("width", this.config.size.width).attr("height", this.config.size.height).append("g").attr("id", "svg-main").attr("transform", "translate(" + this.config.margin.left + "," + this.config.margin.top + ")");
        this.year_label = this.svg.append("text").attr('text-anchor', 'middle').attr('fill', this.config.year.fill).style('font-family', this.config.year.font.family).style('font-size', parseInt(this.config.size.width / this.config.year.size_factor) + 'px').style('font-weight', this.config.year.weight).style('pointer-events', 'none').attr('id', 'year-label').text('XXXX');
        let box = this.year_label.node().getBBox();
        let x = (this.config.size.width - this.config.margin.left - this.config.margin.right) / 2;
        let y = this.config.margin.top + (this.config.size.height - this.config.margin.top - this.config.margin.bottom) / 2 + box.height / 4;
        this.year_label.attr('x', x).attr('y', y);
        this.exclamation = this.svg.append("text").attr('x', this.config.margin.left + this.config.exclamation.offset.left).attr('text-anchor', 'start').attr('fill', this.config.exclamation.fill).attr('id', 'exclamation').attr('font-family', this.config.exclamation.font.family).attr('visibility', 'hidden').style('font-size', this.config.exclamation.font.size).style('pointer-events', 'visible').text(this.config.exclamation.text).style("opacity", this.config.exclamation.opacity).on('mouseover', () => {
            this.tooltip.text(this.config.exclamation.tooltip).style('visibility', 'visible');
        }).on('mousemove', () => {
            this.tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        }).on('mouseout', () => {
            this.tooltip.style('visibility', 'hidden');
        });
        this.exclamation.attr('y', this.config.margin.top + this.config.exclamation.offset.top + this.exclamation.node().getBBox().height / 2);
        this.updateAxisLabels();
        this.drawBars();
        this.drawTimelines();
        this.drawBubbles();
        this.drawLines();
        this.drawTooltip();
        this.invalidateNodeIndex();
        this.updateOrder();
        this.drawZoom();
        this.drawAxes();
        this.drawFocus();
        this.drawPlayControls();
    };
    MotionChart.Chart.prototype.drawAxes = function() {
        this.svg.append('rect').attr('x', -this.config.margin.left).attr('y', 0).attr('width', this.config.margin.left).attr('height', this.config.size.height).style('fill', 'white');
        this.svg.append('rect').attr('x', 0).attr('y', this.config.size.height - this.config.margin.bottom - this.config.margin.top).attr('width', this.config.size.width).attr('height', this.config.margin.bottom).style('fill', 'white');
        this.svg.append("g").attr("class", "x axis").attr("id", "x-axis").attr("transform", "translate(0," + this.height + ")").call(this.axis.x);
        this.svg.append("g").attr("class", "y axis").attr("id", "y-axis").call(this.axis.y);
        this.svg.append('text').attr('x', this.width + this.config.axis.x.offset.x).attr('y', this.config.size.height - this.config.margin.bottom + this.config.axis.x.offset.y).attr('text-anchor', 'end').style('font-family', this.config.axis.x.font.family).style('font-size', this.fontsize(this.config.axis.x.font, this.width)).attr('id', 'x-axis-label').text('X-AXIS');
        let y_axis_label = this.svg.append("text").attr("x", 0).attr("y", 0).attr("class", "y-axis-label").attr("text-anchor", "end").style('font-family', this.config.axis.y.font.family).style("font-size", this.fontsize(this.config.axis.y.font, this.height)).attr("id", 'y-axis-label').text('Y-AXIS');
        y_axis_label.attr("transform", "translate(" + (0 - this.config.margin.left + y_axis_label.node().getBBox().height + this.config.axis.y.offset.x) + "," + (0 + this.config.axis.y.offset.y) + ") rotate(270)");
        let source_label = this.svg.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "start").style('font-family', this.config.axis.source.font.family).style("font-size", this.fontsize(this.config.axis.source.font, this.height)).attr("id", 'source-label').text('Quelle: www.arbeitsmarktmonitor.de').style("cursor", "pointer").on('click', function() {
            window.open('https://arbeitsmarktmonitor.arbeitsagentur.de/', '_blank', 'noopener');
        });
        source_label.attr("transform", "translate(" + (0 - this.config.margin.left + source_label.node().getBBox().height + this.config.axis.source.offset.x) + "," + (0 + this.height + this.config.axis.source.offset.y) + ") rotate(270)");
        this.svg.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "start").style('font-family', this.config.axis.data_source.font.family).style("font-size", this.fontsize(this.config.axis.data_source.font, this.height)).attr("id", 'data-source-label').text(this.getData().source).attr("transform", "translate(" + (0 - this.config.margin.left + source_label.node().getBBox().height + this.config.size.width - this.config.margin.right) + "," + (0 + this.height + this.config.axis.data_source.offset.y) + ") rotate(270)");
        this.svg.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "start").style('font-family', this.config.axis.data_source.font.family).style("font-size", this.fontsize(this.config.axis.data_source.font, this.height)).attr("id", 'data-source-label').text('© Arbeitsmarktmonitor der Bundesagentur für Arbeit').attr("transform", "translate(" + (0 - this.config.margin.left + source_label.node().getBBox().height + this.config.size.width - this.config.margin.right + 10) + "," + (0 + this.height + this.config.axis.data_source.offset.y) + ") rotate(270)");
    };
    MotionChart.Chart.prototype.drawZoom = function() {
        this.debug('drawZoom');
        this.matte_group = this.svg.append('g').attr('id', 'chart-matte-group').style("visibility", "hidden");
        let height = 0;
        if (this.height > 0) {
            height = this.height;
        }
        this.matte_group.append('rect').attr('id', 'chart-matte').attr('class', 'chart-matte').attr('x', 0).attr('y', 0).attr('width', this.width).attr('height', height);
    };
    MotionChart.Chart.prototype.showExclamation = function(visible) {
        this.exclamation.attr('visibility', visible ? 'visible' : 'hidden');
    };
    MotionChart.Chart.prototype.updateAxisLabels = function() {
        this.debug('updateAxisLabels');
        if (!this.svg) {
            return;
        }
        let label_x = null,
            label_y = null,
            label_x_position = this.width + this.config.axis.x.offset.x;
        switch (this.getView()) {
        case MotionChart.CONST.VIEW.LINES:
            label_x = 'Jahr';
            label_y = this.getIndicator(this.getIndicatorY()).text;
            label_x_position -= this.config.timeline.labels.width.value;
            break;
        case MotionChart.CONST.VIEW.BUBBLES:
            label_x = this.getIndicator(this.getIndicatorX()).text;
            label_y = this.getIndicator(this.getIndicatorY()).text;
            break;
        case MotionChart.CONST.VIEW.BARS:
            label_x = 'Position';
            label_y = this.getIndicator(this.getIndicatorY()).text;
            break;
        default:
            throw new Error('unknnown view type');
        }
        this.svg.select('#x-axis-label').transition().duration(this.config.transition.year.duration).text(label_x).attr('x', label_x_position);
        this.svg.select('#y-axis-label').transition().duration(this.config.transition.year.duration).text(label_y);
    };
    MotionChart.Chart.prototype.drawPlayControls = function() {
        this.debug('drawPlayControls');
        let width = 30,
            offset = 5,
            y = this.config.size.height - this.config.margin.bottom,
            bty = this.fullscreen ? -12 : 16,
            by = y + this.config.control.offset.top + 3;
        this.player_controls = this.svg.append('g').attr('transform', 'translate(' + 0 + ',' + by + ')');
        this.btn_rewind = d3.ui.button().fa_glyph('fa-fast-backward').width(width).x(0).y(bty).tooltip(this.config.control.rewind.tooltip).on('click', this.rewind.bind(this));
        this.player_controls.call(this.btn_rewind);
        this.btn_prev = d3.ui.button().fa_glyph('fa-step-backward').width(width).x(width + offset).y(bty).tooltip(this.config.control.prev.tooltip).on('click', this.prev.bind(this));
        this.player_controls.call(this.btn_prev);
        this.btn_play = d3.ui.button().fa_glyph('fa-play').width(width).x((width + offset) * 2).y(bty).tooltip(this.config.control.play.tooltip).on('click', this.play.bind(this));
        this.player_controls.call(this.btn_play);
        this.btn_stop = d3.ui.button().fa_glyph('fa-stop').width(width).x((width + offset) * 3).y(bty).tooltip(this.config.control.stop.tooltip).on('click', this.stop.bind(this))
        this.player_controls.call(this.btn_stop);
        this.btn_next = d3.ui.button().fa_glyph('fa-step-forward').width(width).x((width + offset) * 4).y(bty).tooltip(this.config.control.next.tooltip).on('click', this.next.bind(this));
        this.player_controls.call(this.btn_next);
        this.btn_end = d3.ui.button().fa_glyph('fa-fast-forward').width(width).x((width + offset) * 5).y(bty).tooltip(this.config.control.end.tooltip).on('click', this.end.bind(this));
        this.player_controls.call(this.btn_end);
        this.btn_start_zoom = d3.ui.button().fa_glyph('fa-search').width(width).x((width + offset) * 6).y(bty).tooltip(this.config.control.start_zoom.tooltip).on('click', this.startZoom.bind(this));
        this.player_controls.call(this.btn_start_zoom);
        this.btn_stop_reset = d3.ui.button().fa_glyph('fa-arrows-alt').width(width).x((width + offset) * 7).y(bty).tooltip(this.config.control.stop_reset.tooltip).on('click', this.resetZoom.bind(this));
        this.player_controls.call(this.btn_stop_reset);
        let slider_x = (width + offset) * 9,
            slider_width = this.config.size.width - this.config.margin.right - this.config.margin.left - slider_x - 10;
        this.slider = d3.ui.slider().width(slider_width).all(true).min(0).max(0).x((width + offset) * 9).y(this.config.slider.offset.top).on('change', (e) => {
            this.setYear(e.new);
            this.updateFormYear();
            this.transition(false, true);
        });
        this.player_controls.call(this.slider);
    };
    MotionChart.Chart.prototype.isZoom = function() {
        let zoom = this.getData().zoom,
            is_zoom = _.all([zoom.x1 !== null, zoom.x2 !== null, zoom.y1 !== null, zoom.y2 !== null]);
        this.debug('isZoom', is_zoom);
        return is_zoom;
    };
    MotionChart.Chart.prototype.getZoom = function() {
        this.info('getZoom');
        return this.getData().zoom;
    };
    MotionChart.Chart.prototype.setZoom = function(x1, x2, y1, y2) {
        this.info('setZoom', x1, x2, y1, y2);
        let zoom = this.getData().zoom;
        zoom.x1 = x1;
        zoom.x2 = x2;
        zoom.y1 = y1;
        zoom.y2 = y2;
    };
    MotionChart.Chart.prototype.setZoomNull = function() {
        this.info('setZoomNull');
        this.setZoom(null, null, null, null);
    };
    MotionChart.Chart.prototype.startZoom = function() {
        this.debug('startZoom');
        if (this.zoom_mode !== MotionChart.CONST.ZOOM.NONE) {
            this.setZoomNull();
            this.stopZoom();
            return;
        }
        this.zoom_mode = MotionChart.CONST.ZOOM.ZOOM;
        this.setZoomNull();
        this.matte_group.style('visibility', 'visible').style("cursor", "crosshair");
        this.activateControls(false);
        this.btn_start_zoom.active(true);
        this.btn_stop.active(false);
        this.matte_group.on("mousedown", (_d, _i, _nodes) => {
            let p = d3.mouse(_nodes[_i]);
            this.zoom_mode = MotionChart.CONST.ZOOM.ZOOMING;
            this.matte_group.append('rect').attr('class', 'chart-matte-selection').attr('x', p[0]).attr('y', p[1]).attr('width', 0).attr('height', 0);
        }).on("mousemove", (_d, _i, _nodes) => {
            if (this.zoom_mode !== MotionChart.CONST.ZOOM.ZOOMING) {
                return;
            }
            let p = d3.mouse(_nodes[_i]),
                s = this.matte_group.select('.chart-matte-selection'),
                x1 = parseInt(s.attr('x')),
                y1 = parseInt(s.attr('y')),
                width = d3.max([1, p[0] - x1]),
                height = d3.max([1, p[1] - y1]),
                x2 = x1 + width,
                y2 = y1 + height;
            s.attr('width', width);
            s.attr('height', height);
            this.setZoom(this.scales.x.invert(x1), this.scales.x.invert(x2), this.scales.y.invert(y1), this.scales.y.invert(y2));
        }).on("mouseup", () => {
            this.stopZoom();
        });
    };
    MotionChart.Chart.prototype.stopZoom = function() {
        this.debug('stopZoom');
        if (this.zoom_mode === MotionChart.CONST.ZOOM.NONE) {
            return;
        }
        this.matte_group.select(".chart-matte-selection").remove();
        this.matte_group.style("cursor", "default");
        this.zoom_mode = MotionChart.CONST.ZOOM.NONE;
        this.activateControls(true);
        this.btn_stop.active(true);
        this.matte_group.style('visibility', 'hidden');
        if (this.isZoom()) {
            this.setIndicators(this.getIndicatorX(), this.getIndicatorY(), this.getIndicatorR());
            this.calculateDataYears();
            this.drawLines(true);
            this.transition(false);
        }
    };
    MotionChart.Chart.prototype.resetZoom = function() {
        this.info('resetZoom');
        if (!this.isZoom()) {
            return;
        }
        this.setZoomNull();
        this.setIndicators(this.getIndicatorX(), this.getIndicatorY(), this.getIndicatorR());
        this.calculateDataYears();
        this.drawLines(true);
        this.transition(false);
    };
    MotionChart.Chart.prototype.isShowBubbleLines = function() {
        this.debug('isShowBubbleLines');
        return this.getData().show_bubble_lines;
    };
    MotionChart.Chart.prototype.isShowBubbleTrails = function() {
        this.debug('isShowBubbleTrails');
        return this.getData().show_bubble_trails || this.show_bubble_trails_once_more;
    };
    MotionChart.Chart.prototype.updateYearSlider = function() {
        this.debug('uppdateYearSlider');
        let min = this.getYearMin();
        let max = this.getYearMax();
        this.debug('uppdateYearSlider', min, max);
        this.slider.range([min, max]);
    };
    MotionChart.Chart.prototype.getDataYearDict = function() {
        return this.data.year_data[this.getYear()];
    };
    MotionChart.Chart.prototype.getDataYearList = function() {
        return this.getData().data[this.getYear()];
    };
    MotionChart.Chart.prototype.invalidateNodeIndex = function() {
        this.node_index = null;
    };
    MotionChart.Chart.prototype.getNodeIndex = function() {
        let index = this.node_index;
        if (index !== null) {
            return index;
        }
        index = {
            circle: Object.create(null),
            bar: Object.create(null),
            tline: Object.create(null),
            dots: Object.create(null),
            bubble_line_group: Object.create(null)
        };
        if (!this.svg) {
            return index;
        }
        this.svg.selectAll('.circle').each(function(d) {
            index.circle[d.region_id] = this;
        });
        this.svg.selectAll('.bar').each(function(d) {
            index.bar[d.value] = this;
        });
        this.svg.selectAll('.tline').each(function(d) {
            index.tline[d.value] = this;
        });
        this.svg.selectAll('.dot').each(function(d) {
            (index.dots[d.region_id] || (index.dots[d.region_id] = [])).push(this);
        });
        this.svg.selectAll('.bubble-line-group').each(function(d) {
            index.bubble_line_group[d.region_id] = this;
        });
        this.node_index = index;
        return index;
    };
    MotionChart.Chart.prototype.selectNodes = function(nodes) {
        return d3.selectAll(nodes ? (Array.isArray(nodes) ? nodes : [nodes]) : []);
    };
    MotionChart.Chart.prototype.selectCircle = function(region_id) {
        return this.selectNodes(this.getNodeIndex().circle[region_id]);
    };
    MotionChart.Chart.prototype.selectCircleByTopRegion = function(topregion_id) {
        return this.svg.selectAll('.circle').filter(function(d) {
            return d.topregion_id === topregion_id;
        });
    };
    MotionChart.Chart.prototype.selectCircleTrailByTopRegion = function(topregion_id) {
        return this.svg.selectAll('.gline').filter(function(d) {
            return d.topregion_id === topregion_id;
        });
    };
    MotionChart.Chart.prototype.selectTimeLine = function(region_id) {
        return this.selectNodes(this.getNodeIndex().tline[region_id]);
    };
    MotionChart.Chart.prototype.selectTimeLineByTopRegion = function(topregion_id) {
        return this.svg.selectAll('.tline').filter(function(d) {
            return d.topregion === topregion_id;
        });
    };
    MotionChart.Chart.prototype.selectTimeLineDot = function(region_id) {
        return this.selectNodes(this.getNodeIndex().dots[region_id]);
    };
    MotionChart.Chart.prototype.selectTimeLineDotByTopRegion = function(topregion_id) {
        return this.svg.selectAll('.dot').filter(function(d) {
            return d.topregion_id === topregion_id;
        });
    };
    MotionChart.Chart.prototype.selectTimeLineDotByYear = function(region_id, year) {
        return this.selectTimeLineDot(region_id).filter(function(d) {
            return d.year === year;
        });
    };
    MotionChart.Chart.prototype.selectBar = function(region_id) {
        return this.selectNodes(this.getNodeIndex().bar[region_id]);
    };
    MotionChart.Chart.prototype.selectBarByTopRegion = function(topregion_id) {
        return this.svg.selectAll('.bar').filter(function(d) {
            return d.topregion === topregion_id;
        });
    };
    MotionChart.Chart.prototype.selectBubbleLineGroup = function(region_id) {
        return this.selectNodes(this.getNodeIndex().bubble_line_group[region_id]);
    };
    MotionChart.Chart.prototype.selectBubbleLineByYear = function(year_index) {
        return this.svg.selectAll('.bubble-line[year_id="' + year_index + '"]');
    };
    MotionChart.Chart.prototype.isRegionSelected = function(region_id) {
        return this.data.region_selected[region_id] === true;
    };
    MotionChart.Chart.prototype.getVisibleRegions = function() {
        this.debug('getVisibleRegions');
        let data = this.getData(),
            show_all = data.show_all_regions,
            topregion_selected = data.topregion_selected,
            region_selected = data.region_selected;
        return data.regions.filter(function(region) {
            return topregion_selected[region.topregion] === true && (show_all || region_selected[region.value] === true);
        });
    };
    MotionChart.Chart.prototype.isRegionVisible = function(region_id, topregion_id) {
        let data = this.getData();
        return data.topregion_selected[topregion_id] === true && (data.show_all_regions || data.region_selected[region_id] === true);
    };
    MotionChart.Chart.prototype.selectRegion = function(region_id, selected, transition) {
        this.debug('selectRegion', region_id, 'selected =', selected, 'transition =', transition);
        let topregion_id = this.getRegionTopRegionId(region_id),
            dots = this.selectTimeLineDot(region_id),
            is_region_visible_old,
            is_region_visible_changed;
        is_region_visible_old = this.isRegionVisible(region_id, topregion_id);
        this.data.region_selected[region_id] = selected === true;
        is_region_visible_changed = is_region_visible_old !== this.isRegionVisible(region_id, topregion_id);
        let checkbox = this.getRegionCheckbox(region_id);
        if (checkbox) {
            checkbox.checked = selected === true;
        }
        switch (this.getView()) {
        case MotionChart.CONST.VIEW.LINES:
            dots.style("visibility", (d) => {
                return this.isRegionVisible(d.region_id, d.topregion_id) ? 'visible' : 'hidden';
            });
            break;
        case MotionChart.CONST.VIEW.BUBBLES:
            let sel = this.selectCircle(region_id);
            if (selected) {
                sel.style("stroke", this.config.circle.selected_over.stroke.color).style("stroke-width", this.config.circle.selected_over.stroke.width).style("opacity", this.config.circle.selected_over.opacity);
            } else {
                sel.style("stroke", this.config.circle.over.stroke.color).style("stroke-width", this.config.circle.over.stroke.width).style("opacity", this.config.circle.standard.opacity);
                let group = this.getNodeIndex().bubble_line_group[region_id];
                if (group) {
                    let paths = group.childNodes;
                    for (let k = 0; k < paths.length; k++) {
                        paths[k].style.visibility = 'hidden';
                    }
                }
            }
            sel.style("visibility", (d) => {
                return this.isRegionVisible(d.region_id, d.topregion_id) ? 'visible' : 'hidden';
            });
            break;
        case MotionChart.CONST.VIEW.BARS:
            let bar = this.selectBar(region_id);
            if (selected) {
                bar.style("opacity", this.config.bar.selected.opacity);
            } else {
                bar.style("opacity", this.config.bar.standard.opacity);
            }
            if (is_region_visible_changed) {
                if (!this.isSelectAll) {
                    this.enterView(this.getData().view, MotionChart.CONST.TRANSITION.YES);
                }
                transition = false;
            }
            break;
        default:
            throw new Error('unknnown view type');
        }
        if (transition) {
            this.transition(false, false, this.config.transition.fast.duration);
        }
    };
    MotionChart.Chart.prototype.selectRegionReverse = function(region_id, selected, transition) {
        this.info('selectRegionReverse', region_id, selected, transition);
        let reversed_id = this.getData().region_mapping_reverse[region_id];
        if (typeof reversed_id === 'undefined') {
            throw new Error('could not reverse region_id ' + region_id);
        }
        this.setSuspend(this.config.events.PUSH);
        this.selectRegion(this.getData().region_mapping_reverse[region_id], selected, transition);
        this.unsetSuspend(this.config.events.PUSH);
    };
    MotionChart.Chart.prototype.overRegion = function(region_id, with_topregion) {
        this.info('overRegion', region_id);
        let sel = this.selectCircle(region_id),
            timeline = this.selectTimeLine(region_id),
            selected = this.isRegionSelected(region_id);
        if (with_topregion) {
            this.overTopRegion(sel.data()[0].topregion_id);
        }
        let item = this.getRegionMenuItem(region_id);
        if (item) {
            item.style.backgroundColor = this.config.menu.over.background;
        }
        if (this.isViewBubbles()) {
            if (selected) {
                sel.style("stroke", this.config.circle.selected_over.stroke.color).style("stroke-width", this.config.circle.selected_over.stroke.width).style("opacity", this.config.circle.selected_over.opacity);
            } else {
                sel.style("stroke", this.config.circle.over.stroke.color).style("stroke-width", this.config.circle.over.stroke.width).style("opacity", this.config.circle.over.opacity);
            }
        } else if (this.isViewLines()) {
            timeline.style("stroke-width", this.config.timeline.line.over.stroke.width).style("opacity", this.config.timeline.line.over.opacity);
            this.selectTimeLineDot(region_id).style("opacity", this.config.timeline.line.over.opacity);
        } else if (this.isViewBars()) {
            let bar = this.selectBar(region_id);
            bar.style("opacity", this.config.bar.over.opacity);
        }
    };
    MotionChart.Chart.prototype.outRegion = function(region_id, with_topregion) {
        this.info('outRegion', region_id);
        let sel = this.selectCircle(region_id),
            timeline = this.selectTimeLine(region_id),
            selected = this.isRegionSelected(region_id);
        if (with_topregion) {
            this.outTopRegion(sel.data()[0].topregion_id);
        }
        let item = this.getRegionMenuItem(region_id);
        if (item) {
            item.style.backgroundColor = selected ? this.config.menu.selected.background : this.config.menu.standard.background;
        }
        if (this.isViewBubbles()) {
            if (selected) {
                sel.style("stroke", this.config.circle.selected.stroke.color).style("stroke-width", this.config.circle.selected.stroke.width).style("opacity", this.config.circle.selected.opacity);
            } else {
                sel.style("stroke", this.config.circle.standard.stroke.color).style("stroke-width", this.config.circle.standard.stroke.width).style("opacity", this.config.circle.standard.opacity);
            }
        } else if (this.isViewLines()) {
            if (selected) {
                timeline.style("stroke-width", this.config.timeline.line.selected.stroke.width).style("opacity", this.config.timeline.line.selected.opacity);
                this.selectTimeLineDot(region_id).style("opacity", this.config.timeline.line.selected.opacity);
            } else {
                timeline.style("stroke-width", this.config.timeline.line.standard.stroke.width).style("opacity", this.config.timeline.line.standard.opacity);
                this.selectTimeLineDot(region_id).style("opacity", this.config.timeline.line.standard.opacity);
            }
        } else if (this.isViewBars()) {
            let bar = this.selectBar(region_id);
            bar.style("opacity", selected ? this.config.bar.selected.opacity : this.config.bar.standard.opacity);
        }
    };
    MotionChart.Chart.prototype.isTopRegionSelected = function(topregion_id) {
        return this.getData().topregion_selected[topregion_id] === true;
    };
    MotionChart.Chart.prototype.selectTopRegion = function(topregion_id, selected, suspend, defer) {
        if (suspend) {
            this.setSuspend(this.config.events.TOP_REGION);
        }
        selected = !!selected;
        this.getData().topregion_selected[topregion_id] = selected;
        d3.select('#cb-topregion-' + topregion_id).property('checked', selected);
        if (this.getData().region_type !== 'arbeitsmarktregion') {
            if (!selected) {
                for (let region_id of this.topregionRegionIds(topregion_id)) {
                    if (this.isRegionSelected(region_id)) {
                        this.selectRegion(region_id, false, MotionChart.CONST.TRANSITION.NO);
                    }
                }
            }
        }
        if (defer) {
            if (suspend) {
                this.unsetSuspend(this.config.events.TOP_REGION);
            }
            return;
        }
        this.setRegions();
        this.enterView(this.getData().view, MotionChart.CONST.TRANSITION.NO);
        const callback = () => {
            this.unsetSuspend(this.config.events.TOP_REGION);
        };
        this.transition(false, false, null, callback);
    };
    MotionChart.Chart.prototype.setTopRegionBlinking = function(topregion_id, blinking) {
        this.info('setTopRegionBlinking', topregion_id, blinking);
        this.getData().topregion_blink[topregion_id] = blinking === true;
    };
    MotionChart.Chart.prototype.getTopRegionBlinking = function(topregion_id) {
        this.debug('getTopRegionBlinking', topregion_id);
        return this.getData().topregion_blink[topregion_id] === true;
    };
    MotionChart.Chart.prototype.overTopRegion = function(topregion_id) {
        this.info('overTopRegion', topregion_id);
        if (this.isSuspended(this.config.events.TOP_REGION)) {
            return this.info('overTopRegion', topregion_id, 'SUSPENDED');
        }
        d3.select('#topregion-' + topregion_id).style("background-color", this.config.menu.over.background);
        const topregionRegionIds = this.topregionRegionIds(topregion_id);
        for (let i of topregionRegionIds) {
            this.overRegion(i, false);
        }
        if (this.isTopRegionSelected(topregion_id)) {
            this.setTopRegionBlinking(topregion_id, true);
            switch (this.getView()) {
            case MotionChart.CONST.VIEW.LINES:
                this.blinkTopRegion(topregion_id, this.selectTimeLineByTopRegion(topregion_id));
                this.blinkTopRegion(topregion_id, this.selectTimeLineDotByTopRegion(topregion_id));
                break;
            case MotionChart.CONST.VIEW.BUBBLES:
                this.blinkTopRegion(topregion_id, this.selectCircleByTopRegion(topregion_id));
                this.blinkTopRegion(topregion_id, this.selectCircleTrailByTopRegion(topregion_id));
                break;
            case MotionChart.CONST.VIEW.BARS:
                this.blinkTopRegion(topregion_id, this.selectBarByTopRegion(topregion_id));
                break;
            default:
                throw new Error('unknnown view type');
            }
        }
    };
    MotionChart.Chart.prototype.outTopRegion = function(topregion_id) {
        this.info('outTopRegion', topregion_id);
        if (this.isSuspended(this.config.events.TOP_REGION)) {
            return this.info('outTopRegion', topregion_id, 'SUSPENDED');
        }
        let selected = this.isTopRegionSelected(topregion_id);
        if (selected) {
            d3.select('#topregion-' + topregion_id).style("background-color", this.config.menu.selected.background);
        } else {
            d3.select('#topregion-' + topregion_id).style("background-color", this.config.menu.standard.background);
        }
        const topregionRegionIds = this.topregionRegionIds(topregion_id);
        for (let i of topregionRegionIds) {
            this.outRegion(i, false);
        }
        this.setTopRegionBlinking(topregion_id, false);
    };
    MotionChart.Chart.prototype.blinkTopRegion = function(topregion_id, selection, opacity) {
        this.info('blinkTopRegion', topregion_id);
        if (this.isSuspended(this.config.events.TOP_REGION)) {
            return this.info('blinkTopRegion', topregion_id, 'SUSPENDED');
        }
        let n = 0;
        opacity = typeof opacity === 'undefined' ? this.config.blink.opacity.on : opacity;
        selection.transition().duration(this.config.transition.blink.duration).style('opacity', opacity).on('start', function() {
            n++;
        }).on('end', () => {
            n--;
            if (n === 0) {
                if (this.getTopRegionBlinking(topregion_id)) {
                    this.blinkTopRegion(topregion_id, selection, opacity === this.config.blink.opacity.off ? this.config.blink.opacity.on : this.config.blink.opacity.off);
                } else {
                    selection.transition().duration(this.config.transition.blink.duration).style('opacity', (d) => {
                        switch (this.getView()) {
                        case MotionChart.CONST.VIEW.BUBBLES:
                            return this.isRegionSelected(d.region_id) ? this.config.circle.selected.opacity : this.config.circle.standard.opacity;
                        case MotionChart.CONST.VIEW.LINES:
                            return this.isRegionSelected(d.value) ? this.config.timeline.line.selected.opacity : this.config.timeline.line.standard.opacity;
                        case MotionChart.CONST.VIEW.BARS:
                            return this.isRegionSelected(d.value) ? this.config.bar.selected.opacity : this.config.bar.standard.opacity;
                        default:
                            throw new Error('unknnown view type');
                        }
                    })
                }
            }
        });
    };
    MotionChart.Chart.prototype.drawTooltip = function() {
        this.info('drawTooltip');
        this.tooltip = d3.select("body").append("div").style("background-color", "#e0e0e0").style("padding", "5px").style("opacity", "0.8").style("position", "absolute").style("z-index", "10").style("border-radius", "8px").style("visibility", "hidden").attr("class", "hidden-print").text("tooltip text");
        this.tooltip2 = d3.select("body").append("div").style("background-color", "#e0e0e0").style("padding", "5px").style("opacity", "0.8").style("position", "absolute").style("z-index", "10").style("border-radius", "8px").style("visibility", "hidden").attr("class", "hidden-print").text("tooltip text");
    };
    MotionChart.Chart.prototype.drawFocus = function() {
        this.focus = this.svg.append('g');
        this.focus.append('line').attr('class', 'focus-x').style('stroke', MotionChart.config.focus.line.stroke).style('stroke-dasharray', MotionChart.config.focus.line.stroke_dasharray).style('opacity', MotionChart.config.focus.line.opacity).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 0);
        this.focus.append('line').attr('class', 'focus-y').style('stroke', MotionChart.config.focus.line.stroke).style('stroke-dasharray', MotionChart.config.focus.line.stroke_dasharray).style('opacity', MotionChart.config.focus.line.opacity).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 0);
        this.svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 0).attr("height", 0).attr("fill", MotionChart.config.focus.x.fill).style('opacity', MotionChart.config.focus.x.opacity).attr("id", 'x-axis-focus-background');
        this.svg.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "middle").style("font-size", "15px").attr("id", 'x-axis-focus').text('');
        this.svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 0).attr("height", 0).attr("fill", MotionChart.config.focus.y.fill).style('opacity', MotionChart.config.focus.y.opacity).attr("id", 'y-axis-focus-background');
        this.svg.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "end").style("font-size", "15px").attr("id", 'y-axis-focus').text('');
    };
    /**
     * Sammelt alles, was innerhalb eines Zeichen-/Transition-Durchlaufs konstant
     * ist, einmalig ein. Ohne diesen Kontext ermittelt jede der zehntausenden
     * Callback-Ausfuehrungen Indikatoren, Skalen und Config-Werte erneut.
     */
    MotionChart.Chart.prototype.createRenderContext = function() {
        let data = this.getData(),
            year = this.getYear(),
            circle = this.config.circle;
        return {
            data: data,
            year: year,
            year_data: data.year_data[year],
            indicator_x: this.getIndicatorX(),
            indicator_y: this.getIndicatorY(),
            indicator_r: this.getIndicatorR(),
            scale_x: this.scales.x,
            scale_y: this.scales.y,
            scale_r: this.scales.r,
            default_radius: circle.default_radius,
            opacity_selected: circle.selected_over.opacity,
            opacity_standard: circle.standard.opacity,
            show_all_regions: data.show_all_regions,
            region_selected: data.region_selected,
            topregion_selected: data.topregion_selected,
            show_bubble_trails: this.isShowBubbleTrails(),
            domain_y_0: (this.domains && this.domains.y) ? this.domains.y[0] : null,
            opacity_bar_selected: this.config.bar.selected.opacity,
            opacity_bar_standard: this.config.bar.standard.opacity,
            opacity_line_selected: this.config.timeline.line.selected.opacity,
            opacity_line_standard: this.config.timeline.line.standard.opacity
        };
    };
    MotionChart.Chart.prototype.isRegionVisibleFast = function(ctx, region_id, topregion_id) {
        return ctx.topregion_selected[topregion_id] === true && (ctx.data.show_all_regions || ctx.region_selected[region_id] === true);
    };
    MotionChart.Chart.prototype.calculateBubbleTrailData = function(d, ctx) {
        ctx = ctx || this.createRenderContext();
        let default_radius = ctx.default_radius,
            year_visibility = d.year <= ctx.year,
            trail = d.trail;
        if (trail === undefined) {
            trail = d.trail = {
                id: 'bubble-trail-' + d.region_id + '-' + d.year,
                class: 'circle-bubble-trail circle-bubble-trail-year-' + d.year,
                indicator: {},
                scaled: {},
                final: {}
            };
        }
        let indicator = trail.indicator,
            scaled = trail.scaled,
            final = trail.final;
        indicator.x = d[ctx.indicator_x];
        indicator.y = d[ctx.indicator_y];
        indicator.r = d[ctx.indicator_r];
        scaled.x = ctx.scale_x(indicator.x);
        scaled.y = ctx.scale_y(indicator.y);
        scaled.r = ctx.scale_r(indicator.r);
        let validxy = this.isNumber(indicator.x) && this.isNumber(indicator.y) && this.isNumber(scaled.x) && this.isNumber(scaled.y),
            validr = this.isNumber(indicator.r) && this.isNumber(scaled.r);
        trail.validxy = validxy;
        trail.validr = validr;
        trail.valid = validxy && validr;
        let region_selected = ctx.region_selected[d.region_id] === true,
            region_visible = this.isRegionVisibleFast(ctx, d.region_id, d.topregion_id),
            radius = validr ? Math.max(this.defaultNumber(scaled.r, 0), 0) : default_radius;
        final.region_selected = region_selected;
        final.is_show_bubble_trails = ctx.show_bubble_trails;
        final.region_visible = region_visible;
        final.year_visibility = year_visibility;
        final.visibility = region_selected && ctx.show_bubble_trails && region_visible && year_visibility && validxy;
        final.radius = radius;
        final.corner = validr ? radius : 0;
        final.opacity = year_visibility ? (region_selected ? ctx.opacity_selected : ctx.opacity_standard) : 0;
        final.x = (validxy ? this.defaultNumber(scaled.x, 0) : null) - radius / 2;
        final.y = (validxy ? this.defaultNumber(scaled.y, 0) : null) - radius / 2;
    };
    MotionChart.Chart.prototype.setBubbleDefault = function(node, default_radius, x, y) {
        node.setAttribute('rx', 0);
        node.setAttribute('ry', 0);
        node.setAttribute('width', default_radius);
        node.setAttribute('height', default_radius);
        if (typeof x !== 'undefined') {
            node.setAttribute('x', x - default_radius / 2.0);
        }
        if (typeof y !== 'undefined') {
            node.setAttribute('y', y - default_radius / 2.0);
        }
    };
    MotionChart.Chart.prototype.setBubbleXYR = function(final, x, y, radius, corner, opacity) {
        final.radius = radius;
        final.corner = typeof corner !== 'undefined' ? corner : radius;
        final.opacity = typeof opacity !== 'undefined' ? opacity : 1;
        final.xx = x;
        final.yy = y;
        final.x = x - radius / 2.0;
        final.y = y - radius / 2.0;
    };
    MotionChart.Chart.prototype.calculateBubbleData = function(context, d, ctx) {
        ctx = ctx || this.createRenderContext();
        let default_radius = ctx.default_radius,
            record = ctx.year_data[d.region_id],
            bubble = d.bubble;
        if (bubble === undefined) {
            bubble = d.bubble = {
                indicator: {},
                scaled: {},
                final: {},
                previous: {
                    validxy: false,
                    validr: false,
                    valid: false
                }
            };
        }
        let indicator = bubble.indicator,
            scaled = bubble.scaled,
            final = bubble.final,
            previous = bubble.previous;
        indicator.x = record[ctx.indicator_x];
        indicator.y = record[ctx.indicator_y];
        indicator.r = record[ctx.indicator_r];
        scaled.x = ctx.scale_x(indicator.x);
        scaled.y = ctx.scale_y(indicator.y);
        scaled.r = ctx.scale_r(indicator.r);
        let validxy = this.isNumber(indicator.x) && this.isNumber(indicator.y) && this.isNumber(scaled.x) && this.isNumber(scaled.y),
            validr = this.isNumber(indicator.r) && this.isNumber(scaled.r),
            valid = validxy && validr;
        bubble.validxy = validxy;
        bubble.validr = validr;
        bubble.valid = valid;
        final.visibility = this.isRegionVisibleFast(ctx, d.region_id, d.topregion_id);
        if (valid) {
            let x = this.defaultNumber(scaled.x, 0),
                y = this.defaultNumber(scaled.y, 0),
                radius = Math.max(this.defaultNumber(scaled.r, 0), 0);
            if (previous.valid) {
                this.setBubbleXYR(final, x, y, radius);
            } else if (previous.validxy) {
                this.setBubbleDefault(context, default_radius);
                this.setBubbleXYR(final, x, y, radius);
            } else {
                this.setBubbleXYR(final, x, y, radius);
                this.setBubbleDefault(context, default_radius, final.xx, final.yy);
                context.style.opacity = 0;
            }
        } else if (validxy) {
            let x = this.defaultNumber(scaled.x, 0),
                y = this.defaultNumber(scaled.y, 0);
            this.setBubbleXYR(final, x, y, default_radius, 0);
            if (!(previous.valid || previous.validxy)) {
                this.setBubbleDefault(context, default_radius, final.xx, final.yy);
                context.style.opacity = 0;
            }
        } else {
            let x = typeof previous.x !== 'undefined' ? previous.x : parseFloat(context.getAttribute('x')),
                y = typeof previous.y !== 'undefined' ? previous.y : parseFloat(context.getAttribute('y'));
            this.setBubbleXYR(final, x, y, default_radius, 0, 0);
        }
        previous.validxy = validxy;
        previous.validr = validr;
        previous.valid = valid;
        previous.x = final.xx;
        previous.y = final.yy;
        d.radius = final.radius;
    };
    MotionChart.Chart.prototype.drawBubbles = function() {
        this.info('drawBubbles');
        let data = this.getData(),
            data_year = this.getDataYearList(),
            ctx = this.createRenderContext();
        const regions = data.regions;
        for (let i of regions) {
            let region_id = i.value;
            const datas = data.r2y[region_id];
            for (let i of datas) {
                this.calculateBubbleTrailData(i, ctx);
            }
            this.svg.append("g").attr('id', 'g-bubble-trail-' + region_id).selectAll(".circle-bubble-trail").data(data.r2y[region_id]).enter().append('rect').attr("class", function(d) {
                return d.trail.class;
            }).attr("id", function(d) {
                return d.trail.id;
            }).attr("x", function(d) {
                return d.trail.final.x;
            }).attr("y", function(d) {
                return d.trail.final.y;
            }).attr("rx", function(d) {
                return d.trail.final.corner;
            }).attr("ry", function(d) {
                return d.trail.final.corner;
            }).attr("width", function(d) {
                return d.trail.final.radius;
            }).attr("height", function(d) {
                return d.trail.final.radius;
            }).style("fill", (d) => {
                return this.topRegionColor(d.topregion_id);
            }).style('opacity', function(d) {
                return d.trail.final.opacity;
            }).style('visibility', function(d) {
                return d.trail.final.visibility ? 'visible' : 'hidden';
            }).on("mouseover", (d, _i, _nodes) => {
                return this.mouseOverFocus(_nodes[_i], d, 'trail');
            }).on("mousemove", (d, _i, _nodes) => {
                return this.mouseMoveFocus(_nodes[_i], d, 'trail');
            }).on("mouseout", (d, _i, _nodes) => {
                return this.mouseOutFocus(_nodes[_i], d, 'trail');
            }).on("click", (d, _i, _nodes) => {
                return this.clickFocus(_nodes[_i], d, 'trail');
            });
        }
        this.svg.append("g").attr('id', 'g-bubbles').selectAll(".circle").data(data_year).enter().append('rect').attr("class", "circle").attr("id", function(d) {
            return 'region-' + d.region_id;
        }).attr("x", (d) => {
            return this.defaultNumber(ctx.scale_x(d[ctx.indicator_x]), 0);
        }).attr("y", (d) => {
            return this.defaultNumber(ctx.scale_y(d[ctx.indicator_y]), 0);
        }).attr("rx", (d) => {
            d.radius = Math.max(this.defaultNumber(ctx.scale_r(d[ctx.indicator_r]), 0), 0);
            return d.radius;
        }).attr("ry", (d) => {
            return d.radius;
        }).style("fill", (d) => {
            return this.topRegionColor(d.topregion_id);
        }).style('opacity', 0).on("mouseover", (d, _i, _nodes) => {
            return this.mouseOverFocus(_nodes[_i], d, 'bubble', this.getYear());
        }).on("mousemove", (d, _i, _nodes) => {
            return this.mouseMoveFocus(_nodes[_i], d, 'bubble');
        }).on("mouseout", (d, _i, _nodes) => {
            return this.mouseOutFocus(_nodes[_i], d, 'bubble');
        }).on("click", (d, _i, _nodes) => {
            return this.clickFocus(_nodes[_i], d, 'trail');
        });
    };
    MotionChart.Chart.prototype.drawLines = function(remove) {
        this.info('drawLines', remove, this.isShowBubbleLines());
        let data = this.getDataYearList();
        if (remove) {
            this.svg.selectAll(".bubble-line-group").remove();
            this.invalidateNodeIndex();
        }
        this.line_fn_flat = d3.line().curve(d3.curveLinear).x((d) => {
            return this.scales.x(d.year);
        }).y(() => {
            return this.scales.y(this.domains.y[0]);
        });
        if (!this.isShowBubbleLines()) {
            if (!remove) {
                this.svg.selectAll(".bubble-line-group").remove();
                this.invalidateNodeIndex();
            }
            return;
        }
        this.bubble_line = d3.line().curve(d3.curveLinear).x((d) => {
            return this.scales.x(d[this.getIndicatorX()]);
        }).y((d) => {
            return this.scales.y(d[this.getIndicatorY()]);
        });
        // Die Segmente werden direkt im DOM erzeugt: ein d3-Join pro Segment und
        // drei getTotalLength()-Aufrufe (je ein erzwungenes Layout) waren der
        // teuerste Teil des Neuzeichnens. Bei einer Geraden ist die Pfadlaenge
        // exakt der Punktabstand, das Layout wird also gar nicht mehr gebraucht.
        const SVG_NS = 'http://www.w3.org/2000/svg',
            indicator_x = this.getIndicatorX(),
            indicator_y = this.getIndicatorY(),
            scale_x = this.scales.x,
            scale_y = this.scales.y,
            region_lines = this.getData().region_lines;
        this.svg.selectAll(".bubble-line-group").data(data).enter().append("g").attr("class", "bubble-line-group")
        .attr("region_id", function(d) {
            return d.region_id;
        }).each((d, _i, _nodes) => {
            const region_id = d.region_id,
                lines = region_lines[region_id],
                group = _nodes[_i];
            for (let l = 0; l < lines.length - 1; l++) {
                const d1 = lines[l],
                    d2 = lines[l + 1];
                if (d1 === null || d2 === null) {
                    continue;
                }
                if (d1[indicator_x] === null || d1[indicator_y] === null || d2[indicator_x] === null || d2[indicator_y] === null) {
                    continue;
                }
                const x1 = scale_x(d1[indicator_x]),
                    y1 = scale_y(d1[indicator_y]),
                    x2 = scale_x(d2[indicator_x]),
                    y2 = scale_y(d2[indicator_y]),
                    dx = x2 - x1,
                    dy = y2 - y1,
                    total_length = Math.sqrt(dx * dx + dy * dy),
                    path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('id', 'bubble-line-' + region_id + '-' + l);
                path.setAttribute('year_id', l);
                path.setAttribute('class', 'bubble-line');
                path.setAttribute('d', 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2);
                path.setAttribute('total-length', total_length);
                path.setAttribute('stroke-dasharray', total_length + " " + total_length);
                path.setAttribute('stroke-dashoffset', total_length);
                path.__data__ = d;
                path.__year_id = l;
                path.__total_length = total_length;
                group.appendChild(path);
            }
        });
        this.invalidateNodeIndex();
    };
    MotionChart.Chart.prototype.showFocus = function(x, y, xx, yy, vx, vy) {
        this.debug('showFocus', x, y, xx, yy, vx, vy);
        if (vx) {
            d3.select('.focus-x').style('visibility', 'visible').attr('x1', x).attr('x2', x).attr('y1', y).attr('y2', yy);
        }
        if (vy) {
            d3.select('.focus-y').style('visibility', 'visible').attr('y1', y).attr('y2', y).attr('x1', xx).attr('x2', x);
        }
        if (vx) {
            d3.select('#x-axis-focus').text(this.data.view === "bubbles" ? vx : "").attr('x', x).attr('y', yy).style('visibility', 'visible');
            let xbbox = d3.select('#x-axis-focus').node().getBBox();
            d3.select('#x-axis-focus-background').attr("x", xbbox.x - MotionChart.config.focus.x.padding).attr("y", xbbox.y - MotionChart.config.focus.x.adjust.y).attr("width", xbbox.width + MotionChart.config.focus.x.padding * 2).attr("height", xbbox.height).style('visibility', 'visible');
            d3.select('#x-axis-focus').attr('y', yy + xbbox.height);
            d3.select('#x-axis-focus-background').attr('y', xbbox.y + xbbox.height);
        }
        if (vy) {
            d3.select('#y-axis-focus').text(vy).attr('x', xx).attr('y', y).style('visibility', 'visible');
            let ybbox = d3.select('#y-axis-focus').node().getBBox();
            d3.select('#y-axis-focus-background').attr("x", ybbox.x).attr("y", ybbox.y - MotionChart.config.focus.y.padding).attr("width", ybbox.width).attr("height", ybbox.height + MotionChart.config.focus.y.padding * 2).style('visibility', 'visible');
            d3.select('#y-axis-focus').attr('y', y + ybbox.height / 3);
            d3.select('#y-axis-focus-background').attr('y', ybbox.y - MotionChart.config.focus.y.padding + ybbox.height / 3);
        }
    };
    MotionChart.Chart.prototype.hideFocus = function() {
        this.debug('hideFocus');
        d3.select('.focus-x').style('visibility', 'hidden');
        d3.select('.focus-y').style('visibility', 'hidden');
        d3.select('#x-axis-focus').style('visibility', 'hidden');
        d3.select('#x-axis-focus-background').style('visibility', 'hidden');
        d3.select('#y-axis-focus').style('visibility', 'hidden');
        d3.select('#y-axis-focus-background').style('visibility', 'hidden');
    };
    MotionChart.Chart.prototype.mouseOverFocus = function(context, data, data_attr, current_year) {
        this.debug('mouseOverFocus', data_attr);
        if (current_year) {
            data = this.data.year_data[current_year][data.region_id];
        }
        if (data[data_attr] && data[data_attr].validxy === false) {
            return;
        }
        this.overRegion(data.region_id);
        d3.select(context).style("cursor", "pointer");
        let bubble = d3.select(context),
            w2 = parseFloat(bubble.attr('width')) / 2,
            h2 = parseFloat(bubble.attr('height')) / 2;
        this.showFocus(parseInt(parseFloat(bubble.attr('x')) + w2), parseInt(parseFloat(bubble.attr('y')) + h2), this.scales.x(this.domains.x[0]), this.scales.y(this.domains.y[0]), this.getIndicatorFormatValue(this.getIndicatorX(), data[this.getIndicatorX()]), this.getIndicatorFormatValue(this.getIndicatorY(), data[this.getIndicatorY()]));
        let display_value = this.getIndicatorFormatValue(this.getIndicatorR(), data[this.getIndicatorR()]);
        this.tooltip.text(this.getRegionName(data.region_id)).style("visibility", "visible");
        this.tooltip2.text(this.getIndicatorName(this.getIndicatorR()) + ' : ' + display_value).style("visibility", "visible");
    };
    MotionChart.Chart.prototype.mouseMoveFocus = function(context, data, data_attr) {
        this.debug('mouseMoveFocus', data_attr);
        if (data[data_attr] && data[data_attr].validxy === false) {
            return;
        }
        this.tooltip.style("top", (event.pageY - this.tooltip.node().offsetHeight - 2) + "px").style("left", (event.pageX + 10) + "px");
        this.tooltip2.style("top", (event.pageY + 0) + "px").style("left", (event.pageX + 10) + "px");
    };
    MotionChart.Chart.prototype.mouseOutFocus = function(context, data, data_attr) {
        this.debug('mouseOutFocus', data_attr);
        if (data[data_attr] && data[data_attr].validxy === false) {
            return;
        }
        this.outRegion(data.region_id);
        d3.select(context).style("cursor", "default");
        this.hideFocus();
        this.tooltip2.style("visibility", "hidden");
        return this.tooltip.style("visibility", "hidden");
    };
    MotionChart.Chart.prototype.clickFocus = function(context, data, data_attr) {
        this.debug('clickFocus', data_attr);
        if (!this.getShowAllRegions()) {
            return;
        }
        this.selectRegion(data.region_id, !this.isRegionSelected(data.region_id), MotionChart.CONST.TRANSITION.YES);
    };
    MotionChart.Chart.prototype.drawTimelines = function() {
        this.info('drawTimelines');
        let data = this.getData(),
            regions = data.regions,
            region_lines = data.region_lines,
            zero_line = d3.line().defined(function(d) {
                return d;
            }).curve(d3.curveMonotoneX).x(function() {
                return 0;
            }).y(function() {
                return 0;
            });
        this.svg.append("g").attr('id', 'tlines').selectAll(".tline").data(regions).enter().append('path').attr("class", "tline").attr("d", function(d) {
            return zero_line(region_lines[d.value]);
        }).attr("id", function(d) {
            return 'tline-' + d.value;
        }).style("fill", "none").style("stroke", function() {
            return 'red';
        }).on("mouseover", (d, _i, _nodes) => {
            this.overRegion(d.value);
            d3.select(_nodes[_i]).style("cursor", "pointer");
            let year = Math.round(this.scales.x.invert(d3.mouse(_nodes[_i])[0]));
            let dot = this.selectTimeLineDotByYear(d.value, year);
            this.showFocus(parseInt(dot.attr('cx')), parseInt(dot.attr('cy')), this.scales.x(this.domains.x[0]), this.scales.y(this.domains.r[0]), year, this.getIndicatorFormatValue(this.getIndicatorR(), dot.data()[0][this.getIndicatorR()]));
            return this.tooltip.text(this.getRegionName(d.value)).style("visibility", "visible");
        }).on("mousemove", (d, _i, _nodes) => {
            let year = Math.round(this.scales.x.invert(d3.mouse(_nodes[_i])[0]));
            let dot = this.selectTimeLineDotByYear(d.value, year);
            this.showFocus(parseInt(dot.attr('cx')), parseInt(dot.attr('cy')), this.scales.x(this.domains.x[0]), this.scales.y(this.domains.r[0]), year, this.getIndicatorFormatValue(this.getIndicatorR(), dot.data()[0][this.getIndicatorR()]));
            return this.tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        }).on("mouseout", (d, _i, _nodes) => {
            this.outRegion(d.value);
            d3.select(_nodes[_i]).style("cursor", "default");
            this.hideFocus();
            return this.tooltip.style("visibility", "hidden");
        }).on("click", (d) => {
            if (!this.getShowAllRegions()) {
                return;
            }
            this.selectRegion(d.value, !this.isRegionSelected(d.value), MotionChart.CONST.TRANSITION.YES);
        });
        this.config.timeline.labels.font.size = this.fontsize(this.config.timeline.labels.font, this.width);
        let timeline_label_widths = [];
        this.config.timeline.labels.width.value = 0;
        this.svg.append("g").attr('id', 'timeline-labels').selectAll('.timeline-label').data(regions).enter().append('text').attr('class', 'timeline-label').attr('id', function(d) {
            return 'timeline-label-' + d.value;
        }).attr('alignment-baseline', 'central').attr('text-anchor', 'start').attr('fill', '#ff0000').style('font-family', 'sans-serif').style('font-size', this.config.timeline.labels.font.size).attr('x', 10).attr('y', 0).style('visibility', 'hidden').style('opacity', 0).style('fill', (d) => {
            return this.topRegionColor(d.topregion);
        }).text(function(d) {
            return d.text;
        }).each(function() {
            let width = d3.select(this).node().getBBox().width;
            timeline_label_widths.push(width);
        });
        let timeline_label_width_average = Number.parseInt(d3.sum(timeline_label_widths) / timeline_label_widths.length),
            timeline_label_width_max = Number.parseInt(d3.max(timeline_label_widths)),
            timeline_label_width = Number.parseInt(timeline_label_width_average + (timeline_label_width_max - timeline_label_width_average) * this.config.timeline.labels.width.bias);
        this.config.timeline.labels.width.value = Math.min(this.config.timeline.labels.width.max, Math.max(this.config.timeline.labels.width.min, timeline_label_width));
        this.svg.select('#timeline-labels').attr('transform', 'translate(' + (this.width - this.config.timeline.labels.width.value) + ',0)');
        let dots = this.svg.append("g").attr('id', 'dots');
        regions.forEach((region) => {
            dots.append("g").attr('id', 'dots-region-' + region.value).selectAll(".dot").data(region_lines[region.value]).enter().append("circle").style('visibility', 'hidden').attr("class", "dot").attr("class", function(d) {
                return 'dot dot-region-' + d.region_id;
            }).attr("cx", (d) => {
                return this.defaultNumber(this.scales.x(d.year), 0);
            }).attr("cy", (d) => {
                return this.defaultNumber(this.scales.r(d[this.getIndicatorR()]), 0);
            }).attr("r", this.config.timeline.dot.radius).on("mouseover", (d, _i, _nodes) => {
                this.overRegion(d.region_id);
                let dot = d3.select(_nodes[_i]);
                this.showFocus(parseInt(dot.attr('cx')), parseInt(dot.attr('cy')), this.scales.x(this.domains.x[0]), this.scales.y(this.domains.r[0]), d.year, d[this.getIndicatorR()]);
                d3.select(_nodes[_i]).style("cursor", "pointer");
                return this.tooltip.text(this.getRegionName(d.region_id)).style("visibility", "visible");
            }).on("mousemove", (d, _i, _nodes) => {
                let dot = d3.select(_nodes[_i]);
                this.showFocus(parseInt(dot.attr('cx')), parseInt(dot.attr('cy')), this.scales.x(this.domains.x[0]), this.scales.y(this.domains.r[0]), d.year, d[this.getIndicatorR()]);
                return this.tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            }).on("mouseout", (d, _i, _nodes) => {
                this.outRegion(d.region_id);
                this.hideFocus();
                d3.select(_nodes[_i]).style("cursor", "default");
                return this.tooltip.style("visibility", "hidden");
            });
        });
    };
    MotionChart.Chart.prototype.drawBars = function() {
        this.info('drawBars');
        let data = this.getData();
        this.svg.append("g").attr('id', 'bars').selectAll(".bar").data(data.regions).enter().append('rect').attr("class", "bar").style("stroke", function() {
            return 'red';
        }).attr("id", function(d) {
            return 'bar-region-' + d.value;
        }).attr('x', 0).attr('y', 0).attr('width', 0).attr('height', 0).on("mouseover", (d, _i, _nodes) => {
            this.overRegion(d.value);
            d3.select(_nodes[_i]).style("cursor", "pointer");
            this.tooltip.text(this.getRegionName(d.value)).style("visibility", "visible");
            let srd = this.sortedRegionDict(),
                rank = d3.format('03')(srd[d.value] + 1),
                total = d3.format('03')(_.keys(srd).length);
            this.tooltip2.text(rank + '/' + total).style("visibility", "visible");
            let bar = d3.select(_nodes[_i]);
            let data = this.getDataYearDict();
            this.showFocus(parseInt(bar.attr('x')), d.bar.indicator_pos ? parseInt(bar.attr('y')) : this.scales.y(0) + d.bar.scaled.height, this.scales.x(this.domains.x[0]), null, null, this.getIndicatorFormatValue(this.getIndicatorY(), data[d.value][this.getIndicatorY()]));
        }).on("mousemove", () => {
            this.tooltip2.style("top", (event.pageY + this.tooltip2.node().offsetHeight / 2 + 1) + "px").style("left", (event.pageX + 10) + "px");
            this.tooltip.style("top", (event.pageY - this.tooltip.node().offsetHeight / 2 - 1) + "px").style("left", (event.pageX + 10) + "px");
        }).on("mouseout", (d, _i, _nodes) => {
            this.outRegion(d.value);
            d3.select(_nodes[_i]).style("cursor", "default");
            this.tooltip.style("visibility", "hidden");
            this.tooltip2.style("visibility", "hidden");
            d3.select('.focus-y').style('visibility', 'hidden');
            d3.select('#y-axis-focus').style('visibility', 'hidden');
            d3.select('#y-axis-focus-background').style('visibility', 'hidden');
        }).on("click", (d) => {
            if (!this.getShowAllRegions()) {
                return;
            }
            this.selectRegion(d.value, !this.isRegionSelected(d.value), MotionChart.CONST.TRANSITION.YES);
        });
    };
    MotionChart.Chart.prototype.load = function(values) {
        const data = values.data;
        const layer = values.layer;
        this.info('load', data);
        let url = FORCE_SCRIPT_NAME + "/faktencheck/motionchart/default/" + layer,
            loading = this.startLoading('load', 'Lade Motion Chart');
        if (typeof data === 'object') {
            url = url + '/?' + $.param(data);
        }
        d3.json(url, (error, data) => {
            this.init(error, data);
            this.stopLoading(loading);
        });
    };
    MotionChart.Chart.prototype.initDefault = function(initial) {
        this.info('initDefault', initial);
        let loading = null;
        let url = this.config.urls.default;
        if (typeof initial === 'object') {
            url = url + '?' + $.param(initial);
        }
        if (this.initial_loading) {
            loading = this.initial_loading;
        } else {
            loading = this.startLoading('initDefault', 'Lade Motion Chart');
        }
        d3.json(url, (error, data) => {
            this.init(error, data);
            this.stopLoading(loading);
            this.initial_loading = null;
        });
    };
    MotionChart.Chart.prototype.initPanel = function() {
        this.info('initPanel');
        $(this.config.panel.selector).lobiPanel(this.config.panel);
        this.panel = $(this.config.panel.selector).data('lobiPanel');
        let ul = $(this.config.panel.selector + ' .dropdown-menu'),
            selecor = this.config.panel.selector + ' ' + '.dropdown > ul > li:first-child',
            li = $(selecor);
        $(this.config.panel.selector).on('onMaximize.lobiPanel', () => {
            this.initPanelPositionFix();
        });
        function clone_li(text, icon_class, on_click) {
            let clone = li.clone(),
                i = clone.find('i'),
                span = clone.find('span'),
                a = clone.find('a');
            i.removeClass('fa-chevron-up');
            i.removeClass('fa-chevron-down');
            i.addClass(icon_class);
            span.text(text);
            a.attr('title', text).attr('data-bs-container', 'body');
            a.attr('data-bs-tooltip', text);
            a.removeAttr('data-func');
            clone.tooltip({
                selector: '[data-bs-toggle="tooltip"]'
            });
            clone.on('click', on_click);
            ul.append(clone);
            return clone;
        }
        if (!this.config.embedded) {
            const fs = () => {
                this.setFullScreen(!this.fullscreen);
            };
            clone_li(this.fullscreen ? 'Vollbildmodus beenden' : 'Vollbildmodus öffnen', this.fullscreen ? 'fa-compress' : 'fa-arrows-alt', fs);
        }
        if (this.getUserId() && this.config.export_animation_enabled) {
            clone_li('Animation Export', 'fa-film', this.exportAnimation.bind(this));
        } else {
            this.info('Export animation is disabled');
        }
        this.enablePanel(true);
        this.initPanelPositionFix();
    };
    MotionChart.Chart.prototype.initPanelPositionFix = function() {
        const overflow = this.config.panel.overflow;
        $(this.config.panel.selector).draggable({
            stop: (event, ui) => {
                const $panel = ui.helper,
                    position = $panel.position();
                if (position.top < overflow.top) {
                    $panel.css({
                        top: '0px'
                    });
                }
                if (($panel.width() + position.left) < overflow.left) {
                    $panel.css({
                        left: '0px'
                    });
                }
                if (window.innerWidth - position.left < overflow.right) {
                    $panel.css({
                        left: (window.innerWidth - 150) + 'px'
                    });
                }
                if (window.innerHeight - position.top < overflow.bottom) {
                    $panel.css({
                        top: (window.innerHeight - 50) + 'px'
                    });
                }
            }
        });
    };
    MotionChart.Chart.prototype.enablePanel = function(enabled) {
        if (enabled) {
            $(this.config.panel.selector).removeClass('chart-disable-menu');
        } else {
            $(this.config.panel.selector).addClass('chart-disable-menu');
        }
    };
    MotionChart.Chart.prototype.updatePanelPosition = function() {
        this.info('updatePanelPosition');
        let w = {
                width: $(window).width(),
                height: $(window).height()
            },
            p = $.extend(true, {}, this.panel.getPosition(), {
                width: this.panel.getWidth(),
                height: this.panel.getHeight()
            }),
            x = p.x,
            y = p.y,
            r = false;
        if (p.x + p.width > w.width) {
            x = d3.max([0, w.width - p.width - 5]);
            r = true;
        }
        if (p.y + p.height > w.height) {
            y = d3.max([0, w.height - p.height]);
            r = true;
        }
        if (r) {
            this.panel.setPosition(x, y);
        }
    };
    MotionChart.Chart.prototype.init = function(error, data) {
        this.info('init', error);
        if (error) {
            throw error;
        }
        this.domains = {
            x: null,
            y: null,
            r: null
        };
        this.scales = {
            x: null,
            y: null,
            r: null
        };
        this.axis = {
            x: null,
            y: null,
            r: null
        };
        this.data = data;
        this.topregion_region_ids = null;
        this.invalidateColorCache();
        if (data.last_selected_region_id) {
            this.last_selected_region_id = data.last_selected_region_id;
        }
        data.extent = [];
        data.years.forEach(function(year) {
            data.extent = data.extent.concat(data.data[year]);
        }, this);
        data.indicator_map = {};
        _.each(data.indicators, function(indicator) {
            data.indicator_map[indicator.value] = indicator.text;
        });
        data.region_map = {};
        data.region_lines = {};
        this.data.regions.forEach(function(r) {
            data.region_map[r.value] = r;
            data.region_lines[r.value] = [];
        });
        data.year_data = {};
        this.data.years.forEach(function(year) {
            data.year_data[year] = {};
            data.data[year].forEach(function(record) {
                data.region_lines[record.region_id].push(record);
                data.year_data[year][record.region_id] = record;
            });
        });
        data.r2y = {};
        _.each(data.regions, function(region) {
            data.r2y[region.value] = [];
        });
        _.each(data.years, function(year) {
            _.each(data.data[year], function(d) {
                data.r2y[d.region_id].push(d);
            });
        });
        data.topregion_blink = {};
        data.suspend = {};
        data.old_year_index = null;
        this.setYearIndex(data.year_index);
        let selectedRegion = Object.keys(data.region_selected)[0];
        if (this.open_chart) {
            this.sandbox.region._in.push(selectedRegion);
        }
        $('#region_type_name').text(data.region_name);
        $('#show_all_regions_label').text('Alle ' + data.region_name_plural + ' zeigen');
        $('#btn-select-all-regions').text(data.buttons.region.select_all);
        $('#btn-deselect-all-regions').text(data.buttons.region.deselect_all);
        $('#btn-select-all-topregions').text(data.buttons.topregion.select_all);
        $('#btn-deselect-all-topregions').text(data.buttons.topregion.deselect_all);
        this.getCheckbox('show_bubble_lines').prop('checked', data.show_bubble_lines);
        this.getCheckbox('show_bubble_trails').prop('checked', data.show_bubble_trails);
        this.getSelect('view').prop('value', data.view);
        this.setScales();
        this.setIndicators(data.indicator.x, data.indicator.y, data.indicator.r);
        this.setTopRegions();
        this.draw();
        this.updateForm();
        this.setSuspend(this.config.events.CALCULATE_DATA_YEARS);
        this.setSuspend(this.config.events.PUSH);
        const topregionKeys = Object.keys(data.topregion_selected);
        for (let i of topregionKeys) {
            const selected = data.topregion_selected[i] === true;
            this.selectTopRegion(i, selected, MotionChart.CONST.SUSPEND.NO, true);
        }
        this.setRegions();
        this.isSelectAll = true;
        const regionKeys = Object.keys(data.region_map);
        for (let i of regionKeys) {
            const selected = data.region_selected[i] === true;
            this.selectRegion(i, selected, MotionChart.CONST.TRANSITION.NO);
            if (selected) {
                this.outRegion(i);
            }
        }
        this.isSelectAll = false;
        this.unsetSuspend(this.config.events.PUSH);
        this.setRegions();
        $('#label_topregion').text(data.topregion_name);
        this.resetSuspend();
        this.setIndicators(data.indicator.x, data.indicator.y, data.indicator.r);
        this.enterView(data.view);
        this.transition(false);
        this.open_chart = false;
        this.enablePanel(true);
    };
    MotionChart.Chart.prototype.nextYear = function() {
        this.info('nextYear');
        let year_index = this.getYearIndex(),
            year_index_max = this.getYearIndexMax();
        year_index = year_index + 1;
        if (year_index > year_index_max) {
            this.animation = false;
            return false;
        }
        this.setYearIndex(year_index);
        return true;
    };
    MotionChart.Chart.prototype.prevYear = function() {
        this.info('prevYear');
        let year_index = this.getYearIndex(),
            year_index_min = this.getYearIndexMin();
        year_index = year_index - 1;
        if (year_index < year_index_min) {
            return false;
        }
        this.setYearIndex(year_index);
        return true;
    };
    MotionChart.Chart.prototype.sortedRegionDict = function() {
        this.debug('sortedRegionDict');
        let sorted_region_dict = {},
            data = this.getDataYearDict(),
            bar_sort_order_asc = this.getData().bar_sort_order_asc,
            visible_regions = this.getVisibleRegions(),
            indicator_y = this.getIndicatorY();
        let sorted = _.sortBy(visible_regions, function(r) {
            return data[r.value][indicator_y];
        });
        if (!bar_sort_order_asc) {
            sorted.reverse();
        }
        for (let i = 0; i < sorted.length; i++) {
            sorted_region_dict[sorted[i].value] = i;
        }
        return sorted_region_dict;
    };
    MotionChart.Chart.prototype.isLastYearTransition = function() {
        if (this.lastYearTransition) {
            this.lastYearTransition = false;
            return this.getYearMax() === this.getYear();
        }
        return false;
    };
    MotionChart.Chart.prototype.transition = function(animate, update_order, duration, callback) {
        this.info('transition', 'animate =', animate, 'update_order =', update_order, 'duration =', duration, 'callback =', typeof callback);
        // Der Transition-Root war frueher <body>: jede selectAll() hat damit das
        // komplette Dokument durchsucht statt nur den Chart.
        let svg = this.svg.transition(),
            ctx = this.createRenderContext(),
            data = ctx.year_data,
            n = 0;
        duration = duration ? duration : this.config.transition.year.duration;
        this.activateControls(false);
        if (this.isViewBubbles()) {
            if (this.isShowBubbleTrails()) {
                // show_bubble_trails_once_more sorgt fuer genau einen letzten
                // Durchlauf, der die Spuren ausblendet. Der Render-Kontext ist
                // schon vor dem Zuruecksetzen gebaut worden und muss den neuen
                // Wert uebernehmen - sonst rechnet calculateBubbleTrailData noch
                // mit "Spuren an" und sie bleiben stehen.
                this.show_bubble_trails_once_more = false;
                ctx.show_bubble_trails = this.isShowBubbleTrails();
                svg.selectAll(".circle-bubble-trail").duration(duration).ease(d3.easeLinear).each((d) => {
                    this.calculateBubbleTrailData(d, ctx);
                }).attr("rx", function(d) {
                    return d.trail.final.corner;
                }).attr("ry", function(d) {
                    return d.trail.final.corner;
                }).attr("width", function(d) {
                    return d.trail.final.radius;
                }).attr("height", function(d) {
                    return d.trail.final.radius;
                }).attr("x", function(d) {
                    return d.trail.final.x;
                }).attr("y", function(d) {
                    return d.trail.final.y;
                }).style("fill", (d) => {
                    return this.getRegionColor(d['region_id']);
                }).style('opacity', function(d) {
                    return d.trail.final.opacity;
                }).on('end', function(d) {
                    d3.select(this).style('visibility', d.trail.final.visibility ? 'visible' : 'hidden');
                });
            }
            svg.selectAll(".circle").each((d, _i, _nodes) => {
                this.calculateBubbleData(_nodes[_i], d, ctx);
            }).duration(duration).ease(d3.easeLinear).tween("export", () => {
                return (t) => {
                    this.exportAnimationCallback(t);
                };
            }).style("visibility", function(d) {
                return d.bubble.final.visibility ? 'visible' : 'hidden';
            }).attr("rx", function(d) {
                return d.bubble.final.corner;
            }).attr("ry", function(d) {
                return d.bubble.final.corner;
            }).attr("width", function(d) {
                return d.bubble.final.radius;
            }).attr("height", function(d) {
                return d.bubble.final.radius;
            }).attr("x", function(d) {
                return d.bubble.final.x;
            }).attr("y", function(d) {
                return d.bubble.final.y;
            }).style("fill", (d) => {
                return this.getRegionColor(d['region_id']);
            }).style('opacity', function(d) {
                let opacity = d.bubble.final.opacity;
                if (opacity === 1) {
                    opacity = ctx.region_selected[d.region_id] === true ? ctx.opacity_selected : ctx.opacity_standard;
                }
                return opacity;
            }).on('start', function() {
                n++;
            }).on('end', () => {
                n--;
                if (n === 0) {
                    this.updateFormYear();
                    this.updateFormYearSlider();
                    this.activateControls(true);
                    let next_year;
                    if (animate) {
                        if (this.stop_animation === true) {
                            this.stop_animation = false;
                            this.getButton('stop').prop('disabled', true);
                        } else {
                            if (this.nextYear() || this.isLastYearTransition()) {
                                this.transition(animate, update_order, duration, callback);
                                next_year = this.getYear();
                            } else {
                                this.updateOrder();
                            }
                        }
                    } else if (update_order) {
                        this.updateOrder();
                    }
                    if (callback) {
                        callback(next_year);
                    }
                }
            });
            let target_year_index = this.getYearIndex(),
                old_year_index = this.getOldYearIndex(),
                up = target_year_index > old_year_index,
                down = target_year_index < old_year_index,
                distance = Math.abs(target_year_index - old_year_index),
                year_count = this.getData().years.length;
            const total_length_of = (node) => {
                let length = node.__total_length;
                return length === undefined ? Number.parseFloat(node.getAttribute('total-length')) : length;
            };
            const line_animate = (year_index, on) => {
                this.selectBubbleLineByYear(year_index).style('visibility', 'visible').transition().duration(duration).ease(d3.easeLinear).style("stroke", (d) => {
                    return this.getRegionColor(d['region_id']);
                }).attr("stroke-dashoffset", (d, _i, _nodes) => {
                    let total_length = total_length_of(_nodes[_i]);
                    return (on && this.isRegionSelected(d.region_id)) ? 0 : total_length;
                });
            };
            // Statt pro Pfad eine d3-Selektion zu bauen und year_id/total-length
            // aus dem DOM zu lesen, laeuft das hier direkt ueber die Kindknoten
            // der Gruppe; die Jahresspanne ist immer zusammenhaengend.
            const line_visibility = (visibility, lo, hi) => {
                const offset_visible = visibility === 'visible';
                this.svg.selectAll('.bubble-line-group').each((d, _i, _nodes) => {
                    const group = _nodes[_i],
                        selected = this.isRegionSelected(d.region_id),
                        color = selected ? this.getRegionColor(d.region_id) : null,
                        paths = group.childNodes;
                    for (let k = 0; k < paths.length; k++) {
                        const path = paths[k];
                        if (!selected) {
                            path.style.visibility = 'hidden';
                            continue;
                        }
                        const year_id = path.__year_id;
                        if (year_id < lo || year_id >= hi) {
                            continue;
                        }
                        path.style.visibility = visibility;
                        path.style.stroke = color;
                        path.setAttribute('stroke-dashoffset', offset_visible ? 0 : total_length_of(path));
                    }
                });
            };
            if (distance === 1) {
                if (up) {
                    line_visibility('visible', 0, old_year_index);
                    line_visibility('hidden', target_year_index, year_count);
                    line_animate(old_year_index, true);
                }
                else if (down) {
                    line_animate(target_year_index, false);
                    line_visibility('visible', 0, target_year_index);
                    line_visibility('hidden', target_year_index, year_count);
                }
            } else {
                line_visibility('visible', 0, target_year_index);
                line_visibility('hidden', target_year_index, year_count);
            }
        }
        else if (this.isViewBars()) {
            let region_index = this.sortedRegionDict();
            this.svg.selectAll('.bar').transition().duration(duration).tween("export", () => {
                return (t) => {
                    this.exportAnimationCallback(t);
                };
            }).each((d) => {
                let bar = d.bar;
                if (bar === undefined) {
                    bar = d.bar = {
                        indicator: {},
                        scaled: {},
                        final: {}
                    };
                }
                let indicator = bar.indicator,
                    scaled = bar.scaled,
                    final = bar.final,
                    domain_y_0 = ctx.domain_y_0,
                    scale_y = ctx.scale_y,
                    y_axis_pos = domain_y_0 >= 0,
                    height;
                indicator.x = region_index[d.value];
                indicator.y = data[d.value][ctx.indicator_y];
                indicator.domains_y_0 = domain_y_0;
                indicator.width = 1;
                let indicator_pos = indicator.y >= 0;
                bar.y_axis_pos = y_axis_pos;
                bar.indicator_pos = indicator_pos;
                if (indicator_pos) {
                    if (y_axis_pos) {
                        height = Math.max(0, scale_y(domain_y_0) - scale_y(indicator.y));
                    } else {
                        height = scale_y(0) - scale_y(indicator.y);
                    }
                } else {
                    if (y_axis_pos) {
                        throw new Error('illegal axis');
                    }
                    height = scale_y(indicator.y) - scale_y(0);
                }
                scaled.x = ctx.scale_x(indicator.x);
                scaled.y = indicator_pos ? scale_y(indicator.y) : scale_y(0);
                scaled.width = ctx.scale_x(indicator.width);
                scaled.height = height;
                final.x = this.defaultNumber(scaled.x, 0);
                final.y = this.defaultNumber(scaled.y, 0);
                final.width = this.defaultNumber(scaled.width, 0);
                final.height = this.defaultNumber(scaled.height, 0);
                bar.valid = this.isNumber(scaled.x) && this.isNumber(scaled.y) && this.isNumber(scaled.width) && this.isNumber(scaled.height) && this.isNumber(final.x) && this.isNumber(final.y) && this.isNumber(final.width) && this.isNumber(final.height);
            }).style("visibility", (d) => {
                return d.bar.valid && this.isRegionVisibleFast(ctx, d.value, d.topregion) ? 'visible' : 'hidden';
            }).attr('x', function(d) {
                return d.bar.final.x;
            }).attr('y', function(d) {
                return d.bar.final.y;
            }).attr('width', function(d) {
                return d.bar.final.width;
            }).attr('height', function(d) {
                return d.bar.final.height;
            }).style('opacity', (d) => {
                return ctx.region_selected[d.value] === true ? ctx.opacity_bar_selected : ctx.opacity_bar_standard;
            }).style('stroke', (d) => {
                return this.getRegionColor(d.value);
            }).style('fill', (d) => {
                return this.getRegionColor(d.value);
            }).on('start', function() {
                n++;
            }).on('end', () => {
                n--;
                if (n === 0) {
                    this.updateFormYear();
                    this.updateFormYearSlider();
                    this.activateControls(true);
                    let next_year;
                    if (animate) {
                        if (this.stop_animation === true) {
                            this.stop_animation = false;
                            this.getButton('stop').prop('disabled', true);
                        } else {
                            if (this.nextYear() || this.isLastYearTransition()) {
                                this.transition(animate, update_order, duration, callback);
                                next_year = this.getYear();
                            }
                        }
                    }
                    if (callback) {
                        callback(next_year);
                    }
                }
            });
        }
        else if (this.isViewLines()) {
            let data = this.getData();
            let region_lines = data.region_lines;
            this.svg.selectAll('.tline').transition().duration(duration).tween("export", () => {
                return (t) => {
                    this.exportAnimationCallback(t);
                };
            }).attr('d', (d) => {
                return this.time_line_fn(region_lines[d.value]);
            }).style('stroke', (d) => {
                return this.getRegionColor(d.value);
            }).style("visibility", (d) => {
                return this.isRegionVisibleFast(ctx, d.value, d.topregion) ? 'visible' : 'hidden';
            }).style('opacity', function(d) {
                return ctx.region_selected[d.value] === true ? ctx.opacity_line_selected : ctx.opacity_line_standard;
            }).on('start', function() {
                n++;
            }).on('end', () => {
                n--;
                if (n === 0) {
                    this.activateControls(true);
                    if (callback) {
                        callback();
                    }
                }
            });
            this.svg.selectAll('.dot').transition().duration(duration).each((d) => {
                let dot = d.dot;
                if (dot === undefined) {
                    dot = d.dot = {
                        indicator: {},
                        scaled: {},
                        final: {}
                    };
                }
                let indicator = dot.indicator,
                    scaled = dot.scaled,
                    final = dot.final;
                indicator.x = d.year;
                indicator.y = d[ctx.indicator_y];
                scaled.x = ctx.scale_x(indicator.x);
                scaled.y = ctx.scale_y(indicator.y);
                final.x = this.defaultNumber(scaled.x, 0);
                final.y = this.defaultNumber(scaled.y, 0);
                dot.valid = this.isNumber(indicator.x) && this.isNumber(indicator.y) && this.isNumber(scaled.x) && this.isNumber(scaled.y);
            }).style("visibility", (d) => {
                return d.dot.valid && this.isRegionVisibleFast(ctx, d.region_id, d.topregion_id) ? 'visible' : 'hidden';
            }).attr("cx", function(d) {
                return d.dot.final.x;
            }).attr("cy", function(d) {
                return d.dot.final.y;
            }).style('stroke', (d) => {
                return this.getRegionColor(d.region_id);
            }).style('opacity', function(d) {
                return ctx.region_selected[d.region_id] === true ? ctx.opacity_line_selected : ctx.opacity_line_standard;
            });
            this.svg.selectAll('.timeline-label').transition().duration(duration).each(function(d) {
                let value = null,
                    some_values = false,
                    indicator = ctx.indicator_y,
                    lines = region_lines[d.value];
                for (let k = 0; k < lines.length; k++) {
                    let item_value = lines[k][indicator];
                    if (item_value !== null) {
                        value = item_value;
                    }
                    if (item_value) {
                        some_values = true;
                    }
                }
                d.label_value = value;
                d.label_some_values = some_values;
            }).attr('y', (d) => {
                return this.scales.y(d.label_value === null ? 0 : d.label_value);
            }).style('fill', (d) => {
                return this.getRegionColor(d.value);
            }).style('opacity', function(d) {
                return (ctx.region_selected[d.value] === true && d.label_some_values) ? 1 : 0;
            });
        }
    };
    MotionChart.Chart.prototype.updateForm = function() {
        this.debug('updateForm');
        this.updateFormIndicators();
        this.updateFormYear();
        this.updateFormYearSlider();
        this.updateFormColors();
        this.updateFormRadius();
    };
    MotionChart.Chart.prototype.updateFormRadius = function() {
        this.debug('updateFormRadius');
        let data = this.getData();
        function populate(id, data, value) {
            $('#' + id).children('option').remove();
            d3.select('#' + id).selectAll("option").data(data).enter().append('option').text(function(d) {
                return d + 'px';
            }).attr('value', function(d) {
                return d;
            });
            d3.select('#' + id).property('value', value);
        }
        populate('radius_lo', data.radius_lo_available, data.radius_lo);
        populate('radius_hi', data.radius_hi_available, data.radius_hi);
    };
    MotionChart.Chart.prototype.updateFormColors = function() {
        this.debug('updateFormColors');
        $('#color').children('option').remove();
        d3.select('#color').selectAll("option").data(this.getData().color_schemes).enter().append("option").text(function(d) {
            return d.text;
        }).attr("value", function(d) {
            return d.value;
        });
        d3.select('#color').property('value', this.getData().color_scheme);
    };
    MotionChart.Chart.prototype.updateFormIndicators = function() {
        this.debug('updateFormIndicators');
        let data = this.getData(),
            indicators = data.indicators,
            indicator = data.indicator;
        let populate = function(id, zeit) {
            $('#' + id).children('option').remove();
            let _indicators;
            if (zeit) {
                _indicators = _.filter(indicators, function() {
                    return true
                });
            } else {
                _indicators = _.filter(indicators, function(d) {
                    return d.value !== 'year';
                });
            }
            let combo = d3.select('#' + id);
            let options = combo.selectAll("option").data(_indicators).enter().append("option");
            options.text(function(d) {
                return d.text;
            }).attr("value", function(d) {
                return d.value;
            });
        };
        populate('indicator_x', true);
        populate('indicator_y', false);
        populate('indicator_r', false);
        let set = function(id, value) {
            d3.select('#' + id).property('value', value);
        };
        set('indicator_x', indicator.x);
        set('indicator_y', indicator.y);
        set('indicator_r', indicator.r);
    };
    MotionChart.Chart.prototype.updateFormYear = function() {
        this.debug('updateFormYear');
        let year = this.getYear();
        this.dom.year.text(year);
        this.year_label.text(year);
        this.dom.year_min.text(this.getYearMin());
        this.dom.year_max.text(this.getYearMax());
    };
    MotionChart.Chart.prototype.updateFormYearSlider = function() {
        this.debug('updateFormYearSlider');
        this.dom.slider.slider('value', this.getYear());
        this.dom.slider.slider('option', 'min', this.getYearMin());
        this.dom.slider.slider('option', 'max', this.getYearMax());
        this.slider.value_silent(this.getYear());
    };
    MotionChart.Chart.prototype.play = function(callback) {
        this.info('play');
        this.animation = true;
        this.getButton('stop').prop('disabled', false);
        if (this.getYearIndex() === this.getYearIndexMax()) {
            this.setYearIndex(this.getYearIndexMin());
            this.transition(true, null, null, callback);
        } else {
            this.nextYear();
            this.transition(true, null, null, callback);
        }
    };
    MotionChart.Chart.prototype.stop = function() {
        this.info('stop');
        this.animation = false;
        this.stop_animation = true;
    };
    MotionChart.Chart.prototype.rewind = function(callback) {
        this.info('rewind');
        if (this.getYearIndex() > this.getYearIndexMin()) {
            this.setYearIndex(this.getYearIndexMin());
            this.transition(false, null, null, callback);
        } else {
            callback.call(null);
        }
    };
    MotionChart.Chart.prototype.end = function() {
        this.info('end');
        if (this.getYearIndex() < this.getYearIndexMax()) {
            this.setYearIndex(this.getYearIndexMax());
            this.transition(false);
        }
    };
    MotionChart.Chart.prototype.next = function() {
        this.info('next');
        if (this.nextYear()) {
            this.transition(false);
        }
    };
    MotionChart.Chart.prototype.prev = function() {
        this.info('prev');
        if (this.prevYear()) {
            this.transition(false);
        }
    };
    MotionChart.Chart.prototype.selectAllRegions = function(selected) {
        this.info('selectAllRegions', selected);
        this.isSelectAll = true;
        const regions = this.getData().regions;
        for (let i of regions) {
            if (this.isTopRegionSelected(i.topregion)) {
                if (this.isRegionSelected(i.value) !== selected) {
                    this.selectRegion(i.value, selected, MotionChart.CONST.TRANSITION.NO);
                    this.outRegion(i.value);
                }
            }
        }
        this.enterView(this.getView(), MotionChart.CONST.TRANSITION.YES);
        this.isSelectAll = false;
    };
    MotionChart.Chart.prototype.selectAllTopRegions = function(selected) {
        this.info('selectAllTopRegions', selected);
        this.setSuspend(this.config.events.CALCULATE_DATA_YEARS);
        const topregions = this.getData().topregions;
        for (let i of topregions) {
            if (this.isTopRegionSelected(i.value) !== selected) {
                this.selectTopRegion(i.value, selected, MotionChart.CONST.SUSPEND.NO, true);
                this.outTopRegion(i.value);
            }
        }
        this.setRegions();
        this.resetSuspend();
        this.enterView(this.getView(), MotionChart.CONST.TRANSITION.YES);
    };
    MotionChart.Chart.prototype.alertCommunicationError = function() {
        $.alert({
            icon: 'fa fa-exclamation-triangle',
            title: 'Fehler',
            content: 'Kommunikationsfehler',
            confirmButton: 'Ok',
            confirmButtonClass: 'btn-success',
            keyboardEnabled: true
        });
    };
    MotionChart.Chart.prototype.alertNote = function(text, callback) {
        $.alert({
            icon: 'fa fa-warning',
            title: 'Hinweis',
            content: text,
            keyboardEnabled: true,
            buttons: {
                close: {
                    text: 'Ok',
                    btnClass: 'btn-success',
                    action: callback
                }
            }
        });
    };
    MotionChart.Chart.prototype.confirm = function(text, callback_confirm, callback_cancel) {
        $.confirm({
            icon: 'fa fa-warning',
            title: 'Bestätigung',
            content: text,
            buttons: {
                confirm: {
                    text: 'Ja',
                    btnClass: 'btn-danger',
                    action: function() {
                        if (callback_confirm) {
                            callback_confirm();
                        }
                    }
                },
                cancel: {
                    text: 'Nein',
                    btnClass: 'btn-default',
                    action: function() {
                        if (callback_cancel) {
                            callback_cancel();
                        }
                    }
                }
            }
        });
    };
    MotionChart.Chart.prototype.initChartsForm = function() {
        this.info('initChartsForm');
        if (d3.select('#fg_charts_form').size() === 0) {
            this.info('initChartsForm', 'not authenticated');
            this.is_authenticated = false;
            return;
        }
        d3.select('#fg_charts_form').style('display', 'none');
        this.getButton('open').on('click', this.open.bind(this));
        this.getButton('save').on('click', this.save.bind(this));
        this.getButton('delete').on('click', this.delete.bind(this));
        this.getButton('refresh').on('click', this.refresh.bind(this));
        this.getButton('save_confirm').on('click', this.saveConfirm.bind(this));
        this.getButton('save_cancel').on('click', this.saveCancel.bind(this));
        this.refresh();
    };
    MotionChart.Chart.prototype.chartHeaders = function() {
        this.info('chartHeaders');
        return {
            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
        };
    };
    MotionChart.Chart.prototype.open = function() {
        this.info('open');
        this.open_chart = true;
        let id = $('input[name=chartid]:checked', '#motion_chart_form').val();
        if (!id) {
            return;
        } else {
            id = parseInt(id);
        }
        this.info('open', id);
        let loading = this.startLoading('open', 'Lade Motion Chart');
        this.exitView(this.getView(), () => {
            reqwest({
                url: this.config.urls.load,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                headers: this.chartHeaders(),
                data: JSON.stringify({
                    id: id
                }),
                success: (resp) => {
                    this.stopLoading(loading);
                    this.alertNote('Motion Chart erfolgreich geladen', () => {
                        this.init(null, resp);
                    });
                },
                error: () => {
                    this.stopLoadingForced(loading);
                    this.alertCommunicationError();
                }
            });
        });
    };
    MotionChart.Chart.prototype.openTmp = function(uuid) {
        this.info('openTmp', uuid);
        let loading = this.startLoading('openTmp', 'Vollbildmodus ' + (this.fullscreen ? 'ein' : 'aus'));
        this.enablePanel(false);
        reqwest({
            url: this.config.urls.load_tmp,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            headers: this.chartHeaders(),
            data: JSON.stringify({
                uuid: uuid
            }),
            success: (resp) => {
                this.stopLoading(loading);
                if (this.initial_loading) {
                    this.stopLoading(this.initial_loading);
                    this.initial_loading = null;
                }
                this.init(null, resp);
            },
            error: () => {
                this.stopLoadingForced(loading);
                this.alertCommunicationError();
                this.enablePanel(true);
            }
        });
    };
    MotionChart.Chart.prototype.save = function() {
        this.info('save');
        d3.select('#fg_charts_form').style('display', 'block');
        d3.select('#fg_charts_table').style('display', 'none');
        d3.select('#chart_title').property('value', '');
        d3.select('#chart_description').property('value', '');
    };
    MotionChart.Chart.prototype.delete = function() {
        this.info('delete');
        let id = $('input[name=chartid]:checked', '#motion_chart_form').val();
        if (!id) {
            return;
        } else {
            id = parseInt(id);
        }
        this.info('delete', id);
        this.confirm('Möchten Sie den Motion Chart wirklich löschen?', () => {
            let loading = this.startLoading('delete', 'Lösche Motion Chart');
            reqwest({
                url: this.config.urls.delete,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                headers: this.chartHeaders(),
                data: JSON.stringify({
                    id: id
                }),
                success: () => {
                    d3.timeout(() => {
                        this.stopLoading(loading);
                        this.alertNote('Motion Chart erfolgreich gelöscht', () => {
                            this.refresh();
                        });
                    }, this.config.loading.delay);
                },
                error: () => {
                    this.stopLoadingForced(loading);
                    this.alertCommunicationError();
                }
            });
        });
    };
    MotionChart.Chart.prototype.refresh = function() {
        this.info('refresh');
        let loading = this.startLoading('refresh', 'Aktualisiere meine Charts');
        reqwest({
            url: this.config.urls.list,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
            },
            data: JSON.stringify({
                region_type: this.config.region_type
            }),
            success: (resp) => {
                $("#charts_table_body").empty();
                _.each(resp.data, function(row) {
                    let tpl = Faktencheck.template('<tr><td><input type="radio" name="chartid" value="{{id}}"></td><td style="text-transform: capitalize;">{{chart_type}}</td><td>{{title}}</td></tr>', row);
                    $("#charts_table_body").append(tpl);
                });
                d3.timeout(() => {
                    this.stopLoading(loading);
                }, this.config.loading.delay);
            },
            error: () => {
                this.stopLoadingForced(loading);
                this.alertCommunicationError();
            }
        });
    };
    MotionChart.Chart.prototype.saveConfirm = function() {
        this.info('saveConfirm');
        let title = d3.select('#chart_title').property('value'),
            description = d3.select('#chart_description').property('value');
        if (title.length === 0) {
            this.alertNote('Sie müssen mindestens einen Titel zum Speichern eingeben');
            return;
        }
        let save_data = this.saveData(title, description),
            loading = this.startLoading('saveConfirm', 'Speichere Motion Chart');
        reqwest({
            url: this.config.urls.save,
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
            },
            data: JSON.stringify(save_data),
            success: () => {
                d3.timeout(() => {
                    this.stopLoading(loading);
                    d3.select('#fg_charts_form').style('display', 'none');
                    d3.select('#fg_charts_table').style('display', 'block');
                    this.alertNote('Motion Chart erfolgreich gespeichert', () => {
                        this.refresh();
                    });
                }, this.config.loading.delay);
            },
            error: () => {
                this.stopLoadingForced(loading);
                d3.select('#fg_charts_form').style('display', 'none');
                d3.select('#fg_charts_table').style('display', 'block');
                this.alertCommunicationError();
            }
        });
    };
    MotionChart.Chart.prototype.saveCancel = function() {
        this.info('saveCancel');
        d3.select('#fg_charts_form').style('display', 'none');
        d3.select('#fg_charts_table').style('display', 'block');
    };
    MotionChart.Chart.prototype.saveData = function(title, description) {
        this.info('saveData');
        let year = this.getYear(),
            data = this.getData();
        return {
            title: title,
            description: description,
            chart_type: data.region_type,
            view: data.view,
            indicator: data.indicator,
            scale: data.scale,
            year: year,
            region_selected: data.region_selected,
            topregion_selected: data.topregion_selected,
            show_all_regions: data.show_all_regions,
            show_bubble_lines: data.show_bubble_lines,
            show_bubble_trails: data.show_bubble_trails,
            bar_sort_order_asc: data.bar_sort_order_asc,
            color_scheme: data.color_scheme,
            custom_colors: data.custom_colors,
            zoom: data.zoom,
            radius_lo: data.radius_lo,
            radius_hi: data.radius_hi,
            last_selected_region_id: this.last_selected_region_id
        };
    };
    MotionChart.Chart.prototype._export = function(exportType) {
        this.info('export' + exportType);
        let view = null,
            timestamp = (new Date()).getTime(),
            data = this.getDataYearDict();
        switch (this.getView()) {
        case MotionChart.CONST.VIEW.LINES:
            view = 'liniendiagramm';
            this.getIndicatorName(this.getIndicatorY());
            break;
        case MotionChart.CONST.VIEW.BUBBLES:
            view = 'streudiagramm';
            this.getIndicatorName(this.getIndicatorX());
            this.getIndicatorName(this.getIndicatorY());
            this.getIndicatorName(this.getIndicatorR());
            break;
        case MotionChart.CONST.VIEW.BARS:
            view = 'saeulendiagramm';
            this.getIndicatorName(this.getIndicatorY());
            break;
        default:
            throw new Error('unknnown view type');
        }
        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
        }
        _.each(this.data.regions, (r) => {
            let record;
            if (this.isRegionSelected(r.value)) {
                record = {
                    id: r.value,
                    name: r.text,
                    color: rgb2hex(this.getRegionColor(r.value))
                };
                switch (this.getView()) {
                case MotionChart.CONST.VIEW.LINES:
                    record.columns = [];
                    break;
                case MotionChart.CONST.VIEW.BUBBLES:
                    record.columns = [this.getIndicatorFormatValue(this.getIndicatorX(), data[r.value][this.getIndicatorX()]), this.getIndicatorFormatValue(this.getIndicatorY(), data[r.value][this.getIndicatorY()]), this.getIndicatorFormatValue(this.getIndicatorR(), data[r.value][this.getIndicatorR()])];
                    break;
                case MotionChart.CONST.VIEW.BARS:
                    record.columns = [this.getIndicatorFormatValue(this.getIndicatorY(), data[r.value][this.getIndicatorY()])];
                    break;
                default:
                    throw new Error('unknnown view type');
                }
            }
        });
        let vdata = {
            'filename': 'motion-chart-' + this.data.region_type + '-' + view + '-' + timestamp,
            'image-container': 'chart',
        };
        $('body').attr('data-filename', vdata.filename).attr('data-image-container', vdata["image-container"]);
        let loading = this.startLoading('export' + exportType, 'Bitte warten, der Download beginnt in Kürze...');
        _.delay(() => {
            this.resize(this.config.export.size.width, this.config.export.size.height, true);
            _.delay(() => {
                this.player_controls.style('visibility', 'hidden');
                jsm.api.export._exportImage($('body'), true);
                this.player_controls.style('visibility', 'visible');
                this.resize();
                _.delay(() => {
                    this.stopLoading(loading);
                }, this.config.export.delay);
            }, this.config.export.delay_view);
        }, this.config.export.delay);
    };
    MotionChart.Chart.prototype.exportPNG = function() {
        this._export("png")
    };
    MotionChart.Chart.prototype.exportAnimation = function() {
        this.info('exportAnimation');
        let old = this.config.transition.year.duration;
        if (this.getView() === MotionChart.CONST.VIEW.LINES) {
            return this.alertNote('Liniendiagramme können nicht als Animation exportiert werden');
        }
        const do_export = () => {
            function Uint8ToStringBase64(bytes) {
                let binary = '';
                let len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            }
            let loading = this.startLoading('exportAnimation', 'Der Export der Animation beginnt in kürze..');
            const play_callback = (next_year) => {
                this.info('exportAnimation: play_callback', next_year);
                if (next_year === null) {
                    this.info('exportAnimation: finished export');
                    reqwest({
                        url: this.config.urls.export_start,
                        method: 'post',
                        type: 'json',
                        contentType: 'application/json',
                        headers: {
                            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
                        },
                        data: {},
                        success: (resp) => {
                            this.info('exportAnimation: started export', resp);
                            let total_frames = this.export_animation.frames.length;
                            const export_frame = (export_id, frames) => {
                                let post = frames.shift();
                                if (post) {
                                    this.info('exportAnimation: clean');
                                    if (bowser.msie) {
                                        this.info('exportAnimation: skip clean in IE');
                                    } else {
                                        for (let i = 0; i < post.length; i++) {
                                            post[i] = post[i].replace(this.config.export.regex, '');
                                        }
                                    }
                                    this.info('exportAnimation: cleaned');
                                    let input = JSON.stringify(post),
                                        buf = pako.deflate(input),
                                        compressed = Uint8ToStringBase64(buf);
                                    this.info('exportAnimation: compressed', input.length, '->', compressed.length);
                                    this.info('url', this.config.urls.export_frame);
                                    reqwest({
                                        url: this.config.urls.export_frame,
                                        method: 'post',
                                        headers: {
                                            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
                                        },
                                        data: {
                                            export_id: export_id,
                                            frames: compressed
                                        },
                                        success: () => {
                                            this.info('exportAnimation: successfully posted frames');
                                            this.startLoading('exportAnimationFrame', 'Frame ' + (total_frames - frames.length) + '/' + total_frames + ' übertragen');
                                            _.delay(function() {
                                                export_frame(export_id, frames);
                                            }, 300);
                                        },
                                        error: () => {
                                            this.stopLoadingForced(loading);
                                            this.alertCommunicationError();
                                        }
                                    });
                                } else {
                                    this.export_animation = null;
                                    this.config.transition.year.duration = old;
                                    this.startLoading('export_frame_done', 'Gespeichert');
                                    this.info('exportAnimation: successfully posted all frames');
                                    reqwest({
                                        url: this.config.urls.export_end,
                                        method: 'post',
                                        headers: {
                                            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
                                        },
                                        data: {
                                            export_id: export_id
                                        },
                                        success: (resp) => {
                                            this.info('exportAnimation: done', resp);
                                            this.stopLoading(loading);
                                            this.player_controls.style('visibility', 'visible');
                                            this.alertNote('Ihre Motion-Chart Animation wird erstellt.<br>Sie werden nach Fertigstellung per EMail benachrichtigt.<br>Referenz-Nr: ' + resp.task);
                                        },
                                        error: () => {
                                            this.stopLoadingForced(loading);
                                            this.alertCommunicationError();
                                        }
                                    });
                                }
                            };
                            this.info('exportAnimation: start exporting frames');
                            export_frame(resp.id, this.export_animation.frames);
                        },
                        error: () => {
                            this.stopLoadingForced(loading);
                            this.alertCommunicationError();
                        }
                    });
                }
            };
            const start = () => {
                this.config.transition.year.duration = this.config.transition.export.duration;
                this.export_animation = {
                    elapsed: null,
                    frame_size: 5,
                    frames: [[]]
                };
                this.player_controls.style('visibility', 'hidden');
                this.play(play_callback);
            };
            this.rewind(start);
        };
        this.confirm('Möchten Sie einen Film der Animation exportieren?', () => {
            if (bowser.msie) {
                this.confirm('Der Export ist im Internet Explorer sehr langsam. Wir empfehlen einen anderen Browser. Möchten Sie trotzdem fortfahren?', function() {
                    do_export();
                });
            } else {
                do_export();
            }
        });
    };
    MotionChart.Chart.prototype.exportAnimationCallback = function(elasped) {
        if (this.export_animation) {
            if (this.export_animation.elasped !== elasped) {
                this.export_animation.elasped = elasped;
                let container = document.getElementById('chart');
                let last = _.last(this.export_animation.frames);
                if (last.length >= this.export_animation.frame_size) {
                    last = [];
                    this.export_animation.frames.push(last);
                }
                last.push('' + container.outerHTML);
                this.startLoading('exportAnimationCallback', 'Exportiere Batch ' + this.export_animation.frames.length + '/' + last.length);
            }
        }
    };
    MotionChart.Chart.prototype.startLoading = function(info, text) {
        let newText = text ? text : 'Loading...';
        let token = {
            id: Date.now(),
            info: info,
            text: newText,
            created: false
        };
        if (this.loading === null) {
            $('body').waitMe({
                effect: 'bounce',
                text: text,
                bg: 'rgba(255,255,255,0.7)',
                color: '#e2001a'
            });
            $('body .waitMe').css('z-index', this.config.export.waitme_zindex);
            token.created = true;
            this.loading = token;
        } else {
            $('body .waitMe_text').text(text);
        }
        this.info('startLoading', token.created ? 'created' : 'updated', token);
        return token;
    };
    MotionChart.Chart.prototype.stopLoading = function(token, force) {
        if (force === true) {
            this.loading = null;
            $('body .waitMe').remove();
            this.info('stopLoading', 'forced', token);
            return true;
        }
        else if (this.loading && this.loading.id === token.id) {
            this.loading = null;
            $('body .waitMe').remove();
            this.info('stopLoading', 'removed', token);
            return true;
        } else {
            this.info('stopLoading', 'skipped', token);
            return false;
        }
    };
    MotionChart.Chart.prototype.stopLoadingForced = function(token) {
        return this.stopLoading(token, true);
    };
});
;
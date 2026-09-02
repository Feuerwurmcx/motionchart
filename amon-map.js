$(document).ready(function() {
    const GERMANY_BOUNDS = [[47.2708333, 5.8669444], [55.0591667, 15.0436111]];

    // Flexregionen sind nur sichtbar, solange sie ausgewaehlt sind. Liefert
    // true, wenn der Layer damit abschliessend behandelt ist.
    function hideUnselectedFlexregion(layer, selected) {
        const info = layer.feature.properties.layer;
        if (!info || info.name !== "Flexregion") {
            return false;
        }
        const element = layer.getElement();
        if (selected) {
            if (element) {
                element.removeAttribute('hidden');
            }
            return false;
        }
        layer.setStyle({
            opacity: 0,
            fillColor: "#00000000"
        });
        if (element) {
            element.setAttribute('hidden', true);
        }
        return true;
    }
    function bringSelectedToFront(layer) {
        if (layer._renderer && layer._path && layer._path.parentNode) {
            layer.bringToFront();
            return;
        }
        // once() mit Kontext statt on() mit bind(): Leaflet erkennt das Paar
        // wieder und haengt nicht bei jedem Repaint einen weiteren Handler an,
        // der nie wieder entfernt wird.
        layer.once('add', layer.bringToFront, layer);
    }
    Bacon.fromLeafletEvent = function(target, eventType) {
        return Bacon.fromBinder(function(sink) {
            // Abgemeldet wurde frueher sink() statt des tatsaechlich
            // registrierten Handlers. Leaflet hat den Listener deshalb nie
            // wieder entfernt und jede Neuanmeldung kam obendrauf.
            const handler = function(ev) {
                sink(ev);
            };
            target.on(eventType, handler);
            return function() {
                target.off(eventType, handler);
            };
        });
    };
    Bacon.fromLeafletLayerEvent = function(layer, eventType) {
        return Bacon.fromLeafletEvent(layer, eventType).map(function(ev) {
            return ev.target.feature.properties.region;
        });
    };
    amon.Map = L.Map.extend({
        options: {
            headerControl: true,
            legendControl: true,
            slideMenu: true,
            scrollWheelZoom: !L.Browser.ie,
            doubleClickZoom: false,
            dragging: true,
            minZoom: 5,
            zoomSnap: 0,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 150,
        },
        // Basisstil, aus dem jeder Repaint sich eine Kopie zieht. Liegt auf
        // dem Prototyp und darf daher nicht veraendert werden.
        layerStyle: {
            weight: 1,
            color: "#000000",
            opacity: 1,
            fillColor: '#ffffff',
            fillOpacity: 0.5,
        },
        addGeoJSONLayer: function(geojson, name) {
            if (name) {
                this.layers[name] = geojson;
            } else {
                console.warn('amon.Map: GeoJSON-Layer ohne Namen wird verworfen');
            }
        },
        selectLayer: function(name) {
            if (this.selectedLayer === name) {
                return;
            }
            _.each(this.layers, (geojson, layerName) => {
                if (layerName === name) {
                    this.addLayer(geojson);
                    this.selectedLayer = name;
                } else if (layerName === this.lastLayer) {
                    this.removeLayer(geojson);
                }
            });
            this.lastLayer = this.selectedLayer || name;
        },
        eachLayer: function(fn, context) {
            const layers = this.layers || {};
            if (Object.keys(layers).length === 0) {
                // Der Aufruf lief frueher ohne .call(this, ...). Damit war this
                // der Prototyp, dessen _layers undefined ist - die Schleife lief
                // ins Leere, statt auf Leaflets eigene Layer zurueckzufallen.
                L.Map.prototype.eachLayer.call(this, fn, context);
                return this;
            }
            _.each(layers, function(geojson) {
                _.each(geojson._layers, function(layer) {
                    fn.call(context, layer);
                });
            });
            return this;
        }
    });
    // Alles Veraenderliche gehoert an die Instanz. Was in extend() steht, legt
    // Leaflet auf dem Prototyp ab und teilen sich damit alle Karten - zwei
    // amon.Map-Instanzen haetten sonst dieselbe layers-Sammlung und dieselben
    // Buses benutzt. Dieser Hook ist zuerst registriert und laeuft deshalb vor
    // dem eigentlichen Aufbau weiter unten.
    amon.Map.addInitHook(function() {
        this.layers = {};
        this.selectedLayer = null;
        this.lastLayer = null;
        this.selectedFeatureLayer = null;
        this.repaintQueue = new Bacon.Bus();
        this.resizeTrigger = new Bacon.Bus();
        this.triggerCenter = new Bacon.Bus();
        this.data = new Bacon.Bus();
        this.currentLayer = new Bacon.Bus();
        this.currentSelection = new Bacon.Bus();
        this.currentSelectionIn = new Bacon.Bus();
    });
    amon.Map.addInitHook(function() {
        this.attributionControl.setPrefix("");
        this.attributionControl.setPosition('bottomright');
        this.validData = this.data.filter(function(data) {
            return data.hasOwnProperty("data");
        });
        this.takeRegion = this.data.map((data) => {
            this.regionId = data.region_id;
            return true;
        });
        let layerOrder = this.data.map(function(data) {
            return data.layerOrder;
        });
        let geoLayers = {
            "Staaten": FORCE_SCRIPT_NAME + '/ammservice/ebene/staat/',
            "Bundesländer": FORCE_SCRIPT_NAME + '/ammservice/ebene/bundesland/',
            "Arbeitsagenturen": FORCE_SCRIPT_NAME + '/ammservice/ebene/arbeitsagentur/',
            "Arbeitsmarktregionen": FORCE_SCRIPT_NAME + '/ammservice/ebene/arbeitsmarktregion/',
            "Kreise": FORCE_SCRIPT_NAME + '/ammservice/ebene/kreis/',
            "Flexregionen": FORCE_SCRIPT_NAME + '/ammservice/ebene/flexregion/?',
            'NUTS-0-Regionen': FORCE_SCRIPT_NAME + '/ammservice/ebene/nuts-0-region/',
            'NUTS-1-Regionen': FORCE_SCRIPT_NAME + '/ammservice/ebene/nuts-1-region/',
            'NUTS-2-Regionen': FORCE_SCRIPT_NAME + '/ammservice/ebene/nuts-2-region/'
        };
        this.setInitialStyle = (feature, layer) => {
            if (layer) {
                layer.setStyle(this.layerStyle);
            }
        };
        this.newLayer = layerOrder
        .take(1)
        .flatMap(function(el) {
            return Bacon.fromArray(el);
        })
        .filter(function(layer) {
            return !!geoLayers[layer];
        })
        .map((name) => {
            let url = geoLayers[name];
            if (name === 'Flexregionen') {
                const searchParams = new URLSearchParams({
                    region_id: this.regionId
                });
                url += searchParams.toString();
            }
            return {
                url: url,
                name: name
            };
        })
        .flatMap(function(obj) {
            return Bacon.fromPromise(reqwest({
                url: obj.url,
                type: "json"
            })).map(function(data) {
                return {
                    url: obj.url,
                    name: obj.name,
                    data: data
                };
            });
        }).changes();
        this.newLayer.onValue((layer) => {
            let geojson = new L.GeoJSON();
            // Nur als onEachFeature sinnvoll: als options.style erwartet Leaflet
            // ein zurueckgegebenes Stilobjekt, die Funktion liefert aber keins.
            geojson.options.onEachFeature = this.setInitialStyle;
            geojson.addData(layer.data);
            this.addGeoJSONLayer(geojson, layer.name);
        });
        let allLayersDone = this.newLayer.mapEnd('we are done').filter(function(v) {
            return v === "we are done";
        });
        Bacon.onValues(this.currentLayer.toProperty(), allLayersDone, (layerName) => {
            if (layerName === "EUROPE Regionen") {
                layerName = "NUTS-0-Regionen";
            }
            this.selectLayer(layerName);
        });
        Bacon.onValues(this.validData.toProperty(), this.takeRegion.toProperty(), allLayersDone, (data) => {
            this.eachLayer((layer) => {
                if (!layer.feature) {
                    return;
                }
                layer.feature.extendedProperties = data.data[layer.feature.properties.region] || {};
                this.repaintQueue.push(layer);
            });
        });
        this.resizeTrigger.plug(Bacon.fromEventTarget(window, 'resize'));
        this.resizeTrigger.onValue((trigger) => {
            // invalidateSize(1, true) hat beide Argumente verworfen und exakt
            // wie ein argumentloser Aufruf gewirkt; jetzt steht das auch so da.
            this.invalidateSize();
            if (this.options.zoom) {
                this.setZoom(this.options.zoom);
            }
            if (trigger === null) {
                $(this.getContainer()).parent().css('height', $(window).outerHeight() - $(".footer").outerHeight(true) - 30);
            } else if (trigger) {
                this.triggerCenter.push(true);
            } else {
                this.fitBounds(GERMANY_BOUNDS);
            }
        });
        let displayedLayers = Bacon.fromLeafletEvent(this, 'layeradd').map(function(layer) {
            if (layer.layer) {
                return layer.layer;
            }
            return layer;
        }).filter(function(layer) {
            return ( layer.feature !== undefined && layer.feature.properties !== undefined) ;
        });
        let clicks = displayedLayers.flatMap(function(layer) {
            if (layer._events && layer._events.click) {
                layer._events.click = [];
            }
            return Bacon.fromLeafletLayerEvent(layer, "click");
        }).changes();
        let mouseovers = displayedLayers.flatMap(function(layer) {
            return Bacon.fromLeafletLayerEvent(layer, "mouseover");
        }).changes();
        let mouseouts = displayedLayers.flatMap(function(layer) {
            return Bacon.fromLeafletLayerEvent(layer, "mouseout");
        }).changes();
        this.currentSelection.plug(clicks);
        this.repaintLayers = function() {
            for (let key in this._layers) {
                let layer = this._layers[key];
                if (layer.setStyle && layer.feature) {
                    this.repaintQueue.push(layer);
                }
            }
        };
        this.repaintQueue.onValue((layer) => {
            const properties = layer.feature.properties,
                selected = properties.selected || false,
                hovered = properties.hovered || false,
                localData = layer.feature.extendedProperties;
            if (hideUnselectedFlexregion(layer, selected)) {
                return;
            }
            // Frueher wurde this.layerStyle selbst veraendert. Der Stil ist aber
            // fuer alle Layer derselbe: nach einer ausgewaehlten Region behielten
            // alle danach gezeichneten Regionen deren opacity und Farbe.
            const style = _.extend({}, this.layerStyle);
            if (!localData) {
                style.color = "#000000";
                style.fillColor = '#cccccc';
                layer.setStyle(style);
                return;
            }
            const highlight = this.mapColor.getColorForValueHighlight(localData.value);
            style.color = highlight;
            style.fillColor = hovered ? highlight : this.mapColor.getColorCodeForValue(localData.value);
            if (selected) {
                bringSelectedToFront(layer);
                style.opacity = 0.75;
                style.weight = 2.5;
                style.color = '#333';
            }
            layer.setStyle(style);
        });
        this.activation = this.currentSelection.slidingWindow(2, 2).filter(function(x) {
            return x[0] === x[1];
        }).map(function(x) {
            return x[0];
        });
        this.hoverChanges = mouseovers.merge(mouseouts.map(function() {
            return null;
        }));
        this.hoverChanges.onValue((hovered) => {
            this.eachLayer((layer) => {
                if (!layer.feature) {
                    return;
                }
                if (layer.feature.properties.region === hovered) {
                    layer.feature.properties.hovered = true;
                    this.repaintQueue.push(layer);
                } else {
                    if (layer.feature.properties.hovered === true) {
                        layer.feature.properties.hovered = false;
                        this.repaintQueue.push(layer);
                    }
                }
            });
        });
        this.triggerCenter.onValue((state) => {
            let selectedTopic = $("#faktencheck_content").data('topic');
            let layer = this.selectedFeatureLayer;
            if (selectedTopic === "faktencheck_eu" && state && layer && layer.feature) {
                setTimeout(() => {
                    this.panTo(new L.LatLng(layer.feature.properties.lat, layer.feature.properties.lng));
                }, 0);
            }
        });
        Bacon.onValues(this.currentSelectionIn, allLayersDone, (selected) => {
            this.eachLayer((layer) => {
                if (!layer.feature) {
                    return;
                }
                if (layer.feature.properties.region === selected) {
                    layer.feature.properties.selected = true;
                    // Frueher map.currentLayer = layer. Das hat den gleichnamigen
                    // Bus ueberschrieben, ueber den die Ebenenauswahl laeuft -
                    // ein spaeteres map.currentLayer.push(name) lief danach ins
                    // Leere. Der ausgewaehlte Layer hat jetzt ein eigenes Feld.
                    this.selectedFeatureLayer = layer;
                    this.repaintQueue.push(layer);
                    this.triggerCenter.push(true);
                } else {
                    if (layer.feature.properties.selected === true) {
                        layer.feature.properties.selected = false;
                        this.repaintQueue.push(layer);
                    }
                }
            });
        });
        this.legendData = this.validData.filter(function(data) {
            return data.hasOwnProperty("legend");
        }).map(function(data) {
            return data.legend;
        });
        this.attributionData = this.validData.filter(function(data) {
            return data.hasOwnProperty("source");
        }).map(function(data) {
            return data.source;
        });
        this.legendData.onValue((legend) => {
            this.mapColor = jsm.api.MapColor.init(this);
            this.mapColor.setColors(legend);
            if (this.options.legendControl)
                this.legendControl._update();
            let mm = MapMenu.init(this);
            if (this.options.slideMenu)
                this.slideMenu.setContents(mm);
            if (mm.classSlider) {
                let slider = mm.classSlider.data("ionRangeSlider");
                slider.is_start = true;
                slider.update(mm.options.classSlider);
            }
        });
        this.attributionData.onValue((source) => {
            this.attributionControl._attributions = {};
            this.attributionControl.addAttribution('Kartenmaterial: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors');
            this.attributionControl.addAttribution("<br>" + source);
        });
    });
});

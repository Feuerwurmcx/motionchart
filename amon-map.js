$(document).ready(function() {
    const GERMANY_BOUNDS = [[47.2708333, 5.8669444], [55.0591667, 15.0436111]];
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
        let map = this;
        map.attributionControl.setPrefix("");
        map.attributionControl.setPosition('bottomright');
        map.validData = map.data.filter(function(data) {
            return data.hasOwnProperty("data");
        });
        map.takeRegion = map.data.map(function(data) {
            map.regionId = data.region_id;
            return true;
        });
        let layerOrder = map.data.map(function(data) {
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
        map.setInitialStyle = function(feature, layer) {
            if (layer) {
                layer.setStyle(map.layerStyle);
            }
        };
        map.newLayer = layerOrder
        .take(1)
        .flatMap(function(el) {
            return Bacon.fromArray(el);
        })
        .filter(function(layer) {
            return !!geoLayers[layer];
        })
        .map(function(name) {
            let url = geoLayers[name];
            if (name === 'Flexregionen') {
                const searchParams = new URLSearchParams({
                    region_id: map.regionId
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
        map.newLayer.onValue(function(layer) {
            let geojson = new L.GeoJSON();
            // Nur als onEachFeature sinnvoll: als options.style erwartet Leaflet
            // ein zurueckgegebenes Stilobjekt, die Funktion liefert aber keins.
            geojson.options.onEachFeature = map.setInitialStyle;
            geojson.addData(layer.data);
            map.addGeoJSONLayer(geojson, layer.name);
        });
        let allLayersDone = map.newLayer.mapEnd('we are done').filter(function(v) {
            return v === "we are done";
        });
        Bacon.onValues(map.currentLayer.toProperty(), allLayersDone, function(layerName) {
            if (layerName === "EUROPE Regionen") {
                layerName = "NUTS-0-Regionen";
            }
            map.selectLayer(layerName);
        });
        Bacon.onValues(map.validData.toProperty(), map.takeRegion.toProperty(), allLayersDone, function(data) {
            map.eachLayer(function(layer) {
                if (!layer.feature) {
                    return;
                }
                layer.feature.extendedProperties = data.data[layer.feature.properties.region] || {};
                map.repaintQueue.push(layer);
            });
        });
        map.resizeTrigger.plug(Bacon.fromEventTarget(window, 'resize'));
        map.resizeTrigger.onValue(function(trigger) {
            // invalidateSize(1, true) hat beide Argumente verworfen und exakt
            // wie ein argumentloser Aufruf gewirkt; jetzt steht das auch so da.
            map.invalidateSize();
            if (map.options.zoom) {
                map.setZoom(map.options.zoom);
            }
            if (trigger === null) {
                $(map.getContainer()).parent().css('height', $(window).outerHeight() - $(".footer").outerHeight(true) - 30);
            } else if (trigger) {
                map.triggerCenter.push(true);
            } else {
                map.fitBounds(GERMANY_BOUNDS);
            }
        });
        let displayedLayers = Bacon.fromLeafletEvent(map, 'layeradd').map(function(layer) {
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
        map.currentSelection.plug(clicks);
        map.repaintLayers = function() {
            for (let key in this._layers) {
                let layer = this._layers[key];
                if (layer.setStyle && layer.feature) {
                    this.repaintQueue.push(layer);
                }
            }
        };
        map.repaintQueue.onValue(function(layer) {
            let properties = layer.feature.properties;
            let selected = properties.selected || false;
            let hovered = properties.hovered || false;
            let localData = layer.feature.extendedProperties;
            // Frueher wurde map.layerStyle selbst veraendert. Der Stil ist aber
            // fuer alle Layer derselbe: nach einer ausgewaehlten Region behielten
            // alle danach gezeichneten Regionen deren opacity und Farbe. Nur
            // weight wurde per Hand zurueckgesetzt, der Rest blieb stehen.
            let style = _.extend({}, map.layerStyle);
            if (properties.layer && properties.layer.name === "Flexregion") {
                let element = layer.getElement();
                if (!selected) {
                    layer.setStyle({
                        opacity: 0,
                        fillColor: "#00000000"
                    });
                    if (element) {
                        element.setAttribute('hidden', true);
                    }
                    return;
                } else {
                    if (element) {
                        element.removeAttribute('hidden');
                    }
                }
            }
            if (localData) {
                _.extend(style, {
                    color: map.mapColor.getColorForValueHighlight(localData.value),
                    fillColor: map.mapColor.getColorCodeForValue(localData.value)
                });
                if (hovered) {
                    _.extend(style, {
                        fillColor: map.mapColor.getColorForValueHighlight(localData.value)
                    });
                }
                if (selected) {
                    if (layer._renderer && layer._path && layer._path.parentNode) {
                        layer.bringToFront();
                    } else {
                        // once() mit Kontext statt on() mit bind(): Leaflet
                        // erkennt das Paar wieder und haengt nicht bei jedem
                        // Repaint einen weiteren Handler an, der nie geht.
                        layer.once('add', layer.bringToFront, layer);
                    }
                    _.extend(style, {
                        opacity: 0.75,
                        weight: 2.5,
                        color: '#333'
                    });
                }
            } else {
                _.extend(style, {
                    color: "#000000",
                    fillColor: '#cccccc'
                });
            }
            layer.setStyle(style);
        });
        map.activation = map.currentSelection.slidingWindow(2, 2).filter(function(x) {
            return x[0] === x[1];
        }).map(function(x) {
            return x[0];
        });
        map.hoverChanges = mouseovers.merge(mouseouts.map(function() {
            return null;
        }));
        map.hoverChanges.onValue(function(hovered) {
            map.eachLayer(function(layer) {
                if (!layer.feature) {
                    return;
                }
                if (layer.feature.properties.region === hovered) {
                    layer.feature.properties.hovered = true;
                    map.repaintQueue.push(layer);
                } else {
                    if (layer.feature.properties.hovered === true) {
                        layer.feature.properties.hovered = false;
                        map.repaintQueue.push(layer);
                    }
                }
            });
        });
        map.triggerCenter.onValue(function(state) {
            let selectedTopic = $("#faktencheck_content").data('topic');
            let layer = map.selectedFeatureLayer;
            if (selectedTopic === "faktencheck_eu" && state && layer && layer.feature) {
                setTimeout(function() {
                    map.panTo(new L.LatLng(layer.feature.properties.lat, layer.feature.properties.lng));
                }, 0);
            }
        });
        Bacon.onValues(map.currentSelectionIn, allLayersDone, function(selected) {
            map.eachLayer(function(layer) {
                if (!layer.feature) {
                    return;
                }
                if (layer.feature.properties.region === selected) {
                    layer.feature.properties.selected = true;
                    // Frueher map.currentLayer = layer. Das hat den gleichnamigen
                    // Bus ueberschrieben, ueber den die Ebenenauswahl laeuft -
                    // ein spaeteres map.currentLayer.push(name) lief danach ins
                    // Leere. Der ausgewaehlte Layer hat jetzt ein eigenes Feld.
                    map.selectedFeatureLayer = layer;
                    map.repaintQueue.push(layer);
                    map.triggerCenter.push(true);
                } else {
                    if (layer.feature.properties.selected === true) {
                        layer.feature.properties.selected = false;
                        map.repaintQueue.push(layer);
                    }
                }
            });
        });
        map.legendData = map.validData.filter(function(data) {
            return data.hasOwnProperty("legend");
        }).map(function(data) {
            return data.legend;
        });
        map.attributionData = map.validData.filter(function(data) {
            return data.hasOwnProperty("source");
        }).map(function(data) {
            return data.source;
        });
        map.legendData.onValue(function(legend) {
            map.mapColor = jsm.api.MapColor.init(map);
            map.mapColor.setColors(legend);
            if (map.options.legendControl)
                map.legendControl._update();
            let mm = MapMenu.init(map);
            if (map.options.slideMenu)
                map.slideMenu.setContents(mm);
            if (mm.classSlider) {
                let slider = mm.classSlider.data("ionRangeSlider");
                slider.is_start = true;
                slider.update(mm.options.classSlider);
            }
        });
        map.attributionData.onValue(function(source) {
            map.attributionControl._attributions = {};
            map.attributionControl.addAttribution('Kartenmaterial: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors');
            map.attributionControl.addAttribution("<br>" + source);
        });
    });
});

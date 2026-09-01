/*!
* Copyright 2013 Enterstry GmbH MIT License for AMM BA
* Includes: jsm.js
*/
let jsm = null;
$(document).ready(function() {
    'use strict';
    function Jsm() {
        this.tags = ['[[', ']]'];
        this.data = {};
        this.config = {};
        // Kommandoregister als Objekt ohne Prototyp: als Array angelegt haetten
        // Kommandonamen wie "sort", "concat" oder "filter" die Array-Methoden
        // getroffen, statt als unbekannt aufzufallen.
        this.commands = Object.create(null);
        this.triggerClass = "jsm";
        this.triggerCommand = "jsm-cmd";
        this.triggerPriority = "jsm-cmd-prio";
        this.triggerPreserve = "jsm-preserve";
        this.triggerBind = "jsm-bind";
        this.__bindToDocument();
        this.api = {};
    }
    Jsm.prototype.__bindToDocument = function() {
        // Wir stecken hier bereits in einem ready-Handler. Das zusaetzliche
        // ready() feuert daher erst, nachdem die uebrigen Handler ihre
        // Kommandos registriert haben - der Aufruf muss verzoegert bleiben.
        // jQuery uebergibt dem ready-Callback nur sich selbst, also gibt es
        // beim ersten Durchlauf keinen Wurzelknoten und das ganze Dokument
        // wird durchsucht.
        $(document).ready(() => {
            this.__parsePage__(undefined, {});
        });
        $(document).on("event:jsm-rebind", (event, node, args) => {
            this.__parsePage__(node, args || {});
        });
    };
    Jsm.prototype.__parsePage__ = function(node, args) {
        const trigger_class = this.triggerClass,
            force = !!(args && args.force),
            bindings = [],
            errors = [];
        for (const element of $("." + trigger_class, node)) {
            const $element = $(element),
                command = $element.data(this.triggerCommand) || "",
                bind = force || $element.data(this.triggerBind) !== false;
            let priority = Number.parseInt($element.data(this.triggerPriority) || 0, 10);
            if (!Number.isFinite(priority)) {
                priority = 0;
            }
            if (!command) {
                errors.push({
                    reason: 'kein Kommando angegeben',
                    node: $element
                });
            }
            if ($element.data(this.triggerPreserve) !== true && bind) {
                element.classList.remove(trigger_class);
            }
            const disabled = element.classList.contains("disabled") || element.getAttribute("disabled") || element.disabled;
            if (disabled && !element.classList.contains("disabled-rt")) {
                element.style.cursor = 'default';
                element.classList.add("disabled");
                $element.off("click").on("click", function(event) {
                    event.preventDefault();
                });
                continue;
            }
            if (command && bind) {
                bindings.push({
                    priority: priority,
                    node: $element,
                    commands: command.split(" ")
                });
            }
        }
        // Sortiert wurde frueher ueber die Eintraege selbst (a - b ergibt bei
        // Arrays NaN), die Prioritaet war damit wirkungslos.
        bindings.sort((a, b) => a.priority - b.priority);
        $(document).trigger("event:jsm-init", [node, args]);
        for (const binding of bindings) {
            for (const name of binding.commands) {
                const command = name.trim();
                if (!command) {
                    continue;
                }
                try {
                    this.commands[command](binding.node);
                } catch (error) {
                    errors.push({
                        reason: command,
                        error: error,
                        node: binding.node
                    });
                }
            }
        }
        if (errors.length > 0) {
            console.error("Error on binding");
            console.log(errors);
        }
    };
    Jsm.prototype.register = function(command, func) {
        this.commands[command] = func;
    };
    Jsm.prototype.registerMethod = function(command, obj, func) {
        this.commands[command] = function(node) {
            obj[func](node);
        };
    };
    Jsm.prototype.bind = function(node, command) {
        this.commands[command.trim()](node);
    };
    Jsm.prototype.rebind = function(node, args) {
        $(document).trigger("event:jsm-rebind", [node, args]);
    };
    Jsm.prototype.done = function(node, args) {
        $(document).trigger("event:jsm-done", [node, args]);
    };
    Jsm.prototype.renderHtml = function(html, view, partials) {
        // Mustache.tags ist global. Der Wert wird nur fuer diesen Aufruf
        // gesetzt und danach wieder hergestellt, sonst rendert jeder andere
        // Mustache-Nutzer der Seite anschliessend mit [[ ]] statt {{ }}.
        // Die Sicherung findet den aktuellen Wert vor, geschachtelte Aufrufe
        // rollen sich also korrekt zurueck.
        const previous_tags = Mustache.tags;
        Mustache.tags = this.tags;
        try {
            return Mustache.render(html, view, partials);
        } finally {
            Mustache.tags = previous_tags;
        }
    };
    Jsm.prototype.render = function(elementId, view, partials) {
        return this.renderHtml($(elementId).html(), view, partials);
    };
    window.jsm = jsm = new Jsm();
});

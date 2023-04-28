define("apps/provisioner/app", ["require", "jquery", "lodash", "monster", "footable"], function(t) {
    var n = t("jquery")
      , e = t("lodash")
      , l = t("monster")
      , a = t("footable")
      , o = {
        name: "provisioner",
        subModules: ["contacts"],
        css: ["app"],
        i18n: {
            "de-DE": {
                customCss: !1
            },
            "en-US": {
                customCss: !1
            },
            "fr-FR": {
                customCss: !1
            }
        },
        requests: {
            "provisioner.reseller.get": {
                apiRoot: l.config.api.provisioner,
                url: "resellers/{resellerId}",
                verb: "GET",
                generateError: !1
            },
            "provisioner.reseller.update": {
                apiRoot: l.config.api.provisioner,
                url: "resellers/{resellerId}",
                verb: "POST"
            },
            "provisioner.accounts.get": {
                apiRoot: l.config.api.provisioner,
                url: "accounts/{accountId}",
                verb: "GET",
                generateError: !1
            },
            "provisioner.accounts.update": {
                apiRoot: l.config.api.provisioner,
                url: "accounts/{accountId}",
                verb: "POST"
            },
            "provisioner.devices.get": {
                apiRoot: l.config.api.provisioner,
                url: "devices/{accountId}/{macAddress}",
                verb: "GET"
            },
            "provisioner.devices.create": {
                apiRoot: l.config.api.provisioner,
                url: "devices/{accountId}/{macAddress}",
                verb: "PUT"
            },
            "provisioner.devices.update": {
                apiRoot: l.config.api.provisioner,
                url: "devices/{accountId}/{macAddress}",
                verb: "POST"
            },
            "provisioner.devices.delete": {
                apiRoot: l.config.api.provisioner,
                url: "devices/{accountId}/{macAddress}",
                verb: "DELETE"
            },
            "provisioner.devices.list": {
                apiRoot: l.config.api.provisioner,
                url: "devices/{accountId}",
                verb: "GET"
            },
            "provisioner.devices.unlock": {
                apiRoot: l.config.api.provisioner,
                url: "locks/{accountId}/{macAddress}",
                verb: "DELETE"
            },
            "provisioner.devices.getAccountId": {
                apiRoot: l.config.api.provisioner,
                url: "devices/search/{macAddress}",
                verb: "GET",
                generateError: !1
            },
            "provisioner.ip.ban": {
                apiRoot: l.config.api.provisioner,
                url: "locks/{accountId}/ban/{ip_address}",
                verb: "DELETE"
            },
            "provisioner.debug.checkIp": {
                apiRoot: l.config.api.provisioner,
                url: "debug/check_ip/{ipAddress}"
            },
            "provisioner.debug.checkOwnIp": {
                apiRoot: l.config.api.provisioner,
                url: "debug/check_ip/"
            },
            "provisioner.debug.logFiles.get": {
                apiRoot: l.config.api.provisioner,
                url: "debug/accounts/{accountId}/device_access_log/{macAddress}"
            },
            "provisioner.debug.configFiles.get": {
                apiRoot: l.config.api.provisioner,
                url: "debug/accounts/{accountId}/device_config/{macAddress}"
            },
            "provisioner.debug.openProvisioningWindow": {
                apiRoot: l.config.api.provisioner,
                url: "debug/accounts/{accountId}/ip_address/{ip_address}/hours/{hours}",
                verb: "PUT"
            },
            "provisioner.ui.getGlobal": {
                apiRoot: l.config.api.provisioner,
                url: "ui",
                verb: "GET"
            },
            "provisioner.ui.getModel": {
                apiRoot: l.config.api.provisioner,
                url: "ui/{brand}/{family}/{model}",
                verb: "GET"
            },
            "provisioner.contactList.get": {
                apiRoot: l.config.api.provisioner,
                url: "accounts/{accountId}/contacts",
                verb: "GET",
                generateError: !1
            },
            "provisioner.contactList.update": {
                apiRoot: l.config.api.provisioner,
                url: "accounts/{accountId}/contacts",
                verb: "PUT",
                generateError: !1
            },
            "provisioner.directoryNames.get": {
                apiRoot: l.config.api.provisioner,
                url: "brand_defaults/{brand}/accounts/{accountId}/levels/account",
                verb: "GET",
                generateError: !1
            },
            "provisioner.directoryNames.update": {
                apiRoot: l.config.api.provisioner,
                url: "brand_defaults/{brand}/accounts/{accountId}/levels/account",
                verb: "PUT",
                generateError: !1
            }
        },
        subscribe: {},
        appFlags: {
            contactList: [],
            displayContactNamesBrand: "polycom",
            exportFileName: "contact-list",
            hoursLimits: {
                min: 1,
                max: 168
            }
        },
        load: function(t) {
            var n = this;
            n.initApp(function() {
                t && t(n)
            })
        },
        initApp: function(t) {
            var n = this;
            l.pub("auth.initApp", {
                app: n,
                callback: t
            })
        },
        render: function(t) {
            var n = this
              , a = [{
                text: n.i18n.active().provisionerApp.menus.accountSettings,
                callback: n.renderSettings,
                data: {
                    requests: ["globalDefaults", "resellerData", "accountData"]
                }
            }];
            l.apps.auth.currentAccount.is_reseller && a.push({
                text: n.i18n.active().provisionerApp.menus.providerSettings,
                callback: n.renderSettings,
                data: {
                    requests: ["globalDefaults", "resellerData"]
                }
            }),
            l.ui.generateAppLayout(n, {
                menus: [{
                    tabs: [{
                        text: n.i18n.active().provisionerApp.menus.devices,
                        callback: n.renderListing,
                        id: "listing_devices"
                    }]
                }, {
                    tabs: a
                }, {
                    tabs: [{
                        text: n.i18n.active().provisionerApp.menus.contactList,
                        callback: e.partial(l.pub, "provisioner.contactList.render"),
                        id: "contacts_list"
                    }]
                }, {
                    tabs: [{
                        text: n.i18n.active().provisionerApp.menus.ipCheck,
                        callback: n.renderEntityCheck,
                        data: {
                            entity: "ip"
                        }
                    }]
                }]
            })
        },
        renderListing: function(t) {
            var a = this
              , o = t.container
              , i = function(o, i) {
                var s = n(a.getTemplate({
                    name: "listing",
                    data: r(i)
                }));
                return e.forEach(o, function(n) {
                    a.renderListingItem(s, e.assign({}, t, {
                        data: n
                    }))
                }),
                s.find(".banned-text").html(a.getTemplate({
                    name: "!" + a.i18n.active().provisionerApp.listing.bannedIp,
                    data: {
                        ip: e.get(i, "ip", "")
                    }
                })),
                l.ui.footable(s.find("#devices_list")),
                l.ui.tooltips(s),
                a.bindListingEvents(s, t),
                s
            }
              , r = function(t) {
                var n = l.config.whitelabel
                  , a = l.util.getRealmSuffix()
                  , o = !e.isUndefined(a)
                  , i = "";
                return i = n.hasOwnProperty("provisioner_displayed_url") && n.provisioner_displayed_url.length ? n.provisioner_displayed_url : o ? "http://p." + a : "//" === l.config.api.provisioner.substr(0, 2) ? "http:" + l.config.api.provisioner : l.config.api.provisioner,
                {
                    provisionerUrl: i,
                    isReseller: l.apps.auth.currentAccount.is_reseller,
                    isBanned: e.get(t, "banned", !1),
                    ipAddress: e.get(t, "ip", "")
                }
            }
              , s = function() {
                o.find(".footable-filtering-search input").focus()
            };
            l.ui.insertTemplate(o, function(t) {
                a.helperListAllDevices(function(n, e) {
                    t(i(n, e), s)
                })
            }, {
                title: a.i18n.active().provisionerApp.listing.loading.title
            })
        },
        renderListingItem: function(t, e) {
            var l = this
              , a = function() {
                var t = n(l.getTemplate({
                    name: "listing-item",
                    data: e.data
                }));
                return l.bindListingItemEvents(t, e),
                t
            };
            t.find("tbody").append(a)
        },
        renderSettings: function(t) {
            var a = this
              , o = function(o) {
                var r = n(a.getTemplate({
                    name: "settings",
                    data: i(o)
                }));
                return a.forEachProperty(o.template, function(n) {
                    a.renderSettingsField(r, e.assign({}, t, {
                        data: {
                            fieldData: n,
                            settings: o
                        }
                    }))
                }),
                r.find(".switch-sublink").each(function() {
                    n(this).text(parseInt(n(this).text(), 10) + 1)
                }),
                l.ui.tooltips(r),
                a.bindSettingsEvents(r, e.assign({}, t, {
                    data: o
                })),
                r
            }
              , i = function(t) {
                return e.merge({
                    level: t.action.level,
                    sections: e.map(t.template, function(t, n) {
                        return t.id = n,
                        t
                    })
                }, t.results.hasOwnProperty("deviceData") ? {
                    device: {
                        brand: t.results.deviceData.brand,
                        family: t.results.deviceData.family,
                        model: t.results.deviceData.model,
                        name: t.results.deviceData.name,
                        mac_address: t.results.deviceData.mac_address.match(/[0-9a-f]{2}/gi).join(":")
                    }
                } : {})
            };
            l.ui.insertTemplate(t.container, function(n) {
                a.helperGetSettings({
                    data: t.data,
                    callback: function(t) {
                        n(o(t))
                    }
                })
            }, {
                title: a.i18n.active().provisionerApp.settings.loading.title
            })
        },
        renderSettingsField: function(t, l) {
            var a = this
              , o = l.data.fieldData
              , i = l.data.settings
              , r = function() {
                var t = n(a.getTemplate(s()));
                return a.bindSettingsFieldEvents(t, l),
                t
            }
              , s = function() {
                var t = e.merge({}, o.data, {
                    path: o.path
                })
                  , l = t.type
                  , r = "settings-field".concat(l.charAt(0).toUpperCase(), l.slice(1));
                if (o = a.mergeLevelValues(o, i),
                "select" === l && t.options.forEach(function(t) {
                    "boolean" == typeof t.value && (t.value = t.value.toString())
                }),
                e.isEmpty(o))
                    t.value = "";
                else {
                    for (var s in o)
                        "boolean" == typeof o[s].value && (o[s].value = o[s].value.toString());
                    if (o.hasOwnProperty("field") && (t.value = o.field.value),
                    o.hasOwnProperty("inherit"))
                        if (n.extend(!0, t, {
                            inherit: !o.hasOwnProperty("field"),
                            inheritData: n.extend(!0, {}, o.inherit, {
                                level: a.i18n.active().provisionerApp.settings[o.inherit.level]
                            })
                        }),
                        "select" === l) {
                            t.value = t.inherit ? "inherit" : t.value,
                            t.options.unshift({
                                text: a.i18n.active().provisionerApp.settings.inherit,
                                value: "inherit"
                            });
                            for (var c = 0, u = t.options.length; c < u; c++)
                                if (t.options[c].value === o.inherit.value) {
                                    t.inheritData.text = t.options[c].text;
                                    break
                                }
                        } else
                            "text" !== l && "password" !== l || (t.value = t.inherit ? "" : o.field.value)
                }
                return {
                    name: r,
                    data: t
                }
            };
            e.get(o, "hidden", !1) || e.get(o, "data.hidden", !1) || t.find(function() {
                var t = o.hasOwnProperty("index") ? '.sub-content[data-key="' + o.index + '"] ' : "";
                return ('.content-wrapper .content[data-key="' + o.section + '"] ').concat(t, ".", o.option)
            }()).append(r)
        },
        renderEntityCheck: function(t) {
            var e = this
              , a = t.container
              , o = function() {
                var l = n(e.getTemplate({
                    name: "entityCheck"
                }));
                return e.bindEntityCheckEvents(l, t),
                l
            }
              , i = function() {
                a.find("#entity").focus()
            };
            l.ui.insertTemplate(a, function(t) {
                t(o(), i)
            })
        },
        renderEntityCheckResult: function(t) {
            var e = this
              , a = t.data.entity
              , o = function(a) {
                var o = n(e.getTemplate({
                    name: "entityCheckResult",
                    data: {
                        entity: t.data.value,
                        statuses: a
                    }
                }));
                return l.ui.tooltips(o),
                e.bindEntityCheckResultEvents(o, t),
                o
            }
              , i = {
                ip: function(n) {
                    e.requestCheckIpAddress({
                        data: {
                            ipAddress: t.data.value
                        },
                        success: function(t) {
                            n(null, t)
                        }
                    })
                }
            };
            l.ui.insertTemplate(t.container, function(t) {
                l.parallel([i[a]], function(n, e) {
                    t(o(e[0]))
                })
            })
        },
        renderDebugFilesPopup: function(t) {
            var a = this
              , o = t.data.type
              , i = l.ui.fullScreenModal(null, {
                inverseBg: !0,
                cssContentId: "provisioner_debug_popup"
            })
              , r = t.data.macAddress
              , s = function(i) {
                var s = n(a.getTemplate({
                    name: "debugPopup",
                    data: {
                        files: i,
                        type: o,
                        macAddress: r
                    }
                }));
                return e.forEach(i, function(t) {
                    s.find('.monster-tab-content[data-tab="' + t.name + '"] pre').text(t.data || a.i18n.active().provisionerApp.debugPopup.empty)
                }),
                l.ui.fancyTabs(s),
                a.bindDebugPopupEvent(s, e.merge({}, t, {
                    data: {
                        files: i
                    }
                })),
                s
            };
            t.container = n(".core-absolute").find("#" + i.getId() + " .modal-content"),
            l.ui.insertTemplate(t.container, function(t) {
                a.helperListLogFiles(o, r, function(n) {
                    t(s(n))
                })
            }, {
                hasBackground: !1,
                title: a.i18n.active().provisionerApp.debugPopup.loading[o].title
            })
        },
        renderProvisioningWindowDialog: function() {
            var t = this
              , a = t.appFlags.hoursLimits
              , i = t.getTemplate({
                name: "!" + t.i18n.active().provisionerApp.listing.openProvisioningWindow.fields.hours.label,
                data: a
            })
              , r = n(t.getTemplate({
                name: "provisioningWindow",
                data: {
                    defaultIp: o.getStore("publicIp"),
                    hoursLabel: i
                }
            }))
              , s = r.find("#open_window")
              , c = r.find("#ip_address")
              , u = t.i18n.active().provisionerApp.listing.openProvisioningWindow.title
              , p = l.ui.dialog(r, {
                title: u
            });
            l.ui.mask(c, "ipv4"),
            l.ui.validate(s, {
                rules: {
                    ipAddress: {
                        ipv4: !0,
                        required: !0
                    },
                    hours: {
                        min: e.get(a, "min"),
                        max: e.get(a, "max"),
                        digits: !0,
                        required: !0
                    }
                }
            }),
            t.bindProvisioningWindowDialogEvents(r, {
                popup: p
            })
        },
        bindListingEvents: function(t, a) {
            var o = this
              , i = t.find("#devices_list");
            t.find(".unblock-ip").on("click", function() {
                var t = n(this)
                  , e = t.data("ip");
                o.requestDeleteBanIp({
                    data: {
                        ip_address: e
                    },
                    success: function(t) {
                        l.ui.loadTab(o, "listing_devices")
                    }
                })
            }),
            t.find(".add-device").on("click", function(t) {
                t.preventDefault(),
                l.pub("common.chooseModel.render", {
                    callback: function(t, n) {
                        n && n();
                        var l = {
                            brand: t.provision.endpoint_brand,
                            family: t.provision.endpoint_family,
                            model: t.provision.endpoint_model,
                            deviceData: {
                                brand: t.provision.endpoint_brand,
                                family: t.provision.endpoint_family,
                                model: t.provision.endpoint_model,
                                mac_address: t.mac_address.replace(/:/g, "").toLowerCase(),
                                name: t.name,
                                settings: {}
                            },
                            requests: ["modelDefaults", "resellerData", "accountData"]
                        };
                        o.renderSettings(e.assign({}, a, {
                            data: l
                        }))
                    }
                })
            }),
            t.find(".open-provisioning-window").on("click", function(t) {
                o.renderProvisioningWindowDialog()
            }),
            t.find(".unlock-all").on("click", function(e) {
                var a = n(this).find("i");
                l.ui.confirm(o.i18n.active().provisionerApp.alert.confirm.unlockAll, function() {
                    o.unlockAllDevices({
                        parentTemplate: t,
                        iconTemplate: a
                    })
                })
            }),
            i.on("after.ft.filtering", e.debounce(function(t, n, a) {
                if (t.preventDefault(),
                !e.isEmpty(a)) {
                    var r = i.find("tbody tr:first-child").hasClass("footable-empty")
                      , s = a[0].query.parts[0].query
                      , c = !e.isEmpty(l.util.formatMacAddress(s));
                    r && c && l.waterfall([function(t) {
                        o.requestGetDeviceAccountId({
                            data: {
                                macAddress: s
                            },
                            success: function(n) {
                                t(null, n)
                            },
                            error: function() {
                                t(!0)
                            }
                        })
                    }
                    , function(t, n) {
                        o.requestGetDevice({
                            data: {
                                accountId: t,
                                macAddress: s
                            },
                            success: function(e) {
                                n(null, t, e)
                            }
                        })
                    }
                    ], function(t, n, e) {
                        t ? l.ui.toast({
                            type: "info",
                            message: o.getTemplate({
                                name: "!" + o.i18n.active().provisionerApp.toastr.info.unknownMacAddress,
                                data: {
                                    macAddress: s
                                }
                            })
                        }) : l.pub("common.accountAncestors.render", {
                            accountId: n,
                            entity: {
                                type: "macAddress",
                                data: e
                            }
                        })
                    })
                }
            }, 150))
        },
        bindListingItemEvents: function(t, a) {
            var o = this;
            t.on("click", ".provision-devices", function(t) {
                t.preventDefault();
                var l = n(this).parents("tr")
                  , i = l.data("mac-address")
                  , r = l.data("family")
                  , s = l.data("brand")
                  , c = l.data("model")
                  , u = {
                    macAddress: i,
                    family: r,
                    brand: s,
                    model: c,
                    requests: ["modelDefaults", "resellerData", "accountData", "deviceData"]
                };
                o.renderSettings(e.assign({}, a, {
                    data: u
                }))
            }),
            t.on("click", ".unlock-devices", function(t) {
                t.preventDefault();
                var e = n(this).parents("tr").data("mac-address");
                o.requestUnlockDevice({
                    data: {
                        macAddress: e
                    },
                    success: function() {
                        l.ui.toast({
                            type: "success",
                            message: o.i18n.active().provisionerApp.toastr.success.unlock
                        })
                    }
                })
            }),
            t.on("click", ".restart-devices", function(t) {
                t.preventDefault();
                var e = n(this).parents("tr").data("kazooid");
                o.requestRestartKazooDevice({
                    data: {
                        deviceId: e
                    },
                    success: function() {
                        l.ui.toast({
                            type: "success",
                            message: o.i18n.active().provisionerApp.toastr.success.restart
                        })
                    }
                })
            }),
            t.on("click", ".view-files", function(t) {
                t.preventDefault();
                var l = n(this)
                  , i = l.data("type")
                  , r = l.parents("tr").data("mac-address");
                o.renderDebugFilesPopup(e.assign({}, a, {
                    data: {
                        type: i,
                        macAddress: r
                    }
                }))
            }),
            t.on("click", ".delete-devices", function(t) {
                t.preventDefault();
                var e = n(this).parents("tr")
                  , a = e.data("mac-address");
                l.ui.confirm(o.i18n.active().provisionerApp.alert.confirm.deleteDevice, function() {
                    o.requestDeleteDevice({
                        data: {
                            macAddress: a
                        },
                        success: function() {
                            e.fadeOut(250, function() {
                                n(this).remove()
                            })
                        }
                    })
                })
            })
        },
        bindSettingsEvents: function(t, a) {
            var o = this;
            t.find(".navbar-menu-item-link").on("click", function() {
                var e = n(this);
                e.hasClass("active") || (t.find(".navbar-menu-item-link.active").removeClass("active"),
                e.addClass("active"),
                t.find(".content.active").hide().removeClass("active"),
                t.find('.content[data-key="' + e.data("key") + '"]').fadeIn(250, function() {
                    n(this).addClass("active")
                }))
            }),
            t.find(".switch-sublink").on("click", function() {
                var e = n(this)
                  , l = t.find('.content[data-key="' + e.parents(".content").data("key") + '"]');
                e.hasClass("active") || (l.find(".switch-sublink.active").removeClass("active"),
                e.addClass("active"),
                l.find(".sub-content.active").hide().removeClass("active"),
                l.find('.sub-content[data-key="' + e.data("key") + '"]').fadeIn(250, function() {
                    n(this).addClass("active")
                }))
            }),
            t.find(".cancel").on("click", function() {
                o.renderListing(a)
            }),
            t.find("#settings_form").on("submit", function(n) {
                n.preventDefault(),
                t.find("#save_settings").prop("disabled", !0),
                o.helperSaveSettings(e.merge({}, a, {
                    data: {
                        settings: o.formatSettingsToApi(t, l.ui.getFormData("settings_form"))
                    }
                }))
            })
        },
        bindSettingsFieldEvents: function(t) {
            t.on("change", "select", function() {
                var t = n(this)
                  , e = t.parents(".control-group");
                "inherit" === t.val() ? e.hasClass("warning") || e.addClass("warning") : e.hasClass("warning") && e.removeClass("warning")
            }),
            t.on("keyup", "input", function(t) {
                var e = n(this)
                  , l = e.parents(".controls").find("div:last-child").hasClass("help-inline")
                  , a = e.parents(".control-group");
                l && ("" === e.val() ? a.hasClass("warning") || a.addClass("warning") : a.hasClass("warning") && a.removeClass("warning"))
            })
        },
        bindEntityCheckEvents: function(t, n) {
            var a = this
              , o = function(t) {
                var n, e = {
                    required: !0
                };
                return "ip" === t && (n = "ipv4"),
                e[n] = !0,
                e
            }(n.data.entity);
            t.find(".check-entity").on("click", function(i) {
                i.preventDefault();
                var r = t.find("#check_entity_status")
                  , s = l.ui.getFormData("check_entity_status");
                l.ui.validate(r, {
                    rules: {
                        entity: o
                    }
                }),
                l.ui.valid(r) && a.renderEntityCheckResult(e.merge({}, n, {
                    data: {
                        value: s.entity
                    }
                }))
            })
        },
        bindEntityCheckResultEvents: function(t, n) {
            var e = this
              , l = n.data.entity;
            t.find("#back").on("click", function(t) {
                t.preventDefault(),
                "ip" === l && e.renderEntityCheck(n)
            })
        },
        bindDebugPopupEvent: function(t, l) {
            var a = this;
            t.find(".download").on("click", function(t) {
                t.preventDefault();
                var a = n(this).data("name")
                  , o = e.find(l.data.files, {
                    name: a
                })
                  , i = new Blob([o.data],{
                    type: function() {
                        switch (e.last(o.name.split("."))) {
                        case "xml":
                        case "cfg":
                            return "text/xml";
                        case "txt":
                        default:
                            return "text/plain"
                        }
                    }()
                })
                  , r = new FileReader;
                r.onloadend = function() {
                    var t = document.createElement("a");
                    t.href = r.result,
                    t.download = o.name,
                    t.style.display = "none",
                    document.body.appendChild(t),
                    t.click(),
                    document.body.removeChild(t)
                }
                ,
                r.readAsDataURL(i)
            }),
            t.find(".refresh").on("click", function(o) {
                o.preventDefault();
                var i = n(this)
                  , r = i.data("mac_addres")
                  , s = i.data("type");
                i.prop("disabled", !0),
                a.helperListLogFiles(s, r, function(n) {
                    i.prop("disabled", !1),
                    l.data.files = n,
                    e.forEach(n, function(n) {
                        t.find('.monster-tab-content[data-tab="' + n.name + '"].active pre').text(n.data || a.i18n.active().provisionerApp.debugPopup.empty)
                    })
                })
            })
        },
        bindProvisioningWindowDialogEvents: function(t, n) {
            var a = this
              , o = e.get(n, "popup");
            t.find(".clear-input").on("click", function(n) {
                n.preventDefault(),
                t.find("#ip_address").val("")
            }),
            t.find(".save-window").on("click", function(n) {
                n.preventDefault();
                var i = t.find("#open_window")
                  , r = l.ui.getFormData("open_window");
                l.ui.valid(i) && a.requestOpenProvisioningWindow({
                    data: e.pick(r, ["ip_address", "hours"]),
                    success: function(t) {
                        l.ui.toast({
                            type: "success",
                            message: a.i18n.active().provisionerApp.toastr.success.provisioningWindow
                        }),
                        o.dialog("close")
                    },
                    error: function(t) {
                        l.ui.toast({
                            type: "error",
                            message: a.i18n.active().provisionerApp.toastr.error.provisioningWindow
                        })
                    }
                })
            })
        },
        helperListLogFiles: function(t, n, e) {
            var a = this
              , o = {
                logs: function(t) {
                    a.requestGetDeviceLogFiles({
                        data: {
                            macAddress: n
                        },
                        success: function(n) {
                            t(null, a.utilFormatOldLogsToTemplate(n.log_per_day))
                        }
                    })
                },
                config: function(t) {
                    a.requestGetDeviceConfigFiles({
                        data: {
                            macAddress: n
                        },
                        success: function(n) {
                            t(null, a.utilFormatConfigFilesToTemplate(n.config_files))
                        }
                    })
                }
            };
            l.parallel([o[t]], function(t, n) {
                e(n[0])
            })
        },
        helperListAllDevices: function(t) {
            var n = this;
            l.parallel({
                devices: function(t) {
                    n.requestListDevices({
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                kazooDevices: function(t) {
                    n.requestListKazooDevices({
                        data: {
                            filters: {
                                with_status: !0,
                                paginate: !1
                            }
                        },
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                statusIp: function(t) {
                    n.requestCheckOwnIpAddress({
                        data: {},
                        success: function(n) {
                            o.setStore("publicIp", e.get(n, "ip", "")),
                            t(null, n)
                        }
                    })
                }
            }, function(n, a) {
                var o = e.chain(a.kazooDevices).reject(function(t) {
                    return e.chain(t).get("mac_address", "").isEmpty().value()
                }).map(function(t) {
                    return {
                        id: t.id,
                        isRegistered: !t.registrable || t.registered,
                        macAddress: l.util.formatMacAddress(t.mac_address)
                    }
                }).keyBy("macAddress").value();
                t && t(e.chain(a.devices).map(function(t) {
                    var n = e.get(o, l.util.formatMacAddress(t.mac_address), void 0)
                      , a = e.get(n, "isRegistered", !1);
                    return e.merge({
                        isRegistered: a,
                        kazooId: e.get(n, "id", void 0),
                        showRestart: !e.isUndefined(n) && a,
                        status: a ? "registered" : "unregistered"
                    }, e.pick(t, ["brand", "family", "mac_address", "model", "name"]))
                }).sortBy("name").value(), a.statusIp)
            })
        },
        helperGetSettings: function(t) {
            var n = this
              , a = t.data
              , o = {
                globalDefaults: function(t) {
                    n.requestGetGlobalDefaults({
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                modelDefaults: function(t) {
                    n.requestGetModelDefaults({
                        data: {
                            brand: a.brand,
                            family: a.family,
                            model: a.model
                        },
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                resellerData: function(t) {
                    n.requestGetReseller({
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                accountData: function(t) {
                    n.requestGetAccount({
                        success: function(n) {
                            t(null, n)
                        }
                    })
                },
                deviceData: function(t) {
                    n.requestGetDevice({
                        data: {
                            macAddress: a.macAddress
                        },
                        success: function(n) {
                            t(null, n)
                        }
                    })
                }
            }
              , i = {};
            a.requests.forEach(function(t) {
                i[t] = o[t]
            }),
            delete a.requests,
            l.parallel(i, function(n, l) {
                var o, i = {}, r = {};
                l.hasOwnProperty("globalDefaults") ? (o = l.globalDefaults.template,
                i.settings = l.globalDefaults.settings,
                delete l.globalDefaults) : (o = l.modelDefaults.template,
                i.settings = l.modelDefaults.settings,
                delete l.modelDefaults),
                l.globalData = i,
                a.hasOwnProperty("deviceData") ? (r.method = "create",
                r.level = "device",
                l.deviceData = a.deviceData,
                delete a.deviceData) : (r.method = "update",
                l.hasOwnProperty("deviceData") ? r.level = "device" : l.hasOwnProperty("accountData") ? r.level = "account" : r.level = "reseller"),
                t.callback({
                    action: r,
                    results: l,
                    template: function(t) {
                        return e.each(t, function(t, n, e) {
                            if (t.hasOwnProperty("iterate"))
                                if (0 === t.iterate)
                                    delete e[n];
                                else {
                                    var l = t.iterate
                                      , a = t.data;
                                    t.data = {};
                                    for (var o = 0; o < l; o++)
                                        t.data[o] = a
                                }
                        }),
                        t
                    }(o)
                })
            })
        },
        helperSaveSettings: function(t) {
            var n = this
              , a = t.data
              , o = a.action.level
              , i = a.action.method
              , r = o.charAt(0).toUpperCase().concat(o.slice(1))
              , s = i.charAt(0).toUpperCase().concat(i.slice(1))
              , c = {
                data: {
                    settings: t.data.settings
                }
            }
              , u = function(l) {
                n["request".concat(s, r)]({
                    data: c,
                    success: function() {
                        "device" === o ? n.renderListing(e.assign({}, t, {
                            data: {}
                        })) : "account" === o ? n.renderSettings(e.assign({}, t, {
                            data: {
                                requests: ["globalDefaults", "resellerData", "accountData"]
                            }
                        })) : "reseller" === o && n.renderSettings(e.assign({}, t, {
                            data: {
                                requests: ["globalDefaults", "resellerData"]
                            }
                        }))
                    },
                    error: function() {
                        "device" === o ? n.renderListing(e.assign({}, t, {
                            data: {}
                        })) : "account" === o ? n.renderSettings(e.assign({}, t, {
                            data: {
                                requests: ["globalDefaults", "resellerData", "accountData"]
                            }
                        })) : "reseller" === o && n.renderSettings(e.assign({}, t, {
                            data: {
                                requests: ["globalDefaults", "resellerData"]
                            }
                        }))
                    }
                })
            };
            "device" === o ? (e.merge(c, {
                macAddress: a.results.deviceData.mac_address,
                data: {
                    brand: a.results.deviceData.brand,
                    family: a.results.deviceData.family,
                    model: a.results.deviceData.model,
                    mac_address: a.results.deviceData.mac_address,
                    name: a.results.deviceData.name
                }
            }),
            u()) : l.ui.confirm(n.i18n.active().provisionerApp.alert.confirm.generateFiles.text, function() {
                c.envelopeKeys = {
                    generate: !0
                },
                u()
            }, function() {
                c.envelopeKeys = {
                    generate: !1
                },
                u()
            }, {
                cancelButtonText: n.i18n.active().provisionerApp.alert.confirm.generateFiles.cancel,
                confirmButtonText: n.i18n.active().provisionerApp.alert.confirm.generateFiles.confirm
            })
        },
        forEachProperty: function(t, n) {
            var l, a, o, i, r, s, c, u = [];
            for (l in t)
                if (c = t[l].hasOwnProperty("data") ? t[l].data : t[l],
                function(t) {
                    return e.keys(t).every(function(t, n) {
                        return t === n.toString()
                    })
                }(c))
                    for (i in c) {
                        r = c[i],
                        u.push(l.concat("[", i, "]"));
                        for (o in r) {
                            a = r[o].hasOwnProperty("data") ? r[o].data : r[o],
                            u.push(o);
                            for (s in a)
                                u.push(s),
                                n({
                                    path: u.join("."),
                                    data: a[s],
                                    section: l,
                                    option: o,
                                    index: i,
                                    field: s
                                }),
                                u.splice(-1, 1);
                            u.splice(-1, 1)
                        }
                        u.splice(-1, 1)
                    }
                else {
                    u.push(l);
                    for (o in c) {
                        r = c[o].hasOwnProperty("data") ? c[o].data : c[o],
                        u.push(o);
                        for (s in r)
                            u.push(s),
                            n({
                                path: u.join("."),
                                data: r[s],
                                section: l,
                                option: o,
                                field: s
                            }),
                            u.splice(-1, 1);
                        u.splice(-1, 1)
                    }
                    u.splice(-1, 1)
                }
        },
        formatSettingsToApi: function(t, n) {
            var l = this
              , a = t.find("#settings_form")
              , o = function(t) {
                var l = t.section
                  , a = t.option
                  , o = t.index
                  , i = t.field;
                o ? (delete n[l][o][a][i],
                e.isEmpty(n[l][o][a]) && (delete n[l][o][a],
                e.isEmpty(n[l][o]) && (delete n[l][o],
                e.isEmpty(n[l]) && delete n[l]))) : (delete n[l][a][i],
                e.isEmpty(n[l][a]) && (delete n[l][a],
                e.isEmpty(n[l]) && delete n[l]))
            };
            for (var i in n)
                if (Array.isArray(n[i])) {
                    var r = {};
                    n[i].forEach(function(t, n) {
                        r[n] = t
                    }),
                    n[i] = r
                }
            return function t(n) {
                for (var e in n)
                    "object" == typeof n[e] ? t(n[e]) : "true" !== n[e] && "false" !== n[e] || (n[e] = "true" === n[e])
            }(n),
            l.forEachProperty(n, function(t) {
                var n = a.find('[name="' + t.path + '"]')
                  , e = n.prop("type");
                "select-one" === e ? "inherit" === t.data && o(t) : "text" !== e && "password" !== e || "" === t.data && o(t)
            }),
            n
        },
        unlockAllDevices: function(t) {
            var n = this
              , o = e.get(t, "parentTemplate")
              , i = e.get(t, "iconTemplate")
              , r = o.find("#devices_list")
              , s = a.get(r)
              , c = e.map(s.rows.all, function(t) {
                var l = e.get(t, "$el")
                  , a = l.data("macAddress");
                return function(t) {
                    n.requestUnlockDevice({
                        data: {
                            macAddress: a
                        },
                        success: function() {
                            t(null, {
                                success: !0,
                                macAddress: a
                            })
                        },
                        error: function(n) {
                            t(null, {
                                success: !1,
                                macAddress: a
                            })
                        }
                    })
                }
            });
            i.removeClass("fa-unlock").addClass("fa-spinner fa-spin"),
            l.parallel(c, function(t, a) {
                i.removeClass("fa-spinner fa-spin").addClass("fa-unlock");
                var o = e.filter(a, {
                    success: !1
                });
                o.length > 0 ? l.ui.toast({
                    type: "warning",
                    message: n.getTemplate({
                        name: "!" + n.i18n.active().provisionerApp.toastr.warning.unlockAllIncomplete,
                        data: {
                            macAddresses: e.chain(o).map("macAddress").join(", ").value()
                        }
                    })
                }) : l.ui.toast({
                    type: "success",
                    message: n.i18n.active().provisionerApp.toastr.success.unlockAll
                })
            })
        },
        mergeLevelValues: function(t, n) {
            var l = ["device", "account", "reseller", "global"]
              , a = n.results
              , o = []
              , i = {}
              , r = function t(n, e, l, a) {
                e.hasOwnProperty(n[a]) && ("object" == typeof e[n[a]] ? t(n, e[n[a]], l, ++a) : o.push({
                    level: l,
                    value: e[n[a]]
                }))
            };
            return l.forEach(function(n) {
                var l = n.concat("Data");
                if (a.hasOwnProperty(l) && a[l].hasOwnProperty("settings") && !e.isEmpty(a[l].settings)) {
                    var o, i = [t.section, t.option, t.field];
                    t.hasOwnProperty("index") && (o = "device" === n ? t.index : "0",
                    i.splice(1, 0, o)),
                    r(i, a[l].settings, n, 0)
                }
            }),
            o.length > 0 && (n.action.level === o[0].level ? (i.field = o[0],
            o.length > 1 && (i.inherit = o[1])) : i.inherit = o[0]),
            i
        },
        utilFormatLogsToTemplate: function(t) {
            return t.join("")
        },
        utilFormatOldLogsToTemplate: function(t) {
            var n = this;
            return e.map(t, function(t, e) {
                return {
                    name: e,
                    data: n.utilFormatLogsToTemplate(t)
                }
            })
        },
        utilFormatConfigFilesToTemplate: function(t) {
            return e.map(t, function(t, n) {
                return {
                    name: n,
                    data: t
                }
            })
        },
        requestGetReseller: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.reseller.get",
                data: e.merge({
                    resellerId: l.apps.auth.currentAccount.is_reseller ? n.accountId : l.apps.auth.currentAccount.reseller_id
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    404 === e.status ? t.hasOwnProperty("success") && t.success({}) : t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestUpdateReseller: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.reseller.update",
                data: e.merge({
                    resellerId: l.apps.auth.currentAccount.is_reseller ? n.accountId : l.apps.auth.currentAccount.reseller_id,
                    envelopeKeys: {
                        create_if_missing: !0
                    }
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetAccount: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.accounts.get",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    404 === e.status ? t.hasOwnProperty("success") && t.success({}) : t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestUpdateAccount: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.accounts.update",
                data: e.merge({
                    accountId: n.accountId,
                    envelopeKeys: {
                        create_if_missing: !0
                    }
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestCreateDevice: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.devices.create",
                data: e.merge({
                    accountId: n.accountId,
                    envelopeKeys: {
                        generate: !0
                    }
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestListDevices: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.devices.list",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetDevice: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.devices.get",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestUpdateDevice: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.devices.update",
                data: e.merge({
                    accountId: n.accountId,
                    envelopeKeys: {
                        generate: !0
                    }
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestDeleteDevice: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.devices.delete",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestUnlockDevice: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.devices.unlock",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetDeviceAccountId: function(t) {
            l.request({
                resource: "provisioner.devices.getAccountId",
                data: t.data,
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data.account_id)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestListKazooDevices: function(t) {
            var n = this;
            n.callApi({
                resource: "device.list",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestRestartKazooDevice: function(t) {
            var n = this;
            n.callApi({
                resource: "device.restart",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestCheckIpAddress: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.debug.checkIp",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestCheckOwnIpAddress: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.debug.checkOwnIp",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetDeviceLogFiles: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.debug.logFiles.get",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetDeviceConfigFiles: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.debug.configFiles.get",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetGlobalDefaults: function(t) {
            l.request({
                resource: "provisioner.ui.getGlobal",
                data: e.merge({}, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestGetModelDefaults: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.ui.getModel",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestDeleteBanIp: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.ip.ban",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        },
        requestOpenProvisioningWindow: function(t) {
            var n = this;
            l.request({
                resource: "provisioner.debug.openProvisioningWindow",
                data: e.merge({
                    accountId: n.accountId
                }, t.data),
                success: function(n, e) {
                    t.hasOwnProperty("success") && t.success(n.data)
                },
                error: function(n, e) {
                    t.hasOwnProperty("error") && t.error(n)
                }
            })
        }
    };
    return o
}),
this.monster = this.monster || {},
this.monster.cache = this.monster.cache || {},
this.monster.cache.templates = this.monster.cache.templates || {},
this.monster.cache.templates.provisioner = this.monster.cache.templates.provisioner || {},
this.monster.cache.templates.provisioner._main = this.monster.cache.templates.provisioner._main || {},
this.monster.cache.templates.provisioner._main.debugListing = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.hooks.helperMissing, s = t.escapeExpression, c = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return "\t\t\t\t<tr>\n\t\t\t\t\t<td>\n\t\t\t\t\t\t" + s((o = null != (o = c(e, "name") || (null != n ? c(n, "name") : n)) ? o : r,
        "function" == typeof o ? o.call(i, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 19,
                    column: 6
                },
                end: {
                    line: 19,
                    column: 14
                }
            }
        }) : o)) + "\n\t\t\t\t\t</td>\n\t\t\t\t\t<td>\n\t\t\t\t\t\t" + s((o = null != (o = c(e, "mac_address") || (null != n ? c(n, "mac_address") : n)) ? o : r,
        "function" == typeof o ? o.call(i, {
            name: "mac_address",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 22,
                    column: 6
                },
                end: {
                    line: 22,
                    column: 21
                }
            }
        }) : o)) + '\n\t\t\t\t\t</td>\n\t\t\t\t\t<td class="actions">\n\t\t\t\t\t\t<a href="#" class="icon-wrapper view" data-id="' + s((o = null != (o = c(e, "mac_address") || (null != n ? c(n, "mac_address") : n)) ? o : r,
        "function" == typeof o ? o.call(i, {
            name: "mac_address",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 25,
                    column: 53
                },
                end: {
                    line: 25,
                    column: 68
                }
            }
        }) : o)) + '" >\n\t\t\t\t\t\t\t<i class="fa fa-eye iconography fa-lg"></i>\n\t\t\t\t\t\t</a>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n'
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content debug-listing">\n\t<div class="monster-table-wrapper">\n\t\t<table class="footable monster-table monster-table-skinny" id="debug_listing">\n\t\t\t<thead>\n\t\t\t\t<tr>\n\t\t\t\t\t<th data-sorted="true">\n\t\t\t\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "listing") : o) ? s(o, "headers") : o) ? s(o, "name") : o, n)) + "\n\t\t\t\t\t</th>\n\t\t\t\t\t<th>\n\t\t\t\t\t\t" + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "listing") : o) ? s(o, "headers") : o) ? s(o, "macAddress") : o, n)) + '\n\t\t\t\t\t</th>\n\t\t\t\t\t<th data-sortable="false" data-type="html"></th>\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody>\n' + (null != (o = s(e, "each").call(null != n ? n : t.nullContext || {}, null != n ? s(n, "devices") : n, {
            name: "each",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 3
                },
                end: {
                    line: 30,
                    column: 12
                }
            }
        })) ? o : "") + "\t\t\t</tbody>\n\t\t</table>\n\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main.debugPopup = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.hooks.helperMissing, s = t.escapeExpression, c = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<li class="navbar-menu-item">\n\t\t\t<a href="#" class="navbar-menu-item-link" data-tab="' + s((o = null != (o = c(e, "name") || (null != n ? c(n, "name") : n)) ? o : r,
        "function" == typeof o ? o.call(i, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 5,
                    column: 55
                },
                end: {
                    line: 5,
                    column: 63
                }
            }
        }) : o)) + '">\n\t\t\t\t' + s((o = null != (o = c(e, "name") || (null != n ? c(n, "name") : n)) ? o : r,
        "function" == typeof o ? o.call(i, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 6,
                    column: 4
                },
                end: {
                    line: 6,
                    column: 12
                }
            }
        }) : o)) + "\n\t\t\t</a>\n\t\t</li>\n"
    },
    3: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.escapeExpression, c = t.lambda, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t<div class="monster-tab-content" data-tab="' + s((i = null != (i = u(e, "name") || (null != n ? u(n, "name") : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(r, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 14,
                    column: 44
                },
                end: {
                    line: 14,
                    column: 52
                }
            }
        }) : i)) + '">\n' + (null != (o = u(e, "unless").call(r, null != n ? u(n, "isEmpty") : n, {
            name: "unless",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 15,
                    column: 1
                },
                end: {
                    line: 20,
                    column: 12
                }
            }
        })) ? o : "") + '\t\t<button class="monster-button monster-button-secondary refresh" data-type="' + s(c((o = a && u(a, "root")) && u(o, "type"), n)) + '" data-mac_addres="' + s(c((o = a && u(a, "root")) && u(o, "macAddress"), n)) + '">\n\t\t\t<i class="fa fa-refresh"></i>\n\t\t\t' + s(c((o = (o = (o = (o = a && u(a, "root")) && u(o, "i18n")) && u(o, "provisionerApp")) && u(o, "debugPopup")) && u(o, "refresh"), n)) + "\n\t\t</button>\n\t\t<pre></pre>\n\t</div>\n"
    },
    4: function(t, n, e, l, a) {
        var o, i, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<button class="monster-button monster-button-secondary download" data-name="' + r((i = null != (i = s(e, "name") || (null != n ? s(n, "name") : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(null != n ? n : t.nullContext || {}, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 78
                },
                end: {
                    line: 16,
                    column: 86
                }
            }
        }) : i)) + '">\n\t\t\t<i class="fa fa-download"></i>\n\t\t\t' + r(t.lambda((o = (o = (o = (o = a && s(a, "root")) && s(o, "i18n")) && s(o, "provisionerApp")) && s(o, "debugPopup")) && s(o, "download"), n)) + "\n\t\t</button>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<nav class="monster-navbar">\n\t<ul class="navbar-menu">\n' + (null != (o = r(e, "each").call(i, null != n ? r(n, "files") : n, {
            name: "each",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 3,
                    column: 1
                },
                end: {
                    line: 9,
                    column: 10
                }
            }
        })) ? o : "") + '\t</ul>\n</nav>\n<div class="monster-tab-wrapper">\n' + (null != (o = r(e, "each").call(i, null != n ? r(n, "files") : n, {
            name: "each",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 13,
                    column: 0
                },
                end: {
                    line: 27,
                    column: 9
                }
            }
        })) ? o : "") + "</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main.entityCheck = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content entity-check">\n\t<h3 class="title">\n\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheck") : o) ? s(o, "ip") : o) ? s(o, "title") : o, n)) + '\n\t</h3>\n\t<p class="text">\n\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheck") : o) ? s(o, "ip") : o) ? s(o, "text") : o) ? s(o, "line1") : o, n)) + "\n\t\t<br/><br/>\n\t\t" + r(i(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheck") : o) ? s(o, "ip") : o) ? s(o, "text") : o) ? s(o, "line2") : o, n)) + "\n\t\t<br/><br/>\n\t\t" + r(i(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheck") : o) ? s(o, "ip") : o) ? s(o, "text") : o) ? s(o, "line3") : o, n)) + '\n\t</p>\n\t<form class="input-container" id="check_entity_status">\n\t\t<input type="text" id="entity" name="entity" placeholder="' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheck") : o) ? s(o, "ip") : o) ? s(o, "placeholder") : o, n)) + '">\n\t\t<button type="submit" class="monster-button-primary check-entity">\n\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheck") : o) ? s(o, "ip") : o) ? s(o, "button") : o, n)) + "\n\t\t</button>\n\t</form>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main.entityCheckResult = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<li class="status">\n\t\t\t<i class="fa fa' + (null != (o = r(e, "if").call(i, n, {
            name: "if",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 18
                },
                end: {
                    line: 9,
                    column: 41
                }
            }
        })) ? o : "") + '-circle-o iconography"></i>\n' + (null != (o = r(e, "with").call(i, r(e, "lookup").call(i, (o = (o = (o = (o = a && r(a, "root")) && r(o, "i18n")) && r(o, "provisionerApp")) && r(o, "entityCheckResult")) && r(o, "statuses"), a && r(a, "key"), {
            name: "lookup",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 10
                },
                end: {
                    line: 10,
                    column: 76
                }
            }
        }), {
            name: "with",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 2
                },
                end: {
                    line: 17,
                    column: 11
                }
            }
        })) ? o : "") + "\t\t</li>\n"
    },
    2: function(t, n, e, l, a) {
        return "-dot"
    },
    4: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return "\t\t\t<span>\n\t\t\t\t" + t.escapeExpression((i = null != (i = s(e, "label") || (null != n ? s(n, "label") : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(r, {
            name: "label",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 12,
                    column: 4
                },
                end: {
                    line: 12,
                    column: 13
                }
            }
        }) : i)) + "\n" + (null != (o = s(e, "if").call(r, null != n ? s(n, "tooltip") : n, {
            name: "if",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 13,
                    column: 3
                },
                end: {
                    line: 15,
                    column: 10
                }
            }
        })) ? o : "") + "\t\t\t</span>\n"
    },
    5: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t<i class="fa fa-question-circle" data-toggle="tooltip" title="' + t.escapeExpression((o = null != (o = i(e, "tooltip") || (null != n ? i(n, "tooltip") : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(null != n ? n : t.nullContext || {}, {
            name: "tooltip",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 14,
                    column: 66
                },
                end: {
                    line: 14,
                    column: 77
                }
            }
        }) : o)) + '"></i>\n'
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content entity-check">\n\t<h3 class="title">\n\t\t' + r((s(e, "replaceVar") || n && s(n, "replaceVar") || t.hooks.helperMissing).call(i, null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheckResult") : o) ? s(o, "title") : o, null != n ? s(n, "entity") : n, {
            name: "replaceVar",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 3,
                    column: 2
                },
                end: {
                    line: 3,
                    column: 67
                }
            }
        })) + '\n\t</h3>\n\t<p class="text"></p>\n\t<ul class="statuses-wrapper">\n' + (null != (o = s(e, "each").call(i, null != n ? s(n, "statuses") : n, {
            name: "each",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 7,
                    column: 1
                },
                end: {
                    line: 19,
                    column: 10
                }
            }
        })) ? o : "") + '\t</ul>\n\t<button type="button" class="monster-button" id="back">\n\t\t' + r(t.lambda(null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "entityCheckResult") : o) ? s(o, "button") : o, n)) + "\n\t</button>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main["listing-item"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return "\t\t" + t.escapeExpression(t.lambda(null != (o = null != (o = null != (o = null != (o = null != n ? i(n, "i18n") : n) ? i(o, "provisionerApp") : o) ? i(o, "listing") : o) ? i(o, "item") : o) ? i(o, "registered") : o, n)) + "\n"
    },
    3: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return "\t\t" + t.escapeExpression(t.lambda(null != (o = null != (o = null != (o = null != (o = null != n ? i(n, "i18n") : n) ? i(o, "provisionerApp") : o) ? i(o, "listing") : o) ? i(o, "item") : o) ? i(o, "notRegistered") : o, n)) + "\n"
    },
    5: function(t, n, e, l, a) {
        return "restart-devices"
    },
    7: function(t, n, e, l, a) {
        return "disabled"
    },
    9: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\tdata-toggle="tooltip"\n\t\t\t\t\tdata-placement="top"\n\t\t\t\t\tdata-original-title="' + t.escapeExpression(t.lambda(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? i(n, "i18n") : n) ? i(o, "provisionerApp") : o) ? i(o, "listing") : o) ? i(o, "item") : o) ? i(o, "restart") : o) ? i(o, "disabled") : o, n)) + '"\n\t\t\t\t'
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = "function", u = t.escapeExpression, p = t.lambda, d = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<tr data-mac-address="' + u((i = null != (i = d(e, "mac_address") || (null != n ? d(n, "mac_address") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "mac_address",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 1,
                    column: 22
                },
                end: {
                    line: 1,
                    column: 37
                }
            }
        }) : i)) + '"\n\tdata-brand="' + u((i = null != (i = d(e, "brand") || (null != n ? d(n, "brand") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 2,
                    column: 13
                },
                end: {
                    line: 2,
                    column: 22
                }
            }
        }) : i)) + '"\n\tdata-family="' + u((i = null != (i = d(e, "family") || (null != n ? d(n, "family") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "family",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 3,
                    column: 14
                },
                end: {
                    line: 3,
                    column: 24
                }
            }
        }) : i)) + '"\n\tdata-model="' + u((i = null != (i = d(e, "model") || (null != n ? d(n, "model") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 4,
                    column: 13
                },
                end: {
                    line: 4,
                    column: 22
                }
            }
        }) : i)) + '"\n\tdata-kazooid="' + u((i = null != (i = d(e, "kazooId") || (null != n ? d(n, "kazooId") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "kazooId",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 5,
                    column: 15
                },
                end: {
                    line: 5,
                    column: 26
                }
            }
        }) : i)) + '">\n\t<td>\n\t\t' + u((i = null != (i = d(e, "name") || (null != n ? d(n, "name") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 7,
                    column: 2
                },
                end: {
                    line: 7,
                    column: 10
                }
            }
        }) : i)) + "\n\t</td>\n\t<td>\n" + (null != (o = d(e, "if").call(r, null != n ? d(n, "isRegistered") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.program(3, a, 0),
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 1
                },
                end: {
                    line: 14,
                    column: 8
                }
            }
        })) ? o : "") + '\t</td>\n\t<td data-filter-value="' + u((i = null != (i = d(e, "name") || (null != n ? d(n, "name") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 24
                },
                end: {
                    line: 16,
                    column: 32
                }
            }
        }) : i)) + " " + u((i = null != (i = d(e, "mac_address") || (null != n ? d(n, "mac_address") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "mac_address",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 33
                },
                end: {
                    line: 16,
                    column: 48
                }
            }
        }) : i)) + " " + u((d(e, "formatMacAddress") || n && d(n, "formatMacAddress") || s).call(r, null != n ? d(n, "mac_address") : n, {
            name: "formatMacAddress",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 49
                },
                end: {
                    line: 16,
                    column: 81
                }
            }
        })) + " " + u((i = null != (i = d(e, "brand") || (null != n ? d(n, "brand") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 82
                },
                end: {
                    line: 16,
                    column: 91
                }
            }
        }) : i)) + " " + u((i = null != (i = d(e, "familly") || (null != n ? d(n, "familly") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "familly",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 92
                },
                end: {
                    line: 16,
                    column: 103
                }
            }
        }) : i)) + " " + u((i = null != (i = d(e, "model") || (null != n ? d(n, "model") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 104
                },
                end: {
                    line: 16,
                    column: 113
                }
            }
        }) : i)) + " " + u((i = null != (i = d(e, "status") || (null != n ? d(n, "status") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "status",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 114
                },
                end: {
                    line: 16,
                    column: 124
                }
            }
        }) : i)) + " " + u((i = null != (i = d(e, "kazooId") || (null != n ? d(n, "kazooId") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "kazooId",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 125
                },
                end: {
                    line: 16,
                    column: 136
                }
            }
        }) : i)) + '">\n\t\t' + u((d(e, "formatMacAddress") || n && d(n, "formatMacAddress") || s).call(r, null != n ? d(n, "mac_address") : n, {
            name: "formatMacAddress",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 17,
                    column: 2
                },
                end: {
                    line: 17,
                    column: 34
                }
            }
        })) + '\n\t</td>\n\t<td data-sort-value="' + u((i = null != (i = d(e, "brand") || (null != n ? d(n, "brand") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 19,
                    column: 22
                },
                end: {
                    line: 19,
                    column: 31
                }
            }
        }) : i)) + '">\n\t\t<div class="device-brand model-image" style="background-image: url(\'css/assets/brands/' + u((i = null != (i = d(e, "brand") || (null != n ? d(n, "brand") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 20,
                    column: 88
                },
                end: {
                    line: 20,
                    column: 97
                }
            }
        }) : i)) + '.png\');"></div>\n\t</td>\n\t<td data-sort-value="' + u((i = null != (i = d(e, "model") || (null != n ? d(n, "model") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 22,
                    column: 22
                },
                end: {
                    line: 22,
                    column: 31
                }
            }
        }) : i)) + '">\n\t\t<div class="device-model model-image"\n\t\t\tdata-toggle="tooltip"\n\t\t\tdata-placement="right"\n\t\t\tdata-original-title="' + u((i = null != (i = d(e, "brand") || (null != n ? d(n, "brand") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 26,
                    column: 24
                },
                end: {
                    line: 26,
                    column: 33
                }
            }
        }) : i)) + " - " + u((i = null != (i = d(e, "model") || (null != n ? d(n, "model") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 26,
                    column: 36
                },
                end: {
                    line: 26,
                    column: 45
                }
            }
        }) : i)) + '"\n\t\t\tstyle="background-image: url(\'css/assets/models/' + u((i = null != (i = d(e, "brand") || (null != n ? d(n, "brand") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 51
                },
                end: {
                    line: 27,
                    column: 60
                }
            }
        }) : i)) + "_" + u((i = null != (i = d(e, "family") || (null != n ? d(n, "family") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "family",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 61
                },
                end: {
                    line: 27,
                    column: 71
                }
            }
        }) : i)) + "_" + u((i = null != (i = d(e, "model") || (null != n ? d(n, "model") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 72
                },
                end: {
                    line: 27,
                    column: 81
                }
            }
        }) : i)) + '.jpg\');"></div>\n\t</td>\n\t<td>\n\t\t<div class="dropdown">\n\t\t\t<a class="dropdown-toggle"data-toggle="dropdown" href="#">\n\t\t\t\t<i class="fa fa-2x fa-cog"></i>\n\t\t\t</a>\n\t\t\t<ul class="dropdown-menu pull-right">\n\t\t\t\t<li class="provisioner-action-link provision-devices">\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-cog monster-grey"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + u(p(null != (o = null != (o = null != (o = null != (o = null != n ? d(n, "i18n") : n) ? d(o, "provisionerApp") : o) ? d(o, "listing") : o) ? d(o, "item") : o) ? d(o, "configure") : o, n)) + '\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="provisioner-action-link unlock-devices">\n\t\t\t\t\t<a href="javascript:void(0)">\n\t\t\t\t\t\t<i class="fa fa-unlock monster-grey"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + u(p(null != (o = null != (o = null != (o = null != (o = null != n ? d(n, "i18n") : n) ? d(o, "provisionerApp") : o) ? d(o, "listing") : o) ? d(o, "item") : o) ? d(o, "unlock") : o, n)) + '\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="provisioner-action-link ' + (null != (o = d(e, "if").call(r, null != n ? d(n, "showRestart") : n, {
            name: "if",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.program(7, a, 0),
            data: a,
            loc: {
                start: {
                    line: 51,
                    column: 39
                },
                end: {
                    line: 51,
                    column: 96
                }
            }
        })) ? o : "") + '"\n' + (null != (o = d(e, "unless").call(r, null != n ? d(n, "showRestart") : n, {
            name: "unless",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 52,
                    column: 4
                },
                end: {
                    line: 56,
                    column: 15
                }
            }
        })) ? o : "") + '>\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-refresh monster-grey"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + u(p(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? d(n, "i18n") : n) ? d(o, "provisionerApp") : o) ? d(o, "listing") : o) ? d(o, "item") : o) ? d(o, "restart") : o) ? d(o, "label") : o, n)) + '\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="divider"></li>\n\t\t\t\t<li class="provisioner-action-link view-files" data-type="logs">\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-file-text-o monster-grey"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + u(p(null != (o = null != (o = null != (o = null != (o = null != n ? d(n, "i18n") : n) ? d(o, "provisionerApp") : o) ? d(o, "listing") : o) ? d(o, "item") : o) ? d(o, "logs") : o, n)) + '\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="provisioner-action-link view-files" data-type="config">\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-files-o monster-grey"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + u(p(null != (o = null != (o = null != (o = null != (o = null != n ? d(n, "i18n") : n) ? d(o, "provisionerApp") : o) ? d(o, "listing") : o) ? d(o, "item") : o) ? d(o, "config") : o, n)) + '\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="divider"></li>\n\t\t\t\t<li class="provisioner-action-link delete-devices">\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-times monster-red"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + u(p(null != (o = null != n ? d(n, "i18n") : n) ? d(o, "delete") : o, n)) + "\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\t</td>\n</tr>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main.listing = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return null != (o = (i(e, "monsterPanelText") || n && i(n, "monsterPanelText") || t.hooks.helperMissing).call(null != n ? n : t.nullContext || {}, "", "warning", "fill-width", {
            name: "monsterPanelText",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 3,
                    column: 1
                },
                end: {
                    line: 6,
                    column: 22
                }
            }
        })) ? o : ""
    },
    2: function(t, n, e, l, a) {
        var o, i, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<span class="banned-text"></span>\n\t\t<button type="button" class="monster-button-warning monster-button-fit unblock-ip" data-ip="' + r((i = null != (i = s(e, "ipAddress") || (null != n ? s(n, "ipAddress") : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(null != n ? n : t.nullContext || {}, {
            name: "ipAddress",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 5,
                    column: 94
                },
                end: {
                    line: 5,
                    column: 107
                }
            }
        }) : i)) + '">' + r(t.lambda(null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "listing") : o) ? s(o, "unblockIp") : o, n)) + "</button>\n"
    },
    4: function(t, n, e, l, a) {
        var o, i, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return "\t\t" + r(t.lambda(null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "listing") : o) ? s(o, "provisionerUrl") : o, n)) + " <strong>" + r((i = null != (i = s(e, "provisionerUrl") || (null != n ? s(n, "provisionerUrl") : n)) ? i : t.hooks.helperMissing,
        "function" == typeof i ? i.call(null != n ? n : t.nullContext || {}, {
            name: "provisionerUrl",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 57
                },
                end: {
                    line: 9,
                    column: 75
                }
            }
        }) : i)) + "</strong>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.lambda, s = t.escapeExpression, c = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content" id="listing">\n' + (null != (o = c(e, "if").call(i, null != n ? c(n, "isBanned") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 2,
                    column: 1
                },
                end: {
                    line: 7,
                    column: 8
                }
            }
        })) ? o : "") + (null != (o = (c(e, "monsterPanelText") || n && c(n, "monsterPanelText") || t.hooks.helperMissing).call(i, "", "info", "fill-width", {
            name: "monsterPanelText",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 8,
                    column: 1
                },
                end: {
                    line: 10,
                    column: 22
                }
            }
        })) ? o : "") + '\t<div class="monster-table-wrapper-spaced">\n\t\t<div class="monster-table-header">\n\t\t\t<button class="monster-button-primary add-device">\n\t\t\t\t<i class="fa fa-plus-circle"></i>\n\t\t\t\t<span>\n\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "addDevice") : o, n)) + '\n\t\t\t\t</span>\n\t\t\t</button>\n\t\t\t<button class="monster-button-neutral open-provisioning-window">\n\t\t\t\t<i class="fa fa-clock-o monster-orange"></i>\n\t\t\t\t<span>\n\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "provisioningWindow") : o, n)) + '\n\t\t\t\t</span>\n\t\t\t</button>\n\t\t\t<button class="monster-button-neutral unlock-all">\n\t\t\t\t<i class="fa fa-unlock monster-red"></i>\n\t\t\t\t<span>\n\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "unlockAll") : o, n)) + '\n\t\t\t\t</span>\n\t\t\t</button>\n\n\t\t</div>\n\t\t<table class="monster-table footable" id="devices_list">\n\t\t\t<thead>\n\t\t\t\t<tr>\n\t\t\t\t\t<th data-sorted="true">\n\t\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "headers") : o) ? c(o, "name") : o, n)) + "\n\t\t\t\t\t</th>\n\t\t\t\t\t<th>\n\t\t\t\t\t\t" + s(r(null != (o = null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "headers") : o) ? c(o, "status") : o, n)) + "\n\t\t\t\t\t</th>\n\t\t\t\t\t<th>\n\t\t\t\t\t\t" + s(r(null != (o = null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "headers") : o) ? c(o, "macAddress") : o, n)) + '\n\t\t\t\t\t</th>\n\t\t\t\t\t<th data-type="html" data-breakpoints="xs">\n\t\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "headers") : o) ? c(o, "brand") : o, n)) + '\n\t\t\t\t\t</th>\n\t\t\t\t\t<th data-type="html" data-breakpoints="xs">\n\t\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != (o = null != n ? c(n, "i18n") : n) ? c(o, "provisionerApp") : o) ? c(o, "listing") : o) ? c(o, "headers") : o) ? c(o, "model") : o, n)) + '\n\t\t\t\t\t</th>\n\t\t\t\t\t<th data-type="html" data-sortable="false"></th>\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody></tbody>\n\t\t</table>\n\t</div>\n</div>\n'
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main.provisioningWindow = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i, r = t.lambda, s = t.escapeExpression, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing, p = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content provisioning-window-dialog">\n    <div class="description">\n        <span>' + s(r(null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "listing") : o) ? p(o, "openProvisioningWindow") : o) ? p(o, "description") : o, n)) + '</span>\n    </div>\n    <div class="form-container">\n        <form id="open_window" class="form form-horizontal">\n            <div class="content">\n                <div class="control-group">\n\t\t\t\t\t<label for="label" class="control-label">\n\t\t\t\t\t\t' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "listing") : o) ? p(o, "openProvisioningWindow") : o) ? p(o, "fields") : o) ? p(o, "ipAddress") : o) ? p(o, "label") : o, n)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="input-append">\n\t\t\t\t\t\t\t<input type="text" id="ip_address" name="ip_address" autocomplete="off" value=' + s((i = null != (i = p(e, "defaultIp") || (null != n ? p(n, "defaultIp") : n)) ? i : u,
        "function" == typeof i ? i.call(c, {
            name: "defaultIp",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 14,
                    column: 85
                },
                end: {
                    line: 14,
                    column: 98
                }
            }
        }) : i)) + '>\n\t\t\t\t\t\t\t<button class="btn clear-input">\n\t\t\t\t\t\t\t\t<i class="fa fa-trash"></i>\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="value" class="control-label">\n\t\t\t\t\t\t\t' + s((i = null != (i = p(e, "hoursLabel") || (null != n ? p(n, "hoursLabel") : n)) ? i : u,
        "function" == typeof i ? i.call(c, {
            name: "hoursLabel",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 23,
                    column: 7
                },
                end: {
                    line: 23,
                    column: 21
                }
            }
        }) : i)) + '\n\t\t\t\t\t</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<div class="input-append">\n\t\t\t\t\t\t\t<input type="text" id="hours" name="hours" value=' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "listing") : o) ? p(o, "openProvisioningWindow") : o) ? p(o, "fields") : o) ? p(o, "hours") : o) ? p(o, "defaultValue") : o, n)) + '>\n\t\t\t\t\t\t\t<span class="add-on">' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "listing") : o) ? p(o, "openProvisioningWindow") : o) ? p(o, "fields") : o) ? p(o, "hours") : o) ? p(o, "addOnLabel") : o, n)) + '</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n            </div>\n            <div class="actions clearfix">\n\t\t\t\t<div class="pull-right">\n\t\t\t\t\t<button type="submit" class="monster-button-success save-window">' + s(r(null != (o = null != n ? p(n, "i18n") : n) ? p(o, "save") : o, n)) + "</button>\n\t\t\t\t</div>\n\t\t\t</div>\n        </form>\n\n    </div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main["settings-fieldPassword"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        return " warning"
    },
    3: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t<i class="help-popover fa fa-question-circle"\n\t\t\t\tdata-toggle="tooltip"\n\t\t\t\tdata-placement="right"\n\t\t\t\tdata-original-title="' + t.escapeExpression((o = null != (o = i(e, "tooltip") || (null != n ? i(n, "tooltip") : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(null != n ? n : t.nullContext || {}, {
            name: "tooltip",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 15,
                    column: 25
                },
                end: {
                    line: 15,
                    column: 36
                }
            }
        }) : o)) + '"></i>\n'
    },
    5: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<div class="help-inline">\n\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "settings") : o) ? s(o, "inherits") : o) ? s(o, "partOne") : o, n)) + "<strong>" + r(i(null != (o = null != n ? s(n, "inheritData") : n) ? s(o, "value") : o, n)) + "</strong>" + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "settings") : o) ? s(o, "inherits") : o) ? s(o, "partTwo") : o, n)) + "<strong>" + r(i(null != (o = null != n ? s(n, "inheritData") : n) ? s(o, "level") : o, n)) + "</strong>\n\t\t</div>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = "function", u = t.escapeExpression, p = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="control-group' + (null != (o = p(e, "if").call(r, null != n ? p(n, "inherit") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 1,
                    column: 25
                },
                end: {
                    line: 1,
                    column: 55
                }
            }
        })) ? o : "") + '">\n\t<label class="control-label" for="' + u((i = null != (i = p(e, "path") || (null != n ? p(n, "path") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 2,
                    column: 35
                },
                end: {
                    line: 2,
                    column: 43
                }
            }
        }) : i)) + '">' + u((i = null != (i = p(e, "text") || (null != n ? p(n, "text") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 2,
                    column: 45
                },
                end: {
                    line: 2,
                    column: 53
                }
            }
        }) : i)) + '</label>\n\t<div class="controls">\n\t\t<div class="pull-left">\n\t\t\t<input id="' + u((i = null != (i = p(e, "path") || (null != n ? p(n, "path") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 5,
                    column: 14
                },
                end: {
                    line: 5,
                    column: 22
                }
            }
        }) : i)) + '"\n\t\t\t\tname="' + u((i = null != (i = p(e, "path") || (null != n ? p(n, "path") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 6,
                    column: 10
                },
                end: {
                    line: 6,
                    column: 18
                }
            }
        }) : i)) + '"\n\t\t\t\ttype="text"\n\t\t\t\tvalue="' + u((i = null != (i = p(e, "value") || (null != n ? p(n, "value") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "value",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 8,
                    column: 11
                },
                end: {
                    line: 8,
                    column: 20
                }
            }
        }) : i)) + '"\n\t\t\t\tdata-inherit="' + u((i = null != (i = p(e, "inherit") || (null != n ? p(n, "inherit") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "inherit",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 18
                },
                end: {
                    line: 9,
                    column: 29
                }
            }
        }) : i)) + '"\n\t\t\t\tautocomplete="new-password">\n' + (null != (o = p(e, "if").call(r, null != n ? p(n, "tooltip") : n, {
            name: "if",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 11,
                    column: 2
                },
                end: {
                    line: 16,
                    column: 9
                }
            }
        })) ? o : "") + "\t\t</div>\n" + (null != (o = p(e, "if").call(r, null != n ? p(n, "inheritData") : n, {
            name: "if",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 18,
                    column: 1
                },
                end: {
                    line: 22,
                    column: 8
                }
            }
        })) ? o : "") + "\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main["settings-fieldSelect"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        return " warning"
    },
    3: function(t, n, e, l, a, o, i) {
        var r, s, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing, p = t.escapeExpression, d = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t<option value="' + p((s = null != (s = d(e, "value") || (null != n ? d(n, "value") : n)) ? s : u,
        "function" == typeof s ? s.call(c, {
            name: "value",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 19
                },
                end: {
                    line: 9,
                    column: 28
                }
            }
        }) : s)) + '"' + (null != (r = (d(e, "compare") || n && d(n, "compare") || u).call(c, null != n ? d(n, "value") : n, "==", null != i[1] ? d(i[1], "value") : i[1], {
            name: "compare",
            hash: {},
            fn: t.program(4, a, 0, o, i),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 29
                },
                end: {
                    line: 9,
                    column: 82
                }
            }
        })) ? r : "") + ">\n\t\t\t\t\t" + p((s = null != (s = d(e, "text") || (null != n ? d(n, "text") : n)) ? s : u,
        "function" == typeof s ? s.call(c, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 5
                },
                end: {
                    line: 10,
                    column: 13
                }
            }
        }) : s)) + "\n\t\t\t\t</option>\n"
    },
    4: function(t, n, e, l, a) {
        return " selected"
    },
    6: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t<i class="help-popover fa fa-question-circle" data-toggle="tooltip" data-placement="right" data-original-title="' + t.escapeExpression((o = null != (o = i(e, "tooltip") || (null != n ? i(n, "tooltip") : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(null != n ? n : t.nullContext || {}, {
            name: "tooltip",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 15,
                    column: 115
                },
                end: {
                    line: 15,
                    column: 126
                }
            }
        }) : o)) + '"></i>\n'
    },
    8: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<div class="help-inline">\n\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "settings") : o) ? s(o, "inherits") : o) ? s(o, "partOne") : o, n)) + "<strong>" + r(i(null != (o = null != n ? s(n, "inheritData") : n) ? s(o, "text") : o, n)) + "</strong>" + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "settings") : o) ? s(o, "inherits") : o) ? s(o, "partTwo") : o, n)) + "<strong>" + r(i(null != (o = null != n ? s(n, "inheritData") : n) ? s(o, "level") : o, n)) + "</strong>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a, o, i) {
        var r, s, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing, p = t.escapeExpression, d = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="control-group' + (null != (r = d(e, "if").call(c, null != n ? d(n, "inherit") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0, o, i),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 1,
                    column: 25
                },
                end: {
                    line: 1,
                    column: 55
                }
            }
        })) ? r : "") + '">\n\t<label class="control-label" for="' + p((s = null != (s = d(e, "path") || (null != n ? d(n, "path") : n)) ? s : u,
        "function" == typeof s ? s.call(c, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 2,
                    column: 35
                },
                end: {
                    line: 2,
                    column: 43
                }
            }
        }) : s)) + '">\n\t\t' + p((s = null != (s = d(e, "text") || (null != n ? d(n, "text") : n)) ? s : u,
        "function" == typeof s ? s.call(c, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 3,
                    column: 2
                },
                end: {
                    line: 3,
                    column: 10
                }
            }
        }) : s)) + '\n\t</label>\n\t<div class="controls">\n\t\t<div class="pull-left">\n\t\t\t<select id="' + p((s = null != (s = d(e, "path") || (null != n ? d(n, "path") : n)) ? s : u,
        "function" == typeof s ? s.call(c, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 7,
                    column: 15
                },
                end: {
                    line: 7,
                    column: 23
                }
            }
        }) : s)) + '" name="' + p((s = null != (s = d(e, "path") || (null != n ? d(n, "path") : n)) ? s : u,
        "function" == typeof s ? s.call(c, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 7,
                    column: 31
                },
                end: {
                    line: 7,
                    column: 39
                }
            }
        }) : s)) + '">\n' + (null != (r = d(e, "each").call(c, null != n ? d(n, "options") : n, {
            name: "each",
            hash: {},
            fn: t.program(3, a, 0, o, i),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 8,
                    column: 3
                },
                end: {
                    line: 12,
                    column: 12
                }
            }
        })) ? r : "") + "\t\t\t</select>\n" + (null != (r = d(e, "if").call(c, null != n ? d(n, "tooltip") : n, {
            name: "if",
            hash: {},
            fn: t.program(6, a, 0, o, i),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 14,
                    column: 2
                },
                end: {
                    line: 16,
                    column: 9
                }
            }
        })) ? r : "") + "\t\t</div>\n" + (null != (r = d(e, "if").call(c, null != n ? d(n, "inheritData") : n, {
            name: "if",
            hash: {},
            fn: t.program(8, a, 0, o, i),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 18,
                    column: 1
                },
                end: {
                    line: 21,
                    column: 8
                }
            }
        })) ? r : "") + "\t</div>\n</div>\n"
    },
    useData: !0,
    useDepths: !0
}),
this.monster.cache.templates.provisioner._main["settings-fieldText"] = Handlebars.template({
    1: function(t, n, e, l, a) {
        return " warning"
    },
    3: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t<i class="help-popover fa fa-question-circle" data-toggle="tooltip" data-placement="right" data-original-title="' + t.escapeExpression((o = null != (o = i(e, "tooltip") || (null != n ? i(n, "tooltip") : n)) ? o : t.hooks.helperMissing,
        "function" == typeof o ? o.call(null != n ? n : t.nullContext || {}, {
            name: "tooltip",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 13,
                    column: 115
                },
                end: {
                    line: 13,
                    column: 126
                }
            }
        }) : o)) + '"></i>\n'
    },
    5: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t<div class="help-inline">\n\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "settings") : o) ? s(o, "inherits") : o) ? s(o, "partOne") : o, n)) + "<strong>" + r(i(null != (o = null != n ? s(n, "inheritData") : n) ? s(o, "value") : o, n)) + "</strong>" + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? s(n, "i18n") : n) ? s(o, "provisionerApp") : o) ? s(o, "settings") : o) ? s(o, "inherits") : o) ? s(o, "partTwo") : o, n)) + "<strong>" + r(i(null != (o = null != n ? s(n, "inheritData") : n) ? s(o, "level") : o, n)) + "</strong>\n\t\t</div>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = "function", u = t.escapeExpression, p = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="control-group' + (null != (o = p(e, "if").call(r, null != n ? p(n, "inherit") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 1,
                    column: 25
                },
                end: {
                    line: 1,
                    column: 55
                }
            }
        })) ? o : "") + '">\n\t<label class="control-label" for="' + u((i = null != (i = p(e, "path") || (null != n ? p(n, "path") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 2,
                    column: 35
                },
                end: {
                    line: 2,
                    column: 43
                }
            }
        }) : i)) + '">\n\t\t' + u((i = null != (i = p(e, "text") || (null != n ? p(n, "text") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 3,
                    column: 2
                },
                end: {
                    line: 3,
                    column: 10
                }
            }
        }) : i)) + '\n\t</label>\n\t<div class="controls">\n\t\t<div class="pull-left">\n\t\t\t<input id="' + u((i = null != (i = p(e, "path") || (null != n ? p(n, "path") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 7,
                    column: 14
                },
                end: {
                    line: 7,
                    column: 22
                }
            }
        }) : i)) + '"\n\t\t\t\tname="' + u((i = null != (i = p(e, "path") || (null != n ? p(n, "path") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "path",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 8,
                    column: 10
                },
                end: {
                    line: 8,
                    column: 18
                }
            }
        }) : i)) + '"\n\t\t\t\ttype="' + u((i = null != (i = p(e, "type") || (null != n ? p(n, "type") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "type",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 10
                },
                end: {
                    line: 9,
                    column: 18
                }
            }
        }) : i)) + '"\n\t\t\t\tvalue="' + u((i = null != (i = p(e, "value") || (null != n ? p(n, "value") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "value",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 11
                },
                end: {
                    line: 10,
                    column: 20
                }
            }
        }) : i)) + '"\n\t\t\t\tdata-inherit="' + u((i = null != (i = p(e, "inherit") || (null != n ? p(n, "inherit") : n)) ? i : s,
        typeof i === c ? i.call(r, {
            name: "inherit",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 11,
                    column: 18
                },
                end: {
                    line: 11,
                    column: 29
                }
            }
        }) : i)) + '">\n' + (null != (o = p(e, "if").call(r, null != n ? p(n, "tooltip") : n, {
            name: "if",
            hash: {},
            fn: t.program(3, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 12,
                    column: 2
                },
                end: {
                    line: 14,
                    column: 9
                }
            }
        })) ? o : "") + "\t\t</div>\n" + (null != (o = p(e, "if").call(r, null != n ? p(n, "inheritData") : n, {
            name: "if",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 16,
                    column: 1
                },
                end: {
                    line: 20,
                    column: 8
                }
            }
        })) ? o : "") + "\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._main.settings = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return null != (o = i(e, "with").call(null != n ? n : t.nullContext || {}, null != n ? i(n, "device") : n, {
            name: "with",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 5,
                    column: 2
                },
                end: {
                    line: 21,
                    column: 11
                }
            }
        })) ? o : ""
    },
    2: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.hooks.helperMissing, s = "function", c = t.escapeExpression, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t<div class="detail-card">\n\t\t\t\t<div class="avatar device-model model-image"\n\t\t\t\t\tdata-toggle="tooltip"\n\t\t\t\t\tdata-placement="right"\n\t\t\t\t\tdata-original-title="' + c((o = null != (o = u(e, "brand") || (null != n ? u(n, "brand") : n)) ? o : r,
        typeof o === s ? o.call(i, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 26
                },
                end: {
                    line: 10,
                    column: 35
                }
            }
        }) : o)) + " - " + c((o = null != (o = u(e, "model") || (null != n ? u(n, "model") : n)) ? o : r,
        typeof o === s ? o.call(i, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 10,
                    column: 38
                },
                end: {
                    line: 10,
                    column: 47
                }
            }
        }) : o)) + '"\n\t\t\t\t\tstyle="background-image: url(\'css/assets/models/' + c((o = null != (o = u(e, "brand") || (null != n ? u(n, "brand") : n)) ? o : r,
        typeof o === s ? o.call(i, {
            name: "brand",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 11,
                    column: 53
                },
                end: {
                    line: 11,
                    column: 62
                }
            }
        }) : o)) + "_" + c((o = null != (o = u(e, "family") || (null != n ? u(n, "family") : n)) ? o : r,
        typeof o === s ? o.call(i, {
            name: "family",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 11,
                    column: 63
                },
                end: {
                    line: 11,
                    column: 73
                }
            }
        }) : o)) + "_" + c((o = null != (o = u(e, "model") || (null != n ? u(n, "model") : n)) ? o : r,
        typeof o === s ? o.call(i, {
            name: "model",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 11,
                    column: 74
                },
                end: {
                    line: 11,
                    column: 83
                }
            }
        }) : o)) + '.jpg\');"></div>\n\t\t\t\t<div class="detail">\n\t\t\t\t\t<div class="title">\n\t\t\t\t\t\t' + c((o = null != (o = u(e, "name") || (null != n ? u(n, "name") : n)) ? o : r,
        typeof o === s ? o.call(i, {
            name: "name",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 14,
                    column: 6
                },
                end: {
                    line: 14,
                    column: 14
                }
            }
        }) : o)) + '\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="text">\n\t\t\t\t\t\t' + c((u(e, "formatMacAddress") || n && u(n, "formatMacAddress") || r).call(i, null != n ? u(n, "mac_address") : n, {
            name: "formatMacAddress",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 17,
                    column: 6
                },
                end: {
                    line: 17,
                    column: 38
                }
            }
        })) + "\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n"
    },
    4: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = t.escapeExpression, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t<li class="navbar-menu-item">\n\t\t\t\t\t\t<a href="#" class="navbar-menu-item-link' + (null != (o = (u(e, "compare") || n && u(n, "compare") || s).call(r, a && u(a, "index"), "===", 0, {
            name: "compare",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 46
                },
                end: {
                    line: 27,
                    column: 92
                }
            }
        })) ? o : "") + '" data-tab="' + c((i = null != (i = u(e, "id") || (null != n ? u(n, "id") : n)) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "id",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 104
                },
                end: {
                    line: 27,
                    column: 110
                }
            }
        }) : i)) + '" data-key="' + c((i = null != (i = u(e, "id") || (null != n ? u(n, "id") : n)) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "id",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 122
                },
                end: {
                    line: 27,
                    column: 128
                }
            }
        }) : i)) + '">\n\t\t\t\t\t\t\t' + c((i = null != (i = u(e, "text") || (null != n ? u(n, "text") : n)) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 28,
                    column: 7
                },
                end: {
                    line: 28,
                    column: 15
                }
            }
        }) : i)) + "\n\t\t\t\t\t\t</a>\n\t\t\t\t\t</li>\n"
    },
    5: function(t, n, e, l, a) {
        return " active"
    },
    7: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t<div class="content' + (null != (o = (c(e, "compare") || n && c(n, "compare") || s).call(r, a && c(a, "index"), "===", 0, {
            name: "compare",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 39,
                    column: 22
                },
                end: {
                    line: 39,
                    column: 68
                }
            }
        })) ? o : "") + '" data-key="' + t.escapeExpression((i = null != (i = c(e, "id") || (null != n ? c(n, "id") : n)) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "id",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 39,
                    column: 80
                },
                end: {
                    line: 39,
                    column: 86
                }
            }
        }) : i)) + '">\n' + (null != (o = c(e, "if").call(r, null != n ? c(n, "iterate") : n, {
            name: "if",
            hash: {},
            fn: t.program(8, a, 0),
            inverse: t.program(16, a, 0),
            data: a,
            loc: {
                start: {
                    line: 40,
                    column: 3
                },
                end: {
                    line: 79,
                    column: 10
                }
            }
        })) ? o : "") + "\t\t\t</div>\n"
    },
    8: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return (null != (o = (r(e, "compare") || n && r(n, "compare") || t.hooks.helperMissing).call(i, null != n ? r(n, "iterate") : n, "!==", 1, {
            name: "compare",
            hash: {},
            fn: t.program(9, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 41,
                    column: 4
                },
                end: {
                    line: 49,
                    column: 16
                }
            }
        })) ? o : "") + (null != (o = r(e, "each").call(i, null != n ? r(n, "data") : n, {
            name: "each",
            hash: {},
            fn: t.program(12, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 50,
                    column: 4
                },
                end: {
                    line: 65,
                    column: 13
                }
            }
        })) ? o : "")
    },
    9: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t<div class="nav nav-bar">\n' + (null != (o = i(e, "each").call(null != n ? n : t.nullContext || {}, null != n ? i(n, "data") : n, {
            name: "each",
            hash: {},
            fn: t.program(10, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 43,
                    column: 5
                },
                end: {
                    line: 47,
                    column: 14
                }
            }
        })) ? o : "") + "\t\t\t\t\t</div>\n"
    },
    10: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = t.escapeExpression, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t\t<a class="switch-sublink' + (null != (o = (u(e, "compare") || n && u(n, "compare") || s).call(r, a && u(a, "key"), "===", "0", {
            name: "compare",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 44,
                    column: 30
                },
                end: {
                    line: 44,
                    column: 76
                }
            }
        })) ? o : "") + '" data-key="' + c((i = null != (i = u(e, "key") || a && u(a, "key")) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "key",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 44,
                    column: 88
                },
                end: {
                    line: 44,
                    column: 96
                }
            }
        }) : i)) + '">\n\t\t\t\t\t\t\t' + c((i = null != (i = u(e, "key") || a && u(a, "key")) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "key",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 45,
                    column: 7
                },
                end: {
                    line: 45,
                    column: 15
                }
            }
        }) : i)) + "\n\t\t\t\t\t\t</a>\n"
    },
    12: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t<div class="sub-content' + (null != (o = (c(e, "compare") || n && c(n, "compare") || s).call(r, a && c(a, "key"), "===", "0", {
            name: "compare",
            hash: {},
            fn: t.program(5, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 51,
                    column: 28
                },
                end: {
                    line: 51,
                    column: 74
                }
            }
        })) ? o : "") + '" data-key="' + t.escapeExpression((i = null != (i = c(e, "key") || a && c(a, "key")) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "key",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 51,
                    column: 86
                },
                end: {
                    line: 51,
                    column: 94
                }
            }
        }) : i)) + '">\n' + (null != (o = c(e, "each").call(r, n, {
            name: "each",
            hash: {},
            fn: t.program(13, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 52,
                    column: 5
                },
                end: {
                    line: 63,
                    column: 14
                }
            }
        })) ? o : "") + "\t\t\t\t\t</div>\n"
    },
    13: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = t.escapeExpression, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t\t<div class="' + c((i = null != (i = u(e, "key") || a && u(a, "key")) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "key",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 53,
                    column: 18
                },
                end: {
                    line: 53,
                    column: 26
                }
            }
        }) : i)) + '">\n\t\t\t\t\t\t\t<legend>\n\t\t\t\t\t\t\t\t' + c((i = null != (i = u(e, "text") || (null != n ? u(n, "text") : n)) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 55,
                    column: 8
                },
                end: {
                    line: 55,
                    column: 16
                }
            }
        }) : i)) + "\n\t\t\t\t\t\t\t</legend>\n" + (null != (o = u(e, "if").call(r, null != n ? u(n, "hidden") : n, {
            name: "if",
            hash: {},
            fn: t.program(14, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 57,
                    column: 6
                },
                end: {
                    line: 61,
                    column: 13
                }
            }
        })) ? o : "") + "\t\t\t\t\t\t</div>\n"
    },
    14: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t\t\t<div class="settings-not-supported">\n\t\t\t\t\t\t\t\t' + t.escapeExpression(t.lambda((o = (o = (o = (o = a && i(a, "root")) && i(o, "i18n")) && i(o, "provisionerApp")) && i(o, "settings")) && i(o, "settingsNotSupported"), n)) + "\n\t\t\t\t\t\t\t</div>\n"
    },
    16: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return null != (o = i(e, "each").call(null != n ? n : t.nullContext || {}, null != n ? i(n, "data") : n, {
            name: "each",
            hash: {},
            fn: t.program(17, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 67,
                    column: 4
                },
                end: {
                    line: 78,
                    column: 13
                }
            }
        })) ? o : ""
    },
    17: function(t, n, e, l, a) {
        var o, i, r = null != n ? n : t.nullContext || {}, s = t.hooks.helperMissing, c = t.escapeExpression, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t<div class="' + c((i = null != (i = u(e, "key") || a && u(a, "key")) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "key",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 68,
                    column: 17
                },
                end: {
                    line: 68,
                    column: 25
                }
            }
        }) : i)) + '">\n\t\t\t\t\t\t<legend>\n\t\t\t\t\t\t\t' + c((i = null != (i = u(e, "text") || (null != n ? u(n, "text") : n)) ? i : s,
        "function" == typeof i ? i.call(r, {
            name: "text",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 70,
                    column: 7
                },
                end: {
                    line: 70,
                    column: 15
                }
            }
        }) : i)) + "\n\t\t\t\t\t\t</legend>\n" + (null != (o = u(e, "if").call(r, null != n ? u(n, "hidden") : n, {
            name: "if",
            hash: {},
            fn: t.program(18, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 72,
                    column: 5
                },
                end: {
                    line: 76,
                    column: 12
                }
            }
        })) ? o : "") + "\t\t\t\t\t</div>\n"
    },
    18: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t\t<div class="settings-not-supported">\n\t\t\t\t\t\t\t' + t.escapeExpression(t.lambda((o = (o = (o = (o = a && i(a, "root")) && i(o, "i18n")) && i(o, "provisionerApp")) && i(o, "settings")) && i(o, "settingsNotSupported"), n)) + "\n\t\t\t\t\t\t</div>\n"
    },
    20: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t<button type="button" class="monster-button cancel">\n\t\t\t\t\t' + t.escapeExpression(t.lambda(null != (o = null != (o = null != (o = null != n ? i(n, "i18n") : n) ? i(o, "provisionerApp") : o) ? i(o, "settings") : o) ? i(o, "back") : o, n)) + "\n\t\t\t\t</button>\n"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = null != n ? n : t.nullContext || {}, r = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content monster-detail-card">\n\t<div class="header-wrapper">\n\t\t<div class="header">\n' + (null != (o = r(e, "if").call(i, null != n ? r(n, "device") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 4,
                    column: 2
                },
                end: {
                    line: 22,
                    column: 9
                }
            }
        })) ? o : "") + '\t\t\t<nav class="monster-navbar reverse">\n\t\t\t\t<ul class="navbar-menu">\n' + (null != (o = r(e, "each").call(i, null != n ? r(n, "sections") : n, {
            name: "each",
            hash: {},
            fn: t.program(4, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 25,
                    column: 4
                },
                end: {
                    line: 31,
                    column: 13
                }
            }
        })) ? o : "") + '\t\t\t\t</ul>\n\t\t\t</nav>\n\t\t</div>\n\t</div>\n\t<div class="content-wrapper" id="form2object">\n\t\t<form class="form-horizontal" id="settings_form">\n' + (null != (o = r(e, "each").call(i, null != n ? r(n, "sections") : n, {
            name: "each",
            hash: {},
            fn: t.program(7, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 38,
                    column: 2
                },
                end: {
                    line: 81,
                    column: 11
                }
            }
        })) ? o : "") + '\t\t\t<div class="actions">\n' + (null != (o = (r(e, "compare") || n && r(n, "compare") || t.hooks.helperMissing).call(i, null != n ? r(n, "level") : n, "===", "device", {
            name: "compare",
            hash: {},
            fn: t.program(20, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 83,
                    column: 3
                },
                end: {
                    line: 87,
                    column: 15
                }
            }
        })) ? o : "") + '\t\t\t\t<button type="submit" class="monster-button monster-button-success" id="save_settings">\n\t\t\t\t\t' + t.escapeExpression(t.lambda(null != (o = null != n ? r(n, "i18n") : n) ? r(o, "save") : o, n)) + "\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t</form>\n\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._contacts = this.monster.cache.templates.provisioner._contacts || {},
this.monster.cache.templates.provisioner._contacts.contactList = Handlebars.template({
    1: function(t, n, e, l, a) {
        var o, i = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '\t\t\t\t\t<input type="checkbox" id="displayDirectoryNames"' + (null != (o = i(e, "if").call(null != n ? n : t.nullContext || {}, null != n ? i(n, "isDirectoryNamesDisplayed") : n, {
            name: "if",
            hash: {},
            fn: t.program(2, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 27,
                    column: 54
                },
                end: {
                    line: 27,
                    column: 102
                }
            }
        })) ? o : "") + "/>\n"
    },
    2: function(t, n, e, l, a) {
        return " checked"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = null != n ? n : t.nullContext || {}, c = t.hooks.helperMissing, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="app-content contact-list" id="contact_list">\n\t<div class="monster-table-wrapper-spaced">\n\t\t<div class="monster-table-header">\n\t\t\t<button class="monster-button-primary contact-action" data-action="create">\n\t\t\t\t<i class="fa fa-plus-circle"></i>\n\t\t\t\t<span>\n\t\t\t\t\t' + r(i(null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "addContact") : o, n)) + '\n\t\t\t\t</span>\n\t\t\t</button>\n\t\t\t<div class="csv-actions">\n\t\t\t\t<button class="monster-button-neutral import-csv">\n\t\t\t\t\t' + r((u(e, "telicon") || n && u(n, "telicon") || c).call(s, "file", {
            name: "telicon",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 12,
                    column: 5
                },
                end: {
                    line: 12,
                    column: 23
                }
            }
        })) + "\n\t\t\t\t\t<span>\n\t\t\t\t\t\t" + r(i(null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "importCsv") : o, n)) + '\n\t\t\t\t\t</span>\n\t\t\t\t</button>\n\t\t\t\t<button class="monster-button-neutral export-csv">\n\t\t\t\t\t' + r((u(e, "telicon") || n && u(n, "telicon") || c).call(s, "download", {
            name: "telicon",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 18,
                    column: 5
                },
                end: {
                    line: 18,
                    column: 27
                }
            }
        })) + "\n\t\t\t\t\t<span>\n\t\t\t\t\t\t" + r(i(null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "downloadCsv") : o, n)) + '\n\t\t\t\t\t</span>\n\t\t\t\t</button>\n\t\t\t</div>\n\n\t\t\t<div class="checkbox">\n' + (null != (o = (u(e, "monsterCheckbox") || n && u(n, "monsterCheckbox") || c).call(s, "large-checkbox", "append-label", null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "directoryNames") : o, {
            name: "monsterCheckbox",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 26,
                    column: 4
                },
                end: {
                    line: 28,
                    column: 24
                }
            }
        })) ? o : "") + '\t\t\t\t<i class="fa fa-question-circle" data-toggle="tooltip" data-placement="top" data-original-title="' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "tooltip") : o) ? u(o, "directorynames") : o, n)) + '"></i>\n\t\t\t</div>\n\n\t\t</div>\n\t\t<table class="monster-table footable" id="contact_list_table">\n\t\t\t<thead>\n\t\t\t\t<tr>\n\t\t\t\t\t<th data-sorted="true">\n\t\t\t\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "headers") : o) ? u(o, "index") : o, n)) + "\n\t\t\t\t\t</th>\n\t\t\t\t\t<th>\n\t\t\t\t\t\t" + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "headers") : o) ? u(o, "label") : o, n)) + "\n\t\t\t\t\t</th>\n\t\t\t\t\t<th>\n\t\t\t\t\t\t" + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "headers") : o) ? u(o, "account") : o, n)) + '\n\t\t\t\t\t</th>\n\t\t\t\t\t<th data-type="html" data-breakpoints="xs">\n\t\t\t\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "headers") : o) ? u(o, "number") : o, n)) + '\n\t\t\t\t\t</th>\n\t\t\t\t\t<th data-type="html" data-sortable="false"></th>\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody></tbody>\n\t\t</table>\n\t</div>\n</div>\n'
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._contacts.contactListForm = Handlebars.template({
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i, r = t.lambda, s = t.escapeExpression, c = null != n ? n : t.nullContext || {}, u = t.hooks.helperMissing, p = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return '<div class="contact-list-form contact-form-dialog" id="contact_list_dialog">\n\t<div class="form-container">\n\t\t<form id="save_contacts" class="form form-horizontal">\n\t\t\t<div class="content">\n\t\t\t\t<div class="control-group warning">\n\t\t\t\t\t<label for="index" class="control-label">' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "contactList") : o) ? p(o, "popup") : o) ? p(o, "fields") : o) ? p(o, "index") : o, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="number" name="index" value="' + s((i = null != (i = p(e, "index") || (null != n ? p(n, "index") : n)) ? i : u,
        "function" == typeof i ? i.call(c, {
            name: "index",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 8,
                    column: 47
                },
                end: {
                    line: 8,
                    column: 56
                }
            }
        }) : i)) + '">\n\t\t\t\t\t\t<div class="help-inline">\n\t\t\t\t\t\t\t' + (null != (o = r(null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "contactList") : o) ? p(o, "popup") : o) ? p(o, "inheritIndex") : o, n)) ? o : "") + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="label" class="control-label">' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "contactList") : o) ? p(o, "popup") : o) ? p(o, "fields") : o) ? p(o, "label") : o, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" name="label" value="' + s((i = null != (i = p(e, "label") || (null != n ? p(n, "label") : n)) ? i : u,
        "function" == typeof i ? i.call(c, {
            name: "label",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 17,
                    column: 45
                },
                end: {
                    line: 17,
                    column: 54
                }
            }
        }) : i)) + '">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group">\n\t\t\t\t\t<label for="value" class="control-label">' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "contactList") : o) ? p(o, "popup") : o) ? p(o, "fields") : o) ? p(o, "number") : o, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" name="value" value="' + s((i = null != (i = p(e, "value") || (null != n ? p(n, "value") : n)) ? i : u,
        "function" == typeof i ? i.call(c, {
            name: "value",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 23,
                    column: 45
                },
                end: {
                    line: 23,
                    column: 54
                }
            }
        }) : i)) + '">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="control-group warning">\n\t\t\t\t\t<label for="account" class="control-label">' + s(r(null != (o = null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "contactList") : o) ? p(o, "popup") : o) ? p(o, "fields") : o) ? p(o, "account") : o, n)) + '</label>\n\t\t\t\t\t<div class="controls">\n\t\t\t\t\t\t<input type="text" name="account" value="' + s((i = null != (i = p(e, "account") || (null != n ? p(n, "account") : n)) ? i : u,
        "function" == typeof i ? i.call(c, {
            name: "account",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 29,
                    column: 47
                },
                end: {
                    line: 29,
                    column: 58
                }
            }
        }) : i)) + '">\n\t\t\t\t\t\t<div class="help-inline">\n\t\t\t\t\t\t\t' + (null != (o = r(null != (o = null != (o = null != (o = null != (o = null != n ? p(n, "i18n") : n) ? p(o, "provisionerApp") : o) ? p(o, "contactList") : o) ? p(o, "popup") : o) ? p(o, "inheritAccount") : o, n)) ? o : "") + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class="actions clearfix">\n\t\t\t\t<div class="pull-right">\n\t\t\t\t\t<button type="submit" class="monster-button-success save-contact">' + s(r(null != (o = null != n ? p(n, "i18n") : n) ? p(o, "save") : o, n)) + "</button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</form>\n\t</div>\n</div>\n"
    },
    useData: !0
}),
this.monster.cache.templates.provisioner._contacts.contactListItem = Handlebars.template({
    1: function(t, n, e, l, a) {
        return " disabled"
    },
    compiler: [8, ">= 4.3.0"],
    main: function(t, n, e, l, a) {
        var o, i = t.lambda, r = t.escapeExpression, s = null != n ? n : t.nullContext || {}, c = t.hooks.helperMissing, u = t.lookupProperty || function(t, n) {
            if (Object.prototype.hasOwnProperty.call(t, n))
                return t[n]
        }
        ;
        return "<tr data-index=" + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "index") : o, n)) + '>\n\t<td data-sort-value="' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "index") : o, n)) + '">\n\t\t<div class="index-container">\n\t\t\t<input type="number" value="' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "index") : o, n)) + '" name="index" class="index-input" disabled>\n\t\t\t<div class="inline-actions">\n\t\t\t\t<button href="javascript:void(0)" type="button" class="inline-index-action" data-action-type="up"' + (null != (o = (u(e, "compare") || n && u(n, "compare") || c).call(s, null != (o = null != n ? u(n, "contact") : n) ? u(o, "index") : o, "===", 1, {
            name: "compare",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 6,
                    column: 101
                },
                end: {
                    line: 6,
                    column: 156
                }
            }
        })) ? o : "") + ">\n\t\t\t\t\t" + r((u(e, "telicon") || n && u(n, "telicon") || c).call(s, "arrow-up", {
            name: "telicon",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 7,
                    column: 5
                },
                end: {
                    line: 7,
                    column: 27
                }
            }
        })) + '\n\t\t\t\t<button href="javascript:void(0)" type="button" class="inline-index-action" data-action-type="down"' + (null != (o = u(e, "if").call(s, null != n ? u(n, "isLast") : n, {
            name: "if",
            hash: {},
            fn: t.program(1, a, 0),
            inverse: t.noop,
            data: a,
            loc: {
                start: {
                    line: 8,
                    column: 103
                },
                end: {
                    line: 8,
                    column: 133
                }
            }
        })) ? o : "") + ">\n\t\t\t\t\t" + r((u(e, "telicon") || n && u(n, "telicon") || c).call(s, "arrow-down", {
            name: "telicon",
            hash: {},
            data: a,
            loc: {
                start: {
                    line: 9,
                    column: 5
                },
                end: {
                    line: 9,
                    column: 29
                }
            }
        })) + '\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t</div>\n\n\t</td>\n\t<td data-filter-value="' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "label") : o, n)) + " " + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "value") : o, n)) + '">\n\t\t' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "label") : o, n)) + '\n\t</td>\n\t<td data-sort-value="' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "account") : o, n)) + '">\n\t\t' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "account") : o, n)) + '\n\t</td>\n\t<td data-sort-value="' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "value") : o, n)) + '">\n\t\t' + r(i(null != (o = null != n ? u(n, "contact") : n) ? u(o, "value") : o, n)) + '\n\t</td>\n\t<td>\n\t\t<div class="dropdown">\n\t\t\t<a class="dropdown-toggle"data-toggle="dropdown" href="#">\n\t\t\t\t<i class="fa fa-2x fa-cog"></i>\n\t\t\t</a>\n\t\t\t<ul class="dropdown-menu pull-right">\n\t\t\t\t<li class="provisioner-action-link contact-action" data-action="edit">\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-edit monster-grey"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + r(i(null != (o = null != (o = null != (o = null != (o = null != n ? u(n, "i18n") : n) ? u(o, "provisionerApp") : o) ? u(o, "contactList") : o) ? u(o, "item") : o) ? u(o, "edit") : o, n)) + '\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="provisioner-action-link contact-action" data-action="delete">\n\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t<i class="fa fa-times monster-red"></i>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t' + r(i(null != (o = null != n ? u(n, "i18n") : n) ? u(o, "delete") : o, n)) + "\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</a>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\t</td>\n</tr>\n"
    },
    useData: !0
});

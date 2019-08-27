(function() {
    var plusReady = function() {
        let wb = plus.webview.currentWebview(),
            orgNo = wb.jhOrgNo,
            orgName = wb.jhOrgName;

        var head = new Vue({
            el: ".jhTree-head",
            data: {
                canEdit: "canEdit" in wb ? wb.canEdit : 0,
            },
            methods: {
                newOrg: function() {
                    vm.newOrg();
                }
            }
        });

        var vm = new Vue({
            el: "#jhApply",
            data: {
                canEdit: "canEdit" in wb ? wb.canEdit : 0,
                topOrgNo: orgNo,
                topOrgs: null,
                orgs: [],
                searchWord: "",
                examines: [],
                prevOrgNo: "",
                prevOrgName: "",
            },
            computed: {
                filterOrgs: function() {
                    var sw = _trim(this.searchWord);
                    if (!sw) return this.orgs;
                    let ret = _filter(function(i) {
                        return i.name.indexOf(sw) >= 0;
                    }, this.orgs);
                    return ret;
                }
            },
            methods: {
                openDetail: function(i) {
                    if (i.type == '兼合式支部') {
                        let btns = [
                            {
                                title: "基本信息",
                                callback: () => {
                                    openWindow("jhOrgDetail.html", "jhOrgDetail", {
                                        orgId: i.id
                                    });
                                }
                            },
                            {
                                title: "支部活动",
                                callback: () => {
                                    openWindow("jhActivityList.html","jhActivityList", {
                                        jhOrgNo: i.no,
                                        canEdit: 0
                                    });
                                }
                            },
                            {
                                title: "支部成员",
                                callback: () => {
                                    openWindow("jhMemberManage.html","jhMemberManage", {
                                        jhOrgNo: i.no,
                                        canEdit: 0
                                    });
                                }
                            },
                        ];
                        plus.nativeUI.actionSheet({
                            title: "组织类型",
                            cancel: "取消",
                            buttons: btns
                        }, (e) => {
                            if (0 === e.index) return;
                            btns[e.index-1].callback();
                        });
                    } else {
                        openWindow("jhOrgDetail.html", "jhOrgDetail", {
                            orgId: i.id
                        });
                    }
                },
                openNext: function(i) {
                    var self = this;
                    getOrgs(i, function(d) {
                        if (!d.success || !d.data || !d.data.length) {
                            // ---
                        } else {
                            self.orgs = d.data;
                        }
                    });
                },
                openPrev: function() {
                    var self = this;
                    var i = self.orgs[0];
                    if (i.no == self.topOrgNo) {
                        return mui.toast("已达现有权限顶级");
                    }
                    if (i.superOrgNo == self.topOrgNo) {
                        self.orgs = self.topOrgs;
                    } else {
                        _jhAjax({
                            cmd: "fetch",
                            sql: "select superOrgNo, superOrgName from jhOrg where orgNo in (select superOrgNo from jhOrg where orgNo = ?)",
                            vals: _dump([i.no,])
                        }, function(d) {
                            if (!d.success || !d.data || !d.data.length) return mui.toast("无法获取上层目录父节点");
                            getOrgs(d.data[0], function(d) {
                                if (!d.success || !d.data || !d.data.length) return mui.toast("无法获取上层目录");
                                self.orgs = d.data;
                            });
                        }, "/db4web");
                    }
                },
                openTop: function() {
                    this.orgs = this.topOrgs;
                },
                newOrg: function() {
                    openWindow("jhOrgDetailEdit.html", "jhOrgDetailEdit", {
                        orgId: "",
                        prevOrgName: orgName,
                        prevOrgNo: orgNo,
                    });
                },
                operateJh: function(i) {
                    if (i.type != '兼合式支部') return this.openDetail(i);
                    if (!this.canEdit) return this.openDetail(i);
                    let btns = [
                        {
                            title: "基本信息",
                            callback: () => {
                                openWindow("jhOrgDetail.html", "jhOrgDetail", {
                                    orgId: i.id
                                });
                            }
                        },
                        {
                            title: "支部活动",
                            callback: () => {
                                openWindow("jhActivityList.html","jhActivityList", {
                                    jhOrgNo: i.no,
                                    canEdit: 0
                                });
                            }
                        },
                        {
                            title: "支部成员",
                            callback: () => {
                                openWindow("jhMemberManage.html","jhMemberManage", {
                                    jhOrgNo: i.no,
                                    canEdit: 0
                                });
                            }
                        },
                        {
                            title: "编辑",
                            callback: () => {
                                openWindow("jhOrgDetailEdit.html", "jhOrgDetailEdit", {
                                    orgId: i.id,
                                    prevOrgName: this.prevOrgName,
                                    prevOrgNo: this.prevOrgNo
                                });
                            }
                        },
                        {
                            title: "删除",
                            callback: () => {
                                mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
                                    if (e.index == 0) {
                                        _jhAjax({
                                            cmd: "exec",
                                            sql: "update jhOrg set ifValid = 0 where id = ?",
                                            vals: _dump([i.id])
                                        }, d => {
                                            mui.toast("删除"+(d.success?"成功":"失败"));
                                            if (d.success) {
                                                mui.fire(plus.webview.currentWebview(), "updateOrgs");
                                            }
                                        }, "/db4web");
                                    }
                                });
                            }
                        }
                    ];
					plus.nativeUI.actionSheet({
						title: "兼合组织操作",
						cancel: "取消",
						buttons: btns
					}, (e) => {
						if (0 === e.index) return;
						btns[e.index-1].callback();
                    });
                }
            },
            mounted: function() {
                // NOTHING
            }
        });

        // 初始化
        _jhAjax({
            cmd: "fetch",
            sql: "select id, orgName as name, orgNo as no, type from jhOrg where orgNo = ?",
            vals: _dump([orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                vm.orgs = d.data;
                vm.topOrgs = d.data;
            }
        }, "/db4web");

        var getOrgs = function(i, cb) {
            _jhAjax({
                cmd: "fetch",
                sql: "select id, orgName as name, orgNo as no, type, superOrgNo from jhOrg where superOrgNo = ? and ifvalid = 1",
                vals: _dump([i.no,])
            }, function(d) {
                if (d.success && d.data && d.data.length) {
                    vm.prevOrgNo = i.no;
                    vm.prevOrgName = i.name;
                }
                cb(d);
            }, "/db4web");
        };

        window.addEventListener('updateOrgs', function(event) {
            if (vm.prevOrgNo) {
                getOrgs({
                    name: vm.prevOrgName,
                    no: vm.prevOrgNo
                }, (d) => {
                    if (d.success && d.data) {
                        vm.orgs = d.data;
                    }
                });
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())

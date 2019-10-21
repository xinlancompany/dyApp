(function() {
    var plusReady = function() {
        var userInfo = _load(_get("userInfo")),
            isAdmin = "no" in userInfo,
            orgNo = "jh000001";

        var vm = new Vue({
            el: "#jhApply",
            data: {
                topOrgNo: "jh000001",
                topOrgs: "舟山市",
                orgs: [],
                searchWord: "",
                examines: [],
                canNext: true,
            },
            computed: {
                filterOrgs: function() {
                    var sw = _trim(this.searchWord);
                    if (!sw) return this.orgs;
                    return _filter(function(i) {
                        return i.name.indexOf(sw) >= 0;
                    }, this.orgs);
                }
            },
            methods: {
                openDetail: function(i) {
                    if (!isAdmin) return mui.toast("仅书记可以查看子组织详情");
                    openWindow("subOrg.html", "subOrg", {
						orgId: i.id,
                        orgNo: i.no,
                        orgName: i.name,
                        orgType: i.type,
                    });
                },
                openNext: function(i) {
                    if (!this.canNext) return;
                    this.canNext = false;
                    var self = this;
                    getOrgs(i.no, function(d) {
                        if (!d.success || !d.data || !d.data.length) {
                            if (i.type == "兼合式支部") {
                                mui.confirm("是否加入该支部？", "兼合支部", ["确定", "取消"], function(e) {
                                    if (e.index == 0) {
                                        _jhAjax({
//                                          cmd: "exec",
//                                          sql: "insert into jhMember(idNo,jhOrgNo,status,reason) values(?,?,?,?)",
//                                          vals: _dump([userInfo.idNo, i.no, 2, "兼合支部添加"])
                                            cmd: "applyJHPartyMember",
                                            idNo: userInfo.idNo,
                                            jhOrgNo: i.no
                                        }, d => {
                                            mui.toast(d.errmsg);
                                            if (d.success) {
                                                setTimeout(() => {
                                                    mui.back();
                                                }, 1500);
                                            }
                                            self.canNext = true;
                                        })
                                    }
                                });
                            }
//                          return mui.toast("该组织无下属分支");
                        } else {
                            self.orgs = d.data;
                            self.canNext = true;
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
                            sql: "select superOrgNo from jhOrg where orgNo in (select superOrgNo from jhOrg where orgNo = ?)",
                            vals: _dump([i.no,])
                        }, function(d) {
                            if (!d.success || !d.data || !d.data.length) return mui.toast("无法获取上层目录父节点");
                            getOrgs(d.data[0].superOrgNo, function(d) {
                                if (!d.success || !d.data || !d.data.length) return mui.toast("无法获取上层目录");
                                self.orgs = d.data;
                            });
                        }, "/db4web");
                    }
                },
                openTop: function() {
                    this.orgs = this.topOrgs;
                }
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

        var getOrgs = function(no, cb) {
            _jhAjax({
                cmd: "fetch",
                sql: "select id, orgName as name, orgNo as no, type, superOrgNo from jhOrg where superOrgNo = ? and ifvalid = 1",
                vals: _dump([no,])
            }, function(d) {
                cb(d);
            }, "/db4web");
        };
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())

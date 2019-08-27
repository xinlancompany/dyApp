(function() {
    var plusReady = function() {
        var userInfo = _load(_get("userInfo")),
            orgNo = "033000000018";

        var vm = new Vue({
            el: "#transSelectOrg",
            data: {
                topOrgNo: "033000000018",
                topOrgs: "中共舟山市委员会",
                orgs: [],
                searchWord: "",
                examines: []
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
                openNext: function(i) {
                    var self = this;
                    getOrgs(i.no, function(d) {
                        if (!d.success || !d.data || !d.data.length) {
                            // --
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
                        _callAjax({
                            cmd: "fetch",
                            sql: "select superOrgNo from organization where no in (select superOrgNo from organization where no = ?)",
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
                },
                selectOrg: function(i) {
                   mui.confirm("确定选择？", "提示", ["确定", "取消"], function(e) {
                       if (e.index == 0) {
                           mui.fire(plus.webview.getWebviewById("transUser"), "selectOrg", {
                               org: i
                           });
                           setTimeout(() =>{
                               mui.back();
                           }, 500);
                       }
                   });
                }
            }
        });

        // 初始化
        _callAjax({
            cmd: "fetch",
            sql: "select id, name, no, type from organization where no = ?",
            vals: _dump([orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                vm.orgs = d.data;
                vm.topOrgs = d.data;
            }
        });

        var getOrgs = function(no, cb) {
            _callAjax({
                cmd: "fetch",
                sql: "select id, name, no, type, superOrgNo from organization where superOrgNo = ? and ifvalid = 1",
                vals: _dump([no,])
            }, function(d) {
                cb(d);
            });
        };
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())

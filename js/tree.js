(function() {
    var plusReady = function() {
        var userInfo = _load(_get("userInfo")),
            isAdmin = "no" in userInfo,
            orgNo = isAdmin?userInfo.no:userInfo.orgNo;

        var vm = new Vue({
            el: "#tree",
            data: {
                topOrgNo: orgNo,
                topOrgs: null,
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
                    var self = this;
                    getOrgs(i.no, function(d) {
                        if (!d.success || !d.data || !d.data.length) return mui.toast("该组织无下属分支");
                        self.orgs = d.data;
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
                        });
                    }
                },
                openTop: function() {
                    this.orgs = this.topOrgs;
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
                sql: "select id, name, no, type superOrgNo from organization where superOrgNo = ?",
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

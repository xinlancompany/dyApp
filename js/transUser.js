function plusReady() {
    var vm = new Vue({
        el: "#transUser",
        data: {
            orgNo: "",
            orgName: "",
            org: null,
            users: [],
        },
        computed: {
        		outOrgName: function() {
        		    return this.org ? this.org.name : "";
        		},
            userNames: function() {
                return _map(i => {
                    return i.name;
                }, _filter(i => {
                    return i.ifSelect;
                }, this.users)).join(",");
            },
        },
        methods: {
            selectOrg: function() {
                openWindow("transSelectOrg.html", "transSelectOrg");
            },
            selectUsers: function() {
                openWindow("transSelectUsers.html", "transSelectUsers", {
                    orgNo: this.orgNo,
                    participants: this.users
                });
            },
            confirmTrans: function() {
                if (!this.org) return mui.toast("请选择转出支部");
                let outUsers = _filter(i => {
                    return i.ifSelect;
                }, this.users);
                if (!outUsers.length) return mui.toast("请选择转出党员");
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump(_map((i) => {
                        return {
                            key: "key"+parseInt(Math.random()*10e6),
                            sql: "insert into userTrans(name,idNo,userId,srcOrgNo,srcOrgName,destOrgNo,destOrgName) " +
                                "values('"+i.name+"','"+i.idNo+"',"+i.id+",'"+this.orgNo+"','"+this.orgName+"'," +
                                "'"+this.org.no+"','"+this.org.name+"')"
                        };
                    }, outUsers))
                }, d => {
                    if (d.success) {
                        mui.toast("转出申请已提交");
                        setTimeout(() => {
                            mui.back();
                        }, 500);
                    } else {
                        mui.toast("转出失败");
                    }
                });
            }
        },
        created: function() {
            let wb = plus.webview.currentWebview();
            this.orgNo = wb.orgNo;
            this.orgName = wb.orgName;
        }
    });


    // 返回选择成员
    window.addEventListener("selectUsers", function(event) {
        vm.users = event.detail.participants;
    });

    // 返回选择转出组织
    window.addEventListener("selectOrg", function(event) {
        vm.org = event.detail.org
    });
};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
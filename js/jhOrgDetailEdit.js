function plusReady() {
    var wb = plus.webview.currentWebview();

    var upload = new Vue({
        el: "#jhActivityUpload",
        data: {
            // ------
            idNo:  "", // 身份证
            isEdit: 0, // 是否处于编辑状态
            // ------
            orgId: "",
            prevOrgNo: "",
            prevOrgName: "",
            info: {
                id: "",
                orgName: "",
                orgNo: "",
                secretary: "",
                secretaryPhone: "",
                superOrgName: "",
                type: "",
            }
        },
        computed: {
        },
        methods: {
            chooseType: function() {
                let types = ["组织部", "区县", "街道", "社区", "兼合式支部"];
                plus.nativeUI.actionSheet({
                    title: "组织类型",
                    cancel: "取消",
                    buttons: _map(t => {
                        return {
                            title: t
                        }
                    }, types)
                }, (e) => {
                    if (0 === e.index) return;
                    this.info.type = types[e.index-1];
                });
            },
            newJhOrg: function() {
                if (this.ifSubmit) return;
                this.ifSubmit = true;

                let orgName = _trim(this.info.orgName);
                let orgNo = _trim(this.info.orgNo);
                let secretary = _trim(this.info.secretary);
                let secretaryPhone = _trim(this.info.secretaryPhone);
                if (!orgName) return mui.toast("请填写组织名称");
                if (!orgNo) return mui.toast("请填写组织代码");
                if (!secretary) return mui.toast("请填写书记名字");
                if (!secretaryPhone) return mui.toast("请填写书记电话");

                let sql = "insert into jhOrg(orgName,orgNo,secretary," +
                    "secretaryPhone,superOrgNo,superOrgName,pswd,type) values(?,?,?,?,?,?,?,?)",
                    prms = [orgName,orgNo,secretary,secretaryPhone,this.prevOrgNo,this.prevOrgName,"123456","兼合式支部"];
                if (this.info.id) {
                    sql = "update jhOrg set orgNo = ?, orgName = ?, secretary = ?, " +
                        "secretaryPhone = ? where id = ?",
                    prms = [orgNo, orgName, secretary, secretaryPhone, this.info.id]
                }
                
                _jhAjax({
                    cmd: "exec",
                    sql: sql,
                    vals: _dump(prms)
                }, d => {
                    if (d.success) {
                        mui.toast("设置完成");
                        mui.fire(plus.webview.getWebviewById("jhTree"), "updateOrgs");
                        setTimeout(() => {
                            mui.back();
                        }, 500);
                    } else {
                        mui.toast(d.errMsg);
                    }
                }, "/db4web");
            },
            changeTxt: function(i) {
            },
            init: function(info) {
            },
        },
        created: function() {
            let wb = plus.webview.currentWebview();
		    this.orgId = wb.orgId;
		    this.prevOrgNo = wb.prevOrgNo;
		    this.prevOrgName = wb.prevOrgName;
		    if (!this.orgId) {
                this.info.superOrgName = this.prevOrgName;
                this.info.type = "兼合式支部";
		    } else {
                _jhAjax({
                    cmd: "fetch",
                    sql: "select id, orgName, secretary, secretaryPhone, type, orgNo, superOrgName from jhOrg where id = ?",
                    vals: _dump([this.orgId])
                }, d => {
                    if (d.success && d.data && d.data.length) {
                        this.info = d.data[0];
                    } else {
                    }
                }, "/db4web");
		    }
        }
    });

};

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}


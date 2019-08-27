(function() {
    var plusReady = function() {
		pullToRefresh();
        
        var vm = new Vue({
            el: "#jhMemberAdd",
            data: {
                members: [],
                searchWord:"",
                jhOrgNo: "",
            },
            methods: {
                search: function() {
                    let sw = _trim(this.searchWord),
                        tp = "name";
                    // 身份证
                    if (/(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/.test(sw)) {
                        tp = "idNo"
                    }
                    // 手机
                    if (/^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/.test(sw)) {
                        tp = "phone"
                    }
                    if (!sw) return mui.toast("请输入有效信息");
                    let prms = {
                        cmd: "getAddJHPMList",
                        pageNo: 1,
                        pageSize: 100
                    };
                    prms[tp] = sw;
                    _jhAjax(prms, d => {
                        _tell(d);
                        mui.toast(d.errmsg);
                        if (d.success && d.data && d.data.list.length) {
                            this.members = d.data.list;
                        }
                    });
                },
                openMember: function(i) {
                    openWindow("jhMemberDetail.html", "jhMemberDetail", {
                        info: i
                    });
                },
                addMember: function(i) {
                   var self = this;
                   mui.confirm("确定添加？", "提示", ["确定", "取消"], function(e) {
                       if (e.index == 0) {
                           _jhAjax({
                               cmd: "insertPartyMember",
                               jhOrgNo: self.jhOrgNo,
                               params: _dump([i])
                           }, d => {
                               mui.toast(d.errmsg);
                               if (d.success) {
                                   mui.toast("添加成功");
                                   mui.fire(plus.webview.getWebviewById('jhMemberManage'), 'updateUsers');
                                   setTimeout(() => {
                                       mui.back()
                                   }, 500);
                               }
                           });
                       }
                   });
                }
            },
            mounted: function() {
                let wb = plus.webview.currentWebview();
                this.jhOrgNo = wb.jhOrgNo;
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

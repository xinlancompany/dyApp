(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
        $(".mui-title").text(wb.name+"的活动记录");
        $(".quitJh").click(() => {
            mui.confirm("确定退出兼合支部？", "提示", ["确定", "取消"], function(e) {
                if (e.index == 0) {
                    _jhAjax({
                        cmd: "exec",
                        sql: "update jhMember set status = 4 where idNo = '"+wb.idNo+"'"
                    }, d => {
                        mui.toast("退出提交"+(d.success?"成功":"失败"));
                        if (d.success) {
                            mui.fire(plus.webview.getWebviewById("index"), "updateJhMemberStatus", {
                                status: 4
                            });
                            mui.back();
                        }
                    }, "/db4web");
                }
            });
        });

        var vm = new Vue({
            el: "#jhmAR",
            data: {
                activities: [],
                idNo: "",
            },
            methods: {
                openActivity: function(actId) {
                    openWindow("jhActivityDetail.html", "jhActivityDetail", {
                        jhActId: actId
                    });
                }
            },
            created: function() {
                this.idNo = wb.idNo;
                _jhAjax({
                    cmd: "getPmjhActListByIDNo",
                    idNo: this.idNo,
                    year: 2019,
                    title: "",
                    pageNo: 1,
                    pageSize: 100,
                }, d => {
                    _tell(d);
                    if (d.success && d.data && d.data.list.length) {
                        this.activities = d.data.list;
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
}());

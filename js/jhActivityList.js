(function() {
    var plusReady = function() {

        var vm = new Vue({
            el: "#jhmAR",
            data: {
                activities: [],
                jhOrgNo: "",
                canEdit: 1,
            },
            methods: {
                openActivity: function(actId, idx) {
                    openWindow("jhActivityDetail.html", "jhActivityDetail", {
                        jhOrgNo: this.jhOrgNo,
                        jhActId: actId,
                        idx: idx,
                        canOperate: this.canEdit,
                    });
                },
                newActivity: function() {
                    openWindow(
                        "jhActivityUpload.html",
                        "jhActivityUpload",
                        {
                            jhOrgNo: this.jhOrgNo
                        }
                    );
                },
                delActivity: function(idx) {
                   this.activities.splice(idx, 1);
                },
                getActivities: function() {
                    _jhAjax({
                        cmd: "getJHActList",
                        jhOrgNo: this.jhOrgNo,
                        title: "",
                        starttime: "",
                        endtime: "",
                        pageNo: 1,
                        pageSize: 100,
                    }, d => {
                        _tell(d);
                        if (d.success && d.data && d.data.list.length) {
                            this.activities = d.data.list;
                        }
                    });
                }
            },
            created: function() {
                let wb = plus.webview.currentWebview();
                this.jhOrgNo = wb.jhOrgNo;
                if ("canEdit" in wb) this.canEdit = wb.canEdit;
                if (!this.canEdit) $(".new-activity").hide();
                this.getActivities();
            }
        });

        $(".new-activity").click(() => {
            vm.newActivity();
        });

        // 删除更新
        window.addEventListener("delActivity", function(event) {
            vm.delActivity(event.detail.idx);
        });

        // 新建成功
        window.addEventListener("getActivities", function(event) {
            vm.getActivities();
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

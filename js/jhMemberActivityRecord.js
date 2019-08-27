(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
        $(".mui-title").text(wb.name+"的活动记录");

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

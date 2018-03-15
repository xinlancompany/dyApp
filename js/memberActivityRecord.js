(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview(),
            userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#mAR",
            data: {
                activities: []
            },
            methods: {
                actions: function(i) {
                    var buttons = [
                        {
                            title: "心得审核"
                        },
                        {
                            title: "活动打分"
                        }
                    ];
                    plus.nativeUI.actionSheet({
                        title: "操作",
                        cancel: "取消",
                        buttons: buttons
                    }, function(e) {
                        if (e.index == 0) return;
                        if (e.index == 1) {
                            if (!i.experience) return mui.toast("暂无心得");
                            var imgs = [];
                            if (!!i.imgs) imgs = _load(i.imgs);
                            openWindow("reviewDetail.html", "reviewDetail", {
                                idx: i.id,
                                title: i.experienceTitle,
                                content: i.experience,
                                imgs: imgs,
                                isAdmin: "no" in userInfo,
                                permitted: parseInt(i.experiencePermitted),
                                from: "member",
                            });
                        }
                        if (e.index == 2) {
                            openWindow("grade.html", "grade", {
                                idx: i.id,
                                score: i.score,
                                scoreType: i.scoreType,
                                from: "member",
                            });
                        }
                    });
                }
            }
        });

        $(".mui-title").text(wb.name+"的活动记录");
        var init = function() {
            _callAjax({
                cmd: "fetch",
                sql: "select e.id, a.title, strftime('%Y-%m-%d', a.starttime) as logtime, e.id, e.experience, e.experienceTitle, e.imgs, e.experienceTime, e.experiencePermitted, e.score, e.scoreType from activityEnroll e, activitys a where e.userId = ? and e.activityId = a.id",
                vals: _dump([wb.idx,])
            }, function(d) {
                // alert(_dump(d.data));
                if (d.success && d.data && d.data.length) vm.activities = d.data;
            });
        };
        init();

        window.addEventListener("refresh", function() {
            init();
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

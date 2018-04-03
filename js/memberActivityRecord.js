(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview(),
            userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#mAR",
            data: {
                activities: [],
                // studyScore: 0,
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
            // 学习积分
            _callAjax({
                cmd: "multiFetch",
                multi: _dump([
                    {
                        key: "activity",
                        sql: "select e.id, a.title, strftime('%Y-%m-%d', a.starttime) as logtime, e.id, e.experience, e.experienceTitle, e.imgs, e.experienceTime, e.experiencePermitted, e.score, e.scoreType from activityEnroll e, activitys a where e.userId = "+wb.idx+" and e.activityId = a.id and a.ifValid > 0",
                    },
                    /*
                    {
                        sql: "select sum(credit) as total from courseEnroll e, courses c where e.userId = "+wb.idx+" and e.courseId = c.id",
                        key: "course"
                    },
                    {
                        key: "live",
                        sql: "select liveId, count(id) as cnt from liveEnroll where userId ="+wb.idx+" group by liveId"
                    }
                    */
                ])
            }, function(d) {
                if (!d.success || !d.data) return;
                if (d.data["activity"] && d.data["activity"].length) {
                    vm.activities = d.data["activity"];
                }
                /*
                if (d.data["course"] && d.data["course"].length) {
                    if (!d.data["course"][0].total) {
                        vm.studyScore += 0;
                    } else {
                        vm.studyScore += parseInt(d.data["course"][0].total);
                    }
                }
                if (d.data["live"] && d.data["live"].length) {
                    d.data.live.forEach(function(i) {
                        var score = cnt * 0.05; // 每20分钟1分
                        if (score > 1) score = 1; // 最多得到1分
                        vm.studyScore += score;
                    });
                }
                if (vm.studyScore > 20) vm.studyScore = 20; // 学习总分不超过20分
                */
            });

            // 活动积分
            _callAjax({
                cmd: "fetch",
                sql: "select e.id, a.title, strftime('%Y-%m-%d', a.starttime) as logtime, e.id, e.experience, e.experienceTitle, e.imgs, e.experienceTime, e.experiencePermitted, e.score, e.scoreType from activityEnroll e, activitys a where e.userId = ? and e.activityId = a.id and a.ifValid = 1",
                vals: _dump([,])
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

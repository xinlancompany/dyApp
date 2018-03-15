(function() {
    var plusReady = function() {
        var vm = new Vue({
            el: "#score",
            data: {
                activityScore: 0,
                studyScore: 0,
                activeTab: 0,
                totalScore: 0,
            },
            watch: {
                activeTab: function(i) {
                    if (i) {
                        this.totalScore = this.studyScore;
                    } else {
                        this.totalScore = this.activityScore;
                    }
                }
            },
            methods: {
                changeTab: function(i) {
                    this.activeTab = i;
                    if (i) {
                        this.totalScore = this.studyScore;
                    } else {
                        this.totalScore = this.activityScore;
                    }
                }
            }
        });

        var userInfo = _load(_get("userInfo"));

        _callAjax({
            cmd: "multiFetch",
            multi: _dump([
                {
                    key: "score",
                    sql: "select sum(score) as total, scoreType from activityEnroll where userId = "+userInfo.id+" group by scoreType"
                },
                {
                    sql: "select sum(credit) as total from courseEnroll e, courses c where e.userId = "+userInfo.id+" and e.courseId = c.id",
                    key: "course"
                },
                {
                    key: "live",
                    sql: "select liveId, count(id) as cnt from liveEnroll where userId ="+userInfo.id+" group by liveId"
                }
            ])
        }, function(d) {
            if (!d.success) return;
            if ("score" in d.data && d.data.score && d.data.score.length) {
                d.data.score.forEach(function(i) {
                    if (i.scoreType == "百分制") vm.activityScore += parseInt(i.total);
                    if (i.scoreType == "五星制") vm.activityScore += i.total * 20;
                });
            }
            if ("course" in d.data && d.data.course && d.data.course.length) {
                vm.studyScore += parseInt(d.data.course[0].total);
            }
            if ("live" in d.data && d.data.live && d.data.live.length) {
                d.data.live.forEach(function(i) {
                    var score = cnt * 0.2;
                    if (score > 10) score = 10;
                    vm.studyScore += score;
                });
            }
            if (vm.activeTab) {
                vm.totalScore = vm.studyScore;
            } else {
                vm.totalScore = vm.activityScore;
            }
        });

        var wb = plus.webview.currentWebview();
        vm.activeTab = wb.tab;
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

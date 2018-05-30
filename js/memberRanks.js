(function() {
    var plusReady = function() {
        var vm = new Vue({
            el: "#memberRanks",
            data: {
                members: [],
                searchWord: "",
            },
            computed: {
            	filterMembers: function() {
            		var sw = _trim(this.searchWord);
            		if (!sw) return this.members;
            		return _filter(function(i) {
            			return i.name.indexOf(sw) >= 0;
            		}, this.members);
            	}
            },
            methods: {
                rankMember: function(i) {
                    // 个人打分
                    openWindow("grade.html", "grade", {
                        idx: i.id,
                        score: i.score,
                        scoreType: i.scoreType
                    });
                }
            }
        });

        var wb = plus.webview.currentWebview();

        var init = function() {
            _callAjax({
                cmd: "fetch",
                sql: "select e.id, u.name, e.preScore as score, e.scoreType from activityEnroll e left join user u on e.userId = u.id where e.activityId = ?",
                vals: _dump([wb.aid,])
            }, function(d) {
                if (d.success && d.data && d.data.length) {
                    vm.members = [];
                    d.data.forEach(function(i) {
                        if (!parseInt(i.score)) {
                            i.scoreTag = "未打分";
                        } else {
                            if (i.scoreType == "百分制") {
                                i.scoreTag = i.score+"分";
                            } else {
                                i.scoreTag = i.score+"星";
                            }
                        }
                    });
                    vm.members = d.data;
                }
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

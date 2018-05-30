(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();

        mui.init({
            beforeback: function() {
                var score = vm.s1;
                if (vm.gradeType == "五星制") {
                    score = vm.s2
                }
                if (score > 0) {
                    _callAjax({
                        cmd: "exec",
                        sql: "update activityEnroll set preScore = ?, scoreType = ? where id = ?",
                        vals: _dump([score, vm.gradeType, wb.idx])
                    }, function(d) {
                        if (d.success) {
                            if ("from" in wb && wb.from == "member") {
                                mui.fire(plus.webview.getWebviewById("memberActivityRecord"), "refresh");
                            } else {
                                mui.fire(plus.webview.getWebviewById("memberRanks"), "refresh");
                            }
                        }
                    });

					// 打分
					_callAjax({
						cmd:"exec",
						sql: "insert into notices(userId, msg, tp) values(?,?,?)",
						vals: _dump([vm.userId, vm.title+"，活动打分: "+score, "success"])
					}, function(d) {
						
					});
                }
            }
        });

        var vm = new Vue({
            el: "#grade",
            data: {
                gradeType: "百分制",
                s1: 0,
                s2: 0,
                userId: null,
                title: "",
            },
            methods: {
                switchType: function() {
                    var self = this;
                    var buttons = [
                        {title: "百分制"},
                        {title: "五星制"}
                    ];
                    plus.nativeUI.actionSheet({
                        title: "活动类别",
                        cancel: "取消",
                        buttons: buttons
                    }, function(e) {
                        if (e.index == 0) return;
                        self.gradeType = buttons[e.index-1].title;
                    });
                },
                score1: function() {
                    var self = this;
                    var userPicker = new mui.PopPicker();
					userPicker.setData(_map(function(i) {
                        return {
                            value: i,
                            text: i
                        }
                    }, _range(1, activityScoreSetting.activityLimit)));
					userPicker.show(function(items) {
						// userResult.innerText = JSON.stringify(items[0]);
                        self.s1 = items[0].value;
					});
                },
                score2: function(i) {
                    this.s2 = i;
                }
            },
            created: function() {
                this.gradeType = wb.scoreType;
                if (this.gradeType == "百分制") {
                    this.s1 = wb.score;
                } else {
                    this.s2 = wb.score;
                }
                _callAjax({
                		cmd: "fetch",
                		sql: "select a.title, e.userId from activityEnroll e, activitys a where e.activityId = a.id and e.id = "+wb.idx
                }, function(d) {
                		if (d.success && d.data) {
                			vm.userId = d.data[0].userId;
                			vm.title = d.data[0].title;
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

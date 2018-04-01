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
                        sql: "update activityEnroll set score = ?, scoreType = ? where id = ?",
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
                }
            }
        });

        var vm = new Vue({
            el: "#grade",
            data: {
                gradeType: "百分制",
                s1: 0,
                s2: 0,
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
            }
        });

    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

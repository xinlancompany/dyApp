(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectAbsents", {
                    absents: _filter(function(i) {
                    		return i.reason != '';
                    }, vm.users)
                });
            }
        });

        var userInfo = _load(_get("userInfo"));
		var wb = plus.webview.currentWebview();

        var vm = new Vue({
            el: "#selectAbsents",
            data: {
                users: [],
                reasons: [],
                curReasonId: -1,
                otherReason: '',
                absents: [],
            },
            watch: {
            		curReasonId: function(i) {
            			if (i < 0) return;
            			var r = this.curReasonId == this.reasons.length ? this.otherReason : this.reasons[this.curReasonId];
            			if (r =='') r = "其他";
            			this.users.forEach(function(i) {
            				i.ifSelect = i.reason == r;
            			});
            		}
            },
            methods: {
                updateAbsentReason: function(i) {
                		var orn = this.otherReason == ""?'其他':this.otherReason;
                		if (i.ifSelect) {
                			i.reason = this.curReasonId == this.reasons.length ? orn : i.reason = this.reasons[this.curReasonId];
                		} else {
                			i.reason = '';
                		}
                },
                getUsers: function() {
					wb.users.forEach(function(i) {
						i.reason = '';
						i.ifSelect = false;
						wb.absents.forEach(function(j) {
							if (j.id == i.id) {
								i.reason = j.reason;
							}
						});
						vm.users.push(i);
					});
                }
            },
            created: function() {
				this.absents = wb.absents;
				var self = this;
				// 获取缺席理由
				_callAjax({
					cmd: "fetch",
					sql: "select reason from absentReasons"
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						self.reasons = _map(function(i) {return i.reason}, d.data);
						self.curReasonId = 0;
						self.getUsers();
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

(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#newRule",
			data: {
				userInfo: null,
				year: [],
				season: [],
				month: [],
				curTab: "year",
				ifChanged: false,
				changes: {}
			},
			computed: {
				showRules: function() {
					return this[this.curTab];
				},
				rules: function() {
					return this.year.concat(this.season).concat(this.month);
				}
			},
			watch: {
				ifChanged: function(i) {
					if (i) $(".rules").show();
				}
			},
			methods: {
				updateRules: function() {
					var self = this;
						sqls = [];
					Object.keys(self.changes).forEach(function(cid) {
						cid = parseInt(cid);
						self.rules.forEach(function(i) {
							if (i.id == cid) sqls.push({
								id:      i.id,
								minCnt:  i.minCnt,
								ifValid: i.ifValid?1:0
							});
						});
					});
//					_tell(sqls);
//					alert(_dump(_map(function(i) {
//						_tell(i);
//						var sql = "update orgCheckRules set minCnt = "+i.minCnt+", ifValid = "+i.ifValid+" where id = "+i.id;
//						if (i.minCnt == "按党小组数") {
//							sql = "update orgCheckRules set minCnt = 0, exeMinCnt = 'groupNum', ifValid = "+i.ifValid+" where id = "+i.id;
//						}
//						_tell(sql);
//						return {
//							key: "key"+parseInt(Math.random()*10e6),
//							sql: sql
//						};
//					}, sqls)));
//					return;
					if (sqls.length) {
						_callAjax({
							cmd: "multiFetch",
							multi: _dump(_map(function(i) {
								var sql = "update orgCheckRules set minCnt = "+i.minCnt+", ifValid = "+i.ifValid+" where id = "+i.id;
								if (i.minCnt == "按党小组数") {
									sql = "update orgCheckRules set minCnt = 0, exeMinCnt = 'groupNum', ifValid = "+i.ifValid+" where id = "+i.id;
								}
								return {
									key: "key"+parseInt(Math.random()*10e6),
									sql: sql
								}
							}, sqls))
						}, function(d) {
							mui.toast("修改"+(d.success?"成功":"失败"));
							if (d.success) {
								self.ifChanged = false;
								mui.fire(plus.webview.getWebviewById("summary"), "updateOnRuleChange");
							}
						});
					}
				},
				toggle: function(i) {
					i.ifValid = !i.ifValid;
					this.changes[i.id] = '';
					this.ifChanged = true;
//					mui.confirm('确认'+(i.ifValid?'停用':'启用')+''?', '', ['取消', '确定'], function(e) {
//						if(e.index == 1) {
//							i.ifValid = !i.ifValid;
//							var n = 0;
//							if (i.ifValid) n = 1;
//							_callAjax({
//								cmd: "exec",
//								sql: "update orgCheckRules set ifValild = ? where id = ?",
//								vals: _dump([n, id])
//							}, function(_d) {})
//						}
//					});
				},
				changeMinCnt: function(i) {
                    var userPicker = new mui.PopPicker();
					userPicker.setData(_map(function(i) {
                        return {
                            value: i,
                            text: i
                        }
                    }, _range(1, activityScoreSetting.activityLimit)).concat([{
                    		value: "按党小组数",
                    		text: "按党小组数"
                    }]));
					userPicker.show(function(items) {
						// userResult.innerText = JSON.stringify(items[0]);
                        i.minCnt = items[0].value;
					});
					this.changes[i.id] = '';
					this.ifChanged = true;
				}
			},
			mounted: function() {
				this.userInfo = _load(_get("userInfo"));
				var self = this;
//				_callAjax({
//					cmd: "fetch",
//					sql: "select * from orgCheckRules where orgNo = ?",
//					vals: _dump([self.userInfo.no,])
//				}, function(d) {
				_summaryAjax({
					cmd: "rules",
					orgNo: self.userInfo.no
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						d.data.forEach(function(i) {
							i.id = parseInt(i.id);
							i.ifValid = parseInt(i.ifValid);
							i.minCnt = parseInt(i.minCnt);
							if (i.exeMinCnt == 'groupNum') {
								i.minCnt = "按党小组数";
							}
							self[i.tp].push(i);
						});
						vm.$nextTick(function() {
							mui(".mui-switch").switch();
						});
					}
				});
			}
		});

		$(".rules").click(function() {
			vm.updateRules();
		});
	};

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())

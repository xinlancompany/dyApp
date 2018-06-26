(function() {
	var plusReady = function() {
        mui.init({
            beforeback: function() {
            	var tag = null;
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectCategories", {
                    categories: _filter(function(i) {
                    		i.linkerId = i.id;
                    		return i.ifSelect;
                    }, vm.categories)
                });
            }
        });

		var vm = new Vue({
			el: "#activityCategories",
			data: {
				lid: 0,
				categories: [],
				mutex: {},
				lids:{},
				userInfo: _load(_get("userInfo")),
			},
			methods:{
				mutexOther: function(i) {
					var self = this,
						ifShow = !i.ifSelect,	
						thisMutex = self.mutex[i.id];
					if (!thisMutex) return;
					self.categories.forEach(function(r) {
						for(var j = 0; j < thisMutex.length; j += 1) {
							if (thisMutex[j] == r.id) {
								r.ifShow = ifShow;
								break;
							}
						}
					});
				},
				mutexOnCheck: function() {
					var self = this,
						ret = {};
					self.categories.forEach(function(i) {
						if (i.ifSelect) {
							var mx = self.mutex[i.id];
							if (mx) {
								mx.forEach(function(x) {
									ret[x] = "";
								});
							}
						}
						i.ifShow = true;
					});
					self.categories.forEach(function(i) {
						if (i.id in ret) {
							i.ifShow = false;
							i.ifSelect = false;
						}
					});
				},
				selectCategories: function() {
					var self = this;
					self.categories.forEach(function(i) {
						i.ifSelect = false;
						i.ifShow = true;
					});
					self.categories.forEach(function(i) {
						if (self.lids.indexOf(i.id) >= 0) {
							i.ifSelect = true;
							self.mutexOther(i);
						}
					});
				}
			},
			mounted: function() {
				var self = this,
					wb = plus.webview.currentWebview();
				self.lids = wb.lids;
				var sql = "select id, name from linkers where refId = 131 and (orgNo = '' or orgNo = '"+self.userInfo.no+"') and ifValid = 1";
				// 非党支部，类型为自定义
				if ("党支部" != this.userInfo.type) sql = "select id, name from linkers where refId = 131 and orgNo = '"+self.userInfo.no+"' and ifValid = 1";
				_callAjax({
					cmd: "multiFetch",
					multi: _dump([
						{
							key: "categories",
							sql: sql
						},
						{
							key: "mutex",
							sql: "select linkerId, mutexId from linkerMutex where status = 1"
						}
					])
				}, function(d) {
					if (d.success && d.data.categories && d.data.categories.length) {
						d.data.categories.forEach(function(i) {
							i.id = parseInt(i.id);
							i.ifShow = true;
							i.ifSelect = false;
							self.categories.push(i);
						});
					}
					if (d.success && d.data.mutex && d.data.mutex.length) {
						d.data.mutex.forEach(function(i) {
							if (i.linkerId in self.mutex) {
								self.mutex[i.linkerId].push(parseInt(i.mutexId));
							} else {
								self.mutex[i.linkerId] = [parseInt(i.mutexId)];
							}
						});
					}
					self.selectCategories();
				});
			}
		});

		// 传入参数事件
		window.addEventListener("lids", function(event) {
			vm.lids = event.detail.lids;
			vm.selectCategories();
		});

	};

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

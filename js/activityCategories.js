(function() {
	var plusReady = function() {
        mui.init({
            beforeback: function() {
            	var tag = null;
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectCategories", {
                    categories: _filter(function(i) {
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
				userInfo: _load(_get("userInfo"))
			},
			methods:{
				mutexOther: function(i) {
					var self = this,
						ifShow = !i.ifSelect,	
						thisMutex = self.mutex[i.id];
					self.categories.forEach(function(r) {
						for(var j = 0; j < thisMutex.length; j += 1) {
							if (thisMutex[j] == r.id) {
								r.ifShow = ifShow;
								break;
							}
						}
					});
				}
			},
			mounted: function() {
				var self = this,
					wb = plus.webview.currentWebview();
				self.lids = wb.lids;
				_callAjax({
					cmd: "fetch",
					sql: "select id, name from linkers where refId = 131 and (orgId = 0 or orgId = ?) and ifValid = 1",
					vals: _dump([self.userInfo.no,])
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						d.data.forEach(function(i) {
							i.id = parseInt(i.id);
							i.ifShow = true;
							self.lids.forEach(function(j) {
								if (j == i.id) i.ifSelect = true;
							});
							self.categories.push(i);
						});
					}
				});

				// 获取互斥条件
				_callAjax({
					cmd: "fetch",
					sql: "select linkerId, mutexId from linkerMutex where status = 1"
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						d.data.forEach(function(i) {
							if (i.linkerId in self.mutex) {
								self.mutex[i.linkerId].push(parseInt(i.mutexId));
							} else {
								self.mutex[i.linkerId] = [parseInt(i.mutexId)];
							}
						});
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

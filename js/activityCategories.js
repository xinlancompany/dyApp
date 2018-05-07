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
				userInfo: _load(_get("userInfo"))
			},
			methods:{
				
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
							self.lids.forEach(function(j) {
								if (j == i.id) i.ifSelect = true;
							});
							self.categories.push(i);
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

(function() {
    var plusReady = function() {
    		var vm = new Vue({
    			el: "#notice",
    			data: {
    				notices: [],
    				unReadMsgCnt: 0
    			},
    			watch: {
    				unReadMsgCnt: function(i) {
    					if (i == 0) return;
    					var self = this;
					_callAjax({
						cmd: "multiFetch",
						multi: _dump([
							{
								key: "unread",
								sql: "select msg, tp, strftime('%Y-%m-%d', logtime) as logtime from notices where userId = "+userInfo.id+" and ifRead = 0 order by logtime desc",
							},
							{
								key: "update",
								sql: "update notices set ifRead = 1 where userId = "+userInfo.id
							}
						])
					}, function(d) {
//						alert(_dump(d));
						if (d.success && "unread" in d.data && d.data.unread.length) {
							self.notices = d.data.unread;
						}
					});
    				}
    			},
    			methods:{
    				
    			},
    		});

		var userInfo = _load(_get("userInfo"));

		var wb = plus.webview.currentWebview();
		if (wb &&"unRead" in wb) {
			vm.unReadMsgCnt = wb.unRead;
		} else {
			_callAjax({
				cmd: "fetch",
				sql: "select msg, tp, strftime('%Y-%m-%d', logtime) as logtime from notices where userId = ? order by logtime desc",
				vals: _dump([userInfo.id,])
			}, function(d) {
				if (d.success && d.data && d.data.length) {
					vm.notices = d.data;
				}
			});
		}
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

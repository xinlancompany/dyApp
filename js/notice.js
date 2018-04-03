(function() {
    var plusReady = function() {
    		var vm = new Vue({
    			el: "#notice",
    			data: {
    				notices: []
    			},
    			methods:{
    				
    			}
    		});

		var userInfo = _load(_get("userInfo"));
		_callAjax({
			cmd: "fetch",
			sql: "select msg, tp, strftime('%Y-%m-%d', logtime) as logtime from notices where userId = ?",
			vals: _dump([userInfo.id,])
		}, function(d) {
			if (d.success && d.data && d.data.length) {
				vm.notices = d.data;
			}
		});
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

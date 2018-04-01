(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
            	var tag = null;
				if (vm.selectTagIndex >= 0) tag = vm.tags[vm.selectTagIndex];
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectTags", {
                    // tags: vm.tags
                    tag: tag
                });
            }
        });

        var vm = new Vue({
            el: "#selectTags",
            data: {
                tags: [],
                selectTagIndex: -1,
            },
            methods: {
                showSelects: function(idx) {
                	// alert(idx);
                }
            }
        });

        // 获取tags
        _callAjax({
            cmd: "fetch",
            sql: "select name, credits from activityTags where ifValid = 1"
        }, function(d) {
            if (!d.success || !d.data || !d.data.length) return;
            vm.tags = d.data;
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

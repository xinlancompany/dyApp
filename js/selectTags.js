(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectTags", {
                    tags: vm.tags
                });
            }
        });

        var vm = new Vue({
            el: "#selectTags",
            data: {
                tags: []
            },
            methods: {
                showSelects: function() {
                
                }
            }
        });

        // 获取tags
        _callAjax({
            cmd: "fetch",
            sql: "select name from activityTags where ifValid = 1"
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

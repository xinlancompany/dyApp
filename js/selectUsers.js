(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectUsers", {
                    users: vm.users
                });
            }
        });

        var vm = new Vue({
            el: "#selectUsers",
            data: {
                users: []
            },
            methods: {
                showSelects: function() {
                    /*
                     * 测试用
                    var self = this;
                    alert(_dump(_map(function(i) {
                        return i.ifSelect;
                    }, self.users)));
                    */
                }
            }
        });

        // 全选
        $("#selectAll").click(function() {
            vm.users.forEach(function(i) {
                i.ifSelect = true;
            });
        });

        var userInfo = _load(_get("userInfo"));
        var wb = plus.webview.currentWebview();
        vm.users = wb.users;

        if (!vm.users.length) {
            _callAjax({
                cmd: "fetch",
                sql: "select id, name from User where ifValid = 1 and orgNo = ?",
                vals: _dump([userInfo["no"],])
            }, function(d) {
                if (!d.success || !d.data) return;
                d.data.forEach(function(i) {
                    i.ifSelect = false;
                    vm.users.push(i);
                });
            });
        }
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

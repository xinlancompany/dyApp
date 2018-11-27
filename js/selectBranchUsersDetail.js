(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                if (!vm.sysParticipants) vm.sysParticipants = {};
                vm.sysParticipants[vm.orgInfo.name] = vm.users;
                _set("participants", _dump(vm.sysParticipants));
            }
        });

        var wb = plus.webview.currentWebview();

        var vm = new Vue({
            el: "#selectBranchUsersDetail",
            data: {
                orgInfo: null,
                users: [],
                sysParticipants: null,
            },
            methods: {
                showSelects: function(i) {
                   i.ifSelect = !i.ifSelect;
                   if (!i.ifSelect) $("#selectAll").text("全选");
                },
            },
            created: function() {
                // 获取暂存的信息
                this.orgInfo = wb.orgInfo;
                var participantsStr = _get("participants"),
                    participants = [];
                if (participantsStr) {
                    this.sysParticipants = _load(participantsStr);
                    if (this.sysParticipants && (this.orgInfo.name in this.sysParticipants)) {
                        this.users = this.sysParticipants[this.orgInfo.name];
                    }
                } else {
                    this.sysParticipants = {};
                    this.sysParticipants[this.orgInfo.name] = [];
                    var self = this;
                    _callAjax({
                        cmd: "fetch",
                        sql: "select id, name, orgNo, orgName from User where ifValid = 1 and orgNo = ?",
                        vals: _dump([self.orgInfo["no"],])
                    }, function(d) {
                        if (!d.success || !d.data) return;
                        d.data.forEach((i) => {
                            i.ifSelect = 0;
                        });
                        self.users = d.data;
                    });
                }

            }
        });

        // 全选
        $("#selectAll").click(function() {
            if ($("#selectAll").text() == "全选") {
                vm.users.forEach(function(i) {
                    i.ifSelect = true;
                });
                $("#selectAll").text("全不选");
            } else {
				vm.users.forEach(function(i) {
					i.ifSelect = false;
				});
				$("#selectAll").text("全选");
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("transUser"), "selectUsers", {
                    participants: vm.participants
                });
            }
        });

        var vm = new Vue({
            el: "#transSelectUsers",
            data: {
                participants: [],
            },
            methods: {
                showSelects: function(i) {
                   i.ifSelect = !i.ifSelect;
                   if (!i.ifSelect) $("#selectAll").text("全选");
                },
            },
            mounted: function() {
                let wb = plus.webview.currentWebview();
                _callAjax({
                    cmd: "fetch",
                    sql: "select id, name, idNo, phone, orgNo, orgName from user where orgNo = ? and ifValid = 1",
                    vals: _dump([wb.orgNo,])
                }, d => {
                    if (d.success && d.data && d.data.length) {
                        _callAjax({
                            cmd: "fetch",
                            sql: "select idNo from userTrans where srcOrgNo = ?and status = 0",
                            vals: _dump([wb.orgNo])
                        }, d2 => {
                            if (d2.success && d2.data && d2.data.length) {
                                let idNos = _map(i => {
                                    return i.idNo;
                                }, d2.data);
                                d.data = _filter(i => {
                                    return idNos.indexOf(i.idNo) == -1;
                                }, d.data);
                            } 
                            d.data.forEach(i => {
                                i.ifSelect = 0;
                                wb.participants.forEach(j => {
                                    if (j.idNo == i.idNo) {
                                        i.ifSelect = j.ifSelect;
                                    }
                                });
                            });
                            this.participants = d.data;
                        });
                    }
                });
            }
        });

        // 全选
        $("#selectAll").click(function() {
        		if ($("#selectAll").text() == "全选") {
				vm.participants.forEach(function(i) {
					i.ifSelect = true;
				});
				$("#selectAll").text("全不选");
        		} else {
				vm.participants.forEach(function(i) {
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

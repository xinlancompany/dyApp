(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("jhActivityUpload"), "selectParticipants", {
                    participants: vm.participants
                });
            }
        });

        var vm = new Vue({
            el: "#jhSelectUsers",
            data: {
                participants: [],
                jhOrgNo: '',
                searchWord: "",
            },
            watch: {
                searchWord: function(w) {
                    w = _trim(w);
                    this.participants.forEach(i => {
                        if (!w) {
                            i.ifShow = true;
                        } else {
                            i.ifShow = i.name.indexOf(w) >= 0;
                        }
                    });
                }
            },
            computed: {
                showParticipants: function() {
                    return _filter(i => {
                        return i.ifShow;
                    }, this.participants);
                }
            },
            methods: {
                showSelects: function(i) {
                   i.ifSelect = !i.ifSelect;
                   if (!i.ifSelect) $("#selectAll").text("全选");
                },
            },
            mounted: function() {
                let wb = plus.webview.currentWebview();
                this.jhOrgNo = wb.jhOrgNo;
                _jhAjax({
                    cmd: "getJHPMList",
                    name: "",
                    jhOrgNo: wb.jhOrgNo,
                    pageNo: 1,
                    pageSize: 200
                }, d => {
                    if (d.success && d.data && d.data.list.length) {
                        d.data.list.forEach(i => {
                            i.ifShow = true;
                            i.ifSelect = 0;
                            wb.participants.forEach(j => {
                                if (j.idNo == i.idNo) {
                                    i.ifSelect = j.ifSelect;
                                }
                            });
                        });
                        this.participants = d.data.list;
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

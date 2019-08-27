(function() {
    var plusReady = function() {
		pullToRefresh();
        
        var vm = new Vue({
            el: "#jhMemberApprove",
            data: {
                members: [],
                jhOrgNo: "",
            },
            methods: {
                openMember: function(i) {
                    openWindow("jhMemberDetail.html", "jhMemberDetail", {
                        info: i
                    });
                },
                refuseUser: function(i) {
                    var self = this;
                    mui.prompt('拒绝理由', '', '', ['确认', '取消'], function(e) {
                        if(e.index == 0) {
                            let r = _trim(e.value);
                            if(r) {
                                _jhAjax({
                                    cmd: "refuseMemberByidNo",
                                    idNo: i.idNo,
                                    reason: r
                                }, d => {
                                    alert(_dump(d));
                                    if (d.success) {
                                        mui.toast("拒绝成功");
                                        self.delFromList(i.idNO);
                                    } else {
                                        mui.toast(d.errmsg);
                                    }
                                })
                            } else {
                                mui.toast("请填写理由");
                            }
                        }
                    }, 'div');
                },
                approveUser: function(i) {
                   var self = this;
                   mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
                       if (e.index == 0) {
                           // 确定删除
                           _jhAjax({
                               cmd: "agreeMemberByidNo",
                               idNo: i.idNo
                           }, d => {
                               _tell(d);
                               if (d.success) {
                                   mui.toast("通过成功");
                                   self.delFromList(i.idNo);
                               } else {
                                   mui.toast(d.errmsg);
                               }
                           });
                       }
                   });
                },
                delFromList: function(idNo) {
                    // 删除members数组中的成员
                    let id = 0;
                    for(let i=0; i<this.members.length; i+=1) {
                        if (this.members[i].idNo == idNo) {
                            break
                        }
                    }
                    if (id < this.members.length) {
                        this.members.splice(id, 1);
                    }
                },
            }
        });

        var wb = plus.webview.currentWebview();
		var getUsers = function() {
		    vm.jhOrgNo = wb.jhOrgNo;
		    _jhAjax({
		        cmd: "getApplyJHPMList",
		        name: "",
		        idNo: "",
		        phone: "",
		        jhOrgNo: wb.jhOrgNo,
		        pageNo: 1,
		        pageSize: 200
		    }, d => {
		        d.success && d.data && d.data.list.length && (vm.members = d.data.list);
		    });
        };
        getUsers();

		//		刷新用户列表
		window.addEventListener('updateUsers', function(event) {
			getUsers();
		});
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

(function() {
    var plusReady = function() {
		pullToRefresh();
        
        var vm = new Vue({
            el: "#jhMemberApprove",
            data: {
                members: [],
                quits: [],
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
                refuseDelUser: function(i) {
                    var self = this;
                    mui.confirm("确定拒绝？", "提示", ["确定", "取消"], function(e) {
                        if(e.index == 0) {
                           _jhAjax({
                               cmd: "exec",
                               sql:"update jhMember set status = 1 where idNo = '"+i.idNo+"'"
                           }, d => {
                               _tell(d);
                               if (d.success) {
                                   mui.toast("拒绝成功");
                                   self.delFromList(i.idNo, "quits");
                               } else {
                                   mui.toast(d.errmsg);
                               }
                           }, "/db4web");
                        }
                    });
                },
                approveDelUser: function(i) {
                   var self = this;
                   mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
                       if (e.index == 0) {
                           // 确定删除
                           _jhAjax({
                               cmd: "exec",
                               sql:"update jhMember set status = 3 where idNo = '"+i.idNo+"'"
                           }, d => {
                               _tell(d);
                               if (d.success) {
                                   mui.toast("通过成功");
                                   self.delFromList(i.idNo, "quits");
                               } else {
                                   mui.toast(d.errmsg);
                               }
                           }, "/db4web");
                       }
                   });
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
                delFromList: function(idNo, lst) {
                    // 删除members数组中的成员
                    if (!lst) lst = "members";
                    let id = 0;
                    for(let i=0; i<this[lst].length; i+=1) {
                        if (this[lst][i].idNo == idNo) {
                            break
                        }
                    }
                    if (id < this[lst].length) {
                        this[lst].splice(id, 1);
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
		    _jhAjax({
		        cmd: "fetch",
		        sql: "select u.name as name, u.idNo as idNo, u.sex as sex, u.phone as phone, " +
		          "u.orgName as orgName, '"+wb.jhOrgName+"' as jhOrgName from jhMember j, user u where j.idNo = u.idNo and j.status = 4 and " +
		          "j.jhOrgNo = '"+wb.jhOrgNo+"' and u.ifValid = 1"
		    }, d => {
		        if (d.success && d.data && d.data.length) {
		           vm.quits = d.data;
		        }
		    }, "/db4web");
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

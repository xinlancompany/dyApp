(function() {
    var plusReady = function() {
		pullToRefresh();
        
        var vm = new Vue({
            el: "#jhMemberManage",
            data: {
                members: [],
                searchWord:"",
                sortBy: "down",
                jhOrgNo: "",
                canEdit: 1,
            },
            computed: {
                filterMembers: function() {
                    var sw = _trim(this.searchWord);
                    if (!sw) return this.members;
                    var ret = [];
                    ret = _filter(function(i) {
                        return i.name.indexOf(sw) >= 0;
                    }, this.members);
                    if (ret.length) return ret;
                }
            },
            methods: {
                openMember: function(i) {
                    openWindow("jhMemberDetail.html", "jhMemberDetail", {
                        info: i,
                    });
                },
                upsideDown: function() {
                		var self = this;
                		this.members.sort(function(a, b) {
                			if (self.sortBy == "up") {
                				return a.score < b.score;
                			} else {
                				return a.score > b.score;
                			}
                		});
                		this.sortBy = this.sortBy == "up" ? "down": "up";
                },
                newUser: function() {
                    	openWindow("jhMemberAdd.html", "jhMemberAdd", {
                    	    jhOrgNo: this.jhOrgNo
                    	});
                },
                delUser: function(i) {
                   var self = this;
                   mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
                       if (e.index == 0) {
                           // 确定删除
                           _jhAjax({
                               cmd: "delMemberByidNo",
                               idNo: i.idNo
                           }, d => {
                               _tell(d);
                               if (d.success) {
                                   mui.toast("删除成功");
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
                infoUser: function(i) {
                    let buttons = [
                        {
                            title: "个人信息",
                        },
                        {
                            title: "兼合支部活动",
                        },
                        {
                            title: "组织活动",
                        }
                    ];
					plus.nativeUI.actionSheet({
						title: "党员信息查看",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "个人信息") {
                            openWindow("jhMemberDetail.html", "jhMemberDetail", {
                                info: i
                            });
						} else if (btnTitle == "组织活动") {
                            openWindow("myActivity.html","myactivity" , {
                                userInfo: i
                            });
						} else {
                            openWindow("jhMemberActivityRecord.html", "jhMemberActivityRecord", {
                                name: i.name,
                                idNo: i.idNo
                            });
						}
                    });
                },
                evaluateUser: function(i) {
                    let btns = [
                        {
                            title: '兼合支部考评',
                            callback: () => {
                                openWindow("jhMemberEvaluate.html", "jhMemberEvaluate", {
                                    idNo: i.idNo,
                                    canEdit: this.canEdit
                                });
                            }
                        },
                        {
                            title: "支部考评",
                            callback: () => {
                                openWindow("memberEvaluate.html", "memberEvaluate", {
                                    idNo: i.idNo,
                                    canEdit: 0,
                                });
                            }
                        }
                    ];
					plus.nativeUI.actionSheet({
						title: "年度考评",
						cancel: "取消",
						buttons: btns
					}, (e) => {
						if (0 === e.index) return;
						btns[e.index-1].callback();
                    });
                }
            }
        });

        var wb = plus.webview.currentWebview();
		var getUsers = function() {
		    vm.jhOrgNo = wb.jhOrgNo;
		    if ("canEdit" in wb) vm.canEdit = wb.canEdit;
		    _jhAjax({
		        cmd: "getJHPMList",
		        name: "",
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

(function() {
    var plusReady = function() {
		pullToRefresh();
    	
        var wb = plus.webview.currentWebview(),
            userInfo = _load(_get("userInfo")),
            isAdmin = "no" in userInfo;
        if ("isAdmin" in wb) {
            isAdmin = wb.isAdmin;
            if (!isAdmin) {
            	$(".group-manage").hide();
            }
        }
        
        var vm = new Vue({
            el: "#memberManage",
            data: {
                members: [],
                searchWord:"",
                sortBy: "down",
                isAdmin: isAdmin,
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
						ret = _filter(function(i) {
							return i.pinyin.indexOf(sw) >= 0;
						}, this.members);
						if (ret.length) return ret;
						ret = _filter(function(i) {
							return i.py.indexOf(sw) >= 0;
						}, this.members);
						if (ret.length) return ret;
					}
            },
            methods: {
                operateOnUser: function() {
					var self = this,
						buttons = [
							{
								title: "新增党员"
							},
							{
								title: "删除党员"
							},
						];
					plus.nativeUI.actionSheet({
						title: "党员增减操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "新增党员") {
							self.newUser();
						} else {
							openWindow("delUsers.html", "delUsers");
						}
					});
               },
                openMember: function(i) {
                    if (isAdmin) {
                        openWindow("memberActivityRecord.html", "memberActivityRecord", {
                            idx: i.id,
                            name: i.name,
                            isAdmin: isAdmin
                        });
                    } else {
                        mui.toast("仅书记可查看详细信息");
                    }
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
                    	openWindow("newUser.html", "newUser");
                },
            }
        });

		var getUsers = function() {
        _callAjax({
            cmd: "fetch",
            // sql: "select id, name from user where orgNo = ?",
            /* 百分制与五星制在一起
            sql: "select u.id as id, u.name as name, sum(e.score) as score, e.scoreType as scoreType from user u left join activityEnroll e on e.userId = u.id left join activitys a on e.activityId = a.id where u.orgNo = ? and a.ifValid = 1 group by u.id, e.scoreType",
            vals: _dump([wb.orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                // vm.members = d.data;
                var prev = null;
                d.data.forEach(function(i) {
                    if (!i.score) i.score = 0;
                    if (!i.scoreType) i.scoreType = "百分制";
                    if (!!prev && prev.id != i.id) {
                        vm.members.push(prev);
                        i.tag = i.score+(i.scoreType=="百分制"?"分":"星");
                        prev = i;
                    } else {
                        if (!prev) {
                            prev = i;
                            prev.tag = "";
                        }
                        prev.tag += " "+i.score+(i.scoreType=="百分制"?"分":"星");
                    }
                });
            }
            */

            // 仅百分制
//          sql: "select u.id as id, u.name as name, pinyin, py, sum(e.score) as score, e.scoreType as scoreType from user u left join activityEnroll e on e.userId = u.id and e.scoreType = '百分制' left join activitys a on e.activityId = a.id and a.ifValid > 0 where u.orgNo = ? group by u.id, e.scoreType order by score desc",
//          sql: "select u.id as id, u.name as name, pinyin, py, sum(e.score) as score, e.scoreType as scoreType from user u left join activityEnroll e, activitys a on e.userId = u.id and e.scoreType = '百分制' and e.activityId = a.id and a.ifValid > 0 where u.orgNo = ? group by u.id order by score desc",
//			sql: "select u.id as id, u.name as name, pinyin, py, ifnull(sum(e.score), 0) as score, ifnull(e.scoreType, '百分制') as scoreType from user u left join activityEnroll e on e.userId = u.id and e.scoreType = '百分制' left join activitys a on e.activityId = a.id and a.ifValid > 0 where u.orgNo = ? group by u.id, e.scoreType order by score desc",
			// 删除的党员，活动记录应保存
			sql: "select u.id, u.name, u.ifValid, pinyin, py, ifnull(sum(t.score), 0) as score, ifnull(t.scoreType, '百分制') as scoreType from user u left join activityEnrollList t on u.id = t.userId and t.scoreType = '百分制' where u.orgNo = ? and u.ifValid >= 0 group by u.id, t.scoreType order by score desc",
            vals: _dump([wb.orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
            		vm.members = [];
                d.data.forEach(function(i) {
                    if (!i.score) i.score = 0;
                    i.score = parseInt(i.score);
                    if (!i.scoreType) i.scoreType = "百分制";
                    i.tag = i.score+"分";
                    if (!parseInt(i.ifValid)) i.name += "(已删除)";
                    vm.members.push(i);
                });
            }
        });
        };
        getUsers();

		//		刷新用户列表
		window.addEventListener('updateUsers', function(event) {
			getUsers();
		});

		$(".group-manage").click(function() {
			openWindow("group.html", "group");
		});
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

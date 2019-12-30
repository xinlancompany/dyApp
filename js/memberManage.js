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
                updateGrade: function(i) {
                    // 调整评分  
                    openWindow("memberEvaluate.html", "memberEvaluate", {
                        idNo: i.idNo,
                        canEdit: 1,
                    });
                },
                operateOnUser: function() {
					var self = this,
						buttons = [
							{
								title: "新增党员"
							},
							{
								title: "删除党员"
							},
							{
							    title: "转出党员"
							}
						];
					plus.nativeUI.actionSheet({
						title: "党员增减操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "新增党员") {
						    return mui.alert("新增服务调整中");
							self.newUser();
						} else if (btnTitle == "删除党员") {
							openWindow("delUsers.html", "delUsers");
						} else {
							openWindow("transUser.html", "transUser", {
							    orgNo: userInfo.no,
							    orgName: userInfo.name,
							});
						}
					});
               },
               openJh: function(i) {
				    let btns = [
				        {
				            title: "兼合支部活动",
				        },
				        {
				            title: "兼合支部考评"
				        }
				    ];
					plus.nativeUI.actionSheet({
						title: "兼合支部",
						cancel: "取消",
						buttons: btns
					}, (e) => {
						if (0 === e.index) return;
						let t = btns[e.index-1].title;
						if (t == "兼合支部考评") {
						    openWindow("jhMemberEvaluate.html", "jhMemberEvaluate", {
						        idNo: i.idNo
						    });
						} else {
                            openWindow("jhMemberActivityRecord.html", "jhMemberActivityRecord", {
                                name: i.name,
                                idNo: i.idNo
                            });
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

//          select t1.id, t1.name, t1.pinyin, t1.py, t1.ifValid, t1.easyScore, ifnull(sum(a.score), 0) 
//          as activityScore from (select u.id, u.name, u.ifValid, pinyin, py, ifnull(sum(e.score), 0) 
//          as easyScore from user u left join easyScore e on e.logtime > '2019-01-01 00:00:00' and u.id = e.userId 
//          and e.ifValid = 2 where u.orgNo = "033000153180" and u.ifValid > 0 group by u.id) t1, activitys v 
//          left join activityEnroll a on t1.id = a.userId and a.scoreType = '百分制' and a.activityId = v.id 
//          and v.ifValid >= 4 where v.orgId = 125 and v.starttime > '2019-01-01 00:00:00' 
//          group by t1.id order by (easyScore+activityScore) desc

        console.log(["select t1.id, t1.name, t1.idNo, t1.pinyin, t1.py, t1.ifValid, t1.easyScore, t1.csGrade, ifnull(sum(a.score), 0) " +
            "as activityScore from (select u.id, u.idNo, u.name, u.ifValid, pinyin, py, ifnull(sum(e.score), 0) " +
            "as easyScore, ifnull(cs.grade, 0) as csGrade from user u " +
            "left join classification cs on cs.userIdNo = u.idNo and cs.type = 1 " +
            "left join easyScore e on e.logtime > '2019-01-01 00:00:00' and u.id = e.userId " +
            "and e.ifValid = 2 where u.orgNo = ? and u.ifValid > 0 group by u.id) t1, activitys v " +
            "left join activityEnroll a on t1.id = a.userId and a.scoreType = '百分制' and a.activityId = v.id " +
            "and v.ifValid >= 4 where v.orgId = ? and v.starttime > '2019-01-01 00:00:00' " +
            "group by t1.id order by (easyScore+activityScore) desc "
        ].join(""));
//      _callAjax({
        _jhAjax({
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
			// sql: "select u.id, u.name, u.ifValid, pinyin, py, ifnull(sum(t.score), 0) as score, ifnull(t.scoreType, '百分制') as scoreType from user u left join activityEnrollList t on u.id = t.userId and t.scoreType = '百分制' where u.orgNo = ? and u.ifValid >= 0 group by u.id, t.scoreType order by score desc",
            sql: [
            // 新版本 
            "select t1.id, t1.name, t1.idNo, t1.pinyin, t1.py, t1.ifValid, t1.easyScore, t1.csGrade, ifnull(sum(a.score), 0) " +
            "as activityScore from (select u.id, u.idNo, u.name, u.ifValid, pinyin, py, ifnull(sum(e.score), 0) " +
            "as easyScore, ifnull(cs.grade, 0) as csGrade from user u " +
            "left join classification cs on cs.userIdNo = u.idNo and cs.type = 1 " +
            "left join easyScore e on e.logtime > '2019-01-01 00:00:00' and u.id = e.userId " +
            "and e.ifValid = 2 where u.orgNo = ? and u.ifValid > 0 group by u.id) t1, activitys v " +
            "left join activityEnroll a on t1.id = a.userId and a.scoreType = '百分制' and a.activityId = v.id " +
            "and v.ifValid >= 4 where v.orgId = ? and v.starttime > '2019-01-01 00:00:00' " +
            "group by t1.id order by (easyScore+activityScore) desc "

            // 旧版本
//          "select t1.id, t1.name, t1.idNo, t1.pinyin, t1.py, t1.ifValid, t1.easyScore, ifnull(sum(a.score), 0) " +
//          "as activityScore from (select u.id, u.idNo, u.name, u.ifValid, pinyin, py, ifnull(sum(e.score), 0) " +
//          "as easyScore from user u " +
//          "left join easyScore e on e.logtime > '2019-01-01 00:00:00' and u.id = e.userId " +
//          "and e.ifValid = 2 where u.orgNo = ? and u.ifValid > 0 group by u.id) t1, activitys v " +
//          "left join activityEnroll a on t1.id = a.userId and a.scoreType = '百分制' and a.activityId = v.id " +
//          "and v.ifValid >= 4 where v.orgId = ? and v.starttime > '2019-01-01 00:00:00' " +
//          "group by t1.id order by (easyScore+activityScore) desc "
            ].join(""),
            vals: _dump([wb.orgNo, wb.orgId])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
            		vm.members = [];
                d.data.forEach(function(i) {
                    i.activityScore = parseInt(i.activityScore);
                    i.easyScore = parseInt(i.easyScore);
                    if (!i.scoreType) i.scoreType = "百分制";
                    i.score = i.activityScore + i.easyScore;
                    i.tag = i.score+"分";
                    if (!parseInt(i.ifValid)) i.name += "(已删除)";
                    vm.members.push(i);
                });
                _jhAjax({
                    cmd: "fetch",
                    sql: "select u.id, ifnull(c.status, -1) as csStatus from user u left join classification c on " +
                        "u.idNo = c.userIdNo and c.type = 2 where u.id in ("+((_map(i => {
                            return i.id;
                        }, vm.members)).join(','))+")"
                }, d => {
                    if (d.success && d.data) {
                        d.data.forEach(i => {
                            for(let j=0; j< vm.members.length; j+=1) {
                                let m = vm.members[j];
                                if (m.id == i.id) {
                                    m.csStatus = parseInt(i.csStatus);
                                    return;
                                }
                            }
                        });
                    }
                }, "/db4web");
            }
        }, "/db4web");
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

(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#approve",
			data: {
				userInfo: null,
				examines: [],
				appraises: [],
				users: [],
				toBeDel: []
			},
			methods: {
				openUser: function(i) {
					openWindow('newUser.html', 'newUser', {
						uid: i.id
					});
				},
				delUser: function(i, idx) {
					var self = this,
						buttons = [
							{
								title: "通过"
							},
							{
								title: "退回"
							},
						];
					plus.nativeUI.actionSheet({
						title: "删除党员审批操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "通过") {
							mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
										sql: "update user set ifValid = 0 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("通过"+(d.success?"成功":"失败"));
										if (d.success) self.toBeDel = _del_ele(self.toBeDel, idx);
									});
								}
							});
						} else {
							mui.confirm("确定退回？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
										sql: "update user set ifValid = 1 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("退回"+(d.success?"成功":"失败"));
										if (d.success) self.toBeDel = _del_ele(self.toBeDel, idx);
									});
								}
							});
						}
					});
				},
				operateUser: function(i, idx) {
					var self = this,
						buttons = [
							{
								title: "通过"
							},
							{
								title: "退回"
							},
						];
					plus.nativeUI.actionSheet({
						title: "新增党员审批操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "通过") {
							mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
										sql: "update user set ifValid = 1 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("通过"+(d.success?"成功":"失败"));
										if (d.success) self.users = _del_ele(self.users, idx);
									});
								}
							});
						} else {
							mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
										sql: "update user set ifValid = 0 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("删除"+(d.success?"成功":"失败"));
										if (d.success) self.users = _del_ele(self.users, idx);
									});
								}
							});
						}
					});
				},
				openAppraise: function(i) {
					openWindow('application.html', 'application', {
						aid: i.id
					});
				},
                operateAppraise: function(i, idx) {
                		var self = this,
                			passTag = i.isLocal?'提交上级审批':'通过',
                			withdrawTag = i.isLocal?'删除':"打回",
						buttons = [
							{
								title: passTag
							},
							{
								title: withdrawTag
							},
						];
					plus.nativeUI.actionSheet({
						title: "增减分审批操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "通过") {
							mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
//										二级审核逻辑
//										sql: "update easyScore set ifValid = 3 where id = ?",
										sql: "update easyScore set ifValid = 2 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("通过"+(d.success?"成功":"失败"));
										if (d.success) self.appraises = _del_ele(self.appraises, idx);
									});

									// 通过通知
									_callAjax({
										cmd: "exec",
										sql: "insert into notices(userId, msg, tp) values(?,?,?)",
										vals: _dump([i.userId, '增减分通过', 'success'])
									}, function(_d) {});
								}
							});
						}
//						二级审核逻辑
//						else if(btnTitle == "提交上级审批") {
//							mui.confirm("确定提交？", "提示", ["确定", "取消"], function(e) {
//								if (e.index == 0) {
//									_callAjax({
//										cmd: "exec",
//										sql: "update easyScore set ifValid = 2 where id = ?",
//										vals: _dump([i.id,])
//									}, function(d) {
//										mui.toast("提交"+(d.success?"成功":"失败"));
//										if (d.success) self.appraises = _del_ele(self.appraises, idx);
//									});
//								}
//							});
//						}
						else if(btnTitle == "打回") {
							mui.confirm('<input type="text" id="withdraw" />', "打回", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									var txt = _trim(document.getElementById("withdraw").value);
									if (!txt) {
										mui.toast("请输入理由");
										return false;
									}

									_callAjax({
										cmd: "exec",
										sql: "update easyScore set ifValid = 0, reason = ? where id = ?",
										vals: _dump([txt, i.id])
									}, function(d) {
										mui.toast("退回"+(d.success?"成功":"失败"));
										if (d.success) self.appraises = _del_ele(self.appraises, idx);
									});

									// 打回通知
									_callAjax({
										cmd: "exec",
										sql: "insert into notices(userId, msg, tp) values(?,?,?)",
										vals: _dump([i.userId, '增减分打回:'+txt, 'fail'])
									}, function(_d) {});
								}
							}, 'div')
						}
//						二级审核逻辑
//						else {
//							mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
//								if (e.index == 0) {
//									_callAjax({
//										cmd: "exec",
//										sql: "update easyScore set ifValid = -1 where id = ?",
//										vals: _dump([i.id,])
//									}, function(d) {
//										mui.toast("删除"+(d.success?"成功":"失败"));
//										if (d.success) self.appraises = _del_ele(self.appraises, idx);
//									});
//								}
//							});
//						}
					});
                },
                openActivity: function(i) {
					openWindow('activeDetail.html', 'activeDetail', {
						activityId: i.id,
						isAdmin: true,
						isSub: true
					});
                },
                operateActivity: function(i, idx) {
					var self = this,
						buttons = [
							{
								title: "通过"
							},
							{
								title: "打回"
							},
						];
					plus.nativeUI.actionSheet({
						title: "活动审批操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						var btnTitle = buttons[e.index-1].title;
						if (btnTitle == "通过") {
							mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
										sql: "update activitys set ifValid = 4 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("通过"+(d.success?"成功":"失败"));
										if (d.success) self.examines = _del_ele(self.examines, idx);
									});
								}
							});
						} else {
							mui.confirm('<input type="text" id="withdraw" />', "打回", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									var txt = _trim(document.getElementById("withdraw").value);
									if (!txt) {
										mui.toast("请输入理由");
										return false;
									}

									_callAjax({
										cmd: "exec",
										sql: "update activitys set ifValid = 2, withdrawTxt = ? where id = ?",
										vals: _dump([txt, i.id])
									}, function(d) {
										mui.toast("打回"+(d.success?"成功":"失败"));
										if (d.success) self.examines = _del_ele(self.examines, idx);
									});
								}
							}, 'div')
						}
					});
                },
                getUsers: function() {
					var self = this;
					// 党员转正
					_callAjax({
						cmd: "fetch",
						sql: "select id, name, orgName, strftime('%m-%d', logtime) as logtime from user where ifValid = -1 and orgNo in (select no from organization where superorgNo = ?)",
						vals: _dump([self.userInfo.no,])
					}, function(d) {
						if (d.success && d.data) {
							self.users = d.data;
						}
					});
                },
                getAppraises: function() {
					var self = this;
					// 获取增减分
					_callAjax({
						cmd: "fetch",
						// 二级审核的逻辑
						// sql: "select e.id, userId, u.name, e.orgNo, o.name as orgName, content, e.img, e.reason, score, e.ifValid, strftime('%m-%d', e.logtime) as logtime from easyScore e, user u, organization o where userId = u.id and ((e.orgNo = ? and (e.ifValid = 0 or e.ifValid = 1)) or (e.ifValid = 2 and e.orgNo in (select no from organization where superOrgNo = ?))) and o.no = e.orgNo",
						sql: "select e.id, userId, u.name, e.orgNo, o.name as orgName, content, e.img, e.reason, score, e.ifValid, strftime('%m-%d', e.logtime) as logtime from easyScore e, user u, organization o where userId = u.id and e.orgNo = ? and e.ifValid < 2 and o.no = e.orgNo",
						vals: _dump([self.userInfo.no,self.userInfo.no,])
					}, function(d) {
						if (d.success && d.data) {
							d.data.forEach(function(i) {
//								二级审批逻辑
//								i.isLocal = false;
//								if (i.orgNo == self.userInfo.no) i.isLocal = true;
//								if (i.ifValid == 0) i.stateTag = "已打回";
//								if (i.ifValid == 1 || i.ifValid == 2) i.stateTag = "待审批";
//								if (i.ifValid == 1 || i.ifValid == 2) i.stateTag = "待审批";

								i.isLocal = false;
								if (i.ifValid == 0) i.stateTag = "已退回";
								if (i.ifValid == 1) i.stateTag = "待审核"
								if (i.ifValid == 2) i.stateTag = "已通过"
								self.appraises.push(i);
							});
						}
					});
                },
                getActivities: function() {
					var self = this;
					// 获取子部门提交的活动
					_callAjax({
						cmd: "fetch",
						sql: "select a.id, a.title, o.name as orgName from activitys a, organization o where a.orgId = o.id and a.ifValid = 3 and a.orgId in (select id from organization where superOrgNo = ?)",
						vals: _dump([self.userInfo.no,])
					}, function(d) {
						if (d.success && d.data && d.data.length) {
							self.examines = d.data;
						}
					});
               },
               getToBeoDel: function() {
					var self = this;
					// 党员删除
					_callAjax({
						cmd: "fetch",
						sql: "select id, name, reason, orgName, strftime('%m-%d', logtime) as logtime from user where ifValid = 2 and orgNo in (select no from organization where superorgNo = ?)",
						vals: _dump([self.userInfo.no,])
					}, function(d) {
						if (d.success && d.data) {
							self.toBeDel = d.data;
						}
					});
               }
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
				this.getActivities();
				this.getAppraises();
				this.getUsers();
				this.getToBeoDel();
			}
		});
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());

(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#approve",
			data: {
				userInfo: null,
				examines: [],
				appraises: [],
				usersToBeOperated: [],
				approved: [],
			},
			methods: {
				openUser: function(i) {
					// 仅新增党员可以打开详情
					if (i.ifValid == -1) {
						openWindow('newUser.html', 'newUser', {
							uid: i.id
						});
					}
				},
				operateUser: function(i, idx) {
					// 分别处理新增与删除党员
					if (i.ifValid == -1) {
						this.addUser(i, idx);
					} else if(i.ifValid == 2) {
						this.delUser(i, idx);
					} else {
					    // 没有ifValid，是转入党员
					    this.transUser(i, idx);
					}
				},
				transUser: function(i, idx){
					var self = this,
						buttons = [
							{
								title: "通过",
								callback: () => {
								    _callAjax({
								        cmd: "userTransApprove",
								        id: i.id,
								        userId: i.userId
								    }, d => {
								        mui.toast("批准"+(d.success ? "成功" : "失败"));
								        if (d.success) {
								            this.usersToBeOperated.splice(idx, 1);
								        }
								    });
								}
							},
							{
								title: "退回",
								callback: () => {
								    _callAjax({
								        cmd: "userTransReject",
								        id: i.id,
								        userId: i.userId
								    }, d => {
								        mui.toast("退回"+(d.success ? "成功" : "失败"));
								        if (d.success) {
								            this.usersToBeOperated.splice(idx, 1);
								        }
								    });
								}
							},
						];
					plus.nativeUI.actionSheet({
						title: "转入党员审批操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						buttons[e.index-1].callback();
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
										if (d.success) self.usersToBeOperated = _del_ele(self.usersToBeOperated, idx);
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
										if (d.success) self.usersToBeOperated = _del_ele(self.usersToBeOperated, idx);
									});
								}
							});
						}
					});
				},
				addUser: function(i, idx) {
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
											if (d.success) self.usersToBeOperated = _del_ele(self.usersToBeOperated, idx);
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
										if (d.success) self.usersToBeOperated = _del_ele(self.usersToBeOperated, idx);
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
									    i.ifValid = 2;
									    i.stateTag = "已通过";
										mui.toast("通过"+(d.success?"成功":"失败"));
//										if (d.success) self.appraises = _del_ele(self.appraises, idx);
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
										i.ifValid = 0;
										i.stateTag = "已退回";
//										if (d.success) self.appraises = _del_ele(self.appraises, idx);
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
										cmd: "multiFetch",
										multi: _dump([
											{
												key: "activity",
												sql: "update activitys set ifValid = 4 where id = "+i.id
											},
											{
												key: "score",
												sql: "update activityEnroll set score = preScore where activityId = "+i.id
											}
										])
									}, function(d) {
										mui.toast("通过"+(d.success?"成功":"失败"));
										if (d.success) {
											self.examines = _del_ele(self.examines, idx);
											self.approved.push(i);
										}
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
						sql: "select id, name, orgName, strftime('%m-%d', logtime) as logtime, reason, ifValid from user where (ifValid = -1 or ifValid = 2) and orgNo in (select no from organization where superorgNo = ?)",
						vals: _dump([self.userInfo.no,])
					}, function(d) {
						if (d.success && d.data) {
							d.data.forEach(function(i) {
								i.ifValid = parseInt(i.ifValid);
								i.vText = (i.ifValid==-1?"新增":"删除")+i.name+"的请求";
								self.usersToBeOperated.push(i);
							});
						}
					});

                    // 转入请求 
                    _callAjax({
                        cmd: "fetch",
                        sql: "select id, name, srcOrgName, userId from userTrans where destOrgNo = ? and status = 0",
                        vals: _dump([self.userInfo.no])
                    }, d => {
                        if (d.success && d.data) {
							d.data.forEach(function(i) {
								i.vText = "转入"+i.name+"的请求";
								i.orgName = i.srcOrgName;
								self.usersToBeOperated.push(i);
							});
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
						sql: "select e.id, userId, u.name, e.orgNo, o.name as orgName, content, e.img, e.reason, score, e.ifValid, strftime('%m-%d', e.logtime) as logtime from easyScore e, user u, organization o where userId = u.id and e.orgNo = ? and o.no = e.orgNo",
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
              // 获取30天内过审(ifValid == 4)的项目
              getApproved: function() {
              	var self = this;
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, o.name as orgName from activitys a, organization o where a.orgId = o.id and a.ifValid = 4 and (julianday('now','localtime')-julianday(starttime) < 30.0) and a.orgId in (select id from organization where superOrgNo = ?)",
					vals: _dump([self.userInfo.no,])
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						self.approved = d.data;
					}
				});
             },
             withdrawActivity: function(i, idx) {
             	var self = this;
				mui.confirm('<input type="text" id="withdraw" />', "退回", ["确定", "取消"], function(e) {
					if (e.index == 0) {
						var txt = _trim(document.getElementById("withdraw").value);
						if (!txt) {
							mui.toast("请输入理由");
							return false;
						}

						_callAjax({
							cmd: "multiFetch",
							multi: _dump([
								{
									key: "updateState",
									sql: "update activitys set ifValid = 2, withdrawTxt = '"+txt+"' where id = "+i.id
								},
								{
									key: "updateScore",
									sql: "update activityEnroll set score = 0 where activityId = "+i.id
								}
							])
						}, function(d) {
							mui.toast("打回"+(d.success?"成功":"失败"));
							if (d.success) self.approved = _del_ele(self.approved, idx);
						});
					}
				}, 'div');
             }
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
				this.getActivities();
				this.getAppraises();
				this.getUsers();
				this.getApproved();
			}
		});
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());

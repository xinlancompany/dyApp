mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var activityId = 0;

    // 获取用户信息
    var userInfoStr = _get("userInfo"),
        userInfo = _load(userInfoStr);

    // 页面信息
    var wb = plus.webview.currentWebview();

	var isSub = false;
	if ("isSub" in wb) isSub = wb.isSub;

	// lid用于提交之后的刷新
	var lid = wb.lid;

	var activityDetail = new Vue({
		el: '#activeDetail',
		data: {
			orgName: "", // 支部名称
//			unattenders: [], // 缺席人员
			attenders:[], // 与会人员名单
			detailData: {},  //活动详情数据
			userInfo: null,
			bClick: false,  //报名按钮是否可点击
            isAdmin: wb.isAdmin,
//          isSub: "isSub" in wb ? wb.isSub : ("no" in userInfo && !wb.isAdmin), // 是否子页面打开
			isSub: isSub,
            experiencePermitted: 0, // 心得是否审定
            // ifFinished: false, // 活动是否关闭
		},
		computed: {
			applicantTxt: function() {
				var allCnt = this.detailData.applicant,
					absentCnt = this.detailData.absents.length;
				return (allCnt-absentCnt)+"/"+allCnt;
			},
			invalidNames: function() {
				if (!this.detailData.notOnDuties) return '';
				var self = this;
				return _map(function(i) { return i.name; }, self.detailData.notOnDuties).join(",")
			},
			absentNames: function() {
            		var ret = {};
            		this.detailData.absents.forEach(function(i) {
            			if (i.reason in ret) {
            				ret[i.reason].push(i.name);
            			} else {
            				ret[i.reason] = [i.name];
            			}
            		});
            		var retStr = "";
            		Object.keys(ret).forEach(function(k) {
            			retStr += k+":"+ret[k].join(",")+"\n";
            		});
            		return retStr;
			},
			finishState: function() {
				var ifRecordUploaded = "record" in this.detailData && !!this.detailData["record"];
				if (!ifRecordUploaded) return {
					ifFinished: false,
					tag: "活动记录未上传"
				};
				var ifRecordImgsUploaded = "recordImgs" in this.detailData && !!this.detailData["recordImgs"];
				if (!ifRecordImgsUploaded) return {
					ifFinished: false,
					tag: "活动记录照片未上传",
				};
				var ifTimeup = _dateCompare(_now(), this.detailData.endtime);
				if (!ifTimeup) return {
					ifFinished: false,
					tag: "活动时间为结束"
				};
				return {
					ifFinished:true,
					tag: "已结束"
				};
			}
		},
		methods: {
			openGallery: function() {
				var arr = [];
				var self = this;
				this.detailData.recordImgs.forEach(function(img,i) {
					arr.push(img.img);
					if(self.detailData.recordImgs.length == i + 1) return plus.nativeUI.previewImage(arr,{'current': 0, 'loop': true})
				})
			},
            // 活动打分
            openRanks: function() {
                var self = this;
                if (!self.finishState.ifFinished) return mui.toast(self.finishState.tag);
//              _callAjax({
//              	cmd: "exec",
//              	sql: "update activityEnroll set score = preScore, preScore = 0 where activityId = ? and preScore > 0",
//              	vals: _dump([activityId,])
//              }, function(_d) {
//					openWindow("memberRanks.html", "memberRanks", {
//						aid: activityId,
//						title: self.detailData.title
//					});
//              });

					openWindow("memberRanks.html", "memberRanks", {
						aid: activityId,
						title: self.detailData.title,
					});
            },
            // 上传心得
            uploadExperience: function() {
                if (this.bClick) return mui.toast("您未参加该活动，无法上传心得");
                if (this.experiencePermitted) {
                    return mui.toast("您的心得已经审定，不能再修改");
                    // openWindow("")
                }
                openWindow("experienceUpload.html", "experienceUpload", {
                    aid: activityId
                });
            },
            // 上传记录
            uploadRecord: function() {
                if (this.detailData.ifValid < 3) {
					openWindow("recordUpload.html", "recordUpload", {
						aid: activityId
					});
                } else {
                		mui.toast("当前状态不得修改记录");
                }
            },
            // 打开心得
            openExperiences: function() {
                var self = this;
                openWindow("activityExperiences.html", "activityExperiences", {
                    aid: activityId,
                    isAdmin: self.isAdmin,
                    isSub: isSub,
                });
            },
			//获取活动详情
			getActivityDetail: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select a.id, a.title, a.img, a.content, a.linkerId,a.absents,a.notOnDuties,a.unattendReason, a.organizer,a.recorder,a.superAttenders, a.ifValid, a.withdrawTxt, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime) as endtime, a.address, a.status, count(e.id) as applicant, a.record, a.recordImgs, a.recordTime from activitys a left join activityEnroll e on e.activityId = a.id where a.id = ?",
					vals:_dump([activityId])
				}, function(d) {
					if(d.success && d.data) {
						if (d.data[0].img) {
							var arrImg = d.data[0].img.split('/upload');
							d.data[0].img = serverAddr + '/upload' + arrImg[1];
						} else {
							d.data[0].img = serverAddr+"/upload/pic/activityListAdd/activity_default.jpeg";
						}
						d.data[0].ifValid = parseInt(d.data[0].ifValid); // 转换字符为数字
						self.detailData = d.data[0];	
						if (self.detailData.organizer) self.detailData.organizer = _load(self.detailData.organizer);
						if (self.detailData.recorder) self.detailData.recorder = _load(self.detailData.recorder);
						if (self.detailData.absents) self.detailData.absents = _load(self.detailData.absents);
						if (self.detailData.notOnDuties) self.detailData.notOnDuties = _load(self.detailData.notOnDuties);
						if (self.detailData.recordImgs) self.detailData.recordImgs = _load(d.data[0].recordImgs)
//						self.detailData.organizer = _load(self.detailData.organizer);
//						self.detailData.recorder = _load(self.detailData.recorder);
//						self.detailData.absents = _load(self.detailData.absents);
//						self.detailData.notOnDuties = _load(self.detailData.notOnDuties);
//						self.detailData.recordImgs = _load(d.data[0].recordImgs)
					}
				});

				// 与会名单
				_callAjax({
					cmd:"fetch",
					sql:"select name from user where id in (select userId from activityEnroll where activityId = ?)",
					vals:_dump([activityId,])
				}, function(d) {
					if (d.success && d.data && d.data.length) self.attenders = _map(function(i) {
						return i.name;
					}, d.data);
				});

				var orgNo;
				if ("no" in self.userInfo) {
					orgNo = self.userInfo.no;
				} else {
					orgNo = self.userInfo.orgNo;
				}
				// 缺席人员
				_callAjax({
					cmd: "fetch",
					sql: "select name from user where orgNo = ? and id not in (select userId from activityEnroll where activityId = ?)",
					vals: _dump([orgNo, activityId])
				}, function(d) {
					if (d.success && d.data && d.data.length) self.unattenders = _map(function(i) {
						return i.name;
					}, d.data);
				});
			},
			//报名
			enroll: function(){
				var self = this;
				//当前用户已报名
				if(!self.bClick) return;
				
				if(self.userInfo){
					//已登录
					//确认框
					mui.confirm('确认报名参加此活动?', '', ['取消', '确定'], function(e) {
						if(e.index == 1) {
							//报名
							_callAjax({
								cmd: "exec",
								sql: "insert into activityEnroll(userId, activityId) values(?,?)",
								vals: _dump([self.userInfo.id, activityId])
							}, function(d) {
								if(d.success) {
									mui.toast('报名成功');
                                    self.bClick = 0;
                                    /*
									self.getActivityDetail();
					
									setTimeout(function() {
										mui.fire(plus.webview.getWebviewById("activityList"), 'refresh', {
											id: activityId,
											count: self.detailData.applicant
										});
									}, 500)
                                    */
					
								} else {
									mui.toast('报名失败');
								}
							})
						}
					})
				}else {
					//未登录，跳转到登录页面
					openWindow("login.html","login");
				}
			},
			//当前登录用户是否已报名
			checkEnroll: function(){
				var self = this;
				
				_callAjax({
					cmd: "fetch",
					sql: "select id, experiencePermitted from activityEnroll where userId = ? and activityId = ?",
					vals: _dump([self.userInfo.id, activityId])
				}, function(d) {
					if(d.success) {
						if(d.data && d.data.length) {
							self.bClick = false;
                            self.experiencePermitted = parseInt(d.data[0].experiencePermitted);
						} else {
							self.bClick = true;
						}
					}
				})
			},
			//修改开始时间
			changeStartTime: function(){
				var self = this;
				//修改完后需要保存
			},
			//修改结束时间
			changeEndTime: function(){
				var self = this;
				//修改完后需要保存
			},
			//修改活动地址
			changeAddress: function(){
				var self = this;
				
				mui.prompt('修改活动地址', '', '', ['确认', '取消'], function(e) {
					if(e.index == 0) {
						if(e.value){
							self.detailData.address = e.value;
						}else {
							
						}
					}
				}, 'div');
				
				//修改完后需要保存
			},
			//初始化
			init: function(){
				var self = this;
				
				self.userInfo = _load(_get('userInfo'));
				if ("no" in self.userInfo) {
					self.orgName = self.userInfo.name;
				} else {
					self.orgName = self.userInfo.orgName;
				}
				
				// activityId = _get('activityId');
                activityId = wb.activityId;
				self.getActivityDetail();
				self.checkEnroll();
			},
			
			// 提交活动
			submitActivity: function() {
                var self = this;
                mui.confirm("是否提交审核？", "提示", ["确定", "取消"], function(e) {
                    if (e.index == 0) {
                    		_callAjax({
                    			cmd: "exec",
                    			sql: "update activitys set ifValid = 3 where id = ?",
                    			vals:_dump([activityId,])
                    		}, function(d) {
                    			mui.toast("提交"+(d.success?"成功":"失败"));
                    			if (d.success) {
                    				self.detailData.ifValid = 3;
                    				setTimeout(function() {
									mui.fire(plus.webview.getWebviewById("activityList"), "refresh", {
										lid: lid
									});
                    				}, 1000);
                    			}
                    		});
                    }
                });
			}
		},
		mounted: function() {
			var self = this;
			self.init();
		}
	})
	
	//添加newId自定义事件监听
	window.addEventListener('activityId', function(event) {
		//获得事件参数
		activityDetail.init();
	});

    window.addEventListener("refresh", function(event) {
        activityId = event.detail.aid;
        activityDetail.init();
    });
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

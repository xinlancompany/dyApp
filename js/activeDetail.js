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
		
	var activityDetail = new Vue({
		el: '#activeDetail',
		data: {
			detailData: {},  //活动详情数据
			userInfo: null,
			bClick: false,  //报名按钮是否可点击
            isAdmin: wb.isAdmin,
            isSub: "no" in userInfo && !wb.isAdmin, // 是否子页面打开
            experiencePermitted: 0, // 心得是否审定
		},
		methods: {
            // 活动打分
            openRanks: function() {
                var self = this;
                openWindow("memberRanks.html", "memberRanks", {
                    aid: activityId,
                    title: self.detailData.title
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
                openWindow("recordUpload.html", "recordUpload", {
                    aid: activityId
                });
            },
            // 打开心得
            openExperiences: function() {
                var self = this;
                openWindow("activityExperiences.html", "activityExperiences", {
                    aid: activityId,
                    isAdmin: self.isAdmin
                });
            },
			//获取活动详情
			getActivityDetail: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.address, a.status, count(e.id) as applicant, a.record, a.recordImgs, a.recordTime from activitys a left join activityEnroll e on e.activityId = a.id where a.id = ?",
					vals:_dump([activityId])
				}, function(d) {
					if(d.success && d.data) {
						var arrImg = d.data[0].img.split('/upload');
						d.data[0].img = serverAddr + '/upload' + arrImg[1];
						self.detailData = d.data[0];	
						self.detailData.recordImgs = _load(d.data[0].recordImgs)
						setTimeout(function() {
							var swiper = new Swiper('.activity-swiper', {
								loop: true
							});
						}, 500)
					}
				})
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
									self.getActivityDetail();
					
									setTimeout(function() {
										mui.fire(plus.webview.getWebviewById("activityList"), 'refresh', {
											id: activityId,
											count: self.detailData.applicant
										});
									}, 500)
					
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
				console.log('修改开始时间');
				
				
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
					console.log(((e.index == 0) ? "确认: " : "取消") + e.value);
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
				
				// activityId = _get('activityId');
                activityId = wb.activityId;
				self.getActivityDetail();
				self.checkEnroll();
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

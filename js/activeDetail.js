mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var activityId = 0;
	
	var activityDetail = new Vue({
		el: '#activeDetail',
		data: {
			detailData: {},  //活动详情数据
			userInfo: null,
			bClick: false,  //报名按钮是否可点击
		},
		methods: {
			//获取活动详情
			getActivityDetail: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.address, a.status, count(e.id) as applicant from activitys a outer left join activityEnroll e on e.activityId = a.id where a.id = ?",
					vals:_dump([activityId])
				},function(d){
					if(d.success && d.data) {
						self.detailData = d.data[0];
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
					sql: "select * from activityEnroll where userId = ? and activityId = ?",
					vals: _dump([self.userInfo.id, activityId])
				}, function(d) {
					if(d.success) {
						if(d.data) {
							self.bClick = false;
						} else {
							self.bClick = true;
						}
					}
				})
			},
			//初始化
			init: function(){
				var self = this;
				
				self.userInfo = _load(_get('userInfo'));
				
				activityId = _get('activityId');
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
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

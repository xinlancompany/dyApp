mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var activityId = 0;
	
	var activityDetail = new Vue({
		el: '#activeDetail',
		data: {
			detailData: {},  //活动详情数据
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
				
				var userInfo = _load(_get('userInfo'));
				_tell(userInfo);
				
				if(userInfo){
					//已登录
					//查重
					_callAjax({
						cmd: "fetch",
						sql: "select * from activityEnroll where userId = ? and activityId = ?",
						vals: _dump([userInfo.id, activityId])
					}, function(d) {
						if(d.success) {
							if(d.data) {				
								mui.toast('您已报过名了，请勿重复报名');
							} else {
								//报名
								_callAjax({
									cmd: "exec",
									sql: "insert into activityEnroll(userId, activityId) values(?,?)",
									vals: _dump([userInfo.id, activityId])
								}, function(d) {
									if(d.success) {
										mui.toast('报名成功');
										self.getActivityDetail();
										
										setTimeout(function(){
											mui.fire(plus.webview.getWebviewById("activityList"), 'refresh', {
												id: activityId,
												count: self.detailData.applicant
											});
										},500)
										
									} else {
										mui.toast('报名失败');
									}
								})
							}
						}
					})
				}else {
					//未登录，跳转到登录页面
					openWindow("login.html","login");
				}
				
			},
		},
		mounted: function() {
			var self = this;
			
			activityId = _get('activityId');
			self.getActivityDetail();
		}
	})
	
	//添加newId自定义事件监听
	window.addEventListener('activityId', function(event) {
		//获得事件参数
		activityId = _get('activityId');
		
		console.log("activityId= "+activityId);
		activityDetail.getActivityDetail();
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

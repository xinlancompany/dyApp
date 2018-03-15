mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var myActivity = new Vue({
		el: '#myActivity',
		data: {
			activityList: [{
				img: '',
				title: '',
				applicant: '',
				starttime: '',
				endtime: '',
				status: ''
			}],
			bHaveMore: false,
			userInfo: null
		},
		methods: {
			getActivityList: function(){
				var self = this;
				
				if(self.userInfo){
					var f = 10e5;
					if(self.activityList.length) {
						f = _at(self.activityList, -1).id;
					}
					
					// var orgId = _getOrgId();
					_callAjax({
						cmd: "fetch",
						sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.address, a.status, count(e.id) as applicant from activitys a, activityEnroll e where e.activityId = a.id and ifValid =1 and e.userId = ? and a.id < ? group by a.id order by a.id desc limit 10",
						vals: _dump([self.userInfo.id, f])
					}, function(d) {
						if(d.success && d.data) {
							d.data.forEach(function(r) {
                                if (_dateCompare(r.starttime, _now())) {
                                    r.status = "即将开始";
                                } else if (_dateCompare(r.endtime, _now())) {
                                    r.status = "正在进行";
                                } else {
                                    r.status = "已结束";
                                }
								self.activityList.push(r);
							});
							
							if(self.activityList.length<10){
								self.bHaveMore = false;
							}else {
								self.bHaveMore = true;
							}
						} else {
							self.bHaveMore = false;
							if(f != 10e5) {
								mui.toast("没有更多活动了")
							}
						}
					})
				}
				
			},
			goActivityDetail: function(i) {
				openWindow('activeDetail.html', 'activeDetail', {
                    activityId: i.id,
                    isAdmin: "no" in _load(_get("userInfo"))
                });
			},
		},
		mounted: function() {
			var self = this;
			
			self.userInfo = _load(_get('userInfo'));
			
			self.activityList = [];
			self.getActivityList();
		}
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

mui.init({
	preloadPages: [{
		url: 'internetCourseware.html',
		id: 'internetCourseware'
	}]
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var myStudy = new Vue({
		el: '#myStudy',
		data: {
			internets: [],  //课件
			bHaveMore: false,
			userInfo: null,
			liveList: [],
			bHaveMore_live: true,
		},
		computed: {
            	courseLiveList: function() {
            		var l = this.internets.concat(this.liveList);
            		l.sort(function(a, b) {
            			return a.time < b.time;
            		});
            		return l;
            	}
		},
		methods: {
			getLiveList: function(){
				var self = this;
				
				if(self.userInfo && self.bHaveMore_live) {
					var f = 10e5;

					if(self.liveList.length) {
						f = _at(self.liveList, -1).id;
					}
				
					_callAjax({
						cmd: "fetch",
//						sql: "select a.id, a.title, a.img, a.content, a.brief, strftime('%m-%d', e.logtime)as time, ifnull(e.credit, 0) as points from courses a left join courseEnroll e on e.courseId = a.id where a.ifValid =1 and e.userId = ? and a.id< ? and a.linkerId in (select id from linkers where refId = ?) order by a.id desc limit 10",
//						vals: _dump([self.userInfo.id, f, linkerId.StudyPlatform])

						sql: "select a.id, a.title, a.url, a.img, a.content, a.brief, strftime('%Y-%m-%d', e.logtime) as time, ifnull(e.credit, 0) as points from courses a, courseEnroll e where e.courseId = a.id and a.ifValid > 0 and e.userId = ? and a.id < ? and a.linkerId in (select id from linkers where refId = ? or refId = ?) order by e.logtime desc limit 10",
						vals: _dump([self.userInfo.id, f, linkerId.StudyPlatform, linkerId.HandCourse])
					}, function(d) {
						// alert(_dump(d.data));
						if(d.success && d.data) {
							d.data.forEach(function(r) {
								r.points = studyScoreSetting.livePerMinute * r.points;
								r.points = Math.round(r.points*100)/100.0;
								self.liveList.push(r);				
							});
				
							if(self.liveList.length < 10) {
								self.bHaveMore_live = false;
							} else {
								self.bHaveMore_live = true;
							}

							_tell("--------------");
							_tell(self.bHaveMore_live);
							_tell("--------------");

							if(self.activeTab == 1){
								self.contentList = self.courseLiveList;
							}
						} else {
							self.bHaveMore_live = false;
							if(f != 10e5) {
								mui.toast("已全部加载完毕")
							}
						}
					})
				}
			},
			getMyStudy: function(){
				var self = this;
				
				if(self.userInfo){
					var f = 10e5;
					if(self.internets.length) {
						f = _at(self.internets, -1).id;
					}
					// var orgId = _getOrgId();
					_callAjax({
						cmd: "fetch",
						sql: "select a.id, a.title, a.img, a.content, a.brief, strftime('%Y-%m-%d', e.logtime)as time from courses a left outer join courseEnroll e on e.courseId = a.id where a.ifValid =1 and e.userId = ? and a.id< ? and a.linkerId = ? order by a.id desc limit 10",
						vals: _dump([self.userInfo.id, f, linkerId.netCourse])
					}, function(d) {
						if(d.success && d.data) {
							d.data.forEach(function(r) {
								self.internets.push(r);
					
							});
							
							if(self.internets.length<10){
								self.bHaveMore = false;
							}else {
								self.bHaveMore = true;
							}
						} else {
							self.bHaveMore = false;
							if(f != 10e5) {
								mui.toast("已全部加载完毕")
							}
						}
					})
				}
			},
			//跳转到详情
			gotoNetCourseDetail: function(i) {
//				_set("netcourseId", i.id);
//				mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
//				
//				openWindow("internetCourseware.html", "internetCourseware");

				// 打开外链
				if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
				// 如果预加载，需要触发事件
				mui.fire(plus.webview.getWebviewById("courseDetail"), "courseId", {
					cid: i.id
				});
				openWindow("courseDetail.html", "courseDetail", {
					cid: i.id
				});
			},
		},
		mounted: function() {
			var self = this;
			
			self.userInfo = _load(_get('userInfo'));
			self.internets = [];
			self.getMyStudy();
			self.getLiveList();
		}
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

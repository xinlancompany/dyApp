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
						sql: "select l.id, l.title, l.img, strftime('%Y-%m-%d', e.logtime)as time, count(e.id) as points from lives l, liveEnroll e where l.ifValid > 0 and e.liveId = l.id and e.userId = ? and l.id < ? group by l.id order by l.id desc",
						vals: _dump([self.userInfo.id, f])
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

							if(self.activeTab == 1){
								self.contentList = self.courseLiveList;
							}
						} else {
							self.bHaveMore_live = false;
							if(f != 10e5) {
								mui.toast("没有更多课件了")
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
								mui.toast("没有更多课件了")
							}
						}
					})
				}
			},
			//跳转到详情
			gotoNetCourseDetail: function(i) {
				_set("netcourseId", i.id);
				mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
				
				openWindow("internetCourseware.html", "internetCourseware");
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

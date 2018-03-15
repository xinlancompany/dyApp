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
			userInfo: null
		},
		methods: {
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
						sql: "select a.id, a.title, a.img, a.content, a.brief from courses a left outer join courseEnroll e on e.courseId = a.id where a.ifValid =1 and e.userId = ? and a.id< ? and a.linkerId = ? order by a.id desc limit 10",
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
		}
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

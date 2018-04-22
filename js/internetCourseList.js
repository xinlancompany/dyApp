//预加载页面

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var internetList = new Vue({
		el: '#internetList',
		data: {
			courses:[],
			bHaveMore: false,
			categories: [],
			curId: 0,
		},
		methods: {
			//跳转到网络课堂详情
			gotoNetCourseDetail: function(i) {
				_set("newsId", "");
				openWindow("newsDetail.html", "newsDetail", {
					aid: i.id,
					table: "courses"
				});
			},
			//获取课件列表
			getInternetList: function(){
				var self = this,
					fi = 10e6,
					fn = "3000-12-31 23:59:59";
				if (this.news.length) {
					var i = _at(this.news, -1)["id"];
					fi = i.id;
					fn = i.newsdate;
				}
				_callAjax({
					cmd: "fetch",
					sql: "select id, title, newsdate, img from courses where linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) order by newsdate desc limit 10",
					vals: _dump([self.lid, fn, fn, fi])
				}, function(d) {
					if (d.success && d.data) {
						if (d.data.length == 10) self.bHaveMore = true;
						d.data.forEach(function(i) {
							self.news.push(i);
						});
					}
				});
			},
			init: function(){
				var self = this;
				self.internets = [];
				self.getInternetList();
				self.bHaveMore = false;
			}
			
		},
		created: function() {
			var self = this;
			_callAjax({
				cmd: "fetch",
				sql: "select id, name from linkers where refId = ?",
				vals: _dump([linkerId.HandCourse,])
			}, function(d) {
				if (d.success && d.data) {
					self.categories = d.data;
				}
			});
		}
	})
	
	internetList.init();
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

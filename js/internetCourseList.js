//预加载页面

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var internetList = new Vue({
		el: '#internetList',
		data: {
			courses: {
				c_0: {
					news: [],
					bHaveMore: true 
				},
			},
			bHaveMore: false,
			categories: [],
			curId: 0,
		},
		watch: {
			curId: function(i) {
				if (i > 0 && !this.courses["c_"+i].news.length) this.getInternetList();
			}
		},
		methods: {
			//跳转到网络课堂详情
			openCourse: function(i) {
//				_set("newsId", "");
//				openWindow("newsDetail.html", "newsDetail", {
//					aid: i.id,
//					table: "courses"
//				});
				openWindow("courseDetail.html", "courseDetail", {
					cid: i.id
				});
			},
			//获取课件列表
			getInternetList: function(){
				var self = this,
					fi = 10e6,
					fn = "3000-12-31 23:59:59",
					t = "c_"+self.curId;
				if (this.courses[t].news.length) {
					var i = _at(this.courses[t].news, -1);
					fi = i.id;
					fn = i.newsdate;
				}
				var sql = "select id, title, newsdate, img from courses where linkerId in (select id from linkers where ifValid = 1 and refId = "+linkerId.HandCourse+") and (newsdate < '"+fn+"' or (newsdate = '"+fn+"' and id < '"+fi+"')) order by newsdate desc, id desc limit 10";
				if (this.curId > 0) {
					sql = "select id, title, newsdate, img from courses where linkerId = "+this.curId+" and (newsdate < '"+fn+"' or (newsdate = '"+fn+"' and id < '"+fi+"')) order by newsdate desc, id desc limit 10"
				}
				_callAjax({
					cmd: "fetch",
					sql: sql,
//					vals: _dump([linkerId.HandCourse, fn, fn, fi])
				}, function(d) {
					if (d.success && d.data) {
						self.courses[t].bHaveMore = d.data.length == 10;
						d.data.forEach(function(i) {
							self.courses[t].news.push(i);
						});
					} else {
						self.courses[t].bHaveMore = false;
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
				sql: "select id, name from linkers where refId = ? and ifValid = 1",
				vals: _dump([linkerId.HandCourse,])
			}, function(d) {
				if (d.success && d.data) {
//					self.categories = d.data;
					d.data.forEach(function(i) {
						self.categories.push(i);
//						self.courses["c_"+i.id] = {
//							news: [],
//							bHaveMore: true
//						}
						self.$set(self.courses, "c_"+i.id, {
							news: [],
							bHaveMore: true
						});
					});
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

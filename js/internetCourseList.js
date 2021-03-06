//预加载页面

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var internetList = new Vue({
		el: '#internetList',
		data: {
			courses: {
				c_0: {
					news: [],
					bHaveMore: true,
					tvs: []
				},
			},
			bHaveMore: false,
			categories: [],
			curId: 0, // 非0时为当前课程的linkerId
			searchWord: '',
			searchState: false,
			coursesSearched: [],
			tvs: [], // 电视剧
		},
		watch: {
			curId: function(i) {
				if (i > 0 && !this.courses["c_"+i].news.length) this.getInternetList();
			},
		},
		computed: {
			showCourses: function() {
				return this.searchState ? this.coursesSearched : this.courses['c_'+this.curId].news;
			}
		},
		methods: {
			// 搜索课程 
			searchCourses: function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				var sw = _trim(this.searchWord),
					self = this;
				if (sw == '') {
					this.searchState = false;
				}
				if (evt.keyCode != 13) return;
				if (!sw) mui.toast("请输入搜索标题");
				var sql = "select id, title, url, newsdate, img from courses where linkerId in (select id from linkers where ifValid = 1 and refId = "+linkerId.HandCourse+") and title like '%"+sw+"%' and ifValid = 1"
				if (this.curId > 0) {
					sql: "select id, title, url, newsdate, img from courses where linkerId = "+self.curId+" and title like '%"+sw+"%' and ifValid = 1"
				}
				_callAjax({
					cmd: "fetch",
					sql: sql
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						self.coursesSearched = d.data;
					} else {
						self.coursesSearched = [];
					}
					self.searchState = true;
				});
			},
			//跳转到网络课堂详情
			openCourse: function(i) {
//				_set("newsId", "");
//				openWindow("newsDetail.html", "newsDetail", {
//					aid: i.id,
//					table: "courses"
//				});
				// 打开外链
				if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
				mui.fire(plus.webview.getWebviewById("courseDetail"), "courseId", {
					cid: i.id
				});
				if (i.isTv) {
                    openWindow("serialVideo.html", "serialVideo", {
                        sub_title: i.sub_title,
                        img: i.img,
                    });
				} else {
                    openWindow("courseDetail.html", "courseDetail", {
                        cid: i.id
                    });
				}
			},
			//获取课件列表
			getInternetList: function(){
			    console.log("rth");
				var self = this,
					fi = 10e6,
					fn = "3000-12-31 23:59:59",
					t = "c_"+self.curId;
				if (this.courses[t].news.length) {
					var i = _at(this.courses[t].news, -1);
//					_tell(i);
					fi = i.id;
					fn = i.newsdate;
				}
				var sql = "select id, title, url, newsdate, img from courses where linkerId in (select id from linkers where ifValid = 1 and refId = "+linkerId.HandCourse+") and (newsdate < '"+fn+"' or (newsdate = '"+fn+"' and id < '"+fi+"')) and ifValid > 0 order by newsdate desc, id desc limit 10";
				if (this.curId > 0) {
                    sql = "select id, title, url, newsdate, img from courses where linkerId = "+this.curId+" and (newsdate < '"+fn+"' or (newsdate = '"+fn+"' and id < '"+fi+"')) and ifValid > 0 order by newsdate desc, id desc limit 10"
				}
//				_tell(sql);
//				_tell(fi+","+fn);
				_callAjax({
					cmd: "fetch",
					sql: sql,
//					vals: _dump([linkerId.HandCourse, fn, fn, fi])
				}, function(d) {
				    _tell(d);
					if (d.success && d.data) {
						self.courses[t].bHaveMore = d.data.length == 10;
						d.data.forEach(function(i) {
						    i.isTv = false;
						    if (i.title.indexOf("电视剧_") == 0) {
						        let tvName = i.title.split("_")[1];
						        let l = _filter((j) => {
						            return j.sub_title == tvName;
						        }, self.courses[t].tvs);
						        if (l && l.length == 1) {
						            l[0].id = i.id;
						            l[0].newsdate = i.newsdate;
						            return;
						        }
						        i.sub_title = tvName;
						        i.title = "电视剧："+tvName;
						        i.isTv = true;
						        self.courses[t].tvs.push(i);
						    }
							self.courses[t].news.push(i);
						});
						if (_at(self.courses[t].news, -1).isTv) {
						    self.getInternetList();
						}
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
			// 下拉刷新
			pullToRefresh();

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
							bHaveMore: true,
							tvs: []
						});
					});
				}
			});
		}
	})
	
	internetList.init();
	
	$('.search-btn').on('click', function() {
		openWindow("searchCourse.html", "searchCourse");
	})
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

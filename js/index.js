if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

mui.init({
	preloadPages: [{
		url: 'views/newsDetail.html',
		id: 'newsDetail'
	},{
		url: 'views/internetCourseware.html',
		id: 'internetCourseware'
	},{
		url: 'views/liveDetail.html',
		id: 'liveDetail'
	},{
		url: 'views/score.html',
		id: 'score'
	}]
})	

var changeTab = function(el, self) {
	$('.main').hide();
	$('#' + el + '').show();
	self.addClass('active').siblings().removeClass('active');
}

function plusReady() {
	pullToRefresh();
	
	var swiperStudy = null;
	
	//添加登录返回refresh自定义事件监听
	window.addEventListener('loginBack', function(event) {
		var userInfo = _load(_get('userInfo'));
	
		_tell(userInfo);
		if(userInfo.id != null) {
			ucenter.isLogin = true;
			ucenter.userInfo = userInfo;
		} else {
			ucenter.isLogin = false;
		}
	})
	
	var indexSwiper = new Vue({
		el: '.index-swiper',
		data: {
			scrollNews: [],
			activeSlideText: '',
			show: true
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				index.gotoDetail(i);
			},
		}
	})
		
	var index = new Vue({
		el: '#index',
		data: {
			headNews: [],
			activity: [], //活动专题
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				_set("newsId", i.id);
				//触发详情页面的newsId事件
				mui.fire(plus.webview.getWebviewById("newsDetail"), 'newsId', {});
			
				openWindow("views/newsDetail.html", "newsDetail");
			},
			goActivity: function(i) {
					
			},
			goActivityTab: function() {
				$('.go-activity').click();
			},
			//跳转到某个专题的活动列表页
			goActivityList:function(id){			
				_set('activitySortId', id);
				mui.fire(plus.webview.getWebviewById("activityList"), 'activitySortId', {});
				
				openWindow('views/activityList.html', 'activityList');
			},
			//获取动态新闻
			getNews: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and linkerId = " + linkerId.News +" order by id desc limit 10"
				},function(d){
					if(d.success && d.data) {
						if(d.data.length>5){
							indexSwiper.scrollNews = d.data.slice(0,5);
							self.headNews = d.data.slice(5,8);
						}else {
							indexSwiper.scrollNews = d.data;
						}
						
						indexSwiper.activeSlideText = indexSwiper.scrollNews[0].title;
						setTimeout(function(){
							var swiper = new Swiper('.index-swiper', {
								pagination: '.swiper-pagination',
								onSlideChangeEnd: function(swiper){
							      	indexSwiper.activeSlideText = indexSwiper.scrollNews[swiper.activeIndex].title
								}
							});
						}, 500)
					}
				})
			},
			//获取活动专题
			getActivitySort: function(){
				var self = this;
				
				_callAjax({
					cmd: "fetch",
					sql: "select id, name, img, strftime('%Y-%m-%d %H:%M', logtime) as logtime from linkers where ifValid = 1 and refId = " + linkerId.activitySort + " order by id desc limit 2"
				},function(d){
					if(d.success && d.data){
						self.activity = d.data
					}
				})
			}
		},
		mounted: function() {
			var self = this;
			
			//获取动态新闻
			self.getNews();
			//获取活动专题
			self.getActivitySort();
		}
	})
	
	var activity = new Vue({
		el: '#activity',
		data: {
			activity: [],
			bHaveMore: false
		},
		methods: {
			goActivity: function(i) {
					
			},
			//跳转到某个专题的活动列表页
			goActivityList:function(id){
				
				var userInfo = _load(_get('userInfo'));
				console.log(userInfo);
				
				if(userInfo) {
					_set('activitySortId', id);
					mui.fire(plus.webview.getWebviewById("activityList"), 'activitySortId', {});
					
					openWindow('views/activityList.html', 'activityList');
				} else {
					openWindow("login.html", "login");
				}
				
			},
			//获取活动专题
			getActivitySort: function(){
				var self = this;
				
				var f = 10e5;
				if(self.activity.length) {
					f = _at(self.activity, -1).id;
				}
				
				_callAjax({
					cmd: "fetch",
					sql: "select id, name, img, strftime('%Y-%m-%d %H:%M', logtime) as logtime from linkers where ifValid = 1 and refId = ? and id<? order by id desc limit 5",
					vals: _dump([linkerId.activitySort, f])
				},function(d){
					if(d.success && d.data){
						self.bHaveMore = true;
						d.data.forEach(function(r) {
							self.activity.push(r);
						
						});
					}else {
						self.bHaveMore = false;
						if(f != 10e5){
							mui.toast("没有更多专题了")
						}
					}
				})
			}
		},
		mounted: function() {
			var self = this;
	
			//获取活动专题
			self.getActivitySort();
		}
	})
	
	var study = new Vue({
		el: '#study',
		data: {
	//		scrollNews: [],
			headNews: [],
			activeSlideText: '',
			lives: [], //直播课堂
			internets: [],//网络课堂
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				_set("newsId", i.id);
				//触发详情页面的newsId事件
				mui.fire(plus.webview.getWebviewById("newsDetail"), 'newsId', {});
			
				openWindow("views/newsDetail.html", "newsDetail");
			},
			//跳转到网络课堂详情
			gotoNetCourseDetail: function(i){
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("netcourseId", i.id);
					mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
					
					openWindow("views/internetCourseware.html", "internetCourseware");
				} else {
					openWindow("login.html", "login");
				}
				
			},
			goEduDynamic: function(i) {
					
			},
			//跳转到直播列表
			goLiveList: function() {
				openWindow('views/liveList.html','liveList');
			},
			//跳转到直播课堂详情
			goLiveDetail: function(i) {			
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("livecourseId", i.id);
					mui.fire(plus.webview.getWebviewById("liveDetail"), 'livecourseId', {});
					
					openWindow("views/liveDetail.html", "liveDetail");
				} else {
					openWindow("login.html", "login");
				}
				
			},
			//跳转到网络课堂列表
			goInternetList: function() {
				openWindow('views/internetCourseList.html','internetList');
			},
			goInternetDetail: function() {
				
			},
			//新闻列表
			goNewsList: function(){
				location.href = "views/newsList.html";
			},
			//获取动态新闻
			getNews: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and linkerId = " + linkerId.News +" order by newsdate desc limit 10"
				},function(d){
					if(d.success && d.data) {
						if(d.data.length>5){
	//						self.scrollNews = d.data.slice(0,5);
							self.headNews = d.data.slice(5,8);
						}else {
							self.scrollNews = d.data;
						}
						
					}
				})
			},
			//获取网络课件
			getNetClass: function(){
				var self = this;
				
				_callAjax({
					cmd:"fetch",
					sql:"select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from articles where ifValid =1 and linkerId = " + linkerId.netCourse +" order by id desc limit 2"
				},function(d){
					if(d.success && d.data){
						self.internets = d.data;
					}
				})
			},
			//获取直播课件
			getliveClass: function(){
				var self = this;
				
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(e.id) as audience from lives a outer left join liveEnroll e on e.liveId = a.id where ifValid =1 group by a.id order by a.starttime desc limit 2"
				}, function(d) {
					if(d.success && d.data) {
						self.lives = d.data;
					}
				})
			}
		},
		mounted: function() {
			var self = this;
			
			//获取动态新闻
			self.getNews();
			//获取网络课件
			self.getNetClass();
			//获取直播课件
			self.getliveClass();
			
		}
	})
	
	var ucenter = new Vue({
		el: '#ucenter',
		data: {
			isLogin: false,
			androidUpdate: false,
			isNew: false,
			userInfo: {
				
			}
		},
		methods: {
			//登录
			goLogin: function() {

				if(this.isLogin){
					openWindow('views/ucenter.html','ucenter');
				}else{
					openWindow("views/login.html","login");
				} 
			},
			//查看党员先锋指数
			checkPoints: function(){
				if(this.isLogin){
					_set('checkPoints','0');
					mui.fire(plus.webview.getWebviewById("score"), 'checkPoints', {});

					openWindow("views/score.html","score");
				}else{
					openWindow("views/login.html","login");
				}
				
			},
			//查看学习积分
			checkCredit: function(){
				if(this.isLogin){
					_set('checkPoints', '1');
					mui.fire(plus.webview.getWebviewById("score"), 'checkPoints', {});
					
					openWindow("views/score.html","score");
				}else{
					openWindow("views/login.html","login");
				}
			},
			//我的消息
			goPost: function(){
				
			},
			//我的学习
			goMyStudy: function(){
				if(this.isLogin){
					openWindow("views/myStudy.html","mystudy");
				}else{
					openWindow("views/login.html","login");
				}
			},
			//我的活动
			goMyActivity: function(){
				if(this.isLogin) {
					openWindow("views/myActivity.html","myactivity");
				} else {
					openWindow("views/login.html","login");
				}
				
			},
			//退出登录
			logout: function(){
				var self = this;
				self.isLogin = false;
				self.userInfo = {};
				plus.storage.removeItem('userInfo');
				mui.toast('退出成功');
			},
			//清除缓存
			clearCache:function(){
				plus.cache.clear(function() {
					mui.toast('已清理');
				})
			},
			// 检查新版本
			checkNewVersion: function(){
				var self = this;
				
				var dicVersion = _load(_get('version'));
				var curVersion = plus.runtime.version;
	
				if(curVersion < dicVersion.version){
					mui.confirm('发现新版本v' + dicVersion.version + '，是否更新?', '', ['更新', '取消'], function(e) {
						if(e.index == 0) {
							mui.toast('请使用浏览器打开');
							
							plus.runtime.openURL('http://a.app.qq.com/o/simple.jsp?pkgname=com.xinlan.PTtele', function(){
								mui.toast('浏览器调用失败，请前往应用中心更新');
							});
						}
					})
				}else{
					mui.toast("已是最新版本");
				}
			}
		},
		mounted: function(){
			var self = this;
			self.userInfo = _load(_get('userInfo'));
			
			//获取个人信息
			if(self.userInfo != null) {
				_callAjax({
					cmd: "fetch",
					sql: "select * from User where name = ? and pswd = ?",
					vals: _dump([self.userInfo.name, self.userInfo.pswd])
				}, function(d) {
			
					if(d.success && d.data) {
						self.isLogin = true;
						self.userInfo = d.data[0];
						_set('userInfo', _dump(self.userInfo));
					} else {
						self.isLogin = false;
						self.userInfo = {};
						plus.storage.removeItem('userInfo');
					}
				});
			}
			
			//获取版本号
			_callAjax({
				cmd: "fetch",
				sql: "select * from system"
			}, function(d) {
				if(d.success && d.data) {
					var dicVersion = d.data[0];
			
					_set('version', _dump(dicVersion));
			
					var curVersion = plus.runtime.version;
			
					if(curVersion < dicVersion.version) {
						self.isNew = true;
					} else {
						self.isNew = false;
					}
				}
			});
		}
	})
	
	if('Android' == plus.os.name) {
		ucenter.androidUpdate = true;
		var first = null;
		mui.back = function() {
			if(!first) {
				first = new Date().getTime();
				mui.toast('再按一次退出应用');
				setTimeout(function() {
					first = null;
				}, 1000);
			} else {
				if(new Date().getTime() - first < 1000) {
					plus.runtime.quit();
				}
			}
		}
	}
	
	$('.footer-tab a').on('click', function() {
		var page = $(this).data('page');
		changeTab(page, $(this));
		
		if(page == 'activity'|| page == 'ucenter') {
			indexSwiper.show = false;
		} else {
			indexSwiper.show = true;
		}

	})
}
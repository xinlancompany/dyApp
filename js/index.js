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
		url: 'views/regulationDetail.html',
		id: 'regulationDetail'
	},{
		url: 'views/score.html',
		id: 'score'
	},{
        url: 'views/newsList.html',
        id: 'newsList'
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
		console.log('loginback回调');

		var webview = plus.webview.currentWebview();
		webview.reload();
	});
	
	var header = new Vue({
		el: '.pageTitle',
		data: {
			showOrgTitle: false,
		}
	});
	
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
				self.activity = [];
				var orgId = _getOrgId();
				
				_callAjax({
					cmd: "fetch",
					sql: "select id, name, img, strftime('%Y-%m-%d %H:%M', logtime) as logtime from linkers where ifValid = 1 and refId = ? and orgId = ? order by id desc limit 2",
					vals: _dump([linkerId.activitySort, orgId])
				},function(d){
					if(d.success && d.data){
						d.data.forEach(function(r){
							var arrImg = r.img.split('/upload');
							r.img = serverAddr + '/upload' + arrImg[1];
							self.activity.push(r);
						})
					}
				})
			},
			//党员信息管理
			gotoUcenter: function(){
				var userInfo = _load(_get('userInfo'));
				_tell(userInfo);
				if(userInfo){
					if(userInfo.userType == 0) {
						ucenter.goLogin();
					} else {
						mui.toast('请切换党员账号登录');
						openWindow('views/login.html', 'login', {type: "personal"});
					}
				}else {
					openWindow('views/login.html', 'login', {type: "personal"});
				}
				
			},
			//组织信息管理
			gotoOrganization: function(){
				var userInfo = _load(_get('userInfo'));
                _tell(userInfo);
				if(userInfo){
					if(userInfo.userType == 1) {
						// ucenter.goLogin();
                        openWindow("views/organization.html", "organization");
					} else {
						mui.toast('请切换组织账号登录');
						openWindow('views/login.html', 'login', {type: "organization"});
					}
				}else {
					openWindow('views/login.html', 'login', {type: "organization"});
				}
				
			},
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
			bHaveMore: false,
		},
		methods: {
            // 跳转到规章
            gotoRules: function() {
				//触发列表页面的newList事件
				mui.fire(plus.webview.getWebviewById("newsList"), 'newList', {
                    linkerId: linkerId.Rules
				});
			
				openWindow("views/newsList.html", "newsList");
            },
            goTopicList: function() {
				openWindow('views/topicList.html', 'topicList');
            },
		},
		mounted: function() {
			var self = this;
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
			//跳转到直播列表
			goLiveList: function() {
				openWindow('views/liveList.html','liveList');
			},
			//跳转到直播课堂详情
			goLiveDetail: function(i) {			
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("livecourseId", i.id);
					mui.fire(plus.webview.getWebviewById("liveDetail"), 'livecourseId', {
						
					});
					
					openWindow("views/liveDetail.html", "liveDetail");
				} else {
					openWindow("views/login.html", "login");
				}
				
			},
			//跳转到网络课堂列表
			goInternetList: function() {
				openWindow('views/internetCourseList.html','internetList');
			},
			//跳转到网络课堂详情
			gotoNetCourseDetail: function(i){
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("netcourseId", i.id);
					mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
					
					openWindow("views/internetCourseware.html", "internetCourseware");
				} else {
					openWindow("views/login.html", "login");
				}
				
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
				
				var orgId = _getOrgId();
				console.log("获取网络课件");
				console.log(orgId);
				console.log(linkerId.netCourse);
				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from courses where ifValid =1 and orgId = "+ orgId + " order by id desc limit 2"
				},function(d){
					_tell(d);
					if(d.success && d.data){
						self.internets = d.data;
						_tell(self.internets);
					}
				})
			},
			//获取直播课件
			getliveClass: function(){
				var self = this;
				var orgId = _getOrgId();
				self.lives = [];
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(e.id) as audience from lives a outer left join liveEnroll e on e.liveId = a.id where ifValid =1 and a.orgId = ? group by a.id order by a.starttime desc limit 2",
					vals: _dump([orgId])
				}, function(d) {
					if(d.success && d.data) {
						d.data.forEach(function(r){
							var arrImg = r.img.split('/upload');
							r.img = serverAddr + '/upload' + arrImg[1];
							self.lives.push(r);
						});
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
			userType: null,
			userInfo: {
			}
		},
		methods: {
			//登录
			goLogin: function() {
				if(this.isLogin){
					console.log('登录');
					var userInfo = _load(_get('userInfo'));
					_tell(userInfo);
					if(userInfo.userType == 1){
						openWindow('views/organization.html', 'organization');
					}else {
						openWindow('views/ucenter.html','ucenter');	
					}
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
			//跳转到组织学习tab
			goOrgStudy: function() {
				$('.go-study').click();
			},
			//跳转到组织活动tab
			goOrgActivity: function() {
				$('.go-activity').click();
			},
			//退出登录
			logout: function(){
				var self = this;
//				self.isLogin = false;
//				self.userInfo = {};
//				self.userType = null;
				plus.storage.removeItem('userInfo');
				mui.toast('退出成功');
				plus.webview.currentWebview().reload();
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
			
			//获取用户信息
			if(self.userInfo != null) {
				var userType = self.userInfo.userType;
				console.log("首页登录usertype=" + userType);
				var sql = '';
				if(userType == 1){
					//组织登录
					sql = "select * from organization where name = ? and pswd = ?";
				}else {
					//党员登录
					sql = "select id,name,orgName,orgNo,pswd from User where name = ? and pswd = ?";					
				}
				
				_callAjax({
					cmd: "fetch",
					sql: sql,
					vals: _dump([self.userInfo.name, self.userInfo.pswd])
				}, function(d) {
				
					if(d.success && d.data) {
						self.isLogin = true;
						self.userInfo = d.data[0];
						self.userInfo.userType = userType;
						_set('userInfo', _dump(self.userInfo));
						self.userType = userType;
						
						
					} else {
						self.isLogin = false;
						self.userInfo = {};
						plus.storage.removeItem('userInfo');
						self.userType = null;
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
        var userInfo = _load(_get('userInfo'));
//      if (page != "index" && !userInfo) {
//          mui.toast("请先登录");
//			return openWindow('views/login.html', 'login', {type: "personal"});
//      }
		changeTab(page, $(this));
		
		$(".mui-title").text("舟山共产党员");
		header.showOrgTitle = false;
		
		if(page == 'ucenter' || page == 'activity') {
			indexSwiper.show = false;
		}else if(page == 'study'){
			indexSwiper.show = true;
			if(userInfo != null){
				var name = userInfo.userType == 1 ? userInfo.name : userInfo.orgName;
				header.showOrgTitle = true;
			}
		}
	})
}

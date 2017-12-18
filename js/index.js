if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

var changeTab = function(el, self) {
	$('.main').hide();
	$('#' + el + '').show();
	self.addClass('active').siblings().removeClass('active');
}

$('.footer-tab a').on('click', function() {
	var page = $(this).data('page');
	changeTab(page, $(this));
	
//	if(page == 'study') {
//		var swiper = new Swiper('.study-swiper');
//	}
})

function plusReady() {
	pullToRefresh();
}

mui.init({
	preloadPages: [{
		url: '',
		id: ''
	},]
})

	
var index = new Vue({
	el: '#index',
	data: {
		scrollNews: [],
		headNews: [],
		activity: [], //活动专题
		activeSlideText: ''
	},
	methods: {
		gotoDetail: function(i) {
				
		},
		goActivity: function(i) {
				
		},
		goActivityTab: function() {
			$('.go-activity').click();
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
						self.scrollNews = d.data.slice(0,5);
						self.headNews = d.data.slice(5,8);
					}else {
						self.scrollNews = d.data;
					}
					
					self.activeSlideText = self.scrollNews[0].title;
					setTimeout(function(){
						var swiper = new Swiper('.index-swiper', {
							pagination: '.swiper-pagination',
							onSlideChangeEnd: function(swiper){
						      	self.activeSlideText = self.scrollNews[swiper.activeIndex].title
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
				sql: "select name, img, strftime('%Y-%m-%d %H:%M', logtime) as logtime from linkers where ifValid = 1 and refId = " + linkerId.activitySort + " order by id desc limit 2"
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
		bHaveMore: true
	},
	methods: {
		goActivity: function(i) {
				
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
				sql: "select name, img, strftime('%Y-%m-%d %H:%M', logtime) as logtime from linkers where ifValid = 1 and refId = ? and id<? order by id desc limit 5",
				vals: _dump([linkerId.activitySort, f])
			},function(d){
				if(d.success && d.data){
					self.activity = d.data
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
		scrollNews: [],
		headNews: [],
		activeSlideText: '',
		lives: [{
			img: 'https://unsplash.it/750/250',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
			statistics: '1133',
			state: true,
		},{
			img: 'https://unsplash.it/750/250',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
			statistics: '1133',
			state: false,
		}],
		internets: [],//网络课堂
	},
	methods: {
		gotoDetail: function(i) {
				
		},
		goEduDynamic: function(i) {
				
		},
		goLiveList: function() {
			
		},
		goLiveDetail: function() {
			
		},
		goInternetList: function() {
			
		},
		goInternetDetail: function() {
			
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
						self.scrollNews = d.data.slice(0,5);
						self.headNews = d.data.slice(5,8);
					}else {
						self.scrollNews = d.data;
					}
					
					self.activeSlideText = self.scrollNews[0].title;
					setTimeout(function(){
						var swiper = new Swiper('.study-swiper', {
							pagination: '.study-pagination',
							onSlideChangeEnd: function(swiper){
								console.log("111");
						      	self.activeSlideText = self.scrollNews[swiper.activeIndex].title
							}
						});
					}, 500)
				}
			})
		},
		//获取网络课件
		getNetClass: function(){
			var self = this;
			
			_callAjax({
				cmd:"fetch",
				sql:"select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from articles where ifValid =1 and linkerId = " + linkerId.netClass +" order by id desc limit 2"
			},function(d){
				if(d.success && d.data){
					self.internets = d.data;
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
		
	}
})

var ucenter = new Vue({
	el: '#ucenter',
	data: {
		isLogin: false,
		androidUpdate: false,
		userInfo: {
			
		}
	},
	methods: {
		//登录
		goLogin: function() {
			
		},
		//我的消息
		goPost: function(){
			
		},
		//我的学习
		goMyStudy: function(){
			
		},
		//我的活动
		goMyActivity: function(){
			
		},
		//推荐
		goRecommend:function(){
			
		},
		//退出登录
		logout: function(){
			
		},
		//清除缓存
		clearCache:function(){
			
		},
		
	}
})

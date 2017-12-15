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
	
	if(page == 'study') {
		var swiper = new Swiper('.study-swiper');
	}
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
		scrollNews: [{
			img: 'https://unsplash.it/750/200',
			title: '一'
		},{
			img: 'https://unsplash.it/750/200',
			title: '二'
		}],
		headNews: [{
			img: 'https://unsplash.it/120/60',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
			date: '2017-09-17'
		},{
			img: 'https://unsplash.it/120/60',
			title: '市委组织部一行赴浦东国际人才城学习交流',
			date: '2017-09-17'
		}],
		activity: [{
			img: 'https://unsplash.it/750/250',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
		},{
			img: 'https://unsplash.it/750/250',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
		}],
		activeSlideText: '一'
	},
	methods: {
		gotoDetail: function(i) {
				
		},
		goActivity: function(i) {
				
		},
		goActivityTab: function() {
			$('.go-activity').click();
		}
	},
	mounted: function() {
		var self = this;
		
		var swiper = new Swiper('.index-swiper', {
			pagination: '.index-pagination',
			onSlideChangeEnd: function(swiper){
		      	self.activeSlideText = self.scrollNews[swiper.activeIndex].title
			}
		});
	}
})

var activity = new Vue({
	el: '#activity',
	data: {
		activity: [{
			img: 'https://unsplash.it/750/250',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
		},{
			img: 'https://unsplash.it/750/250',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
		}],
	},
	methods: {
		goActivity: function(i) {
				
		},
		getAcitivity: function() {
			
		}
	},

})

var study = new Vue({
	el: '#study',
	data: {
		scrollNews: [{
			img: 'https://unsplash.it/750/200',
		},{
			img: 'https://unsplash.it/750/200',
		}],
		headNews: [{
			img: 'https://unsplash.it/120/60',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
			date: '2017-09-17'
		},{
			img: 'https://unsplash.it/120/60',
			title: '市委组织部一行赴浦东国际人才城学习交流',
			date: '2017-09-17'
		}],
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
		internets: [{
			img: 'https://unsplash.it/120/60',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
			desc: '简介：长歌浩荡——五水共治这三年'
		},{
			img: 'https://unsplash.it/120/60',
			title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
			desc: '简介：长歌浩荡——五水共治这三年'
		}],
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
			
		}
	},
	mounted: function() {
		var self = this;
	}
})

var ucenter = new Vue({
	el: '#ucenter',
	data: {
		isLogin: false,
		userInfo: {
			
		}
	},
	methods: {
		goLogin: function() {
			
		}
	}
})

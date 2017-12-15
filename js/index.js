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
				
		}
	},
	mounted: function() {
		var self = this;
		
		var swiper = new Swiper('.index-swiper', {
			pagination: '.swiper-pagination',
			onSlideChangeEnd: function(swiper){
		      	self.activeSlideText = self.scrollNews[swiper.activeIndex].title
			}
		});
	}
})


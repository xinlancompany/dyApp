//预加载页面
mui.init({
});


// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

var activityDetail = new Vue({
	el: '#activityDetail',
	data: {
		banner: 'http://lorempixel.com/750/300',
		count: '12',
		startTime: '2017-01-01',
		endTime: '2017-02-01',
		place: '党校',
		breif: '为着力解决基层党组织 “三会一课”等掌的组织 生活不经常、不严肃 、不认真的问题。全面贯彻落实从严治党要求，以实现“三会一课”等党的组织 生活正常化、规范化、制度化为上拍， 积极探索推行人员固定活动日制度，确定每月第一个工作日作为“党员固定活动日”，每月开展一次，每次不少于半天。要求基层党支部要创新活动形式，改变“一人讲，大家听”的固有模式，注重'
	},
	methods: {
		
	},
	mounted: function() {
	}
})

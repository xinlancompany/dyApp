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

var internetCourseware = new Vue({
	el: '#internetCourseware',
	data: {
		video: {
			title: '不灭明灯',
			brief: '《红色故事汇（浙江篇2）》之一，讲述中共早期党员张人亚同志追求真理、不畏艰难、鞠躬尽瘁的感人事迹。',
			src: '',
			poster: ''
		},
		otherCoursewares: [{
			img: 'http://lorempixel.com/450/300',
			title: '红船缘',
			brief:  '展现习近平总书记心系南湖红船、始终“不忘初心，牢记使命”的领袖形象，展望习近平带领共产党人，领航中…'
		},{
			img: 'http://lorempixel.com/450/300',
			title: '红船缘',
			brief:  '展现习近平总书记心系南湖红船、始终“不忘初心，牢记使命”的领袖形象，展望习近平带领共产党人，领航中…'
		},{
			img: 'http://lorempixel.com/450/300',
			title: '红船缘',
			brief:  '展现习近平总书记心系南湖红船、始终“不忘初心，牢记使命”的领袖形象，展望习近平带领共产党人，领航中…'
		}]
	},
	methods: {
		changeCoursewares: function() {
			
		}
	},
	mounted: function() {
	}
})

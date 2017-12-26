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

var liveDetail = new Vue({
	el: '#liveDetail',
	data: {
		src: '',
		title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
		brief: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
		state: false,
		count: 123
	},
	methods: {
	},
	mounted: function() {
	}
})

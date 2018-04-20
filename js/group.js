// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
	var group = new Vue({
		el: '#group',
		data: {
			
		},
		methods: {
			groupDetail: function() {
				openWindow('groupDetail.html', 'groupDetail');
			}
		},
		created: function() {
			
		}
	})
}

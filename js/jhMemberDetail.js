function plusReady() {
	var vm = new Vue({
		el: '#jhMemberDetail',
		data: {
		    info: null
		},
		mounted: function() {
            var wb = plus.webview.currentWebview();
		    this.info = wb.info;
		}
	});
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

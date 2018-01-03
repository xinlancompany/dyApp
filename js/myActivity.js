mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var myActivity = new Vue({
		el: '#myActivity',
		data: {
			activityList: [{
				img: '',
				title: '',
				applicant: '',
				starttime: '',
				endtime: '',
				status: ''
			}],
			bHaveMore: false
		},
		methods: {
			getActivityList: function(){
				
			},
			goActivityDetail: function() {
				
			},
		},
		mounted: function() {
			var self = this;
		}
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

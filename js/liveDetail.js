//预加载页面
mui.init({
});


// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var livecourseId = 0;
	
	var liveDetail = new Vue({
		el: '#liveDetail',
		data: {
	//		src: '',
	//		title: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
	//		brief: '市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作市委组织部一行赴普陀调研沈家门渔港特色小镇建设工作',
	//		state: false,
	//		count: 123,
			liveData: {},  //直播数据
		},
		methods: {
			//获取直播详情
			getLiveDetail: function() {
				var self = this;
			
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(e.id) as audience from lives a outer left join liveEnroll e on e.liveId = a.id where a.id = ?",
					vals: _dump([livecourseId])
				}, function(d) {
					if(d.success && d.data) {
						self.liveData = d.data[0];
			
					}
				})
			},
			//初始化
			init: function(){
				var self = this;
				livecourseId = _get('livecourseId');
				
				console.log("livecourseId= " + livecourseId);
				self.getLiveDetail();
			}
		},
		mounted: function() {
			var self = this;
			
			self.init();
		}
	})
	
	//添加newId自定义事件监听
	window.addEventListener('livecourseId', function(event) {
		//获得事件参数
		liveDetail.init();
	})
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}


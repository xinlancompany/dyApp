// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	//预加载页面
	mui.init({
		beforeback: function() {
			// 页面返回前关闭所有视频播放
			$('video').each(function() {
				$(this)[0].pause();
			})
			$('body').animate({scrollTop:0})
			liveDetail.liveData = []
		}
	});
	var livecourseId = 0;
	
	var liveDetail = new Vue({
		el: '#liveDetail',
		data: {
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


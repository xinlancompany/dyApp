//预加载页面
mui.init({
	preloadPages: [{
		url: '',
		id: '',
	}],
});

var activitySortId = 0;

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

var activityList = new Vue({
	el: '#activityList',
	data: {
		activityList:[],
		bHaveMore: true,
	},
	methods: {
		//跳转到活动详情页
		goActivityDetail: function(i) {
				
		},
		
		//获取动态新闻
		getActivityList: function(){
			var self = this;
			var f = 10e5;
			if(self.activityList.length) {
				f = _at(self.activityList, -1).id;
			}
			
			_callAjax({
				cmd:"fetch",
				sql:"select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and linkerId = ? and id < ? order by id desc limit 10",
				vals:_dump([activitySortId, f])
			},function(d){
				if(d.success && d.data) {
					d.data.forEach(function(r) {
//						if(r.img == ''){
//							r.img = "../img/default.jpg";
//						}
						self.activityList.push(r);
					
					});
				}else {
					self.bHaveMore = false;
					if(f != 10e5){
						mui.toast("没有更多活动了")
					}
				}
			})
		},
		//初始化操作
		init: function(){
			var self = this;
			
			activitySortId = _get('activitySortId');
			console.log("111=" + activitySortId);
			self.activityList = [];
			self.getActivityList();
			self.bHaveMore = true;
		}
		
	},
	mounted: function() {
		var self = this;
		
		self.init();
	}
})

//添加newId自定义事件监听
window.addEventListener('activitySortId', function(event) {
	//获得事件参数
	activityList.init();
})
	
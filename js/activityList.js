//预加载页面
mui.init({
	preloadPages: [{
		url: 'activeDetail.html',
		id: 'activeDetail',
	}],
});

var activitySortId = 0;

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
    var wb = plus.webview.currentWebview(),
        lid = wb.lid;
    $(".mui-title").text(wb.title);

	var activityList = new Vue({
		el: '#activityList',
		data: {
			activityList:[],
			bHaveMore: false,
		},
		methods: {
			//跳转到活动详情页
			goActivityDetail: function(i) {
				_set('activityId', i.id);
				
				mui.fire(plus.webview.getWebviewById("activeDetail"), 'activityId', {});
				openWindow('activeDetail.html', 'activeDetail');
				
			},
			
			//获取动态新闻
			getActivityList: function() {
				var self = this;
				var f = 10e5;
				if(self.activityList.length) {
					f = _at(self.activityList, -1).id;
				}
				
				_callAjax({
					cmd:"fetch",
					sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.address, a.status, count(e.id) as applicant from activitys a left join activityEnroll e on e.activityId = a.id where a.ifValid =1 and a.linkerId = ? and a.id < ? group by a.id order by a.id desc limit 10",
					vals:_dump([lid, f])
				},function(d){
					if(d.success && d.data) {
						self.bHaveMore = true;
						d.data.forEach(function(r) {
							var arrImg = r.img.split('/upload');
							r.img = serverAddr + '/upload' + arrImg[1];
							self.activityList.push(r);
						})
					}else {
						self.bHaveMore = false;
						if(f != 10e5){
							mui.toast("没有更多活动了")
						}
					}
				});
			},
			//初始化操作
			init: function() {
				var self = this;
				
				activitySortId = _get('activitySortId');
				console.log("111=" + activitySortId);
				self.activityList = [];
				self.getActivityList(lid);
				self.bHaveMore = false;
			}			
		},
		mounted: function() {
            this.activityList = [];
			this.init();
		}
	});
	
	//添加newId自定义事件监听
	window.addEventListener('activitySortId', function(event) {
		//获得事件参数
		activityList.init();
	});
	window.addEventListener('refresh', function(event) {
        /*
		var id = event.detail.id;
		var count = event.detail.count;
		
		//报名人数刷新
		activityList.activityList.forEach(function(a){
			if(a.id == id){
				a.applicant = count;
				console.log(count);
			}
		});
        */
        lid = event.detail.lid;
        activityList.init();
	});

    // 点击打开新增页面
    $("#newActivity").click(function() {
        openWindow("activityUpload.html", "activityUpload", {
            lid: lid,
        });
    });

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}


	

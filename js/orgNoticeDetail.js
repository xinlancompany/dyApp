// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	//预加载页面	
	var vm = new Vue({
		el: '#newsDetail',
		data: {
			newsId: 0,
			newsData: [],  //新闻内容
            userInfo: _load(_get("userInfo")),
            unreads: []
		},
		computed:{
			unreadsStr: function() {
				var self = this;
				return _map(function(i) {
					return i.name;
				}, self.unreads).join(",");
			}
		},
		methods: {
			//获取新闻内容
			getNewsData: function() {
				var self = this;

				_callAjax({
					cmd: "multiFetch",
					multi: _dump([
						{
							key: "info",
							sql: "select id, title, img, brief, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and id = "+self.newsId
						},
						{
							key: "unreads",
							sql: "select u.name from user u, notices n where u.id = n.userId and n.orgNoticeId = "+self.newsId
						}
					])
				}, function(d) {
					if(d.success && d.data && d.data.info) {
						self.newsData = d.data.info[0];
					}
					if(d.success && d.data && d.data.unreads) {
						self.unreads = d.data.unreads;
					}
				});
			},
		},
		watch: {
			newsId: function(i) {
				if (i == 0) return;
                this.getNewsData();
			}
		}
	});
	
    var wb = plus.webview.currentWebview();
	vm.newsId = wb.aid;
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
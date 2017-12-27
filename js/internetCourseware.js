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

var netcourseId = 0;

var internetCourseware = new Vue({
	el: '#internetCourseware',
	data: {
		courseData: {},  //课件内容
		otherCoursewares: [], //其他课件
		
//		otherCoursewares: [{
//			img: 'http://lorempixel.com/450/300',
//			title: '红船缘',
//			brief:  '展现习近平总书记心系南湖红船、始终“不忘初心，牢记使命”的领袖形象，展望习近平带领共产党人，领航中…'
//		},{
//			img: 'http://lorempixel.com/450/300',
//			title: '红船缘',
//			brief:  '展现习近平总书记心系南湖红船、始终“不忘初心，牢记使命”的领袖形象，展望习近平带领共产党人，领航中…'
//		},{
//			img: 'http://lorempixel.com/450/300',
//			title: '红船缘',
//			brief:  '展现习近平总书记心系南湖红船、始终“不忘初心，牢记使命”的领袖形象，展望习近平带领共产党人，领航中…'
//		}]
	},
	methods: {
		//获取课件详情
		getNetCourseDetail: function(){
			var self = this;
			
			_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, brief, content, url, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and id = ?",
					vals: _dump([netcourseId])
				}, function(d) {
					_tell(d.data);
					if(d.success && d.data) {
						
						self.courseData = d.data[0];
						
						//视频新闻，取src
						var content = d.data[0].content;
						var url = d.data[0].url;
						console.log("url="+url);
						if(url.length<=0)
						{
							var src = $(content).find('src').text();
							console.log("src="+src);
							self.courseData.url = src;
						}
					} 
				})
		},
		//获取其他课件
		getOtherCourse: function(){
			var self = this;
			
			self.otherCoursewares = [];

			_callAjax({
				cmd: "fetch",
				sql: "select id, title, img, brief, content, url, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and id < ? and linkerId = ? order by id desc limit 3",
				vals: _dump([netcourseId, linkerId.netCourse])
			}, function(d) {

				if(d.success && d.data) {
					d.data.forEach(function(r){
						
						self.otherCoursewares.push(r);
					})
					
				}
			})
		},
		
		//改变课件
		changeCoursewares: function(i) {
			var self = this;
			
			if(i.id){
				_set('netcourseId',i.id);
				
				self.init();
			}
		},
		//初始化
		init: function (){
			var self = this;

			netcourseId = _get('netcourseId');
			self.getNetCourseDetail();
			self.getOtherCourse();
		}
	},
	mounted: function() {
		var self = this;
		
//		self.init();
	}
})

//添加newId自定义事件监听
window.addEventListener('netcourseId', function(event) {
	//获得事件参数
	
	internetCourseware.init();
})

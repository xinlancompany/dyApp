var internetCourseware;
var timer = null;
	
function startTimeOut() {
	console.log('startTimeOut');
	timer = setInterval(function() {
		internetCourseware.studyTime++;
	}, 1000);
}

function clearTimeOut() {
	console.log('clearTimeOut');
	clearInterval(timer);
}

//预加载页面
mui.init({
	beforeback: function() {
		window.clearInterval(timer);
		// 页面返回前关闭所有视频播放
		$('video').each(function() {
			$(this)[0].pause();
		})
		$('body').animate({scrollTop:0});
		internetCourseware.courseData = {};
		internetCourseware.otherCoursewares = [];
		internetCourseware.studyTime = 0;
	}
});


// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var netcourseId = 0;
	
	internetCourseware = new Vue({
		el: '#internetCourseware',
		data: {
			courseData: {},  //课件内容
			otherCoursewares: [], //其他课件
			studyTime: 0, //学习时间
		},
		methods: {
			//获取课件详情
			getNetCourseDetail: function(){
				var self = this;
				
				console.log("获取课件详情 courseId = " + netcourseId);
				_callAjax({
						cmd: "fetch",
						sql: "select id, title, img, brief, content, url, linkerId, reporter, readcnt, newsdate, subtitle, credit from courses where ifValid =1 and id = ?",
						vals: _dump([netcourseId])
					}, function(d) {
						
						_tell(d.data);
						if(d.success && d.data) {
							self.courseData = d.data[0];
							
							//视频新闻，取src
							var content = d.data[0].content;
							var url = d.data[0].url;
							console.log("url="+url);
							if(url == '#' || url.length<=0){
								var src = $(content).find('video').attr('src');
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
				var orgId = _getOrgId();
				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, brief, content, url, reporter, readcnt, newsdate, subtitle, credit from courses where ifValid =1 and id < ? and linkerId = ? and orgId = " + orgId + " order by id desc limit 3",
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
			//插入学习记录
			recordStudy: function(){
				var self = this;
				var userInfo = _load(_get('userInfo'));
	
				//先删除再插入
				_callAjax({
					cmd: "exec",
					sql: "delete from courseEnroll where userId = ? and courseId = ?",
					vals: _dump([userInfo.id, netcourseId])
				},
				function(d) {
					if(d.success) {
						_callAjax({
							cmd: "exec",
							sql: "insert into courseEnroll(userId, courseId) values(?,?)",
							vals: _dump([userInfo.id, netcourseId])
						}, function(d) {
							if(d.success) {
								console.log(self.courseData.credit);
								mui.alert('恭喜您获得' + self.courseData.credit + '学分');
							}
						})
					}
				})
			},
			//初始化
			init: function (){
				var self = this;
	
				netcourseId = _get('netcourseId');
				console.log("netcourseId= "+ netcourseId);
				self.getNetCourseDetail();
				self.getOtherCourse();
				
				//查重
//				var userInfo = _load(_get('userInfo'));
//				if(userInfo) {
//					_callAjax({
//						cmd: "fetch",
//						sql: "select * from courseEnroll where userId = ? and courseId = ?",
//						vals: _dump([userInfo.id, netcourseId])
//					}, function(d) {
//						if(d.success) {
//							if(d.data) {
//								mui.confirm('您已学过该课程，确定重新学习?', '', ['确定', '取消'], function(e) {
//									if(e.index == 0) {
//				
//									}
//								})
//							}
//						}
//					})				
//				}
			}
		},
		watch:{
			studyTime:function() {
				var self = this;
				console.log(self.studyTime);
				if(self.studyTime == 15*1){
					self.recordStudy();
				}
			}
		},
		mounted: function() {
			var self = this;
			self.init();
		}
	})
	
	//添加newId自定义事件监听
	window.addEventListener('netcourseId', function(event) {
		//初始化
		internetCourseware.init();
	})
}

// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

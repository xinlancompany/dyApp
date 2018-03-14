var timer = null;
var liveDetail;

function startTimeOut() {
	console.log("startTimeOut");
	timer = setInterval(function() {
		liveDetail.studyTime++;
	}, 1000);
}

function clearTimeOut() {
	console.log("clearTimeOut");
	clearInterval(timer);
}

//预加载页面
mui.init({
	beforeback: function() {
		// 页面返回前关闭所有视频播放
		$('video').each(function() {
			$(this)[0].pause();
		})
		$('body').animate({
			scrollTop: 0
		})
		liveDetail.liveData = [];
		liveDetail.studyTime = 0;
		window.clearInterval(timer);
	}
});

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	// var livecourseId = 0;

    var wb = plus.webview.currentWebview(),
        livecourseId = wb.liveId;

	liveDetail = new Vue({
		el: '#liveDetail',
		data: {
			liveData: {},  //直播数据
			studyTime: 0, //学习时间
		},
		methods: {
			//获取直播详情
			getLiveDetail: function() {
				var self = this;
			
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, a.credit, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(distinct e.userId) as audience from lives a left join liveEnroll e on e.liveId = a.id where a.id = ?",
					vals: _dump([livecourseId])
				}, function(d) {

					if(d.success && d.data) {
						var arrImg = d.data[0].img.split('/upload');
						d.data[0].img = serverAddr + '/upload' + arrImg[1];
						self.liveData = d.data[0];
			
						//视频新闻，取src
						var content = d.data[0].content;
						var url = d.data[0].url;
						console.log("url=" + url);
						if(url == '#' || url.length <= 0) {
							var src = $(content).find('video').attr('src');
							console.log("live src=" + src);
                            if (src.indexOf("m3u8") == -1) {
                                var arrSrc = src.split('/upload');
                                src = serverAddr + '/upload' + arrSrc[1];
                            }
							self.liveData.url = src;
						}
						console.log("img="+self.liveData.img);
						
					}
				})
			},
			//插入学习记录
			recordStudy: function() {
				var self = this;
				var userInfo = _load(_get('userInfo'));
			
				//先删除再插入
                // 较为低效
                /*
				_callAjax({
						cmd: "exec",
						sql: "delete from liveEnroll where userId = ? and liveId = ?",
						vals: _dump([userInfo.id, livecourseId])
					},
					function(d) {
						if(d.success) {
							_callAjax({
								cmd: "exec",
								sql: "insert into liveEnroll(userId, liveId) values(?,?)",
								vals: _dump([userInfo.id, livecourseId])
							}, function(d) {
								if(d.success) {
									mui.alert('恭喜您获得' + self.liveData.credit + '学分');
								}
							})
						}
					});
                */
                _callAjax({
                    cmd: "exec",
                    sql: "insert into liveEnroll(userId, liveId) values(?,?)",
                    vals: _dump([userInfo.id, livecourseId])
                }, function(d) {
                    if(d.success) {
                        // mui.alert('恭喜您获得' + self.liveData.credit + '学分');
                        mui.alert("已学习"+(self.studyTime/60)+"分钟");
                    }
                });
			},
			//初始化
			init: function(){
				var self = this;
				// livecourseId = _get('livecourseId');

				self.getLiveDetail();
				
			}
		},
		watch: {
			studyTime: function() {
				var self = this;
				console.log(self.studyTime);
				if(self.studyTime > 0 && self.studyTime % 60 == 0) {
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


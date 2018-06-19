var linkerId = {
	// 学习平台
	StudyPlatform: 105, // 学习平台
	News: 161,   // 党建动态
	BranchActNews: 162,//支部活动
	HandCourse: 163, //网络课堂
	PublicNotice: 164, // 通知公告
	ZhoushanNews: 165, // 关注舟山
	Books: 170, // 党建书屋 

	activitySort: 108, //活动专题
    Rules: 127, // 规章制度
    IndexNews: 128, // 动态新闻，首页用
    Activity: 131, // 组织活动
    Notice: 139, // 组织通知
    Rules: 141, // 规章制度
    BranchCon: 151, // 支委会
    AllMemberCon: 152, // 全体党员大会
    GroupCon: 153, // 党小组会 
    LessonCon: 154, // 专题党课
    ThemeDayCon: 155, // 主题党日
};

// 设置学习积分限制
var studyScoreSetting = {
    "totalLimit": 20,
    "livePerMinute": 0.1,
};

// 设置活动积分限制
var activityScoreSetting = {
	"activityLimit": 5.0
};

var pullToRefresh = function() {
	var ws = plus.webview.currentWebview();
	// 下拉刷新事件
	ws.setPullToRefresh({
		support: true,
		style: 'circle',
		color: '#009cff',
		offset: '45px'
	}, function() {
		window.location.reload();
		ws.endPullToRefresh();
	});
}

var openWindow = function(u, i, e) {
    if (!e) e = {};
	mui.openWindow({
		url: u,
		id: i,
		show: {
			aniShow: 'pop-in'
		},
        extras: e
	});
};

var openOutlink = function(url, title, closeId) {
	plus.webview.open(url, 'iframe', {
		'titleNView': {
			'backgroundColor': '#009cff',
			'titleText': '' + title + '',
			'titleColor': '#fff',
			autoBackButton: false,
			progress: {
				color: '#F40'
			},
			buttons: [{
				text: '关闭',
				fontSize: '16px',
				float: 'left',
				onclick: function() {
					var wb = plus.webview.getWebviewById('iframe');
					wb.close();
					if (!!closeId) {
						var v = plus.webview.getWebviewById(closeId);
						if (!!v) v.close();
					}
				}
			},{
				text: '分享',
				fontSize: '16px',
				float: 'right',
				onclick: function() {
					plus.nativeUI.actionSheet({
			            title: "分享到",
			            cancel: "取消",
			            buttons: [{title:"微信好友"},{title:"微信朋友圈"},{title:"QQ好友"}]
			        }, function(e){
			        	if(e.index == 1) return share('outLink', url, title, null, 'weixin', 'WXSceneSession');
			        	if(e.index == 2) return share('outLink', url, title, null, 'weixin', 'WXSceneTimeline');
			        	if(e.index == 3) return share('outLink', url, title, null, 'qq', null);
			        })
				}
			}]
		},
		backButtonAutoControl: 'hide'
	});
}

var share = function(type, id, title, img, sid, ext) {
	var hrefUrl = 'http://develop.wifizs.cn/zsdy/ptappShare/news.html?id='+id+'&tp='+type;
	if(type == 'outLink') hrefUrl = id;
	var title = title;
	var imgs = [img,];
	var content = '';
	
	if(img != '') imgs = [img];
//	if(ext == 'WXSceneTimeline') title = content;

	plus.share.getServices(function(shares,err) {
		shares.forEach(function(s) {
//			if (!s.authenticated || sid !== s.id) return;  qq分享认证失败但仍能分享
			if(sid == 'weixin' && s.id == 'weixin' || sid == 'qq' && s.id == 'qq') {
				s.send({
					thumbs: imgs,
					title: title,
					content: '舟山共产党员E家APP',
					href: hrefUrl,
					extra: {
						scene: ext
					}
				}, function() {
					mui.toast("分享到\"" + s.description + "\"成功！ ");
				}, function(e) {
					mui.toast("分享到\"" + s.description + "\"失败！");
				});
			}
//			if(s.id == 'weixin') {
//				s.send({
//					thumbs: imgs,
//					title: title,
//					content: '舟山共产党员E家APP',
//					href: hrefUrl,
//					extra: {
//						scene: ext
//					}
//				}, function() {
//					mui.toast("分享到\"" + s.description + "\"成功！ ");
//				}, function(e) {
//					mui.toast("分享到\"" + s.description + "\"失败: " + e.code);
//				});
//			}
		});
	}, function(e) {
	    mui.toast("获取分享服务列表失败：" + e.message);
	});
}

/**
 * zeroize value with length(default is 2).
 * @param {Object} v
 * @param {Number} l
 * @return {String} 
 */
var ultZeroize = function(v,l){
	var z="";
	l=l||2;
	v=String(v);
	for(var i=0;i<l-v.length;i++){
		z+="0";
	}
	return z+v;
};

// 格式化时长字符串，格式为"HH:MM:SS"
var timeToStr = function(ts){
	if(isNaN(ts)){
		return "--:--:--";
	}
	var h=parseInt(ts/3600);
	var m=parseInt((ts%3600)/60);
	var s=parseInt(ts%60);
	return (ultZeroize(h)+":"+ultZeroize(m)+":"+ultZeroize(s));
};

// 格式化日期时间字符串，格式为"YYYY-MM-DD HH:MM:SS"
var dateToStr = function(d){
	return (d.getFullYear()+"-"+ultZeroize(d.getMonth()+1)+"-"+ultZeroize(d.getDate())+" "+ultZeroize(d.getHours())+":"+ultZeroize(d.getMinutes())+":"+ultZeroize(d.getSeconds()));
};

function uploadImage(folder, evt, cb){
    // 文件上传的文件夹
    var arr = [{
        key: 'kkkk',
        width: 750
    }];
    // 上传图片
    _uploadMulityImageVueChange(folder, evt.target.files, arr, serverAddr+'/multiupload', function(ret) {
        if(null !== ret && ret.length > 0) {
            ret.forEach(function(r) {
                cb(r);
            });
        }
    });
};


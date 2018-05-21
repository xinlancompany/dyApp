//预加载页面
/*
mui.init({
	preloadPages: [{
		url: 'activeDetail.html',
		id: 'activeDetail',
	}],
});
*/

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
            isAdmin: wb.isAdmin
		},
		methods: {
            // 删除操作
            delActivity: function(i, idx) {
                if (i.status != "即将开始") {
                    mui.alert("活动"+i.status+"，无法删除");
                    return;
                }
                var self = this;
                mui.confirm("确定删除？", "提示", ["是", "否"], function(e) {
                    if (e.index == 0) {
                        _callAjax({
                            cmd: "exec",
                            sql: "update activitys set ifValid = 0 where id = ?",
                            vals: _dump([i.id,])
                        }, function(d) {
                            mui.toast("删除"+(d.success?"成功":"失败"));
                            self.activityList = _del_ele(self.activityList, idx);
                        });
                    }
                });
            },
            editActivity: function(i, idx) {
//              if (i.status != "即将开始") {
//                  mui.alert("活动"+i.status+"，无法修改");
//                  return;
//              }
				if (i.ifValid == 4) {
					mui.alert("活动已审定，无法修改");
					return;
				}
                openWindow("activityUpload.html", "activityUpload", {
                    aid: i.id,
                    idx: idx,
                    lid: lid,
                });
            },
			//跳转到活动详情页
			goActivityDetail: function(i) {
				// _set('activityId', i.id);
				
                // alert(wb.isAdmin);
				// mui.fire(plus.webview.getWebviewById("activeDetail"), 'activityId', {});
				openWindow('activeDetail.html', 'activeDetail', {
                    activityId: i.id,
                    isAdmin: wb.isAdmin
                });
				
			},
			
			//获取动态新闻
			getActivityList: function() {
				var self = this;
				var f = 10e5;
				if(self.activityList.length) {
					f = _at(self.activityList, -1).id;
				}

				var userInfo = _load(_get("userInfo"));
				var orgId;
				if ("no" in userInfo) {
					orgId = userInfo.id;
				} else {
					orgId = userInfo.orgId;
				}

				// subOrg打开
				if ("orgId" in wb) {
					orgId = wb.orgId;
				}
				
				_callAjax({
					cmd:"fetch",
					sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.address, a.status, a.ifValid, count(e.id) as applicant from activitys a, activityCategories ae left join activityEnroll e on e.activityId = a.id where a.id = ae.activityId and a.ifValid > 0 and orgId = ? and ae.linkerId = ? and a.id < ? group by a.id order by a.id desc limit 10",
					vals:_dump([orgId, lid, f])
				}, function(d) {
					if (d.success && d.data) {
						self.bHaveMore = true;
						d.data.forEach(function(r) {
							if (r.img) {
								var arrImg = r.img.split('/upload');
								r.img = serverAddr + '/upload' + arrImg[1];
							} else {
								r.img = serverAddr+"/upload/pic/activityListAdd/activity_default.jpeg";
							}
                            // 设置活动的状态，不能从数据库取
                            if (_dateCompare(r.starttime, _now())) {
                                r.status = "即将开始";
                            } else if (_dateCompare(r.endtime, _now())) {
                                r.status = "正在进行";
                            } else {
                                r.status = "已结束";
                            }
                            r.ifValid = parseInt(r.ifValid);
							self.activityList.push(r);
						});
					} else {
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

    $("#operate").click(function() {
        openWindow("activityUpload.html", "activityUpload", {
            lid: lid,
            lname: wb.title
        });
    });

    if (wb.isAdmin) {
        $("#operate").show();
    } else {
        $("#operate").hide();
    }

    /*
    $("#operate").click(function() {
    	var btnArray = [{
			title: "查看模式",
		}, {
			title: "新增模式"
		}, {
			title: "编辑模式"
		}];
		plus.nativeUI.actionSheet({
			title: "操作",
			cancel: "取消",
			buttons: btnArray
		}, function(e) {
			var index = e.index;
			switch(index) {
				case 0:
					break;
				case 1:
					openWindow("activityUpload.html", "activityUpload", {
			            lid: lid,
			        });
					break;
				case 2:
					break;
            };
		});
    });
    */
}

// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
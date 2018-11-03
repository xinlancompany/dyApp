// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
//	mui.init({
//		gestureConfig:{
//  		longtap: true, 
// 		}
//	});
	
	var group = new Vue({
		el: '#group',
		data: {
			userInfo: null,
			groups: []
		},
		methods: {
			groupDetail: function(i) {
				var self = this;
				openWindow('groupDetail.html', 'groupDetail', {
					inf: i,
					groups: self.groups
				});
			},
			getGroups: function() {
				this.userInfo = _load(_get("userInfo"));
				var self = this;
				_callAjax({
					cmd: "fetch",
					sql: "select id, name from groups where orgNo = ? and ifValid >= 1",
					vals: _dump([self.userInfo.no,])
				}, function(d) {
					if (d.success && d.data) {
						self.groups = [];
						d.data.forEach(function(i) {
							i.id = parseInt(i.id);
							self.groups.push(i);
						});
					}
				});
			},
			delGroup: function(i, idx) {
				var self = this;
                mui.confirm("确定删除该党小组？", "提示", ["确定", "取消"], function(e) {
                    if (e.index == 0) {
						_callAjax({
							cmd: "multiFetch",
							multi: _dump([
							    {
							        key: "delGroupMemners",
							        sql: "update user set groupId = 0 where groupId = "+i.id
							    },
							    {
							        key: "delGroup",
							        sql: "update groups set ifValid = 0 where id = "+i.id
							    }
							])
							// sql: "update groups set ifValid = 0 where id = ?",
							// vals: _dump([i.id,])
						}, function(d) {
							mui.toast("删除"+(d.success?"成功":"失败"));
							if (d.success) {
								self.groups = _del_ele(self.groups, idx);
							}
						});
                    }
                });
			}
		},
		created: function() {
			this.getGroups();
		}
	});

	$(".groupBtn").click(function() {
		openWindow("groupDetail.html", "groupDetail", {
			groups: group.groups
		});
	});
	
//	mui("#group").on('longtap',".group-li",function(){
//	  alert('触发长按');
//	});

	window.addEventListener('refresh', function(event) {
		group.getGroups();
	});
}

// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
	mui.init({
  		gestureConfig:{
    		longtap: true, 
   		}
	});
	
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
					sql: "select id, name from groups where orgNo = ?",
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
	
	mui("#group").on('longtap',".group-li",function(){
	  alert('触发长按');
	})

	window.addEventListener('refresh', function(event) {
		group.getGroups();
	});
}

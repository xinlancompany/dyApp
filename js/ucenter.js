mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var ucenter = new Vue({
		el: '#ucenter',
		data: {
			userInfo:{},
		},
		methods: {
			getInfo: function(){
				var self = this;
				
				var userInfo = _load(_get('userInfo'));
				_tell(userInfo);
				_callAjax({
					cmd:"fetch",
					sql:"select u.id, u.name, u.idNo, u.img, o.name as orgName from User u left outer join organization o on u.orgId = o.id where u.ifValid = 1 and u.id = ?",
					vals:_dump([userInfo.id])
				},function(d){
					if(d.success && d.data){
						self.userInfo = d.data[0];
					}
				})
			},
			
		},
		mounted: function() {
			var self = this;
			
		}
	});

    /*
    window.addEventListener("updateUserInfo", function(evt) {
        ucenter.getInfo();
    });
    */

	ucenter.getInfo();
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

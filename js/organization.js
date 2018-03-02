mui.init({
});
// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var organization = new Vue({
		el: '#organization',
		data: {
			orgInfo: {
				img: '',
				name: '',
				no:'',
				secretary:'',
				type:'',
			}
		},
		methods: {
			getInfo: function(){
				var self = this;
				
				var userInfo = _load(_get('userInfo'));
				_callAjax({
					cmd:"fetch",
					sql:"select o.id, o.name, o.img, o.no, o.secretary, o.type, count(u.id) as memCount from organization o left join User u on u.orgNo = o.no and u.ifValid = 1 where o.ifValid = 1 and o.id = ?",
					vals:_dump([userInfo.id,])
				},function(d) {
                    _tell(d);
					if(d.success && d.data){
						self.orgInfo = d.data[0];
						if(self.orgInfo.img == ''){
							self.orgInfo.img = "../img/organization.jpg";
						}
					}
				});
			},
			
		},
		mounted: function() {
			var self = this;
			
			self.getInfo();
		}
	})

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

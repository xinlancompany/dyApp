function plusReady() {
	var vm = new Vue({
		el: '#jhMemberDetail',
		data: {
		    orgId: "",
		    info: null
		},
		mounted: function() {
            var wb = plus.webview.currentWebview();
		    this.orgId = wb.orgId;
		    _jhAjax({
		        cmd: "fetch",
		        sql: "select orgName, secretary, secretaryPhone, type, orgNo, superOrgName from jhOrg where id = ?",
		        vals: _dump([this.orgId])
		    }, d => {
		        if (d.success && d.data && d.data.length) {
		            this.info = d.data[0];
		        }
		    }, "/db4web")
		}
	});
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

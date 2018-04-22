(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#activityList",
			data: {
				activities:[],
				bHaveMore: false
			},
			methods: {
				gotoActivity: function(i) {
					openWindow('activeDetail.html', 'activeDetail', {
						activityId: i.activityId,
						isAdmin: false ,
						isSub: true
					});
				},
				getMoreActivities: function() {
					var sql = "select a.id, activityId, v.title, v.img, o.name as orgName, strftime('%Y-%m-%d', logdate) as logtime from activityRecommend a, organization o, activitys v where a.activityId = v.id and a.orgNo = o.no and a.id < ? order by a.id desc limit 5",
						f = 10e6,
						self = this;
					if(self.activities.length) f = _at(self.activities, -1).id;
					_callAjax({
						cmd: "fetch",
						sql: sql,
						vals: _dump([f,])
					}, function(d) {
						if (d.success && d.data) {
							self.bHaveMore = true;
							d.data.forEach(function(i) {
								self.activities.push(i);
							});
						} else {
							self.bHaveMore = false
						}
					});
				},
			},
			created: function() {
				this.getMoreActivities();
			}
		});
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());

//预加载页面
mui.init({
});


// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

var activityId = 0;

var activityDetail = new Vue({
	el: '#activityDetail',
	data: {
		banner: 'http://lorempixel.com/750/300',
		count: '12',
		startTime: '2017-01-01',
		endTime: '2017-02-01',
		place: '党校',
		breif: '为着力解决基层党组织 “三会一课”等掌的组织 生活不经常、不严肃 、不认真的问题。全面贯彻落实从严治党要求，以实现“三会一课”等党的组织 生活正常化、规范化、制度化为上拍， 积极探索推行人员固定活动日制度，确定每月第一个工作日作为“党员固定活动日”，每月开展一次，每次不少于半天。要求基层党支部要创新活动形式，改变“一人讲，大家听”的固有模式，注重'
	},
	methods: {
		//获取活动详情
		getActivityDetail: function(){
			var self = this;
			
			_callAjax({
				cmd:"fetch",
				sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.organizer, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.address, a.status, count(e.id) as applicant from activitys a outer left join activityEnroll e on e.activityId = a.id where ifValid =1 and linkerId = ? and a.id < ? group by a.id order by a.id desc limit 10",
				vals:_dump([activitySortId, f])
			},function(d){
				if(d.success && d.data) {
					self.bHaveMore = true;
					d.data.forEach(function(r) {

						self.activityList.push(r);
					
					});
				}else {
					self.bHaveMore = false;
					if(f != 10e5){
						mui.toast("没有更多活动了")
					}
				}
			})
		},
	},
	mounted: function() {
		var self = this;
		
		activityId = _get('activityId');
		self.getActivityDetail();
		
	}
})

//添加newId自定义事件监听
window.addEventListener('activityId', function(event) {
	//获得事件参数
	activityId = _get('activityId');
	activityDetail.getActivityDetail();
})

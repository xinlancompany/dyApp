if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
	var msgBoard = new Vue({
		el: '#msgBoard',
		data: {
			bHaveMore: false
		},
		methods: {
			getMsgs: function() {
				
			}
		},
		created: function() {
		}
	});
	
	$(".publish").click(function() {
		openWindow("msgBoardPublish.html", "msgBoardPublish");
	});
	
	$(window).scroll(function() {
		var scrollTop = $(this).scrollTop();
		var scrollHeight = $(document).height();
		var windowHeight = $(this).height();
		if (scrollTop + windowHeight == scrollHeight && msgBoard.bHaveMore) {
			// 底部自动加载
			msgBoard.getMsgs();	
		}
	});

}

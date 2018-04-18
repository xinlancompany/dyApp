(function() {
    var plusReady = function() {
        mui.init({
           
        });

        var vm = new Vue({
            el: "#studyRank",
            data: {
            	
            },
            methods: {
            	
            }
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

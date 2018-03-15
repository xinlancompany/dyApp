(function() {
    var plusReady = function() {
        var wb = plus.webview.currentWebview();
        
        var vm = new Vue({
            el: "#activityExperiences",
            data: {
                experiences: []
            },
            methods: {
                openExperience: function(i) {
                    var imgs = [];
                    if (!!i.imgs) imgs = _load(i.imgs);
                    openWindow("reviewDetail.html", "reviewDetail", {
                        idx: i.id,
                        title: i.experienceTitle,
                        content: i.experience,
                        imgs: imgs,
                        isAdmin: wb.isAdmin,
                        permitted: parseInt(i.experiencePermitted)
                    });
                }
            }
        });

        var init = function() {
            _callAjax({
                cmd: "fetch",
                sql: "select e.id, u.name, e.imgs, e.experience, e.experienceTitle, e.experiencePermitted, e.experienceTime from activityEnroll e, user u where e.activityId = ? and e.userId = u.id and e.experience != '' "+(wb.isAdmin?"":" and e.experiencePermitted = 1"),
                vals: _dump([wb.aid,])
            }, function(d) {
                if (d.success && d.data && d.data.length) {
                    vm.experiences = d.data;
                }
            });
        };
        init();

        window.addEventListener("refresh", function() {
            init();
        });
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());

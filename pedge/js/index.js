jQuery(function() {
    var fixHeight=2000,fixWidth=3000;
    var scaleBase = 20;
    var scaleBol = true;
    $('.pedigreeDetail').css({
        height:fixHeight,
        width:fixWidth
    })
    $('.pedigreeConts').on('mousewheel', function (event) {
        event.preventDefault();

        scaleBol = false
        console.log(event.deltaY);
        if (event.deltaY > 0) {
            scaleBase++;
        } else {
            scaleBase--;
        }
        if (scaleBase >= 40) scaleBase = 40;
        if (scaleBase <= 10) scaleBase = 10;
        console.log(scaleBase / 20)
        $(this).css('transform', 'scale(' + scaleBase / 20 + ')');
        scaleBol = true

    });

    $(".pedigreeDetail").Tdrag({
        cbStart: function (a,b,c) {
            console.log(a,b,c)
        },//移动前的回调函数
        cbMove: function (a,b,c)  {

            if(parseInt($(a).css('top'))>40)$(a).css('top',40);
            if(parseInt($(a).css('left'))>0)$(a).css('left',0);
            //设置上、左边距
            var outWidth=-(fixWidth-$(window).width());
            var outHeight=-(fixHeight-$(window).height());
            if(parseInt($(a).css('top'))/(scaleBase/20)<=outHeight)$(a).css('top',outHeight);
            if(parseInt($(a).css('left'))/(scaleBase/20)<=outWidth)$(a).css('left',outWidth);
            //设置下、右边距
            console.log($(a).css("left"))
            $('.LineageTitle').css("left",$(a).css("left"));
        },//移动中的回调函数
        cbEnd: function (a,b,c)  {
            console.log(a,b,c)
        }//移动结束时候的回调函数
    });

});

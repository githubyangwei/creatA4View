

var ftt = {        //   ftt====>  formatToTree 缩写
    format: function (data) {
        var formatData;
        if($.tool.isEmpty(data)){
            formatData=data;
        }else{
            bp.dynasty[0] = data[0].NODE_NUMBER;
            $.each(data,function(x,y){
                if($.tool.isEmpty(y.RELATION_RELATED_ID)){
                    y.isRoot=true;
                    if(y.NODE_NUMBER<bp.dynasty[0])bp.dynasty[0]=y.NODE_NUMBER;
                }
            });
            data.sort(function(a,b){
                return a.NODE_NUMBER - b.NODE_NUMBER;
            });
            data = ftt.setX(data);
            data[0].eachNUM = 0;
            bp.maxYnums = 0;
            data = ftt.setY(data, 0);
            formatData=$.tool.JsonTool.prseTree(data,'children');
        }
        if (bp.dynasty[1] - bp.dynasty[0] < 30) bp.dynasty[1] = bp.dynasty[0] + 30;//补全缩放所需代数
        if (bp.maxYnums < 20) bp.maxYnums = 20;//补全缩放所需横列数
        bp.graphLimit = {width: (bp.dynasty[1] - bp.dynasty[0]) * bp.dynastyWidth, height: bp.maxYnums * 105};
        return formatData;
    },
    setX: function (data) {//设置横向位置
        $.each(data, function (a, b) {//设置代数
            if (b.NODE_NUMBER > (bp.dynasty[1]-5)) bp.dynasty[1] = b.NODE_NUMBER+5;
        })

        $.each(data, function (a, b) {//算X值
            b.setX = bp.dynastyWidth / 2 + (b.NODE_NUMBER - bp.dynasty[0]) * bp.dynastyWidth;
            b.children="";
        });

        data = $.tool.JsonTool.toTree(data, 'NODE_ID', 'RELATION_RELATED_ID', 'children');
        data.sort(function(a,b){
            return a.RELATION_SORT - b.RELATION_SORT;
        });
        return data;
    },
    setY: function (data, parentY) {

        $.each(data, function (x, y) {
            if (x == 0) {
                if (bp.maxYnums == 0) {
                    y.setY = 0;
                } else {
                    y.setY = parentY;
                }
                if (!$.tool.isEmpty(y.children)) {
                    y.hasShow=true;
                    y.children.sort(function(a,b){//按家庭排行排序
                        return a.RELATION_SORT - b.RELATION_SORT;
                    });
                    y.children = ftt.setY(y.children, y.setY);
                }
            } else {

                y.setY = bp.maxYnums + 1;

                bp.maxYnums=y.setY;
                if (!$.tool.isEmpty(y.children)) {
                    y.hasShow=true;
                    y.children.sort(function(a,b){//按家庭排行排序
                        return a.RELATION_SORT - b.RELATION_SORT;
                    });
                    y.children = ftt.setY(y.children, y.setY);
                }
            }
        });
        return data;
    }

}
var scaleBase = 20;

var bp = {                      //   bp====>  baseOption 缩写
    dynasty: [1, 1],            //get           代的范围 便利分析得到
    nodeWidth: 160,             //init          节点宽度 初始定义
    nodeHeight: 80,            //init          节点高度 初始定义
    dynastyWidth: 160,          //init          每代宽度 初始定义
    canvasWidth: 800,           //Calculation   画布绘图区域宽度    计算得到
    canvasHeight: 900,          //Calculation   画布绘图区域高度    计算的到
    maxYnums: 0,                 //Calculation   最大Y值
    data: "",                      //Calculation    节点数据
    restData: "",
};

bp.data = ftt.format(baseData);
bp.dynasty = [bp.dynasty[0], (bp.dynasty[1] + 10)];

var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
var chnUnitChar = ["", "十", "百", "千"];

function SectionToChinese(section) {
    var strIns = '', chnStr = '';
    var unitPos = 0;
    var zero = true;
    while (section > 0) {
        var v = section % 10;
        if (v === 0) {
            if (!zero) {
                zero = true;
                chnStr = chnNumChar[v] + chnStr;
            }
        } else {
            zero = false;
            strIns = chnNumChar[v];
            strIns += chnUnitChar[unitPos];
            chnStr = strIns + chnStr;
        }
        unitPos++;
        section = Math.floor(section / 10);
    }
    return chnStr;
}

function NumberToChinese(num) {
    var unitPos = 0;
    var strIns = '', chnStr = '';
    var needZero = false;

    if (num === 0) {
        return chnNumChar[0];
    }

    while (num > 0) {
        var section = num % 10000;
        if (needZero) {
            chnStr = chnNumChar[0] + chnStr;
        }
        strIns = SectionToChinese(section);
        strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
        chnStr = strIns + chnStr;
        needZero = (section < 1000) && (section > 0);
        num = Math.floor(num / 10000);
        unitPos++;
    }

    return chnStr;
};

for (var i = bp.dynasty[0]; i < bp.dynasty[1]; i++) {
    $('.LineageTitle').append('<div class="LineageList">第' + NumberToChinese(i) + '代</div>');
}
var getJson = $.tool.JsonTool.toTree(bp.data, 'NODE_ID', 'RELATION_RELATED_ID', 'children');

getJson.sort(function (a, b) {
    return a.NODE_NUMBER - b.NODE_NUMBER;
});

var nextJson = [];
var baseLv = 0;

/*插入节点*/
function insertNode(data) {
    var insertHtml = '<table class="insertPd">';
    $.each(data, function (nodeX, nodeY) {
        insertHtml += '<tr class="">'
        //当前节点信息
        insertHtml += '<td class="rootPdNode">' +
            '<div class="pdNodeCont" tdata=\''+JSON.stringify(nodeY)+'\'>' +
            '<div class="pdNodeSexLive"><img class="pdNodeSexImg"  src="'+(nodeY.NODE_SEX=="0"?'img/men':'img/women')+(nodeY.NODE_LIFE_FLAG=="0"?"":"-die")+'.png" alt=""></div>' +
            '<div class="pdNodeName">' + nodeY.NODE_NAME +
            '</div>' +
            '<div class="pdNodeMoreShow"></div>' +
            '<div class="pdNodeOpenClose">' +
            '<img src="img/close-child.png" class="pdNodeOpenControl" alt="">' +
            '</div>' +
            '<div class="pdNodeSpouse">' +
            '</div>' +
            '</div>' +
            '</td>';
        //子女节点信息
        insertHtml += '<td class="pdNodeChild">'
        if (!$.tool.isEmpty(nodeY.children)) {
            insertHtml += insertNode(nodeY.children);
        }
        insertHtml += '</td>'
        insertHtml += '</tr>'
    });

    insertHtml += '</table>';
    return insertHtml;
}

var insertObjs = "";
if (getJson.length > 1) {
    $.each(getJson, function (a, b) {
        if (a == 0) {
            insertObjs = insertNode([getJson[a]]);
        } else {
            nextJson.push(getJson[a])
        }
    })
} else {
    insertObjs = insertNode(getJson);
}

$('.pedigreeDetail').html(insertObjs);

$('.pdNodeCont').each(function(da,db){
    $(db).data('node',JSON.parse($(db).attr('tdata')))
    $(db).removeAttr('tdata');
})


fixTopLeft($(".pedigreeDetail"));
pageToImg();

var initNum = 0;
$(document).on('keydown', function (e) {
    if (e.keyCode == 39 || e.keyCode == 40) {
        initNum++;
        $('.pdNodeCont').removeClass('active');
        $('.pdNodeCont:eq(' + initNum + ')').addClass('active');
        fixTopLeft($('.pedigreeDetail'), $('.pdNodeCont:eq(' + initNum + ')').offset().left, $('.pdNodeCont:eq(' + initNum + ')').offset().top)
    }
    if (e.keyCode == 37 || e.keyCode == 38) {
        initNum--;
        $('.pdNodeCont').removeClass('active');
        $('.pdNodeCont:eq(' + initNum + ')').addClass('active');

        fixTopLeft($('.pedigreeDetail'), $('.pdNodeCont:eq(' + initNum + ')').offset().left, $('.pdNodeCont:eq(' + initNum + ')').offset().top)

    }
})


$('.pdNodeCont:eq(' + initNum + ')').addClass('active');

/*//双击修改内容，和移动冲突
$('.pedigreeDetail').on('dblclick','.pdNodeName',function(){
    var $this=$(this);
    var getTip=$this.attr('edit');
    if(getTip!="true"){
        $this.attr('edit','true');
        var $name=$this.html();
        $this.html('<input type="text" maxlength="4" value="'+$name+'">');
        $this.find('input').focus()
        $this.find('input').on('keyup',function(e){
            if(e.keyCode==13){
                var value=$(this).val();
                $this.html(value);
                $this.attr('edit','false');
            }
        })
        $this.find('input').on('blur',function(){
            var value=$(this).val();
            $this.html(value);
            $this.attr('edit','false');
        })
    }
})*/

/*移动修正*/
function fixTopLeft($obj, left, top) {
    $('.pedigreeDetail').css({
        height: bp.graphLimit.height + 800,
        width: bp.graphLimit.width + 1600
    });
    if (!$.tool.isEmpty(left)) {
        if (left > $(window).width() / 2 || left < 0) {
            var turn = left - $(window).width() / 2;
            $obj.css('left', parseFloat($obj.css('left')) - turn / (scaleBase / 20));
        }
    }

    if (!$.tool.isEmpty(top)) {
        if (top > $(window).height() / 2 || top < 0) {
            var turn = top - $(window).height() / 2;
            $obj.css('top', parseFloat($obj.css('top')) - turn / (scaleBase / 20));
        }
    }

    if (parseFloat($obj.css('top')) > 40) $obj.css('top', 40);
    if (parseFloat($obj.css('left')) > 0) $obj.css('left', 0);
    //设置上、左边距
    var outWidth = -(bp.graphLimit.width - $(window).width());
    var outHeight = -(bp.graphLimit.height - $(window).height());

    if (parseFloat($obj.css('top')) <= outHeight) {
        $obj.css('top', outHeight);
    }

    if (parseFloat($obj.css('left')) <= (outWidth + $('.pedigreeConts').width() * (1 - scaleBase / 20))) {
        $obj.css('left', outWidth + $('.pedigreeConts').width() * (1 - scaleBase / 20));
    }
    //设置下、右边距
    $('.LineageTitle').css("left", $obj.css("left"));


    fixThumbnail();
}


jQuery(function () {

    $(window).resize(function () {
        fixTopLeft($(".pedigreeDetail"))
    })

    $('.pedigreeConts').on('mousewheel', function (event) {
        event.preventDefault();

        if (event.deltaY > 0) {
            scaleBase++;
        } else {
            scaleBase--;
        }
        if (scaleBase >= 40) scaleBase = 40;
        if (scaleBase <= 10) scaleBase = 10;
        fixTopLeft($(".pedigreeDetail"));
        $(this).css('transform', 'scale(' + scaleBase / 20 + ')');

    });

    $(".pedigreeDetail").Tdrag({
        cbStart: function (a, b, c) {
            console.log(a, b, c)
        },//移动前的回调函数
        cbMove: function (a, b, c) {
            fixTopLeft($(a));

        },//移动中的回调函数
        cbEnd: function (a, b, c) {
            console.log(a, b, c)
            fixThumbnailBG('bg');
        }//移动结束时候的回调函数
    });

    $(".movePath").Tdrag({
        cbStart: function (a, b, c) {
            console.log(a, b, c)
        },//移动前的回调函数
        cbMove: function (a, b, c) {

            var $outWidth=parseFloat($('.thumbnail').css('width'));
            var $outHeight=parseFloat($('.thumbnail').css('height'));
            var $obj=$('.movePath');
            var $imgObj=$('#thumbnailImg');
            var $left=parseFloat($obj.css('left'));
            var $top=parseFloat($obj.css('top'));
            var $width=parseFloat($obj.css('width'));
            var $height=parseFloat($obj.css('height'));
            if($left>=0)$left=0;
            if($top>=(40/15))$top=40/15;
            if($left<=$outWidth-$width)$left=$outWidth-$width;
            if($top<=$outHeight-$height)$top=$outHeight-$height;

            $obj.css({
                top:$top,
                left:$left
            });
            $('#thumbnailImg').css({
                top:$top,
                left:$left
            });

        },//移动中的回调函数
        cbEnd: function (a, b, c) {

            var $outWidth=parseFloat($('.thumbnail').css('width'));
            var $outHeight=parseFloat($('.thumbnail').css('height'));
            var $obj=$('.movePath');
            var $imgObj=$('#thumbnailImg');
            var $left=parseFloat($obj.css('left'));
            var $top=parseFloat($obj.css('top'));
            var $width=parseFloat($obj.css('width'));
            var $height=parseFloat($obj.css('height'));
            if($left>=0)$left=0;
            if($top>=(40/15))$top=40/15;
            if($left<=$outWidth-$width)$left=$outWidth-$width;
            if($top<=$outHeight-$height)$top=$outHeight-$height;
            $obj.css({
                top:$top,
                left:$left
            });
            $('#thumbnailImg').css({
                top:$top,
                left:$left
            });
            $('.pedigreeDetail').css({
                top:parseFloat($top)*baseTmNum,
                left:parseFloat($left)*baseTmNum
            });
        }//移动结束时候的回调函数
    });
    
});

/*缩略图生成*/
var baseTmNum=15;

/*修正缩略图*/
function fixThumbnail(){
    $("#thumbnailImg,.movePath").css({
        width: $(".pedigreeDetail").width()/baseTmNum,
        height: $(".pedigreeDetail").height()/baseTmNum,
        top:40/baseTmNum
    });
    $('.moveSelects').css({
        width: $(window).width()/baseTmNum/(scaleBase/20),
        height: $(window).height()/baseTmNum/(scaleBase/20)
    });
}

/*修正缩略图*/
function fixThumbnailBG(moveType){
    if(moveType=="bg"){
        $("#thumbnailImg").css({
            top: parseFloat($(".pedigreeDetail").css('top'))/baseTmNum,
            left: parseFloat($(".pedigreeDetail").css('left'))/baseTmNum
        });
    }
}

function pageToImg() {
    var pageCanvas = document.querySelector("#thumbnailImg");
    html2canvas(document.querySelector(".pedigreeDetail"), {
        canvas: pageCanvas,
    }).then(function(canvas) {

        fixThumbnail();

    });

}

/********************
 * layercake
 * PC端 JS工具集
 * 因为是内容使用，不保证通用
 * Created by 林丽娜 on 16/1/29.
 */

(function ($) {
    /***************************
     * 模糊搜索
     * 使用方式：
     *         $('').autoComplete({
                  url: ,
                  dataName: 'name'
               });
     */
    var defaults = {
        currentLi: -1,
        onSubmit: function (text) {
        },
        returnFn: function (data, domElm) {
            $.each(data.result, function (key, val) {
                domElm.append('<li class="proposal" data-idx="' + val.id + '" data-namex="' + val.name + '">' + val.name + '</li>');
            });
        }
    };

    $.fn.autoComplete = function (param) {

        return this.each(function () {
            var me = this;
            me.param = $.extend({}, defaults, param);
            var auto = new AutoComplete(this.param);

            auto.init($(this));
            auto.hiddenDom($(this));
            auto.keyPress($(this), me.param);
            auto.changeEvent($(this), me.param);
            auto.hiddenList($(this));

        });
    };


    function AutoComplete(options){
        return this.options = options, this;
    }

    /* 初始化dom */
    AutoComplete.prototype.init = function($this) {
        /* container */
        var container = $('<div></div>').addClass('autocomplete-container');

        /* 存放列表的div */
        var proposals = $('<div class="proposal-box"></div>')
            .css('width', $this.outerWidth())
            .css('top', $this.outerHeight());

        /* 存放列表的ul */
        this.proposalList = $('<ul class="proposal-ul"></ul>');

        proposals.append(this.proposalList);
        $this.wrap(container).after(proposals);

        this.newDom();

    };


    /* 存放id的input隐藏域 */
    AutoComplete.prototype.hiddenDom = function($this) {
        this.inputHidden = $('<input type="hidden" class="proposal-id" />');
        $this.before(this.inputHidden);
    };

    /* 设置list列表为空*/
    AutoComplete.prototype.newDom = function(){
        this.proposalList.empty();
    };

    /* 完整的 key press 过程分为两个部分：1. 按键被按下；2. 按键被松开。 */
    AutoComplete.prototype.keyPress = function( $this, opt){
        var _this = this;
        $this.keydown(function(e){
            switch (e.which) {
                case 38: //向上up
                    e.preventDefault(); //阻止元素发生默认的行为
                    _this.proposalList.find('li').removeClass('selected');
                    if ((currentLi - 1) >= 0) {
                        currentLi--;
                        _this.proposalList.find('li:eq(' + currentLi + ')').addClass('selected');
                    } else {
                        currentLi = -1;
                    }
                    break;
                case 40: //向下down
                    console.log('down_currentLi='+currentLi);
                    console.log('length='+_this.proposalList.find('li').length);
                    e.preventDefault();
                    if ((currentLi + 1) < _this.proposalList.find('li').length) {
                        _this.proposalList.find('li').removeClass('selected');
                        currentLi++;
                        _this.proposalList.find('li:eq(' + currentLi + ')').addClass('selected');
                    }
                    break;
                case 13: //enter
                    if (currentLi > -1) {
                        var text = _this.proposalList.find('li:eq(' + currentLi + ')').html();
                        $this.val(text);
                    }
                    currentLi = -1;
                    _this.proposalList.empty();
                    opt.onSubmit($this.val());
                    break;
                case 27: // esc button
                    currentLi = -1;
                    _this.proposalList.empty();
                    $this.val('');
                    break;
            }
        });
    };

    //当前输入框对输入值得模糊搜索
    AutoComplete.prototype.changeEvent = function($this, opt){
        var _this = this;
        $this.bind('input propertychange', function(e){
            var self = $(this);
            if (e.which != 40 && e.which != 38 && e.which != 13 && e.which != 27) {
                currentLi = -1;
                _this.proposalList.empty();
                $this.prop('autocomplete', 'off');
                if ($this.val().length < 1) {
                    _this.proposalList.empty();
                } else {
                    _this.proposalList.empty();
                    var dataObj = {};
                    dataObj.datatime = +new Date;
                    dataObj[opt.dataName] = $this.val();
                    console.log('dataobj', dataObj);
                    $.ajax({
                        type: 'POST',
                        url: opt.url,
                        data: dataObj
                    }).done(function (data) {

                        _this.proposalList.empty();
                        //console.log('联想列表', data);
                        opt.returnFn.call(self, data, _this.proposalList);

                        _this.proposalList.find('.proposal')
                            .click(function (event) {
                                var target = $(event.target);
                                var idx = target.data('idx');
                                var namex = target.data('namex');
                                $this.val(namex).data('idx', idx);
                                $(_this.inputHidden).val(idx);
                                if (opt.callback) {
                                    opt.callback();
                                }
                                _this.proposalList.empty();
                                opt.onSubmit($this.val());
                            })
                            .mouseenter(function () {
                                $(this).addClass('selected');
                            })
                            .mouseleave(function () {
                                $(this).removeClass('selected');
                            });
                    });
                }
            }
            return opt;
        });

    };

    //输入框失去焦点时，模糊查询列表隐藏
    AutoComplete.prototype.hiddenList = function(){
        var _this = this;
        $(document).on('click', function (event) {
            currentLi = -1;
            var target = $(event.target);
            if (target.closest('.preview').length == 0) {
                _this.proposalList.empty();
            }
        });
    };

})(jQuery);



(function($){
    /***************************
     * 提示并限制textarea的输入字数
     * 使用方式：
     *         $('').limitNum({
                countNum: textarea所需要的字数
              });
     */
    var defaults = {
        countNum : 20
    };

    $.fn.limitNum = function(options){
        return this.each(function(){
            var me = this;
            me.opts = $.extend({}, defaults, options);

            //container
            var wordCount = $('<div></div>').addClass('wordCount');
            //wordWrap word
            var wordWrap = $('<span class="wordWrap"><span class="wordNum">'+ me.opts.countNum +'</span>/'+ me.opts.countNum +'</span>');
            $(this).wrap(wordCount).after(wordWrap);
            limitNum(this, me.opts);
        });
    };

    function limitNum($this, meopts){
        var max = meopts.countNum;
        $($this).bind('input propertychange', function(){
            var curLength = $(this).val().length,
                wordNum = $(this).closest('.wordCount').find('.wordNum');
            wordNum.text(max - curLength);
            //console.log(curLength, max);
            /* textArea的文本长度大于maxLength */
            if(curLength > max){
                /* 截断textArea的文本重新赋值 */
                $(this).val($(this).val().substring(0, max));
                wordNum.text(0);
            }
        });
    }
})(jQuery);
$('#login').on('click', '.forgot', function() {
	$(this).closest('.modal').modal('hide');
	$('#forgot').modal('show');

	return false;
});//.modal('show');

$('.fileviewToggle').on('click', '.btn', function() {
	var i = $(this).parent().children().removeClass('active').end().end().addClass('active').index();
	$('.fileviews').children().hide().eq(i).show();
});

$('.fileStructure').on('click', '.btn-link', function() {
	$(this).toggleClass('showChildren');
});

$('.nav').on('click', 'li', function() {
	var $views = $('.views').children();
	var $show = $views.eq($(this).index());
	if ($show.length) {
		$views.hide();
		$show.show();
	}
});

$('.main').show();

var md = new MonodiDocument({
    staticStyleElement : document.getElementById("staticStyle"),
    dynamicStyleElement: document.getElementById("dynamicStyle"),
    musicContainer     : document.getElementById("musicContainer"),
    xsltUrl            : "/bundles/digitalwertmonodiclient/js/monodi/mei2xhtml.xsl",
    meiUrl             : "/bundles/digitalwertmonodiclient/js/monodi/empty.mei"
});

var checkElement = function(el) {
	return (md.getSelectedElement())? md.getSelectedElement().nodeName == el : false;
};

var getCaretCharacterOffsetWithin = function (element) {
    var caretOffset = 0;
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
};

$(document).on('keydown', function(e) {
	if (checkElement('note')) {
		switch(e.keyCode) {
			case 38: //up
			case 40: //down
				var change
				if (e.shiftKey) {
					change = (e.keyCode == 38)? 'u' : 'd';
					md.setIntm(change);
				} else {
					change = (e.keyCode == 38)? 1 : -1;
					md.changeScaleStep(change);
				}
			break;
			case 37: //left
			case 39: //right
				var prevOrNext = (e.keyCode == 37)? 'preceding' : 'following';
				md.selectNextElement(prevOrNext);
			break;
			case 173: //- (Lin)
			case 189: //- (Mac)
				md.newNoteAfter();
			break;
			case 32: //space
				md.newUneumeAfter();
			break;
			case 13: //enter
				md.newIneumeAfter();
			break;
			case 8: //del
				md.deleteElement();
			break;
			case 66: //b
        md.toggleAccidental("f");
      break;
      case 83: //s
        md.toggleAccidental("s");
			break;
			case 78: // n
			  md.toggleAccidental("n");
			break;
			case 79: //o
			case 81: //q
			case 187: //´
			case 188: //,
				var pitchClass = (function() {
					switch(e.keyCode) {
						case 79: return 'oriscus';
						case 81: return 'quilisma';
						case 187:
						case 188:
							return 'apostropha';
					}
				})();
				md.togglePerformanceNeumeType(pitchClass);
			break;
      case 76: //l
        console.log("here")
        md.toggleLiquescence();
      break;
			default: console.log(e);
		}

		return false;
	}

	if (checkElement('syl')) {
		var caret;

		switch(e.keyCode) {
			case 37: //left
			case 39: //right
				caret = getCaretCharacterOffsetWithin(e.target);
				if (e.keyCode == 37 && caret == 0) {
					var $prev = $(md.getHtmlElement(md.selectNextElement('preceding')));
					if ($prev.length) {
						$prev.focus();
					}
				}
				if (e.keyCode == 39 && caret >= $(e.target).text().length) {
					var $next = $(md.getHtmlElement(md.selectNextElement('following')));
					if ($next.length) {
						$next.focus();
					}
				}
			break;
			case 32: //Space
			case 173: //- (Lin)
			case 189: //- (Mac)
				var $target = $(e.target),
					text = $(e.target).text(),
					open = text.indexOf('<'),
					close = text.indexOf('>');
				caret = getCaretCharacterOffsetWithin(e.target);

				if (open < 0 || close < 0 || caret > close) {
					md.setSylText(text.substring(0,caret) + (e.keyCode == 32? '' : '-'));
					$target.data('saved', true);
					md.newSyllableAfter(text.substring(caret));
				}
			break;
		}
	}
}).on('click', '#musicContainer', function(e) {
	var $target = $(e.target);
	if ($(e.target).hasClass('_mei')) {
		md.selectElement(e.target);
	} else {
		$target = $target.closest('._mei');
		if ($target.length) { md.selectElement($target[0]); }
	}
}).on('focusout', '.syl span[contenteditable]', function(e) {
	if (checkElement('syl')) {
		var $target = $(e.target);
		if (!$target.data('saved')) {
			//md.setSylText($(e.target).text());
		}
	}
}).on('focusout', '.sb.edition[contenteditable]', function(e) {
	if (checkElement('sb')) {
		md.setSbLabel($(e.target).text());
	}
});

$('#login').on('click', function() {
	$.ajax({
		url: baseurl + 'oauth/v2/auth?client_id=1_2m0rkq8ev2yoow4oswcs8wsokc400c0ooocc84k4g0k8kws4g0'
	}).done(function(data) {
		var form = data.match(/(<form(.|[\r\n])*\/form>)/)[0];
		if (form.length) {
			var $form = $(form);

			$.ajax({
				url: $form.attr('action') + '&redirect_uri=http://notengrafik.dw-dev.de/client/',
				data: $form.find('#digitalwert_monodi_oauth_server_auth_allowAccess').prop('checked', true).end().serialize(),
				method: $form.attr('method')
			}).done( function(data) {

			});
		}
	});
	//window.open(baseurl + 'oauth/v2/auth?client_id=1_2m0rkq8ev2yoow4oswcs8wsokc400c0ooocc84k4g0k8kws4g0','','width=700,height=500,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=0,left=0,top=0');
	return false;
});
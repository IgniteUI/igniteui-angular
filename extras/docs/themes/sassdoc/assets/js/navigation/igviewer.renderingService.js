(function ($, Modernizr, window, igViewer) {

	var $window, $navContainer, $navButton;

	var svc = {

	    addImgResponsiveClass: function (element) {
	        var images = element.find('img');
	        images.each(function (imgIndex, img) {
	            var $img = $(img);
	            if (!$img.attr('class')) {
	                $img.addClass('img-responsive');
	            } else if ($img.attr('class').indexOf('img-responsive') === -1) {
	                $img.addClass('img-responsive');
	            }
	        });
	    }
	};

	$(function () {
	    var width,
            $element = $(".main-box");

	    $window = $(window);
	    $navButton = $('#nav-button');
	    $navContainer = $('#nav-container');

	    if ($element.length === 1) {
	        svc.addImgResponsiveClass($element);
	    }

	    var showOrHideNavigation = function () {
	        if ($(window).width() == width) {
	            return;
	        }
	        // cache width to stop misfires
	        width = $window.width();

	        if (window.matchMedia && window.matchMedia("print").matches) return;
	        var mode = (igViewer.common.isSmallDeviceWidth()) ? 'hide' : 'show';
	        // $navContainer.collapse(mode);
	        //$navContainer[mode](350); // jquery version
	        igViewer.common.syncSidebarHeight();
	    };

	    //init collapse widget w/o toggle
	    // $navContainer.collapse({ toggle: false });
	    showOrHideNavigation();

	    $window.on('resize', showOrHideNavigation);

	    $navButton.click(function (e) {
	        // $navContainer.collapse('toggle');
	        //$navContainer.toggle(350); // jquery version

	        var isHidden = parseInt($navContainer.height()) === 0,
				label = (isHidden) ? igViewer.locale.navHideLabel : igViewer.locale.navShowLabel;

	        $navButton.text(label).blur();

	        if (label === igViewer.locale.navShowLabel) {
	            igViewer.common.scrollToTop();
	        }
	    });
	});

	igViewer = igViewer || {};
	igViewer.renderingService = svc;

}(jQuery, Modernizr, window, window.igViewer));
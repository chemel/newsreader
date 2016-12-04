var UserInterface = {

	init: function() {

		$(window).resize(function() {
			UserInterface.resize();
		});

		this.resize();
	},

	resize: function () {

		$('#feeds, #entries').height( $(window).height() - 40);
		$('#entry').height( $(window).height() - 60 );
		$('#entry').width( $(window).width() - ($('#feeds').width() + $('#entries').width()) - 21 );
	}
}

var Feeds = {

	request: null,

	bind: function() {

		$('#feeds li.feed').click(function() {

			$('#feeds li.feed.selected').removeClass('selected');
			$(this).addClass('selected');

			Feeds.showEntriesAction( $(this).attr('data-id') );

			return false;
		});

		$('#btn-markallread').click(function() {

			var feed = $('#feeds li.feed.selected');
			var feed_id = feed.attr('data-id');

			if( feed_id > 0 ) {
				$.ajax({ 
					type: 'POST',
					url: '/reader/read/' + feed_id,
					async: true,
					success: function() {
						feed.find('.unread').hide();
						$('#entries li').removeClass('unread');
				}});
			}

			return false;
		});
	},

	showEntriesAction: function( feed_id ) {

		if( this.request != null )
			this.request.abort();

		this.request = $.ajax({ 
			type: 'POST',
			url: '/reader/entries/' + feed_id,
			async: true,
			success: function( entries ) {
				Entries.setEntries( entries );
				Entries.bind();
				Entries.scrollTop();
		}});
	},

	getUnreadPost: function( id ) {

		return parseInt($('#feed-' + id + ' span.unread' ).text());
	},

	setUnreadPost: function( id, unread ) {

		var feed = $('#feed-' + id );
		var span = feed.find('span.unread');

		if( feed ) {
			if( unread > 0 ) {
				span.text( unread );
				span.show();
			}
			else {
				span.hide();
			}
		}
	}
}

var Live = {

	every: 5 * 60 * 1000, // 5 min

	init: function() {

		this.check();
	},
	check: function() {

        $.ajax({
            url: '/reader/counter',
            dataType: 'json',
            async: true,
            success: function( json ) {

            	$('#feeds span.unread').hide();

            	$.each(json.unreads, function( i, unread ) {
					Feeds.setUnreadPost( unread.id, unread.unreads );
				}); 	
            }
        });

		this.timeout();
	},

	timeout: function() {

		setTimeout('Live.check()', this.every);
	}
}

$(function() {
	UserInterface.init();
	Feeds.bind();
	Live.init();
	$('#feeds li.feed:first').click();
});
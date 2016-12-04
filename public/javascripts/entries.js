var Entries = {

	request: null,

	setEntries: function( entries ) {

		$('#entries').html(entries);
	},

	bind: function(entry) {

		if(!entry) entry = $('#entries li.entry');

		entry.click(function() {

			$('#entries li.entry.selected').removeClass('selected');
			$(this).addClass('selected');

			Entries.showEntryAction( $(this).attr('data-id') );

			if( $(this).hasClass('unread') ) {

				$(this).removeClass('unread');

				if($('#feeds').length == 1) Feeds.setUnreadPost( $(this).attr('data-feed-id'), Feeds.getUnreadPost( $(this).attr('data-feed-id') ) - 1 );
			}

			return false;
		});
	},

	showEntryAction: function( entry_id ) {

		if( this.request != null )
			this.request.abort();

		this.request = $.ajax({ 
			type: 'POST',
			url: '/reader/entry/' + entry_id,
			// data: {'id': entry_id},
			async: true,
			success: function( content ) {
				Entry.setEntry( content );
		}});
	},

	scrollTop: function() {

		$('#entries').scrollTop(0);
	}
}

var Entry = {

	setEntry: function( entry ) {

		$('#entry').html(entry).scrollTop(0);
		$('#entry a').attr('target', '_blank');
	}
}
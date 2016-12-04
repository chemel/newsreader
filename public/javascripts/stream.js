var UserInterface = {

	init: function() {

		$(window).resize(function() {
			UserInterface.resize();
		});

		this.resize();
	},

	resize: function () {

		$('#entries').width( $(window).width() / 2 - 20 );
		$('#entry').width( $(window).width() / 2 );

		$('#entries').height( $(window).height() - 40);
		$('#entry').height( $(window).height() - 60 );
	}
}

var SocketIo = {

	init: function() {

		var socket = io.connect('http://localhost:3000');

		socket.on('connect', function () {
			if( $('ul#entries li').length == 0) socket.emit('getstream');
		});

		socket.on('stream', function (entry) {

		  var date = $('<span />');
		  date.addClass('date');
		  date.text(entry.date);

		  var favicon = $('<img />');
		  favicon.addClass('feed-favicon');
		  favicon.attr('src', entry.feedFavicon);

		  var li = $('<li />');
		  li.addClass('entry');
		  if( entry.readed !== 1 ) li.addClass('unread');
		  li.attr('data-id', entry.id);
		  li.text(entry.feedTitle+' - '+entry.title);

		  li.prepend(favicon);
		  li.prepend(date);

		  Entries.bind(li);

		  $('ul#entries').prepend(li);
		});
	}
}

$(function() {
	UserInterface.init();
	SocketIo.init();
});
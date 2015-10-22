module.exports = {
	uniqid: (function () {
		var id = 0;
		return function () {
			return id++;
		};
	})(),

	validatenick: function (nick) {
		return /^[a-zA-Z0-9_.-]{3,}$/.test(nick);
	},
};

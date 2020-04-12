/**
 * <p>{"x": float, "y": float} stub.</p>
 */
class Position {
	/**
	 * @var {number}
	 */
	get x() {
	}

	/**
	 * @var {number}
	 */
	get y() {
	}
}

/**
 * <p>RoomConfig is passed to HBInit to configure the room, all values are optional.</p>
 *
 * @typedef {{
 * 		roomName: (string|undefined),
 * 		playerName: (string|undefined),
 * 		password: (string|undefined),
 * 		maxPlayers: (number|undefined),
 * 		public: (boolean|undefined),
 * 		geo: ({code: string, lat: number, lon: number}|undefined),
 * 		token: (string|undefined),
 * 		noPlayer: (boolean|undefined)
 * }} RoomConfigObject
 */
let RoomConfigObject;

/**
 * <p>RoomObject is the main interface which lets you control the room and listen to it's events</p>
 */
class RoomObject {
	/**
	 * <p><code>CollisionFlags : CollisionFlagsObject</code></p>
	 * <p>Object filled with the collision flags constants that compose the cMask and cGroup disc properties.</p>
	 * <p><a href="https://github.com/haxball/haxball-issues/wiki/Collision-Flags">Read more about collision flags here</a>.</p>
	 * <p>Example usage:</p>
	 * <pre>// Check if disc 4 belongs to collision group "ball":
	 * var discProps = room.getDiscProperties(4);
	 * var hasBallFlag = (discProps.cGroup & room.CollisionFlags.ball) != 0;
	 *
	 * // Add "wall" to the collision mask of disc 5 without changing any other of it's flags:
	 * var discProps = room.getDiscProperties(5);
	 * room.setDiscProperties(5, {cMask: discProps.cMask | room.CollisionFlags.wall});</pre>
	 *
	 * @var {CollisionFlagsObject}
	 */
	get CollisionFlags() {
	}

	/**
	 * <p>Event called when a new player joins the room.</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onPlayerJoin(callback) {
	}

	/**
	 * <p>Event called when a player leaves the room.</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onPlayerLeave(callback) {
	}

	/**
	 * <p>Event called when a team wins.</p>
	 *
	 * @param {function(ScoresObject)} callback
	 */
	set onTeamVictory(callback) {
	}

	/**
	 * <p>Event called when a player sends a chat message.</p>
	 * <p>The event function can return <code>false</code> in order to filter the chat message. This prevents the chat message from reaching other players in the room.</p>
	 *
	 * @param {function(PlayerObject, string): boolean} callback
	 */
	set onPlayerChat(callback) {
	}

	/**
	 * <p>Event called when a player kicks the ball.</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onPlayerBallKick(callback) {
	}

	/**
	 * <p>Event called when a team scores a goal.</p>
	 *
	 * @param {function(TeamID)} callback
	 */
	set onTeamGoal(callback) {
	}

	/**
	 * <p>Event called when a game starts.</p>
	 * <p><code>byPlayer</code> is the player which caused the event (can be null if the event wasn't caused by a player).</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onGameStart(callback) {
	}

	/**
	 * <p>Event called when a game stops.</p>
	 * <p><code>byPlayer</code> is the player which caused the event (can be null if the event wasn't caused by a player).</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onGameStop(callback) {
	}

	/**
	 * <p>Event called when a player's admin rights are changed.</p>
	 * <p><code>byPlayer</code> is the player which caused the event (can be null if the event wasn't caused by a player).</p>
	 *
	 * @param {function(PlayerObject, PlayerObject)} callback
	 */
	set onPlayerAdminChange(callback) {
	}

	/**
	 * <p>Event called when a player team is changed.</p>
	 * <p><code>byPlayer</code> is the player which caused the event (can be null if the event wasn't caused by a player).</p>
	 *
	 * @param {function(PlayerObject, PlayerObject)} callback
	 */
	set onPlayerTeamChange(callback) {
	}

	/**
	 * <p>Event called when a player has been kicked from the room. This is always called after the onPlayerLeave event.</p>
	 * <p><code>byPlayer</code> is the player which caused the event (can be null if the event wasn't caused by a player).</p>
	 *
	 * @param {function(PlayerObject, string, boolean, PlayerObject)} callback
	 */
	set onPlayerKicked(callback) {
	}

	/**
	 * <p>Event called once for every game tick (happens 60 times per second). This is useful if you want to monitor the player and ball positions without missing any ticks.</p>
	 * <p>This event is not called if the game is paused or stopped.</p>
	 *
	 * @param {function()} callback
	 */
	set onGameTick(callback) {
	}

	/**
	 * <p>Event called when the game is paused.</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onGamePause(callback) {
	}

	/**
	 * <p>Event called when the game is unpaused.</p>
	 * <p>After this event there's a timer before the game is fully unpaused, to detect when the game has really resumed you can listen for the first onGameTick event after this event is called.</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onGameUnpause(callback) {
	}

	/**
	 * <p>Event called when the players and ball positions are reset after a goal happens.</p>
	 *
	 * @param {function()} callback
	 */
	set onPositionsReset(callback) {
	}

	/**
	 * <p>Event called when a player gives signs of activity, such as pressing a key. This is useful for detecting inactive players.</p>
	 *
	 * @param {function(PlayerObject)} callback
	 */
	set onPlayerActivity(callback) {
	}

	/**
	 * <p>Event called when the stadium is changed.</p>
	 *
	 * @param {function(string, PlayerObject)} callback
	 */
	set onStadiumChange(callback) {
	}

	/**
	 * <p>Event called when the room link is obtained.</p>
	 *
	 * @param {function(string)} callback
	 */
	set onRoomLink(callback) {
	}

	/**
	 * <p>Event called when the kick rate is set.</p>
	 *
	 * @param {function(number, number, number, PlayerObject)} callback
	 */
	set onKickRateLimitSet(callback) {
	}

	/**
	 * <p>Sends a chat message using the host player</p>
	 * <p>If targetId is null or undefined the message is sent to all players. If targetId is defined the message is sent only to the player with a matching id.</p>
	 *
	 * @param {string} message
	 * @param {?number} targetId
	 */
	sendChat(message, targetId = null) {
		//
	}

	/**
	 * <p>Changes the admin status of the specified player</p>
	 *
	 * @param {number} playerID
	 * @param {boolean} admin
	 */
	setPlayerAdmin(playerID, admin) {
		//
	}

	/**
	 * <p>Moves the specified player to a team</p>
	 *
	 * @param {number} playerID
	 * @param {number} team
	 */
	setPlayerTeam(playerID, team) {
		//
	}

	/**
	 * <p>Kicks the specified player from the room</p>
	 *
	 * @param {number} playerID
	 * @param {string} reason
	 * @param {boolean} ban
	 */
	kickPlayer(playerID, reason, ban) {
		//
	}

	/**
	 * <p>Clears the ban for a playerId that belonged to a player that was previously banned.</p>
	 *
	 * @param {number} playerId
	 */
	clearBan(playerId) {
		//
	}

	/**
	 * <p>Clears the list of banned players.</p>
	 */
	clearBans() {
		//
	}

	/**
	 * <p>Sets the score limit of the room</p>
	 * <p>If a game is in progress this method does nothing.</p>
	 *
	 * @param {number} limit
	 */
	setScoreLimit(limit) {
		//
	}

	/**
	 * <p>Sets the time limit of the room. The limit must be specified in number of minutes.</p>
	 * <p>If a game is in progress this method does nothing.</p>
	 *
	 * @param {number} limitInMinutes
	 */
	setTimeLimit(limitInMinutes) {
		//
	}

	/**
	 * <p>Parses the stadiumFileContents as a .hbs stadium file and sets it as the selected stadium.</p>
	 * <p>There must not be a game in progress, If a game is in progress this method does nothing</p>
	 * <p>See example <a href="https://github.com/haxball/haxball-issues/blob/master/headless/examples/setCustomStadium.js">here</a>.</p>
	 *
	 * @param {string} stadiumFileContents
	 */
	setCustomStadium(stadiumFileContents) {
		//
	}

	/**
	 * <p>Sets the selected stadium to one of the default stadiums. The name must match exactly (case sensitive)</p>
	 * <p>There must not be a game in progress, If a game is in progress this method does nothing</p>
	 *
	 * @param {string} stadiumName
	 */
	setDefaultStadium(stadiumName) {
		//
	}

	/**
	 * <p>Sets the teams lock. When teams are locked players are not able to change team unless they are moved by an admin.</p>
	 *
	 * @param {boolean} locked
	 */
	setTeamsLock(locked) {
		//
	}

	/**
	 * <p>Sets the colors of a team.</p>
	 * <p>Colors are represented as an integer, for example a pure red color is <code>0xFF0000</code>.</p>
	 *
	 * @param {TeamID} team
	 * @param {number} angle
	 * @param {number} textColor
	 * @param {Array.<number>} colors
	 */
	setTeamColors(team, angle, textColor, colors) {
		//
	}

	/**
	 * <p>Starts the game, if a game is already in progress this method does nothing</p>
	 */
	startGame() {
		//
	}

	/**
	 * <p>Stops the game, if no game is in progress this method does nothing</p>
	 */
	stopGame() {
		//
	}

	/**
	 * <p>Sets the pause state of the game. true = paused and false = unpaused</p>
	 *
	 * @param {boolean} pauseState
	 */
	pauseGame(pauseState) {
		//
	}

	/**
	 * <p>Returns the player with the specified id. Returns null if the player doesn't exist.</p>
	 *
	 * @param {number} playerId
	 *
	 * @return {?PlayerObject}
	 */
	getPlayer(playerId) {
		//
	}

	/**
	 * <p>Returns the current list of players</p>
	 *
	 * @return {Array.<PlayerObject>}
	 */
	getPlayerList() {
		//
	}

	/**
	 * <p>If a game is in progress it returns the current score information. Otherwise it returns null</p>
	 *
	 * @return {?ScoresObject}
	 */
	getScores() {
		//
	}

	/**
	 * <p>Returns the ball's position in the field or null if no game is in progress.</p>
	 *
	 * @return {?Position}
	 */
	getBallPosition() {
		//
	}

	/**
	 * <p>Starts recording of a haxball replay.</p>
	 * <p>Don't forget to call stop recording or it will cause a memory leak.</p>
	 */
	startRecording() {
		//
	}

	/**
	 * <p>Stops the recording previously started with startRecording and returns the replay file contents as a Uint8Array.</p>
	 * <p>Returns null if recording was not started or had already been stopped.</p>
	 *
	 * @return {?Uint8Array}
	 */
	stopRecording() {
		//
	}

	/**
	 * <p>Changes the password of the room, if pass is null the password will be cleared.</p>
	 *
	 * @param {string} pass
	 */
	setPassword(pass) {
		//
	}

	/**
	 * <p>Activates or deactivates the recaptcha requirement to join the room.</p>
	 *
	 * @param {boolean} required
	 */
	setRequireRecaptcha(required) {
		//
	}

	/**
	 * <p>First all players listed are removed, then they are reinserted in the same order they appear in the playerIdList.</p>
	 * <p>If moveToTop is true players are inserted at the top of the list, otherwise they are inserted at the bottom of the list.</p>
	 *
	 * @param {Array.<number>} playerIdList
	 * @param {boolean} moveToTop
	 */
	reorderPlayers(playerIdList, moveToTop) {
		//
	}

	/**
	 * <p>Sends a host announcement with msg as contents. Unlike sendChat, announcements will work without a host player and has a larger limit on the number of characters.</p>
	 * <p>If targetId is null or undefined the message is sent to all players, otherwise it's sent only to the player with matching targetId.</p>
	 * <p>color will set the color of the announcement text, it's encoded as an integer (0xFF0000 is red, 0x00FF00 is green, 0x0000FF is blue).</p>
	 * <p>If color is null or undefined the text will use the default chat color.</p>
	 * <p>style will set the style of the announcement text, it must be one of the following strings: <code>"normal","bold","italic", "small", "small-bold", "small-italic"</code></p>
	 * <p>If style is null or undefined <code>"normal"</code> style will be used.</p>
	 * <p>If sound is set to 0 the announcement will produce no sound. If sound is set to 1 the announcement will produce a normal chat sound. If set to 2 it will produce a notification sound.</p>
	 *
	 * @param {string} msg
	 * @param {?number} targetId
	 * @param {?number} color
	 * @param {?string} style
	 * @param {?number} sound
	 */
	sendAnnouncement(msg, targetId = null, color = null, style = null, sound = null) {
		//
	}

	/**
	 * <p>Sets the room's kick rate limits.</p>
	 * <p><code>min</code> is the minimum number of logic-frames between two kicks. It is impossible to kick faster than this.</p>
	 * <p><code>rate</code> works like <code>min</code> but lets players save up extra kicks to use them later depending on the value of burst.</p>
	 * <p><code>burst</code> determines how many extra kicks the player is able to save up.</p>
	 *
	 * @param {number} min
	 * @param {number} rate
	 * @param {number} burst
	 */
	setKickRateLimit(min = 2, rate = 0, burst = 0) {
		//
	}

	/**
	 * <p>Overrides the avatar of the target player.</p>
	 * <p>If avatar is set to null the override is cleared and the player will be able to use his own avatar again.</p>
	 *
	 * @param {number} playerId
	 * @param {string} avatar
	 */
	setPlayerAvatar(playerId, avatar) {
		//
	}

	/**
	 * <p>Sets properties of the target disc.</p>
	 * <p>Properties that are null or undefined will not be set and therefor will preserve whatever value the disc already had.</p>
	 * <p>For example <code>room.setDiscProperties(0, {x: 0, y: 0});</code> will set the position of disc 0 to &lt;0,0&gt; while leaving any other value intact.</p>
	 *
	 * @param {number} discIndex
	 * @param {DiscPropertiesObject} properties
	 */
	setDiscProperties(discIndex, properties) {
		//
	}

	/**
	 * <p>Gets the properties of the disc at discIndex. Returns null if discIndex is out of bounds.</p>
	 *
	 * @param {number} discIndex
	 *
	 * @return {?DiscPropertiesObject}
	 */
	getDiscProperties(discIndex) {
		//
	}

	/**
	 * <p>Same as setDiscProperties but targets the disc belonging to a player with the given Id.</p>
	 *
	 * @param {number} playerId
	 * @param {DiscPropertiesObject} properties
	 */
	setPlayerDiscProperties(playerId, properties) {
		//
	}

	/**
	 * <p>Same as getDiscProperties but targets the disc belonging to a player with the given Id.</p>
	 *
	 * @param {number} playerId
	 *
	 * @return {DiscPropertiesObject}
	 */
	getPlayerDiscProperties(playerId) {
		//
	}

	/**
	 * <p>Gets the number of discs in the game including the ball and player discs.</p>
	 */
	getDiscCount() {
		//
	}
}

/**
 * <p>PlayerObject holds information about a player</p>
 */
class PlayerObject {
	/**
	 * <p>The id of the player, each player that joins the room gets a unique id that will never change.</p>
	 *
	 * @var {number}
	 */
	get id() {
	}

	/**
	 * <p>The name of the player.</p>
	 *
	 * @var {string}
	 */
	get name() {
	}

	/**
	 * <p>The team of the player.</p>
	 *
	 * @var {TeamID}
	 */
	get team() {
	}

	/**
	 * <p>Whether the player has admin rights.</p>
	 *
	 * @var {boolean}
	 */
	get admin() {
	}

	/**
	 * <p>The player's position in the field, if the player is not in the field the value will be null.</p>
	 *
	 * @var {Position}
	 */
	get position() {
	}

	/**
	 * <p>The player's public ID. Players can view their own ID's here: <a href="https://www.haxball.com/playerauth" rel="nofollow">https://www.haxball.com/playerauth</a></p>
	 * <p>The public ID is useful to validate that a player is who he claims to be, but can't be used to verify that a player isn't someone else. Which means it's useful for implementing user accounts, but not useful for implementing a banning system.</p>
	 * <p>Can be null if the ID validation fails.</p>
	 * <p>This property is only set in the RoomObject.onPlayerJoin event.</p>
	 *
	 * @var {?string}
	 */
	get auth() {
	}

	/**
	 * <p>A string that uniquely identifies the player's connection, if two players join using the same network this string will be equal.</p>
	 * <p>This property is only set in the RoomObject.onPlayerJoin event.</p>
	 *
	 * @var {string}
	 */
	get conn() {
	}
}

/**
 * <p>ScoresObject holds information relevant to the current game scores</p>
 */
class ScoresObject {
	/**
	 * <p>The number of goals scored by the red team</p>
	 *
	 * @var {number}
	 */
	get red() {
	}

	/**
	 * <p>The number of goals scored by the blue team</p>
	 *
	 * @var {number}
	 */
	get blue() {
	}

	/**
	 * <p>The number of seconds elapsed (seconds don't advance while the game is paused)</p>
	 *
	 * @var {number}
	 */
	get time() {
	}

	/**
	 * <p>The score limit for the game.</p>
	 *
	 * @var {number}
	 */
	get scoreLimit() {
	}

	/**
	 * <p>The time limit for the game.</p>
	 *
	 * @var {number}
	 */
	get timeLimit() {
	}
}

/**
 * <p>TeamID are int values:</p>
 * <pre><code>Spectators: 0
 * Red Team: 1
 * Blue Team: 2
 * </code></pre>
 *
 * @enum {number}
 */
const TeamID = {
	Spectators: 0,
	RedTeam: 1,
	BlueTeam: 2,
};

/**
 * <p>DiscPropertiesObject holds information about a game physics disc.</p>
 */
class DiscPropertiesObject {
	/**
	 * <p>The x coordinate of the disc's position</p>
	 *
	 * @var {number}
	 */
	get x() {
	}

	/**
	 * <p>The y coordinate of the disc's position</p>
	 *
	 * @var {number}
	 */
	get y() {
	}

	/**
	 * <p>The x coordinate of the disc's speed vector</p>
	 *
	 * @var {number}
	 */
	get xspeed() {
	}

	/**
	 * <p>The y coordinate of the disc's speed vector</p>
	 *
	 * @var {number}
	 */
	get yspeed() {
	}

	/**
	 * <p>The x coordinate of the disc's gravity vector</p>
	 *
	 * @var {number}
	 */
	get xgravity() {
	}

	/**
	 * <p>The y coordinate of the disc's gravity vector</p>
	 *
	 * @var {number}
	 */
	get ygravity() {
	}

	/**
	 * <p>The disc's radius</p>
	 *
	 * @var {number}
	 */
	get radius() {
	}

	/**
	 * <p>The disc's bouncing coefficient</p>
	 *
	 * @var {number}
	 */
	get bCoeff() {
	}

	/**
	 * <p>The inverse of the disc's mass</p>
	 *
	 * @var {number}
	 */
	get invMass() {
	}

	/**
	 * <p>The disc's damping factor.</p>
	 *
	 * @var {number}
	 */
	get damping() {
	}

	/**
	 * <p>The disc's color expressed as an integer (0xFF0000 is red, 0x00FF00 is green, 0x0000FF is blue, -1 is transparent)</p>
	 *
	 * @var {number}
	 */
	get color() {
	}

	/**
	 * <p>The disc's collision mask (Represents what groups the disc can collide with)</p>
	 *
	 * @var {number}
	 */
	get cMask() {
	}

	/**
	 * <p>The disc's collision groups</p>
	 *
	 * @var {number}
	 */
	get cGroup() {
	}
}

/**
 * <p>CollisionFlagsObjects contains flag constants that are used as helpers for reading and writing collision flags.</p>
 * <p>The flags are <code>ball</code>, <code>red</code>, <code>blue</code>, <code>redKO</code>, <code>blueKO</code>, <code>wall</code>, <code>all</code>, <code>kick</code>, <code>score</code>, <code>c0</code>, <code>c1</code>, <code>c2</code> and <code>c3</code></p>
 * <p>Example usage:</p>
 * <pre>var cf = room.CollisionFlags;
 *
 * // Check if disc 4 belongs to collision group "ball":
 * var discProps = room.getDiscProperties(4);
 * var hasBallFlag = (discProps.cGroup & cf.ball) != 0;
 *
 * // Add "wall" to the collision mask of disc 5 without changing any other of it's flags:
 * var discProps = room.getDiscProperties(5);
 * room.setDiscProperties(5, {cMask: discProps.cMask | cf.wall});</pre>
 *
 * @enum {number}
 */
const CollisionFlagsObject = {
	ball: 1,
	red: 2,
	blue: 4,
	redKO: 8,
	blueKO: 16,
	wall: 32,
	all: 63,
	kick: 64,
	score: 128,
	c0: 268435456,
	c1: 536870912,
	c2: 1073741824,
	c3: -2147483648,
};

/**
 * @constructor
 *
 * @param {RoomConfigObject} roomConfig
 *
 * @return {RoomObject}
 *
 * @link https://github.com/haxball/haxball-issues/wiki/Headless-Host Documentation
 * @link https://html5.haxball.com/headless                           Headless server host
 */
function HBInit(roomConfig) {
};

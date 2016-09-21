/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 ///////////////////
 // Dependencies //
 //////////////////
var Promise = require('bluebird');
var gameAPI = sails.hooks['customgamehook'];
var userAPI = sails.hooks['customuserhook'];


module.exports = {
	create: function(req, res) {
		if (req.body.gameName) {
			var promiseCreateGame = gameAPI.createGame(req.body.gameName)
			.then(function (game) {
				Game.publishCreate({
					id: game.id,
					name: game.name,
					status: game.status
				});
				return res.ok();

				// gameAPI.findAllGames()
				// .then(function foundGames (games) {
				// 	res.ok();
				// 	return Game.publishCreate({
				// 		id: 0,
				// 		games: games
				// 	});
				// })
				// .catch(function failed (error) {
				// 	return res.badRequest(error);
				// });
			}).catch(function (reason) {
				console.log(reason);
				res.badRequest(reason);
			});
		}
	},

	getList: function (req, res) {
		console.log(req.session);
		Game.watch(req);
		gameAPI.findAllGames()
		.then(function success (games) {
			return res.send(games);
		})
		.catch(function failure (error) {
			return res.badRequest(error);
		});		
	},

	subscribe: function (req, res) {
		if (req.body.id) {
			Game.subscribe(req, req.body.id);
			var promiseGame = gameAPI.findGame(req.body.id);
			var promiseUser = userAPI.findUser(req.session.usr);
			Promise.all([promiseGame, promiseUser]).then(function success (arr) {
				// Catch promise values
				var game = arr[0];
				var user = arr[1];
				var pNum;
				if (game.players) {
					pNum = game.players.length;
				} else {
					pNum = 0;
				}
				// Set session data
				req.session.game = game.id;
				req.session.pNum = pNum;
				// Update models
				user.pNum = pNum;
				game.players.add(user.id);
				game.save();
				user.save();
				// Respond with 200
				res.ok({playerId: user.id});
			})
			.catch(function failure (error) {
				return res.badRequest(error);
			});
		} else {
			res.badRequest("No game id received for subscription");
		}
	},

	ready: function (req, res) {
		console.log("\nReady");
		if (req.session.game && req.session.usr) {
			var promiseGame = gameAPI.findGame(req.session.game);
			var promiseUser = userAPI.findUser(req.session.usr);
			// Promise.all([promiseGame, promiseUser])
			// // Assign player readiness
			// .then(function foundRecords (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var pNum = user.pNum;
			// 	var bothReady = false;
			// 	switch (pNum) {
			// 		case 0:
			// 			game.p0Ready = true;
			// 			break;
			// 		case 1:
			// 			game.p1Ready = true;
			// 			break;
			// 	}
			// 	// Check if everyone is ready
			// 	if (game.p0Ready && game.p1Ready) bothReady = true;
			// 	return Promise.resolve([game, user, bothReady]);
			// })
			// // Deal if both ready
			// .then(function makeDeckIfBothReady (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var bothReady = values[2];
			// 	var promiseDeck = [];
			// 	if (bothReady) {
			// 		var findP0 = userService.findUser(game.players[0]);
			// 		var findP1 = userService.findUser(game.players[1]);
			// 		var data = [findP0, findP1];
			// 		// Deal, then publishUpdate
			// 		for (suit = 0; suit<4; suit++) {
			// 			for (rank = 1; rank < 14; rank++) {
			// 				var promiseCard = cardService.createCard({
			// 					gameId: game.id,
			// 					suit: suit,
			// 					rank: rank
			// 				});
			// 				data.push(promiseCard);
			// 			}
			// 		};

			// 		Promise.all(data)
			// 		// Then deal cards into hands
			// 		.then(function deal (playersAndDeck) {
			// 			var p0 = playersAndDeck[0];
			// 			var p1 = playersAndDeck[1];
			// 			var deck = playersAndDeck.slice(2);

			// 		})
			// 		.catch(function failedDealing (err) {
			// 			return Promise.reject(err);
			// 		});

			// 		// cardService.createCard({
			// 		// 	suit: 3,
			// 		// 	rank: 1,
			// 		// 	gameId: game.id}).then(function madeCard(newCard) {
			// 		// 		console.log(newCard);
			// 		// 		return Promise.resolve(newCard);
			// 		// 	}).catch(function failedCard(err) {
			// 		// 		console.log(err);
			// 		// 		return Promise.reject(err);
			// 		// 	});
			// 	}
			// 	return Promise.resolve(values);
			// })
			// // Save
			// .then(function readyToSave (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var bothReady = values[2];
			// 	if (bothReady) {
			// 		var cards = values[3];
			// 	}
			// 	// Save records w/ promises
			// 	var saveGame = gameService.saveGame({game: game});
			// 	var saveUser = userService.saveUser({user: user});
			// 	return Promise.all([saveGame, saveUser])
			// 	.then(function successfullySaved (values) {
			// 		var result = values.concat([bothReady]);
			// 		return Promise.resolve(result);
			// 	})
			// 	.catch(function failedToSave (err) {
			// 		return Promise.reject(err);
			// 	});
			// })
			// // Publish
			// .then(function readyToPublish (values) {
			// 	var game = values[0];
			// 	var user = values[1];
			// 	var bothReady = values[2];
			// 	// Handle dealing if both ready
			// 	return res.ok({
			// 		bothReady: bothReady,
			// 		game: game
			// 	});
			// })
			// // Handle errors
			// .catch(function handleError (err) {
			// 	return res.badRequest(err);
			// });





			Promise.all([promiseGame, promiseUser])
			// Assign player readiness
			.then(function foundRecords (values) {
				var game = values[0];
				var user = values[1];
				var pNum = user.pNum;
				var bothReady = false;
				switch (pNum) {
					case 0:
						game.p0Ready = true;
						break;
					case 1:
						game.p1Ready = true;
						break;
				}
				if (game.p0Ready && game.p1Ready) {
					bothReady = true;
					return new Promise(function makeDeck (resolveMakeDeck, rejectmakeDeck) {
						var findP0 = userService.findUser({userId: game.players[0].id});
						var findP1 = userService.findUser({userId: game.players[1].id});
						var data = [findP0, findP1];
						for (suit = 0; suit<4; suit++) {
							for (rank = 1; rank < 14; rank++) {
								var promiseCard = cardService.createCard({
									gameId: game.id,
									suit: suit,
									rank: rank
								});
								data.push(promiseCard);
							}
						};
						return resolveMakeDeck(Promise.all(data));			
					})
					.then(function deal (values) {
						var p0 = values[0];
						var p1 = values[1];
						var deck = values.slice(2);
						var dealt = []; //Prevents doubly dealing one card
						var min = 0;
						var max = 51;
						var random = Math.floor((Math.random() * ((max + 1) - min)) + min);

						// Deal one extra card to p1
						p1.hand.add(deck[random]);
						game.deck.remove(deck[random].id);
						dealt.push(random);
						// Then deal 5 cards to each player
						for (var i = 0; i < 5; i++) {
							// deal to p1
							while (dealt.indexOf(random) >= 0) {
								random = random = Math.floor((Math.random() * ((max + 1) - min)) + min);
							}
							p1.hand.add(deck[random]);
							game.deck.remove(deck[random].id);
							dealt.push(random);
							// deal to p0
							while (dealt.indexOf(random) >= 0) {
								random = Math.floor((Math.random() * ((max + 1) - min)) + min);
							}
							p0.hand.add(deck[random]);
							game.deck.remove(deck[random].id);
							dealt.push(random);
						} // end dealing
						// Now assign top card
						while (dealt.indexOf(random) >= 0) {
							random = Math.floor((Math.random() * ((max + 1) - min)) + min);
						}
						game.topCard = deck[random];
						game.deck.remove(deck[random].id);
						dealt.push(random);
						// Then assign secon card
						while (dealt.indexOf(random) >= 0) {
							random = Math.floor((Math.random() * ((max + 1) - min)) + min);
						}
						game.secondCard = deck[random];
						game.deck.remove(deck[random].id);
						dealt.push(random);		
						console.log("finishedDealing");
						
					/////////////////////////////////////////////////////////////////
					// ADD CARDS TO POINTS, AND ATTACHMENTS TO TEST POPULATEGAME() //
					/////////////////////////////////////////////////////////////////

					// p0.points.add([deck[0].id, deck[1].id, deck[3].id]);
					// p1.points.add([deck[4].id, deck[5].id]);
					// deck[0].attachments.add(deck[2].id);
					// deck[0].save();

						return Promise.resolve([game, p0, p1]);
					})
					.then(function save (values) {
						console.log("saving");
						var saveGame = gameService.saveGame({game: game})
						var saveP0 = userService.saveUser({user: values[1]});
						var saveP1 = userService.saveUser({user: values[2]});
						return Promise.all([saveGame, saveP0, saveP1]);
					})
					.then(function getPopulatedGame (values) {
						return gameService.populateGame({gameId: values[0].id});
					})
					.then(function publish (fullGame) {
						console.log("\npublishing");
						Game.publishUpdate(fullGame.id, {change: "Initialize", game: fullGame});
						return Promise.resolve(fullGame);
					})
					.catch(function failedToDeal (err) {
						return Promise.reject(err);
					});
				// If this player is first to be ready, save and respond
				} else {
					return new Promise(function save (resolveSave, rejectSave) {
						console.log("Saving 1st player ready");
						var saveGame = gameService.saveGame({game: game});
						var saveUser = userService.saveUser({user: user});
						return Promise.all([saveGame, saveUser]);
					});
				}

			}) //End foundRecords
			.then(function respond (values) {
				console.log("responding");
				res.ok();
				return Promise.resolve(values);
			})
			.catch(function failed (err) {
				// console.log("error in ready action");
				// console.log(err);
				return res.badRequest(err);
			});



		} else {
			var err = new Error("Missing game or player id");
			return res.badRequest(err);
		}
	},

	draw: function (req, res) {
		console.log("\nDrawing Card for p" + req.session.pNum + " in game: " + req.session.game);
		var pGame = gameService.findGame({gameId: req.session.game})
		.then(function checkTurn (game) {
			if (req.session.pNum === game.turn % 2) {
				return Promise.resolve(game);
			} else {
				return Promise.reject(new Error("It's not your turn."));
			}
		});

		var pUser = userService.findUser({userId: req.session.usr})
		.then(function handLimit (user) {
			if (user.hand.length < 8) {
				return Promise.resolve(user);
			} else {
				return Promise.reject(new Error("You are at the hand limit; you cannot draw."));
			}
		});

		// Make changes after finding records
		Promise.all([pGame, pUser])
		.then(function changeAndSave (values) {
			var game = values[0], user=values[1];
			user.hand.add(game.topCard.id);
			game.topCard = game.secondCard;
			var min = 0;
			var max = game.deck.length;
			var random = Math.floor((Math.random() * ((max + 1) - min)) + min);
			game.secondCard = game.deck[random];
			game.deck.remove(game.deck[random].id);	
			game.log.push("Player " + user.pNum + " Drew a card");
			game.turn++;
			var saveGame = gameService.saveGame({game: game})		;
			var saveUser = userService.saveUser({user: user});
			return Promise.all([saveGame, saveUser]);

		}) //End changeAndSave
		.then(function getPopulatedGame (values) {
			var game = values[0], user=values[1];
			return gameService.populateGame({gameId: game.id});
		}) //End getPopulatedGame
		.then(function publishAndRespond (fullGame) {
			console.log("Publishing Update for draw");
			Game.publishUpdate(fullGame.id,
				{
					change: 'draw',
					game: fullGame
				}
			);
			return res.ok();
		}) //End publishAndRespond
		.catch(function failed (err) {
			console.log("Failed to draw card:");
			console.log(err);
			return res.badRequest(err);
		});
	},

	points: function (req, res) {
		console.log("playing points");
		res.ok();
	},

	populateGameTest: function (req, res) {
		console.log("\npopulate game test");
		var popGame = gameService.populateGame({gameId: req.session.game})
		.then(function gotPop(fullGame) {
			res.ok(fullGame);
		})
		.catch(function failed (err) {
			console.log(err);
			res.badRequest(err);
		});
	}
};


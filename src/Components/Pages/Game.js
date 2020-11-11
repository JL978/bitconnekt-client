import React, { useEffect, useState, useRef } from "react";
import qs from "qs";
import { Redirect } from "react-router-dom";

import io from "socket.io-client";
const ENDPOINT = "http://localhost:4000";

const socket = io(ENDPOINT);

export default function Game() {
	const { name, room_id } = useQuery();
	const [socketId, setSocketId] = useState("");
	const [isWaiting, setIsWaiting] = useState(true);
	const [players, setPlayers] = useState([]);
	const [isMod, setIsMod] = useState(false);
	const [game, setGame] = useState(null);
	const [self, setSelf] = useState(null);
	const [winner, setWinner] = useState(null);
	//const [error, setError] = useState('')

	const copyText = useRef(null);

	useEffect(() => {
		if (name && room_id) {
			//On getting here, send out a join room signal to register on server
			socket.emit("joinRoom", { name, room_id });
			//On server confirmation that we are joined, also set Mod role
			socket.on("roomJoined", ({ socket_id, players }) => {
				setSocketId(socket_id);
				setPlayers(players);
				const [currentPlayer] = players.filter(
					(player) => player._id === socket_id
				);
				if (currentPlayer._role === "Moderator") {
					setIsMod(true);
				}
			});
			//When a new player joins update the list of players
			socket.on("newPlayer", ({ players }) => {
				setPlayers(players);
			});

			socket.on("startGame", (game) => {
				setIsWaiting(false);
				gameStateUpdate(game);
			});

			socket.on("gameUpdate", (game) => {
				gameStateUpdate(game);
			});

			socket.on("gameOver", ({ winner, game }) => {
				gameStateUpdate(game);
				setWinner(winner);
			});

			socket.on("restartGame", (game) => {
				gameStateUpdate(game);
			});

			socket.on("playerLeft", ({ playerLeaving, players }) => {
				setIsWaiting(true);
				setPlayers(players);
			});

			socket.on("errorMessage", (message) => console.log(message));
		}
		return () => socket.disconnect();
		// eslint-disable-next-line
	}, []);

	const gameStateUpdate = (game) => {
		const { _players } = game;
		setPlayers(_players);
		setGame(game);
	};

	useEffect(() => {
		updateSelf();
		// eslint-disable-next-line
	}, [players]);

	const updateSelf = () => {
		const [currentPlayer] = players.filter((player) => player._id === socketId);
		if (currentPlayer && currentPlayer._role === "Moderator") {
			setIsMod(true);
		}
		setSelf(currentPlayer);
	};

	const onStart = () => {
		socket.emit("start", { room_id });
	};

	const onCopyText = () => {
		copyText.current.select();
		document.execCommand("copy");
	};

	const onMove = (move) => {
		socket.emit("move", { room_id, move });
	};

	const onRestart = () => {
		socket.emit("restart", { room_id });
	};

	return (
		<>
			{!(name && room_id) && <Redirect to="/" />}
			<div className="gameRoom">
				{/* title */}
				{isWaiting ? (
					<h1>Waiting for game to start...</h1>
				) : (
					<h1>BitConnekkkkt!</h1>
				)}

				{/* Mod starting button */}
				{isMod && isWaiting && (
					<button className="startButton" onClick={() => onStart()}>
						Start game
					</button>
				)}

				{/* Waiting room players indicator */}
				{isWaiting && <h2>Available players:</h2>}

				{/* List of players */}
				<div className="players">
					{players.map(({ _name, cards, _turn, score }, index) => (
						<div className={`player`} key={index}>
							<p className={_turn && game && !game.is_over ? "turn" : null}>
								{_name}
							</p>
							<div className="cards">
								{cards.map((card, index) => (
									<div className="card" key={index}>
										{card}
									</div>
								))}
							</div>
							{game && game.is_over ? (
								<div className="score">Score: {score}</div>
							) : null}
						</div>
					))}
				</div>

				{/* Room id for users to copy if in waiting room */}
				{isWaiting && (
					<div className="copyText">
						<h4>Room ID</h4>
						<input readOnly ref={copyText} value={room_id} type="text" />
						<button onClick={() => onCopyText()}>Copy</button>
					</div>
				)}

				{/* Current game info */}
				{!isWaiting &&
					game &&
					self &&
					(game.is_over ? (
						<div className="gameOver">
							<div className="title">Game Over</div>
							{winner ? (
								<div className="winner">
									Winner: {winner.map((player) => player._name)}
								</div>
							) : null}
							{isMod ? (
								<button onClick={() => onRestart()}>Restart</button>
							) : null}
						</div>
					) : (
						<>
							<div className="currentCard">
								<h2>Current Card</h2>
								<div className="card">{game.card_up}</div>
								<div className="tokenPile">Token pile: {game.token_down}</div>
							</div>
							<div className="gameChoice">
								<button disabled={!self._turn} onClick={() => onMove("TAKE")}>
									Take
								</button>
								<button disabled={!self._turn} onClick={() => onMove("PASS")}>
									Pass
								</button>
							</div>
							<div className="tokens">
								<p>Your tokens: {self.tokens}</p>
							</div>
						</>
					))}
			</div>
		</>
	);
}

function useQuery() {
	return new qs.parse(window.location.search, {
		ignoreQueryPrefix: true,
	});
}

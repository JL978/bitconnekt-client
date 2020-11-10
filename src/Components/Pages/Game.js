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
				console.log(currentPlayer);
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
				const { _players } = game;
				setPlayers(_players);
				setGame(game);
			});

			socket.on("gameUpdate", (game) => {
				const { _players } = game;
				setPlayers(_players);
				setGame(game);
			});

			socket.on("errorMessage", (message) => console.log(message));
		}
		return () => socket.disconnect();
	}, []);

	useEffect(() => {
		updateSelf();
	}, [players]);

	const updateSelf = () => {
		console.log(players);
		const [currentPlayer] = players.filter((player) => player._id === socketId);
		console.log(currentPlayer);
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

	return (
		<>
			{!(name && room_id) && <Redirect to="/" />}
			<div className="gameRoom">
				{isWaiting ? (
					<h1>Waiting for game to start...</h1>
				) : (
					<h1>BitConnekkkkt!</h1>
				)}
				{isMod && isWaiting && (
					<button className="startButton" onClick={() => onStart()}>
						Start game
					</button>
				)}
				{isWaiting && <h2>Available players:</h2>}
				<div className="players">
					{players.map(({ _name, cards, _turn }, index) => (
						<div className={`player`} key={index}>
							<p className={_turn && "turn"}>{_name}</p>
							<div className="cards">
								{cards.map((card, index) => (
									<div className="card" key={index}>
										{card}
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				{isWaiting && (
					<div className="copyText">
						<h4>Room ID</h4>
						<input readOnly ref={copyText} value={room_id} type="text" />
						<button onClick={() => onCopyText()}>Copy</button>
					</div>
				)}
				{!isWaiting && game && self && (
					<>
						<div className="currentCard">
							<h2>Current Card</h2>
							<div className="card">{game.card_up}</div>
						</div>
						<div className="gameChoice">
							<button disabled={!self._turn} onClick={() => onMove("TAKE")}>
								Take
							</button>
							<button disabled={!self._turn} onClick={() => onMove("PASS")}>
								Pass
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
}

function useQuery() {
	return new qs.parse(window.location.search, {
		ignoreQueryPrefix: true,
	});
}

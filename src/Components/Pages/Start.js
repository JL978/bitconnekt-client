import React, { useState, useEffect, useRef } from "react";
import { Switch, Route, useRouteMatch, useHistory } from "react-router-dom";
import io from "socket.io-client";
const ENDPOINT = "http://localhost:4000";

const socket = io(ENDPOINT);

export default function Start() {
	const history = useHistory();
	let { path } = useRouteMatch();

	const [name, setName] = useState("");
	const [room, setRoom] = useState("");
	const [toast, setToast] = useState("");

	const timer = useRef();

	useEffect(() => {
		socket.on("newRoomCreated", ({ room_id }) => {
			console.log(`joined ${room_id}`);
		});
	});

	const onMakeRoom = () => {
		console.log("make room");

		if (name === "") {
			setToast("Please name yourself");
		}

		socket.emit("newRoom", { name });
	};

	const onJoinRoom = () => {
		console.log("join room");
		if (name === "" || room === "") {
			setToast("Please name yourself and provide a room number");
		}
	};

	return (
		<>
			<div className="Choice">
				<button onClick={() => history.push(`/create`)}>Create new room</button>
				<button onClick={() => history.push(`/join`)}>Join room</button>
			</div>
			<div className="form">
				<Switch>
					<Route exact path={path}>
						<h3>Please select a topic.</h3>
					</Route>
					<Route path={`/create`}>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							type="text"
							placeholder="Your name"
						/>
						<button onClick={() => onMakeRoom()}>Let's go</button>
					</Route>
					<Route path={`/join`}>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							type="text"
							placeholder="Your name"
						/>
						<input
							value={room}
							onChange={(e) => setRoom(e.target.value)}
							type="text"
							placeholder="Room ID"
						/>
						<button onClick={() => onJoinRoom()}>Let's go</button>
					</Route>
				</Switch>
			</div>
			{toast !== "" && <div className="error">{toast}</div>}
		</>
	);
}

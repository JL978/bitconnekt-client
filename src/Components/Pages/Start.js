import React, { useState, useEffect } from "react";
import {
	Switch,
	Route,
	useRouteMatch,
	useHistory,
	Redirect,
} from "react-router-dom";
import io from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT;

const socket = io(ENDPOINT);

export default function Start() {
	const history = useHistory();
	let { path } = useRouteMatch();

	const [name, setName] = useState("");
	const [room, setRoom] = useState("");
	const [toast, setToast] = useState("");
	const [redirect, setRedirect] = useState(false);

	useEffect(() => {
		socket.on("redirect", ({ name, room_id }) => {
			setRoom(room_id);
			setName(name);
			setRedirect(true);
		});
		socket.on("errorMessage", (error) => {
			console.log(error);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const onMakeRoom = () => {
		if (name === "") {
			setToast("Please name yourself");
		} else {
			setToast("");
			socket.emit("newRoom", { name });
		}
	};

	const onJoinRoom = () => {
		console.log("join room");
		if (name === "" || room === "") {
			setToast("Please name yourself and provide a room number");
		} else {
			setToast("");
			socket.emit("joinRequest", { name, room_id: room });
		}
	};

	return (
		<>
			{redirect && <Redirect to={`/game?room_id=${room}&name=${name}`} />}
			<div className="startForm">
				<div className="toast">
					{toast !== "" && <div className="error">{toast}</div>}
				</div>
				<div className="choice">
					<button
						onClick={() => {
							history.push(`${path}/create`);
							setToast("");
						}}
					>
						Create new room
					</button>
					<button
						onClick={() => {
							history.push(`${path}/join`);
							setToast("");
						}}
					>
						Join room
					</button>
				</div>
				<div className="form">
					<Switch>
						<Route exact path={path}>
							<h3>BITCONNEKKKKT!</h3>
						</Route>
						<Route path={`${path}/create`}>
							<input
								value={name}
								onChange={(e) => setName(e.target.value)}
								type="text"
								placeholder="Your name"
							/>
							<button onClick={() => onMakeRoom()}>Let's go</button>
						</Route>
						<Route path={`${path}/join`}>
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
			</div>
		</>
	);
}

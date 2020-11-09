import { Switch, Route, Redirect } from "react-router-dom";
import Game from "./Components/Pages/Game";
import Start from "./Components/Pages/Start";

function App() {
	return (
		<>
			<Switch>
				<Route exact path="/">
					<Redirect to="/start" />
				</Route>
				<Route path="/start">
					<Start />
				</Route>
				<Route path="/game">
					<Game />
				</Route>
			</Switch>
		</>
	);
}

export default App;

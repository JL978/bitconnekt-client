import { Switch, Route } from "react-router-dom";
import Game from "./Components/Pages/Game";
import Start from "./Components/Pages/Start";

function App() {
	return (
		<>
			<Switch>
				<Route path="/">
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

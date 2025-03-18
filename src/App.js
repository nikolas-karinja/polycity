import CityState from './interface/states/CityState';
import Octavia from './Octavia';
 
const App = () => 
{
    return (
        <div className="App">
            <Octavia>
				<CityState />
            </Octavia>
        </div>
    );
}
 
export default App;
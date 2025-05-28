import ChoosePartyState from './interface/states/ChoosePartyState';
import CityState from './interface/states/CityState';
import Octavia from './Octavia';
 
const App = () => 
{
    return (
        <div className="App">
            <Octavia>
				<CityState />
                <ChoosePartyState />
            </Octavia>
        </div>
    );
}
 
export default App;
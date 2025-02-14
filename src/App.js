import CityPathsMenu from './interface/states/CityPathsMenu';
import CityState from './interface/states/CityState';
import CityStructuresMenu from './interface/states/CityStructuresMenu';
import Octavia from './Octavia';
 
const App = () => 
{
    return (
        <div className="App">
            <Octavia>
				<CityState />
				<CityStructuresMenu />
                <CityPathsMenu />
            </Octavia>
        </div>
    );
}
 
export default App;
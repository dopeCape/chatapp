import './App.css';
import Navbar from './Nav Bar.svg';
import MainScreen from './Screens/MainScreen';

function App() {
  return (
    <div className="App w-screen h-screen   bg-lessy_bg pl-[2.5%] pr-[2.5%] pb-[2.5%] pt-[5%]  max-h-screen max-w-screen overflow-hidden  flex flex-col ">
      <div className="w-full h-full relative rounded-lg">
        <MainScreen />
      </div>
    </div>
  );
}

export default App;

import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';
import Clarifai from 'clarifai';
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js';

const app = new Clarifai.App({
 apiKey: '59f85ba38c6d4590a8389effb20473f0'
});

const initialState={

      input:'',
      imageUrl:'',
      box: {},
      route:'signin',
      isSignedIn: false,
      user:{
        id:'',
        name: '',
        email:'',
        entries:0,
        joined: ''
      } 
}

class App extends Component{

  constructor(){

    super();
    this.state=initialState;
  }

  loadUser=(data)=>{
    this.setState({user:{

        id:data.id,
        name: data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
  }})


  }

  // componentDidMount(){

  //   fetch('http://localhost:3000/').then(response=>response.json()).then(data=>console.log(data));
  // }

  calculateFaceLocation = (data) =>{

    const clarifaiFace=data.rawData.outputs[0].data.regions[0].region_info.bounding_box;
    console.log(clarifaiFace);
    const image=document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    

  }

  displayFaceBox=(box)=>{

    console.log(box);

    this.setState({box:box});
  }

  onInputChange = (event)=>{

    this.setState({input:event.target.value});
  }
  onSubmit = ()=>{

    this.setState({imageUrl:this.state.input});

      // fetch('http://localhost:3000/imageurl',{
      //       method:'post',
      //       headers: {'Content-Type':'application/json'},
      //       body: JSON.stringify({
      //             input: this.state.input
      //       })
      //     })
    console.log(this.state.imageUrl);
    app.models.predict(
        //"53e1df302c079b3db8a0a36033ed2d15",
        //"5e026c5fae004ed4a83263ebaabec49e",
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
        .then(response=>{

          this.displayFaceBox(this.calculateFaceLocation(response))

          if(response){

            fetch('https://whispering-tor-68365.herokuapp.com/image',{
              method:'put',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({

                id: this.state.user.id
              })


            })
            .then(response=>response.json()).then(count=>{

                this.setState(Object.assign(this.state.user, { entries: count}))
          })}
        

      })
      .catch(err=>console.log(err));

      //   function(response){

          

      //     console.log(response.rawData.outputs[0].data.regions[0].region_info.bounding_box);
      //   },
      //   function(err) {
      //     // body...
      //   }

      // );
    }


  onRouteChange=(route)=>{

    if(route==='signout')
    {
      this.setState(initialState);
    }
    else if(route==='Home')
    {
      this.setState({isSignedIn:true});
    }

    this.setState({route:route});


  }

  render(){
    return (
    <div className="App">

      <Particles className='Particles' 
                params={{
                  particles: {
                    number: {
                      value:100,
                      density: {
                        enable: true,
                        value_area:800
                      }
                    }
                  }
                }}
                
              />

        

     <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
    
        {this.state.route==='Home'?
        
        <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
          <FaceRecognition box={this.state.box}imageUrl={this.state.imageUrl}/>
        </div>

        :(this.state.route === 'signin'?
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

          )

        
        }
    
    </div>
    );
  }

}

export default App;

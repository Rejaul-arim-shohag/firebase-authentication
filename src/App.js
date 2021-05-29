import firebase from "firebase/app";
import "firebase/auth";
import { useState } from "react";
import './App.css';
import firebaseConfig from "./firebase.config";
firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false,
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () => {
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        const { displayName, photoURL, email } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        }
        setUser(signedInUser)
        console.log(displayName, photoURL, email)
      })
      .catch(error => {
        console.log(error)
        console.log(error.message)
      })
  }

  const handleSignOut = () => {
    firebase.auth()
      .signOut()
      .then((response) => {
        const signedOutUser = {
          isSignedIn: false,
          newUser: false,
          name: '',
          email: '',
          photo: ''
        }
        setUser(signedOutUser)
      }).catch(error => {
        console.log(error)
      })
  }

  const handleChange = (event) => {
    let isFieldValid = true;
    if (event.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
    } if (event.target.value === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value)
      isFieldValid = isPasswordValid && passwordHasNumber;
    } if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (event) => {
    console.log(user.email, user.password)
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((response) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          console.log(response);
          setUser(newUserInfo)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
          console.log('signin user info', res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    event.preventDefault();
  }

  const updateUserName = name => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(function () {
      console.log('user name updated successfully')
    }).catch(function (error) {
      console.log(error)
    });
  }

  return (
    <div className="App">
      <header >
        {
          user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> :
            <button onClick={handleSignIn}>Sign in</button>
        }
        {
          user.isSignedIn && <div>
            <p>welcome {user.name}</p>
            <p>Email {user.email}</p>
            <img src={user.photo} alt="" />
          </div>
        }

        <h1>Our Own Authentication</h1>
        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="newUser">New user signup</label>
        <form onSubmit={handleSubmit}>
          {newUser && <input name="name" type="text" onBlur={handleChange} placeholder="Your name" />}
          <br />
          <input type="text" name="email" onBlur={handleChange} placeholder="Write your email address" required />
          <br />
          <input type="password" name="password" onBlur={handleChange} placeholder="password" required />
          <br />
          <input type="submit" value={newUser? 'sign in': 'sign up'} />
        </form>
        <p style={{ color: 'red' }}>{user.error}</p>
        {
          user.success && <p style={{ color: 'green' }}>user {newUser ? 'created' : 'Logged In'} successfully</p>
        }
      </header>
    </div>
  );
}

export default App;

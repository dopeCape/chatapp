import React, { useRef, useState } from 'react';
import Avatar from 'avatar-initials';
import { auth } from '../firebase';

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth
} from 'firebase/auth';
import { instance } from '../axios';
import { useUserStore } from '../Stores/MainStore';

function LoginScreen() {
  const [login, setLogin] = useState(true);
  const [error, setError] = useState('');
  const userRef = useRef();
  const passRef = useRef();
  const retypePassRef = useRef();

  const emailRef = useRef();

  const updateUser = useUserStore(state => state.updateUserState);
  let provide = new GoogleAuthProvider();

  const handleGauthLgin = () => {
    signInWithPopup(auth, provide)
      .then(async user => {
        let user_;

        if (user.providerId === 'google.com') {
          user_ = {
            fireBaseid: user.user.uid,
            email: user.user.email,
            name: user.user.displayName,
            profilePic: user.user.photoURL
          };
        }
        try {
          let res = await instance.post(
            '/user/gauth',
            {
              ...user_
            },
            {
              headers: {
                authorization: `Bearer ${user.user.accessToken}`
              }
            }
          );

          localStorage.setItem('token', user.user.accessToken);
          updateUser(null);
        } catch (error) {
          console.error(error);
        }
      })
      .catch(e => console.log(e));
  };
  const handlePasswordSignUp = async () => {
    setError('');
    const email = emailRef.current.value;
    const rePass = retypePassRef.current.value;
    const password = passRef.current.value;
    try {
      let invite = await instance.post('/user/chelckinvite', {
        email: email
      });
      if (rePass === password) {
        if (false) {
        } else {
          try {
            const auth = getAuth();
            createUserWithEmailAndPassword(auth, email, password)
              .then(async userCredential => {
                // Signed in
                //
                const user = userCredential.user;
                let user_;

                let profilePic = Avatar.gravatarUrl({
                  initials: user?.userName
                });
                if (user.providerId === 'firebase') {
                  user_ = {
                    fireBaseid: user.uid,
                    email: user.email,
                    name: userRef.current.value,
                    profilePic: profilePic
                  };
                }
                try {
                  let res = await instance.post(
                    '/user',
                    {
                      ...user_
                    },
                    {
                      headers: {
                        authorization: `Bearer ${userCredential.user.accessToken}`
                      }
                    }
                  );
                  localStorage.setItem('token', userCredential.user.accessToken);
                  updateUser(null);
                } catch (error) {
                  console.error(error);
                }

                // ...
              })
              .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
                if (errorCode === 'auth/email-already-in-use') {
                  setError('User already exists.Please Login.');
                }
                if (errorCode === 'auth/missing-password') {
                  setError('Password cannot be empty.');
                }
                if (errorCode === 'auth/invalid-email') {
                  setError('Invalid Email. ');
                }
                if (errorCode === 'auth/weak-password') {
                  setError('Password has to be atleast 6 digits.');
                }
                // ..
              });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        setError('Passwords do not match');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePasswordLogin = () => {
    setError('');
    const email = emailRef.current.value;

    const password = passRef.current.value;
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(userCred => {
        const user = userCred.user;

        updateUser(null);
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        if (errorCode === 'auth/invalid-email') {
          setError('Invalid Email.');
        }
        if (errorCode === 'auth/wrong-password') {
          setError('Invalid Password.');
        }
        if (errorCode === 'auth/missing-password') {
          setError('Password cannot be empty.');
        }
      });
  };

  return (
    <div className="w-screen h-screen bg-black_i_like flex flex-wrap justify-center content-center">
      <div className="w-[30%] h-[70%] rounded-lg border-gray_i_like border-[2px] bg-black flex flex-col flex-wrap justify-center content-center">
        {login ? null : (
          <input
            className="w-[50%]  p-3 text-white outline-none border-[2px] border-gray_i_like hover:border-white bg-black mb-5 mt-3 ml-5"
            placeholder="Username"
            ref={userRef}
          />
        )}
        <input
          className="w-[50%]  p-3 text-white outline-none border-[2px] border-gray_i_like hover:border-white bg-black ml-5 "
          placeholder="Email"
          ref={emailRef}
        />
        <input
          className="w-[50%]  p-3 text-white outline-none border-[2px] border-gray_i_like hover:border-white bg-black mt-5 ml-5"
          placeholder="Password"
          type="password"
          ref={passRef}
        />
        <div className="flex flex-wrap w-[50%] ">
          {login ? (
            <button
              className="bg-black outline-none border-[2px] border-gray_i_like hover:border-white p-4 w-[60%] text-white mt-5  ml-5"
              onClick={handlePasswordLogin}
            >
              Login
            </button>
          ) : (
            <>
              <input
                className="w-[100%]  p-3 text-white outline-none border-[2px] border-gray_i_like hover:border-white bg-black mt-5 ml-5"
                placeholder="Retype Password"
                type="password"
                ref={retypePassRef}
              />

              <button
                className="bg-black outline-none border-[2px] border-gray_i_like hover:border-white p-4 w-[60%] text-white mt-5 ml-5 "
                onClick={handlePasswordSignUp}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
        {login ? (
          <div className="text-gray-400 mt-3 text-[24px] ">
            New here?
            <span
              className="text-white ml-2 cursor-pointer"
              onClick={() => {
                setError('');
                setLogin(false);
              }}
            >
              Sign up.
            </span>
          </div>
        ) : (
          <div className="text-gray-400 mt-3 text-[24px] ">
            Already have a account?
            <span
              className="text-white ml-2 cursor-pointer"
              onClick={() => {
                setError('');
                setLogin(true);
              }}
            >
              Login.
            </span>
          </div>
        )}

        <div className="font-extrabold relative top-[5%] text-red-800 text-[20px] ">{error}</div>
      </div>
    </div>
  );
}

export default LoginScreen;

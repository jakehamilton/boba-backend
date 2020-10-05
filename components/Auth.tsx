import React from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import axios from "axios";
import debug from "debug";

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyA8UreGu624GJbczXgT3xmeYBqoX9Z6wZA",
    authDomain: "bobaboard-fb.firebaseapp.com",
    databaseURL: "https://bobaboard-fb.firebaseio.com",
    projectId: "bobaboard-fb",
    storageBucket: "bobaboard-fb.appspot.com",
    messagingSenderId: "148314730930",
    appId: "1:148314730930:web:3e9d2e94a0e94bf1b0b4ab",
  };
  firebase.initializeApp(firebaseConfig);
}

const AuthContext = React.createContext({} as any);

const useAuth = () => React.useContext(AuthContext);
const log = debug("bobafrontend:auth-log");
const logRefresh = debug("bobafrontend:auth-log-refresh");

export const DEFAULT_USER_NAME = "You";
export const DEFAULT_USER_AVATAR = "/bobatan.png";

// Here we have a firebase user promise which checks whether we are
// presently in a state where we don't effectively know the status
// of the current user. This could be because the page has just loaded
// or because an action like login or logout is pending.
// In any case, an operation based on knowing the current state of the user
// (like getting the id token or making a new post) cannot be performed
// until this promise is resolved.
let resolveFirebaseUserPromise: (user: firebase.User | null) => void;
const newFirebaseUserPromise = () =>
  new Promise<firebase.User | null>((resolve) => {
    resolveFirebaseUserPromise = resolve;
  });
let firebaseUserPromise = newFirebaseUserPromise();

const AuthProvider: React.FC<{}> = (props) => {
  const [status, setStatus] = React.useState<{
    isLoggedIn: boolean;
    isPending: boolean;
    idToken?: string;
    user?: {
      username: string;
      avatarUrl?: string;
    };
    authError?: string;
  }>({
    isLoggedIn: false,
    isPending: true,
  });

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        log(`Firebase user state has changed to logged out.`);
        resolveFirebaseUserPromise(null);
        setStatus({
          isLoggedIn: false,
          isPending: false,
        });
        return;
      }
      resolveFirebaseUserPromise(user);
      axios.get("users/me/").then((userResponse) => {
        if (!userResponse) {
          log(`Request for user data has returned no user.`);
          // Error state
          setStatus({
            isLoggedIn: false,
            isPending: false,
            authError: "Error while logging in on BobaBoard server.",
          });
          return;
        }
        log(`Request for user data has returned. Logged in!`);
        setStatus({
          isLoggedIn: true,
          isPending: false,
          user: {
            ...userResponse.data,
            username: userResponse.data.username || DEFAULT_USER_NAME,
            avatarUrl: userResponse.data.avatarUrl || DEFAULT_USER_AVATAR,
          },
        });
      });
    });

    firebase.auth().onIdTokenChanged((user) => {
      logRefresh("Refresh status change");
      logRefresh(user);
      user?.getIdTokenResult().then((token) => logRefresh(token.issuedAtTime));
    });
  }, []);

  const getAuthIdToken: () => Promise<string | undefined> = () => {
    return firebaseUserPromise.then((user) => {
      log(`Firebase is done authenticating! Getting token...`);
      return user?.getIdTokenResult().then((token) => {
        log(`Returning token!`);
        log(`Token was issued at ${new Date(token.issuedAtTime)}`);
        log(`Token will expire at ${new Date(token.expirationTime)}`);
        return token.token;
      });
    });
  };

  const refreshUserData = (data: { username: string; avatarUrl: string }) => {
    setStatus({
      ...status,
      user: { username: data.username, avatarUrl: data.avatarUrl },
    });
  };

  const attemptLogin = (
    username: string,
    password: string
  ): Promise<boolean> => {
    setStatus({
      ...status,
      authError: undefined,
      isPending: true,
    });
    firebaseUserPromise = newFirebaseUserPromise();
    return firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .then((user) => {
        log(`Login succesful, found user:`);
        log(user);
        return !!user;
      })
      .catch((e) => {
        log(`Error occurred during login:`);
        log(e);
        setStatus({
          isLoggedIn: false,
          isPending: false,
          authError: e.message,
        });
        resolveFirebaseUserPromise(null);
        return false;
      });
  };

  const attemptLogout = () => {
    firebaseUserPromise = newFirebaseUserPromise();
    log(`Attempting to log out user...`);
    return firebase.auth().signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...status,
        getAuthIdToken,
        attemptLogin,
        attemptLogout,
        refreshUserData,
      }}
      {...props}
    />
  );
};

export { AuthProvider, useAuth };

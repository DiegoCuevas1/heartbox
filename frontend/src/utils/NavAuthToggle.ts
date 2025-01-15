let navSignIn: (() => void) | null = null;
let navSignOut: (() => void) | null = null;

export function setSignIn(func: () => void) {
  navSignIn = func;
}

export function setSignOut(func: () => void) {
  navSignOut = func;
}

export function triggerSignIn() {
  if (navSignIn) {
    navSignIn();
  } else {
    console.error("SignIn function is not set.");
  }
}

export function triggerSignOut() {
  if (navSignOut) {
    navSignOut();
  } else {
    console.error("SignOut function is not set.");
  }
}

export { navSignIn, navSignOut };

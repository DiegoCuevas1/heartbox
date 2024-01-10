let navSignIn: () => void;
let navSignOut: () => void;

export function setSignIn(func: () => void) {
  navSignIn = func;
}

export function setSignOut(func: () => void) {
  navSignOut = func;
}

export { navSignIn, navSignOut };

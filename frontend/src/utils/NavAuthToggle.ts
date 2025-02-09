type AuthFunction = () => void;

let navSignIn: AuthFunction | null = null;
let navSignOut: AuthFunction | null = null;

/**
 * Sets the sign-in function to be triggered globally
 * @param func The function to be called when sign-in is triggered
 */
export function setSignIn(func: AuthFunction): void {
  navSignIn = func;
}

/**
 * Sets the sign-out function to be triggered globally
 * @param func The function to be called when sign-out is triggered
 */
export function setSignOut(func: AuthFunction): void {
  navSignOut = func;
}

/**
 * Triggers the global sign-in function if it has been set
 * @throws Console error if sign-in function is not set
 */
export function triggerSignIn(): void {
  if (navSignIn) {
    navSignIn();
  } else {
    console.error("SignIn function is not set.");
  }
}

/**
 * Triggers the global sign-out function if it has been set
 * @throws Console error if sign-out function is not set
 */
export function triggerSignOut(): void {
  if (navSignOut) {
    navSignOut();
  } else {
    console.error("SignOut function is not set.");
  }
}

export const LOADING_TEXT = `Loading...
Please be patient while the world loads.`
export const DIALOG_STAND_INTRO = 'Get ready to embark on an epic journey filled with challenges, treasures, and unforgettable experiences.'
export const DIALOG_HELI_INTRO = `Please register at the desk before entering the helicopter.`
export const DIALOG_REGISTERED = name => 'Thank you '+name+' for registering with us!'

export const headingText = dialog => ({
  [DIALOG_STAND_INTRO]: 'Welcome, Adventurer!',
  [DIALOG_REGISTERED]: 'Registration Successful!',
  [DIALOG_OILRIG_INTRO]: 'Welcome to People Fest!'
}[dialog] || '')

export const DIALOG_OILRIG_INTRO = 'Dive into the fun and start collecting tokens today. The more tokens you gather, the more rewards and surprises await you. Enjoy every moment of People Fest, and may your token collection grow!'

export const DIALOG_OILRIG_1 = 'To unlock the grand prize, you must collect all the tokens.'
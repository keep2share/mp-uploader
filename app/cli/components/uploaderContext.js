/* eslint indent: ["error", 2] */
export const CONSOLE_MODE = 'console';
export const UI_MODE = 'ui';

const ctx = {
  activeUploaders: [],
  appMode: UI_MODE,
  appQuit: undefined,
  mainWindow: undefined,
}

export const setAppMode = (mode) => {
  ctx.appMode = mode
};
export const getAppMode = () => ctx.appMode;

export const getActiveUploaders = () => ctx.activeUploaders;
export const addActiveUploader = (id) => ctx.activeUploaders.push(id);
export const removeActiveUploader = (id) => {
  ctx.activeUploaders = ctx.activeUploaders.filter(uploaderId => uploaderId !== id);
}

export const setAppQuit = (func) => {
  ctx.appQuit = func;
}

export const executeAppQuit = () => {
  if (typeof ctx.appQuit === "function" ) {
    return ctx.appQuit();
  }
};

export const setMainWindow = (mw) => {
  ctx.mainWindow = mw;
}

export const getMainWindow = () => ctx.mainWindow;

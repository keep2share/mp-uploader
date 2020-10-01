import React from 'react';

let context = null;
export const createStoresContext = stores => {
  context = React.createContext(stores);
}

export function useStores() {
  return React.useContext(context);
}

export { default as MetaStore } from './meta';
export { default as LangStore } from './lang';
export { default as TokenStore } from './token';
export { default as UploadParams } from './params';
export { default as LogStore } from './log';


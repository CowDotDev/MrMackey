export const addPosessive = (name: string) => {
  return name.charAt(name.length - 1) === 's' ? `${name}'` : `${name}'s`;
};

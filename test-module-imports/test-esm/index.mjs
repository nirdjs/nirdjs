import { atom } from 'nirdjs';

const count = atom(1);

export const value = count.get();

if (value !== 1) {
    throw new Error('Unexpected');
}


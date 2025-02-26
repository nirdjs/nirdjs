const { getValue, atom  } = require('nirdjs');

const count = atom(1);
const value = count.get();
module.exports = {
    value
};

if (value !== 1) {
    throw new Error('Unexpected')
}


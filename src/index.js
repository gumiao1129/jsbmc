import libminisatFactory from './cpp/libminisat.js';
import {Solver} from './solver_base.js';

class MinisatSolver extends Solver {
    constructor() {
        super(libminisatFactory);
    }
}

export {
    MinisatSolver
};

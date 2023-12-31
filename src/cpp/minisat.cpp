#include "minisat/core/Solver.h"
#include <emscripten.h>

using namespace Minisat;

inline Lit itoLit(int i) {
    bool sign = i < 0;
    int var = (sign) ? -i-1 : i-1; // 0-based variable numbering
    return (sign) ? ~mkLit(var) : mkLit(var);
}

inline int Littoi(Lit l) {
    return (var(l)+1) * (sign(l) ? -1 : 1);
}

extern "C" {
EMSCRIPTEN_KEEPALIVE
    Solver* Solver_new() { return new Solver(); }
EMSCRIPTEN_KEEPALIVE
    void Solver_delete(Solver* s) { delete s; }

EMSCRIPTEN_KEEPALIVE
    int nVars(Solver* s) { return s->nVars(); }
EMSCRIPTEN_KEEPALIVE
    int nClauses(Solver* s) { return s->nClauses(); }

EMSCRIPTEN_KEEPALIVE
    // Controls the level of phase saving (0=none, 1=limited, 2=full).
    void setPhaseSaving(Solver* s, int ps) { s->phase_saving = ps; }

EMSCRIPTEN_KEEPALIVE
    // Control whether random polarities are used (overridden if vars are created with a user polarity other than Undef)
    void setRndPol(Solver* s, bool val) { s->rnd_pol = val; }

EMSCRIPTEN_KEEPALIVE
    // Control whether variables are intialized with a random initial activity
    // (default: False)
    void setRndInitAct(Solver* s, bool val) { s->rnd_init_act = val; }

EMSCRIPTEN_KEEPALIVE
    // Initialize the solver's random seed
    void setRndSeed(Solver* s, double seed) { assert(seed != 0.0); s->random_seed = seed; }

EMSCRIPTEN_KEEPALIVE
    // polarity: 0=False, 1=True, 2=Undef
    int newVar(Solver* s, uint8_t polarity, bool dvar=true) { return s->newVar(lbool(polarity), dvar); }

EMSCRIPTEN_KEEPALIVE
    bool addClause(Solver* s, int len, int* lits) {
        vec<Lit> clause;
        for (int i = 0 ; i < len ; i++) {
            clause.push( itoLit(lits[i]) );
        }
        return s->addClause(clause);
    }
EMSCRIPTEN_KEEPALIVE
    bool addUnit(Solver* s, int lit) {
        return s->addClause(itoLit(lit));
    }

EMSCRIPTEN_KEEPALIVE
    bool solve(Solver* s) { return s->solve(); }
EMSCRIPTEN_KEEPALIVE
    bool solve_assumptions(Solver* s, int len, int* lits) {
        vec<Lit> assumptions;
        for (int i = 0 ; i < len ; i++) {
            assumptions.push( itoLit(lits[i]) );
        }
        return s->solve(assumptions);
    }
EMSCRIPTEN_KEEPALIVE
    bool check_complete(Solver* s, const int len, const int* lits, const bool pos) {
        int n = s->nVars();
        vec<Lit> assumptions;
        bool * specified = new bool[n+1]();
        for (int i = 0 ; i < len ; i++) {
            assumptions.push( itoLit(lits[i]) );
            specified[pos ? lits[i] : -lits[i]] = true;
        }
        for (int i = 1 ; i < n+1 ; i++) {
            if (!specified[i]) {
                assumptions.push( itoLit(pos ? -i : i) );
            }
        }
        delete[] specified;
        return s->solve(assumptions);
    }

EMSCRIPTEN_KEEPALIVE
    bool simplify(Solver* s) { return s->simplify(); }

EMSCRIPTEN_KEEPALIVE
    // This is fairly slow to call from Python.
    // It is better to copy the whole model over with fillModel()
    // if you will be looking at most or all values, anyway.
    int modelValue(Solver* s, int i) { return s->modelValue(i-1) != l_False; }

EMSCRIPTEN_KEEPALIVE
    void fillModel(Solver* s, int* model, int from, int to) {
        for (int i = from ; i < to ; i++) {
            model[i-from] = s->modelValue(i) != l_False;
        }
    }

EMSCRIPTEN_KEEPALIVE
    int getModelTrues(Solver* s, int* trues, int from, int to, int offset) {
        int count = 0;
        for (int i = from ; i < to ; i++) {
            if (s->modelValue(i) == l_True) trues[count++] = i - from + offset;
        }
        return count;
    }

EMSCRIPTEN_KEEPALIVE
    // returns the size of the current conflict
    int conflictSize(Solver* s) {
        return s->conflict.size();
    }

EMSCRIPTEN_KEEPALIVE
    // returns a core with 0-based counting
    // (i.e., first clause is 0, etc.)
    // (subtracts given number of original variables from conflict variables)
    int unsatCore(Solver* s, int nv, int* core, int offset) {
        for (int i = 0 ; i < s->conflict.size() ; i++) {
            core[i] = var(s->conflict[i]) - nv + offset;
        }
        return s->conflict.size();
    }

EMSCRIPTEN_KEEPALIVE
    // fills an array w/ any literals known to be implied by the current formula
    // (i.e., all 0-level assignments)
    // returns number of elements in the filled array
    int getImplies(Solver* s, int* assigns) {
        vec<Lit> empty;
        vec<Lit> outvec;
        s->implies(empty, outvec, true);
        int len = outvec.size();
        for (int i = 0 ; i < len ; i++) {
            assigns[i] = Littoi(outvec[i]);
        }
        return len;
    }

EMSCRIPTEN_KEEPALIVE
    // fills an array w/ any literals known to be implied by the current formula
    // and any given assumptions (i.e., all 0-level assignments)
    // returns number of elements in the filled array
    int getImplies_assumptions(Solver* s, int* assigns, int* assumps, int assumps_size) {
        vec<Lit> assumptions;
        for (int i = 0 ; i < assumps_size ; i++) {
            assumptions.push( itoLit(assumps[i]) );
        }
        vec<Lit> outvec;
        s->implies(assumptions, outvec, true);
        int len = outvec.size();
        for (int i = 0 ; i < len ; i++) {
            assigns[i] = Littoi(outvec[i]);
        }
        return len;
    }
}

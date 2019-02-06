import React from 'react';

import classes from './LoanInput.module.css';

interface LoanInputProps {
    principal: number;
    interestRate: number;
    loanLength: number;
    monthlyPayment: number;
    idx: number;
    onChangeInput(field: string, newValue: number, idx: number): void;
    removeLoan(idx: number): void;
}

const LoanInput = (props: LoanInputProps) => {
    return (
        <div className={classes.LoanInput}>
            <div>
                Loan Principal:
                <input
                    type="number"
                    value={props.principal}
                    onChange={(event) => props.onChangeInput("principal", +event.target.value, props.idx)}
                    min="0"
                    step="0.01" />
            </div>
            <div>
                Loan Interest Rate:
                <input
                    type="number"
                    value={props.interestRate}
                    onChange={(event) => props.onChangeInput("interestRate", +event.target.value, props.idx)}
                    min="0"
                    step="0.001" />
            </div>
            <div>
                Months Remaining:
                <input
                    type="number"
                    value={props.loanLength}
                    onChange={(event) => props.onChangeInput("loanLength", +event.target.value, props.idx)}
                    min="1"
                    step="1" />
            </div>
            <div>
                Monthly Payment:
                <input
                    type="number"
                    value={props.monthlyPayment.toFixed(2)}
                    readOnly/>
            </div>
            <button onClick={() => props.removeLoan(props.idx)}>Remove Loan</button>
        </div>
    );
}

export default LoanInput;